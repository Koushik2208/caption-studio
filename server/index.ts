import cors from "cors";
import express from "express";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import multer from "multer";
import { parseSrt, type Caption } from "@remotion/captions";
import { transcribe, toCaptions } from "@remotion/install-whisper-cpp";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { CaptionStyleOverrides, CaptionStyleVariant } from "../src/captions/styles/types.js";
import type { OverlaySettings } from "../src/overlay/types.js";

// ffmpeg-static's CJS export shape doesn't line up with its own .d.ts under
// "module": "nodenext", so import it via require() and assert the type instead.
const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string;

const PORT = Number(process.env.TRANSCRIBE_SERVER_PORT ?? 5175);

// tools/whisper/ layout is produced by scripts/setupWhisper.mjs - override via
// env vars if whisper.cpp/the model live somewhere else on a given machine.
const WHISPER_BIN_DIR = process.env.WHISPER_CLI ?? "tools/whisper/bin";
const WHISPER_MODEL_DIR = process.env.WHISPER_MODEL ?? "tools/whisper/models";
const WHISPER_CPP_VERSION = "1.7.6";
const WHISPER_MODEL_NAME = "small.en";

const UPLOAD_DIR = path.join("tmp", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXPORT_DIR = path.join("tmp", "exports");
fs.mkdirSync(EXPORT_DIR, { recursive: true });

const REMOTION_ENTRY = path.resolve("src/remotion/index.ts");

const upload = multer({ dest: UPLOAD_DIR });

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const runFfmpeg = (inputPath: string, outputPath: string): Promise<void> =>
  new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      reject(new Error("ffmpeg-static did not resolve a binary path"));
      return;
    }
    const proc = spawn(ffmpegPath, [
      "-y",
      "-i",
      inputPath,
      "-ar",
      "16000",
      "-ac",
      "1",
      outputPath,
    ]);
    let stderr = "";
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    proc.on("error", reject);
    proc.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
    });
  });

const PUNCTUATION_ONLY = /^[.,!?;:]+$/;

// whisper.cpp emits sentence-final punctuation as its own token (e.g.
// "container" then "."), so the script needs the same split to end up with
// a comparable word count.
const tokenizeScript = (text: string): string[] => {
  const tokens: string[] = [];
  for (const chunk of text.split(/\s+/).filter(Boolean)) {
    const match = chunk.match(/^(.+?)([.,!?;:]+)$/);
    if (match) {
      tokens.push(match[1], match[2]);
    } else {
      tokens.push(chunk);
    }
  }
  return tokens;
};

// Script text is typed, not ASR'd, so it wins on wording; Whisper wins on
// timing (see CLAUDE.md). Whisper output is already word-level (one Caption
// per token via splitOnWord), so this only needs a positional word swap -
// falls back to Whisper's own wording if the word counts don't line up
// closely enough to trust a 1:1 zip.
const alignWordingWithScript = (
  whisperCaptions: Caption[],
  srtText: string,
): Caption[] => {
  const { captions: srtBlocks } = parseSrt({ input: srtText });
  const scriptWords = tokenizeScript(srtBlocks.map((block) => block.text).join(" "));

  if (scriptWords.length !== whisperCaptions.length) {
    console.warn(
      `Script word count (${scriptWords.length}) doesn't match Whisper word count (${whisperCaptions.length}) - keeping Whisper's own wording, timing is unaffected.`,
    );
    return whisperCaptions;
  }

  return whisperCaptions.map((caption, index) => {
    const word = scriptWords[index];
    const needsLeadingSpace = index > 0 && !PUNCTUATION_ONLY.test(word);
    return { ...caption, text: needsLeadingSpace ? ` ${word}` : word };
  });
};

const cleanup = (...filePaths: (string | undefined)[]) => {
  for (const filePath of filePaths) {
    if (!filePath) continue;
    fs.rm(filePath, { force: true }, () => {});
  }
};

