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
import type { FrameSettings } from "../src/frames/types.js";
import type { TextureOverlaySettings } from "../src/textures/types.js";
import type { MotionGraphicsSettings } from "../src/motion/types.js";

// ffmpeg-static's CJS export shape doesn't line up with its own .d.ts under
// "module": "nodenext", so import it via require() and assert the type instead.
const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string;

const PORT = Number(process.env.TRANSCRIBE_SERVER_PORT ?? 5175);

// Matches the fixed 30fps composition rate (CLAUDE.md) - the amplitude array
// is indexed 1:1 with output video frames, not audio sample count.
const OUTPUT_FPS = 30;

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

// Separate from `upload` above: preserves the original file extension (vs.
// multer's default extension-less temp name) since OffthreadVideo's
// ffmpeg-backed frame extraction is more reliable with one, and gives it its
// own disk-backed storage config since video uploads can be much larger than
// the transcribe endpoint's audio-only ones.
const videoUpload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
  }),
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Remotion's renderer hard-rejects local filesystem paths for OffthreadVideo/
// Video/Audio src (it only downloads http(s):// URLs, even server-side - see
// LEARNINGS.md), so an uploaded export video has to be reachable over HTTP
// during the render, not just present on disk. Scoped to exactly UPLOAD_DIR
// (nothing else in the project tree) and only for GETs under this one path
// prefix - express.static also refuses `..` path-traversal attempts out of
// its root by default.
app.use("/tmp-media", express.static(path.resolve(UPLOAD_DIR)));

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

// Minimal RIFF/WAVE parser - runFfmpeg's output is uncompressed 16-bit PCM
// mono (ffmpeg's default encoder for a .wav extension), so no external
// audio-decoding dependency is needed to read raw samples back out. Computes
// per-output-frame RMS amplitude, peak-normalized to 0-1 so Audio-Reactive
// Pulse (src/textures/AudioPulse.tsx) reads consistently regardless of the
// source recording's absolute loudness.
const computeAudioAmplitude = (wavPath: string, fps: number): number[] => {
  const buffer = fs.readFileSync(wavPath);

  let offset = 12; // skip "RIFF" + chunkSize(4) + "WAVE"
  let sampleRate = 16000;
  let dataStart = -1;
  let dataLength = 0;
  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkDataStart = offset + 8;
    if (chunkId === "fmt ") {
      sampleRate = buffer.readUInt32LE(chunkDataStart + 4);
    } else if (chunkId === "data") {
      dataStart = chunkDataStart;
      dataLength = Math.min(chunkSize, buffer.length - chunkDataStart);
    }
    offset = chunkDataStart + chunkSize + (chunkSize % 2);
  }
  if (dataStart === -1 || dataLength <= 0) return [];

  const sampleCount = Math.floor(dataLength / 2); // 16-bit samples
  const samplesPerFrame = sampleRate / fps;
  const frameCount = Math.max(1, Math.ceil(sampleCount / samplesPerFrame));

  const rmsPerFrame = new Array<number>(frameCount).fill(0);
  for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
    const startSample = Math.floor(frameIndex * samplesPerFrame);
    const endSample = Math.min(sampleCount, Math.floor((frameIndex + 1) * samplesPerFrame));
    let sumSquares = 0;
    let count = 0;
    for (let s = startSample; s < endSample; s++) {
      const sample = buffer.readInt16LE(dataStart + s * 2) / 32768;
      sumSquares += sample * sample;
      count++;
    }
    rmsPerFrame[frameIndex] = count > 0 ? Math.sqrt(sumSquares / count) : 0;
  }

  const peak = Math.max(...rmsPerFrame, 1e-6);
  return rmsPerFrame.map((value) => Math.min(1, value / peak));
};

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

      const audioAmplitude = computeAudioAmplitude(wavPath, OUTPUT_FPS);

      res.json({ captions: finalCaptions, audioAmplitude });
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
  frameSettings?: FrameSettings;
  textureSettings?: TextureOverlaySettings;
  motionSettings?: MotionGraphicsSettings;
  audioAmplitude?: number[];
  durationInFrames: number;
  // ExportPage's Resolution dropdown, converted client-side to a renderMedia
  // scale factor (see src/export/resolutions.ts) - multiplies the composition's
  // logical resolution (1080x1920 or 1920x1080, see orientation) rather than
  // changing it.
  scale?: number;
  // LayoutContext's layoutMode, forwarded through to Root.tsx's
  // calculateMetadata so the render itself is sized 1920x1080 for horizontal
  // instead of always rendering the vertical composition.
  orientation?: "vertical" | "horizontal";
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
      frameSettings: body.frameSettings,
      textureSettings: body.textureSettings,
      motionSettings: body.motionSettings,
      audioAmplitude: body.audioAmplitude,
      durationInFrames: body.durationInFrames,
      orientation: body.orientation ?? "vertical",
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

