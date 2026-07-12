# Caption Studio

A local video-captioning studio built on [Remotion](https://www.remotion.dev/): upload a voiceover (and optionally a script), get word-synced animated captions over a template background, preview them live, and export a rendered MP4. Vertical 1080x1920, 30fps.

Transcription runs fully locally via [whisper.cpp](https://github.com/ggerganov/whisper.cpp) — no API keys, no cloud calls, no data leaves your machine.

## Requirements

- [Node.js](https://nodejs.org/) 20 or later (tested on 24)
- ~200MB free disk space for the local whisper.cpp binary + speech model (downloaded once, see below)
- Windows, macOS, or Linux

No API keys or accounts are required.

## Setup

```bash
# 1. Clone the repo
git clone <this-repo-url>
cd caption-studio

# 2. Install dependencies
npm install

# 3. Download whisper.cpp + the transcription model (one-time, ~150MB)
npm run setup:whisper
```

Step 3 downloads the `whisper.cpp` binary and the `small.en` speech-to-text model into `tools/whisper/` (gitignored, machine-specific). Re-run `npm run setup:whisper` any time that folder is missing or you switch machines.

## Running locally

```bash
npm run dev
```

This starts both the Vite frontend and the local transcription/render server (`server/index.ts`) concurrently. Open the URL Vite prints (typically http://localhost:5173).

- Upload an audio file (and optionally a script as `.srt`) to generate word-level captions — transcription happens locally via whisper.cpp, no network calls.
- Preview captions live over the template background using the Remotion Player.
- Export a rendered MP4 via the built-in render pipeline.

Other scripts:

```bash
npm run dev:client   # Vite frontend only
npm run dev:server   # transcription/render server only
npm run build         # type-check + production build
npm run lint          # eslint
npm run preview       # preview the production build
```

## How transcription works

"Local LLM" here refers to whisper.cpp, a fast, dependency-free C++ implementation of OpenAI's Whisper speech-to-text model, run entirely on your CPU:

1. `npm run setup:whisper` downloads a prebuilt `whisper.cpp` binary and the `small.en` model (English-only, ~150MB) into `tools/whisper/`.
2. When you upload audio, the server converts it to 16kHz mono WAV (via the bundled `ffmpeg-static`, no system ffmpeg install needed) and runs it through whisper.cpp for word-level timestamps.
3. If you also supply a script (`.srt`), the transcript's wording is aligned to your script text while keeping Whisper's timing — see `server/index.ts` for details.

Everything runs on-device; nothing is uploaded anywhere.

## Project layout

- `src/` — React app: caption styles, preview player, export UI, Remotion compositions
- `server/` — Express server for transcription (whisper.cpp) and MP4 rendering (Remotion)
- `scripts/setupWhisper.mjs` — one-time whisper.cpp + model installer
- `tools/whisper/` — downloaded whisper.cpp binary + model (gitignored)
- `PLAN.md`, `PROGRESS.md`, `LEARNINGS.md` — build spec, phase status, and known issues/fixes for anyone continuing development
