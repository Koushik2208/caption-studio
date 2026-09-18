# Caption Studio

Caption Studio is a creative caption and video editing tool built on [Remotion](https://www.remotion.dev/). It converts video and subtitle/transcript files (.srt) or Creative JSON documents into editable, content-aware caption treatments, dynamic compositions, and server-rendered MP4 video exports.

---

## Input Workflows

Caption Studio supports three primary input workflows:

1. **Video + SRT Subtitles**: Upload media (MP4, MOV, etc.) along with an existing `.srt` file. Word-level timings are automatically parsed and mapped into animated captions.
2. **Transcript/SRT-based Creative JSON**: Generate or load a structured Creative JSON specification created from transcript or SRT data to orchestrate styling, layouts, and effects.
3. **Direct Creative JSON Import**: Paste or load complete Creative JSON specifications directly into the studio to configure full multi-beat projects, typography, transitions, audio effects, and composition settings.

---

## Creative JSON

**Creative JSON** is the portable creative specification format used by Caption Studio to define and serialize project state. It contains:

- **Semantic Beats**: Segmented narrative blocks with frame-accurate start/end timing.
- **Timing & Alignment**: Word-level timestamps, anchor points, and positional coordinates.
- **Typography & Styling**: Font presets, size multipliers, custom colors, gradients, stroke, shadow, glow, and backdrops.
- **Animation Variants**: Animated kinetic presets (karaoke, kinetic word stamp, bounce, fade, typewriter, slide, street split, etc.).
- **Visual Composition**: Full bleed, card containers, top/bottom split, and left/right split layouts with aspect ratio and border controls.
- **Video Motion & Effects**: Dynamic camera pans, zoom in/out, Ken Burns motion, and sway animations.
- **Overlays & Textures**: Film grain, chromatic aberration, scanlines, vignettes, and audio-reactive pulse.
- **Transitions**: Frame-accurate visual transition overlays (e.g. film burns, flashes).
- **SFX**: Timed sound effects mapped to key beats and narrative cues.
- **Asset References**: Structured references to video media and studio audio/visual assets.

---

## Built-In Asset Library

Caption Studio comes with a built-in library of registered assets ready for composition and audio design:

- **Transition Overlays (2)**: High-energy overlay transitions (`film_burn`, `flash`).
- **Sound Effects (20)**: Cinematic impacts, bass hits, whooshes, risers, UI clicks, pops, typing, and camera shutter effects.

---

## Rendering Pipeline

Caption Studio renders final output videos via Remotion's server-side rendering pipeline (`server/index.ts`):

- **Video Export (MP4)**: Bundles the Remotion composition with `<OffthreadVideo>` and renders H.264 MP4 with hardware-accelerated frame extraction.
- **Green Screen Export (MP4)**: Renders captions and visual overlays on a chroma key background for overlaying in external NLEs.
- **SRT Export**: Exports clean, formatted `.srt` subtitle files with edited text and timestamps.

---

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- Windows, macOS, or Linux

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd caption-studio

# 2. Install dependencies
npm install
```

### Running the Application

```bash
# Start both Vite client (port 5173) and Express render server (port 5175)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

- `npm run dev` — Starts Vite dev server and Express server concurrently.
- `npm run dev:client` — Runs the Vite development frontend only.
- `npm run dev:server` — Runs the Express Remotion rendering backend server only.
- `npm run build` — Type-checks TypeScript (`tsc -b`) and builds the Vite production bundle.
- `npm run lint` — Runs ESLint across the codebase.
- `npm run preview` — Previews the production build locally.

---

## Important Limitations

- **Speech-to-Text Transcription**: Caption Studio does not bundle or provide a local speech-to-text transcription engine. Users should supply an existing `.srt` subtitle file or use Creative JSON specifications containing transcript timestamps.