app.post(
  "/api/transcribe",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "srt", maxCount: 1 },
  ]),
  async (req, res) => {
    const files = req.files as
      | { [field: string]: Express.Multer.File[] }
      | undefined;
    const audioFile = files?.audio?.[0];
    const srtFile = files?.srt?.[0];

    if (!audioFile) {
      res.status(400).json({ error: "Missing required 'audio' file" });
      return;
    }

    const wavPath = path.resolve(UPLOAD_DIR, `${randomUUID()}.wav`);

    try {
      await runFfmpeg(audioFile.path, wavPath);

      // inputPath must be absolute: transcribe() spawns whisper-cli with its cwd
      // set to whisperPath, so a relative path here resolves against the wrong
      // directory. splitOnWord is intentionally omitted - whisper-cli defaults
      // it to on already, and passing `true` explicitly hits a library quirk
      // that appends a stray "true" arg, which whisper-cli misreads as another
      // input file ("input file not found 'true'").
      const whisperOutput = await transcribe({
        inputPath: wavPath,
        whisperPath: WHISPER_BIN_DIR,
        whisperCppVersion: WHISPER_CPP_VERSION,
        model: WHISPER_MODEL_NAME,
        modelFolder: WHISPER_MODEL_DIR,
        tokenLevelTimestamps: true,
        printOutput: false,
      });

      const { captions } = toCaptions({ whisperCppOutput: whisperOutput });

      const finalCaptions = srtFile
        ? alignWordingWithScript(captions, fs.readFileSync(srtFile.path, "utf-8"))
        : captions;

      res.json({ captions: finalCaptions });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Transcription failed",
      });
    } finally {
      cleanup(audioFile.path, srtFile?.path, wavPath);
    }
  },
);

// The Remotion webpack bundle only depends on code (src/remotion/index.ts +
// whatever it imports), never on a given request's captions/style, so it's
// built once per server process and reused across every export job.
let bundlePromise: Promise<string> | null = null;
const getServeUrl = (): Promise<string> => {
  if (!bundlePromise) {
    bundlePromise = bundle({ entryPoint: REMOTION_ENTRY, onProgress: () => {} });
  }
  return bundlePromise;
};

type ExportJob = {
  status: "rendering" | "done" | "error";
  progress: number;
  outputPath?: string;
  error?: string;
};

const exportJobs = new Map<string, ExportJob>();

type GreenScreenRequestBody = {
  captions: Caption[];
  styleVariant?: CaptionStyleVariant;
  styleOverrides?: CaptionStyleOverrides;
  overlaySettings?: OverlaySettings;
  durationInFrames: number;
  // ExportPage's Resolution dropdown, converted client-side to a renderMedia
  // scale factor (see src/export/resolutions.ts) - multiplies the fixed
  // 1080x1920 composition rather than changing its logical size.
  scale?: number;
};

const runGreenScreenRender = async (jobId: string, body: GreenScreenRequestBody) => {
  const job = exportJobs.get(jobId);
  if (!job) return;

  try {
    const serveUrl = await getServeUrl();
    const inputProps = {
      captions: body.captions,
      styleVariant: body.styleVariant,
      styleOverrides: body.styleOverrides,
      overlaySettings: body.overlaySettings,
      durationInFrames: body.durationInFrames,
    };

    const composition = await selectComposition({
      serveUrl,
      id: "CaptionExport",
      inputProps,
    });

    const outputPath = path.resolve(EXPORT_DIR, `${jobId}.mp4`);

    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      scale: body.scale && body.scale > 0 ? body.scale : 1,
      onProgress: ({ progress }) => {
        job.progress = progress;
      },
    });

    job.status = "done";
    job.progress = 1;
    job.outputPath = outputPath;
  } catch (error) {
    console.error(error);
    job.status = "error";
    job.error = error instanceof Error ? error.message : "Render failed";
  }
};

app.post("/api/export-green-screen", (req, res) => {
  const body = req.body as Partial<GreenScreenRequestBody>;

  if (!Array.isArray(body.captions) || body.captions.length === 0) {
    res.status(400).json({ error: "Missing required 'captions' array" });
    return;
  }
  if (typeof body.durationInFrames !== "number" || body.durationInFrames <= 0) {
    res.status(400).json({ error: "Missing required 'durationInFrames'" });
    return;
  }

  const jobId = randomUUID();
  exportJobs.set(jobId, { status: "rendering", progress: 0 });

  void runGreenScreenRender(jobId, body as GreenScreenRequestBody);

  res.status(202).json({ jobId });
});

app.get("/api/export-green-screen/:jobId", (req, res) => {
  const job = exportJobs.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Unknown job" });
    return;
  }
  res.json({ status: job.status, progress: job.progress, error: job.error });
});

app.get("/api/export-green-screen/:jobId/download", (req, res) => {
  const job = exportJobs.get(req.params.jobId);
  if (!job || job.status !== "done" || !job.outputPath) {
    res.status(409).json({ error: "Render not ready" });
    return;
  }
  res.download(job.outputPath, "caption-export.mp4");
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Transcription server listening on http://localhost:${PORT}`);
});
