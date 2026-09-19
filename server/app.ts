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

// On serverless / Vercel environments, write to /tmp or local tmp directory
const BASE_TMP_DIR = process.env.VERCEL ? "/tmp" : "tmp";
const UPLOAD_DIR = path.join(BASE_TMP_DIR, "uploads");
const EXPORT_DIR = path.join(BASE_TMP_DIR, "exports");

try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
} catch {
  // Directory creation may be constrained or already present
}

const REMOTION_ENTRY = path.resolve("src/remotion/index.ts");
const PUBLIC_DIR = fs.existsSync(path.resolve(process.cwd(), "public"))
  ? path.resolve(process.cwd(), "public")
  : path.resolve(import.meta.dirname ?? "", "../public");

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

// Safe diagnostic request logging middleware
app.use((req, res, next) => {
  const requestId = randomUUID().slice(0, 8);
  (req as any).requestId = requestId;
  res.setHeader("x-request-id", requestId);
  const start = Date.now();
  const pathName = req.path;
  const method = req.method;

  if (pathName.startsWith("/api")) {
    console.log(`[API] requestId=${requestId} method=${method} path=${pathName} timestamp=${new Date().toISOString()}`);
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`[API] requestId=${requestId} status=${res.statusCode} duration=${duration}ms`);
    });
  }
  next();
});

// Remotion's renderer hard-rejects local filesystem paths for OffthreadVideo/
// Video/Audio src (it only downloads http(s):// URLs, even server-side - see
// LEARNINGS.md), so an uploaded export video has to be reachable over HTTP
// during the render, not just present on disk.
app.use("/tmp-media", express.static(path.resolve(UPLOAD_DIR)));

const cleanup = (...filePaths: (string | undefined)[]) => {
  for (const filePath of filePaths) {
    if (!filePath) continue;
    fs.rm(filePath, { force: true }, () => {});
  }
};

let bundlePromise: Promise<string> | null = null;
const getServeUrl = (): Promise<string> => {
  if (!bundlePromise) {
    bundlePromise = bundle({
      entryPoint: REMOTION_ENTRY,
      publicDir: PUBLIC_DIR,
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
  scale?: number;
  orientation?: "vertical" | "horizontal";
};

const runGreenScreenRender = async (jobId: string, body: GreenScreenRequestBody, requestId?: string) => {
  const job = exportJobs.get(jobId);
  if (!job) return;

  const startTime = Date.now();
  console.log(`[EXPORT] requestId=${requestId ?? 'unknown'} jobId=${jobId} type=green-screen render=started captionsCount=${body.captions.length} durationInFrames=${body.durationInFrames}`);

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
    const elapsed = Date.now() - startTime;
    console.log(`[EXPORT] jobId=${jobId} render=completed duration=${elapsed}ms outputPath=${outputPath}`);
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[EXPORT] jobId=${jobId} render=failed duration=${elapsed}ms error=`, error);
    job.status = "error";
    job.error = error instanceof Error ? error.message : "Render failed";
  }
};

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "caption-studio-api",
    environment: process.env.VERCEL ? "production" : (process.env.NODE_ENV ?? "development"),
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.post("/api/export-green-screen", (req, res) => {
  const requestId = (req as any).requestId;
  const body = req.body as Partial<GreenScreenRequestBody>;

  if (!Array.isArray(body.captions) || body.captions.length === 0) {
    res.status(400).json({ ok: false, error: "Missing required 'captions' array" });
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
  } as GreenScreenRequestBody, requestId);

  res.status(202).json({ jobId });
});

type VideoRequestBody = GreenScreenRequestBody;

const runVideoRender = async (jobId: string, mediaPath: string, body: VideoRequestBody, requestId?: string) => {
  const job = exportJobs.get(jobId);
  if (!job) return;

  const startTime = Date.now();
  console.log(`[EXPORT] requestId=${requestId ?? 'unknown'} jobId=${jobId} type=video render=started captionsCount=${body.captions.length} durationInFrames=${body.durationInFrames}`);

  try {
    const serveUrl = await getServeUrl();
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
    const elapsed = Date.now() - startTime;
    console.log(`[EXPORT] jobId=${jobId} render=completed duration=${elapsed}ms outputPath=${outputPath}`);
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[EXPORT] jobId=${jobId} render=failed duration=${elapsed}ms error=`, error);
    job.status = "error";
    job.error = error instanceof Error ? error.message : "Render failed";
  } finally {
    cleanup(mediaPath);
  }
};

app.post("/api/export-video", videoUpload.single("media"), (req, res) => {
  const requestId = (req as any).requestId;
  const mediaFile = req.file;
  if (!mediaFile) {
    res.status(400).json({ ok: false, error: "Missing required 'media' file" });
    return;
  }

  let body: Partial<VideoRequestBody>;
  try {
    body = JSON.parse(req.body.payload ?? "{}");
  } catch {
    cleanup(mediaFile.path);
    res.status(400).json({ ok: false, error: "Invalid 'payload' JSON" });
    return;
  }

  if (!Array.isArray(body.captions) || body.captions.length === 0) {
    cleanup(mediaFile.path);
    res.status(400).json({ ok: false, error: "Missing required 'captions' array" });
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
  } as VideoRequestBody, requestId);

  res.status(202).json({ jobId });
});

const registerJobRoutes = (prefix: string) => {
  app.get(`${prefix}/:jobId`, (req, res) => {
    const job = exportJobs.get(req.params.jobId);
    if (!job) {
      res.status(404).json({ ok: false, error: "Unknown job" });
      return;
    }
    res.json({ status: job.status, progress: job.progress, error: job.error });
  });

  app.get(`${prefix}/:jobId/download`, (req, res) => {
    const job = exportJobs.get(req.params.jobId);
    if (!job || job.status !== "done" || !job.outputPath) {
      res.status(409).json({ ok: false, error: "Render not ready" });
      return;
    }
    res.download(job.outputPath, "caption-export.mp4");
  });
};

registerJobRoutes("/api/export-green-screen");
registerJobRoutes("/api/export-video");

// API 404 Handler - ensures missing API endpoints return 404 JSON and are NEVER swallowed
app.use("/api", (req, res) => {
  const requestId = (req as any).requestId;
  res.status(404).json({
    ok: false,
    error: "API endpoint not found",
    requestId,
    path: req.originalUrl || req.url || req.path,
  });
});

// Safe Express error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const requestId = (req as any).requestId || "unknown";
  console.error(`[API ERROR] requestId=${requestId} path=${req.path} error=`, err);
  if (res.headersSent) return;
  res.status(err.status || 500).json({
    ok: false,
    error: "Internal server error",
    requestId,
    message: err instanceof Error ? err.message : "Internal server error",
  });
});

export { app, PORT };
export default app;