// Same shape as GreenScreenRequestBody - separate alias since the two
// formats' request bodies are conceptually distinct even though they
// currently happen to match field-for-field.
type VideoRequestBody = GreenScreenRequestBody;

const runVideoRender = async (jobId: string, mediaPath: string, body: VideoRequestBody) => {
  const job = exportJobs.get(jobId);
  if (!job) return;

  try {
    const serveUrl = await getServeUrl();
    // OffthreadVideo needs an http(s) URL, not the local path - see the
    // /tmp-media static route registered above.
    const mediaUrl = `http://localhost:${PORT}/tmp-media/${path.basename(mediaPath)}`;
    const inputProps = {
      captions: body.captions,
      mediaUrl,
      styleVariant: body.styleVariant,
      styleOverrides: body.styleOverrides,
      overlaySettings: body.overlaySettings,
      frameSettings: body.frameSettings,
      textureSettings: body.textureSettings,
      motionSettings: body.motionSettings,
      audioAmplitude: body.audioAmplitude,
      durationInFrames: body.durationInFrames,
      orientation: body.orientation ?? "vertical",
    };

    const composition = await selectComposition({
      serveUrl,
      id: "CaptionExportVideo",
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
  } finally {
    // Only the uploaded source - the rendered output is kept for download.
    cleanup(mediaPath);
  }
};

app.post("/api/export-video", videoUpload.single("media"), (req, res) => {
  const mediaFile = req.file;
  if (!mediaFile) {
    res.status(400).json({ error: "Missing required 'media' file" });
    return;
  }

  let body: Partial<VideoRequestBody>;
  try {
    body = JSON.parse(req.body.payload ?? "{}");
  } catch {
    cleanup(mediaFile.path);
    res.status(400).json({ error: "Invalid 'payload' JSON" });
    return;
  }

  if (!Array.isArray(body.captions) || body.captions.length === 0) {
    cleanup(mediaFile.path);
    res.status(400).json({ error: "Missing required 'captions' array" });
    return;
  }
  if (typeof body.durationInFrames !== "number" || body.durationInFrames <= 0) {
    cleanup(mediaFile.path);
    res.status(400).json({ error: "Missing required 'durationInFrames'" });
    return;
  }

  const jobId = randomUUID();
  exportJobs.set(jobId, { status: "rendering", progress: 0 });

  void runVideoRender(jobId, path.resolve(mediaFile.path), body as VideoRequestBody);

  res.status(202).json({ jobId });
});

// Status/download polling is identical across export formats - both write
// into the same `exportJobs` map, keyed by the same jobId scheme, so the
// per-format prefix is just for route clarity on the client.
const registerJobRoutes = (prefix: string) => {
  app.get(`${prefix}/:jobId`, (req, res) => {
    const job = exportJobs.get(req.params.jobId);
    if (!job) {
      res.status(404).json({ error: "Unknown job" });
      return;
    }
    res.json({ status: job.status, progress: job.progress, error: job.error });
  });

  app.get(`${prefix}/:jobId/download`, (req, res) => {
    const job = exportJobs.get(req.params.jobId);
    if (!job || job.status !== "done" || !job.outputPath) {
      res.status(409).json({ error: "Render not ready" });
      return;
    }
    res.download(job.outputPath, "caption-export.mp4");
  });
};

registerJobRoutes("/api/export-green-screen");
registerJobRoutes("/api/export-video");

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Transcription server listening on http://localhost:${PORT}`);
});
