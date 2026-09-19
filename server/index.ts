import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import type { Caption } from "@remotion/captions";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { CaptionStyleOverrides, CaptionStyleVariant } from "../src/captions/styles/types";
import type { OverlaySettings } from "../src/overlay/types";
import type { FrameSettings } from "../src/frames/types";
import type { TextureOverlaySettings } from "../src/textures/types";
import type { MotionGraphicsSettings } from "../src/motion/types";
import type { VideoMotionSettings } from "../src/videoMotion/types";
import type { AssetSettings } from "../src/assets/types";

const PORT = Number(process.env.PORT ?? process.env.TRANSCRIBE_SERVER_PORT ?? 5175);

const UPLOAD_DIR = path.join("tmp", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXPORT_DIR = path.join("tmp", "exports");
fs.mkdirSync(EXPORT_DIR, { recursive: true });

const REMOTION_ENTRY = path.resolve("src/remotion/index.ts");

// Disk-backed storage config for video uploads to preserve file extension
// for OffthreadVideo's frame extraction.
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

const cleanup = (...filePaths: (string | undefined)[]) => {
  for (const filePath of filePaths) {
    if (!filePath) continue;
    fs.rm(filePath, { force: true }, () => {});
  }
};

// The Remotion webpack bundle only depends on code (src/remotion/index.ts +
// whatever it imports), never on a given request's captions/style, so it's
// built once per server process and reused across every export job.
let bundlePromise: Promise<string> | null = null;
const getServeUrl = (): Promise<string> => {
  if (!bundlePromise) {
    bundlePromise = bundle({
      entryPoint: REMOTION_ENTRY,
      onProgress: () => {},
      webpackOverride: (config) => ({
        ...config,
        resolve: {
          ...config.resolve,
          extensionAlias: {
            '.js': ['.ts', '.tsx', '.js'],
            ...(config.resolve?.extensionAlias || {}),
          },
        },
      }),
    }).catch((err) => {
      bundlePromise = null;
      throw err;
    });
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
  videoMotion?: VideoMotionSettings;
  assetSettings?: AssetSettings;
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
    const lastCaptionEndMs = Array.isArray(body.captions) && body.captions.length > 0
      ? Math.max(...body.captions.map((c: any) => (typeof c?.endMs === 'number' ? c.endMs : 0)))
      : 0;
    const captionDurationFrames = lastCaptionEndMs > 0 ? Math.ceil((lastCaptionEndMs / 1000) * 30) : 150;
    const durationInFrames = Math.max(
      typeof body.durationInFrames === 'number' && body.durationInFrames > 0 ? body.durationInFrames : 0,
      captionDurationFrames
    );

    const inputProps = {
      captions: body.captions,
      styleVariant: body.styleVariant,
      styleOverrides: body.styleOverrides,
      overlaySettings: body.overlaySettings,
      frameSettings: body.frameSettings,
      textureSettings: body.textureSettings,
      motionSettings: body.motionSettings,
      videoMotion: body.videoMotion,
      assetSettings: body.assetSettings,
      audioAmplitude: body.audioAmplitude,
      durationInFrames,
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

  const lastCaptionEndMs = Math.max(...body.captions.map((c: any) => (typeof c?.endMs === 'number' ? c.endMs : 0)));
  const captionDurationFrames = lastCaptionEndMs > 0 ? Math.ceil((lastCaptionEndMs / 1000) * 30) : 150;
  const durationInFrames = Math.max(
    typeof body.durationInFrames === "number" && body.durationInFrames > 0 ? body.durationInFrames : 0,
    captionDurationFrames
  );

  const jobId = randomUUID();
  exportJobs.set(jobId, { status: "rendering", progress: 0 });

  void runGreenScreenRender(jobId, {
    ...body,
    durationInFrames,
  } as GreenScreenRequestBody);

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
    const lastCaptionEndMs = Array.isArray(body.captions) && body.captions.length > 0
      ? Math.max(...body.captions.map((c: any) => (typeof c?.endMs === 'number' ? c.endMs : 0)))
      : 0;
    const captionDurationFrames = lastCaptionEndMs > 0 ? Math.ceil((lastCaptionEndMs / 1000) * 30) : 150;
    const durationInFrames = Math.max(
      typeof body.durationInFrames === 'number' && body.durationInFrames > 0 ? body.durationInFrames : 0,
      captionDurationFrames
    );

    const inputProps = {
      captions: body.captions,
      mediaUrl,
      styleVariant: body.styleVariant,
      styleOverrides: body.styleOverrides,
      overlaySettings: body.overlaySettings,
      frameSettings: body.frameSettings,
      textureSettings: body.textureSettings,
      motionSettings: body.motionSettings,
      videoMotion: body.videoMotion,
      assetSettings: body.assetSettings,
      audioAmplitude: body.audioAmplitude,
      durationInFrames,
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

  const lastCaptionEndMs = Math.max(...body.captions.map((c: any) => (typeof c?.endMs === 'number' ? c.endMs : 0)));
  const captionDurationFrames = lastCaptionEndMs > 0 ? Math.ceil((lastCaptionEndMs / 1000) * 30) : 150;
  const durationInFrames = Math.max(
    typeof body.durationInFrames === "number" && body.durationInFrames > 0 ? body.durationInFrames : 0,
    captionDurationFrames
  );

  const jobId = randomUUID();
  exportJobs.set(jobId, { status: "rendering", progress: 0 });

  void runVideoRender(jobId, mediaFile.path, {
    ...body,
    durationInFrames,
  } as VideoRequestBody);

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
  console.log(`Caption Studio server listening on http://localhost:${PORT}`);
});
