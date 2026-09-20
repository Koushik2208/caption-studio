<img width="1896" height="1078" alt="image" src="https://github.com/user-attachments/assets/62329eea-6bff-4857-b56a-d0d4ee27ff05" />

# Caption Studio

Caption Studio is a creator-focused web application for turning transcripts, ideas, and raw video footage into engaging, beautifully styled short-form video content (UGC, Reels, Shorts, and TikToks). Built with React, Tailwind CSS, and [Remotion](https://www.remotion.dev/), it provides structured storytelling, semantic beat-based caption choreography, rich visual effects, and server-side MP4 rendering.

---

## What It Does

Caption Studio bridges the gap between raw transcripts or creative concepts and polished, animated short-form video. Rather than acting as a generic, complex video editor, Caption Studio focuses on the creative storytelling workflow:

**Language:** Caption Studio supports source transcripts in any language, but its generated caption/subtitle output is **English only**. Non-English speech is translated into English while preserving the original timing and meaning.

- **Structure Stories**: Organize content into narrative beats (Hook, Conflict, Journey, Outcome).
- **Style Captions**: Apply curated typography, vibrant color palettes, badges, stroke, shadow, and kinetic animations.
- **Compose Layouts**: Frame videos with full-bleed, split-screen, or card-container layouts.
- **Layer Effects**: Add film grain, scanlines, chromatic aberration, camera motion, and customizable gradient overlays.
- **Sound Design & Transitions**: Place timed transition overlays (film burns, flashes) and SFX audio hits (cinematic impacts, whooshes, UI pops).
- **Render & Export**: Produce final MP4 videos, green-screen caption overlays, or updated SRT subtitles.

---

## Workflow

```
Idea / SRT / Transcript
       │
       ▼
Creative Planning (ChatGPT + Creative Director Prompt)
       │
       ▼
Portable Creative JSON Specification
       │
       ▼
Caption Studio Editor (Beats, Styling, Composition, Overlays, SFX)
       │
       ▼
Real-Time Player Preview
       │
       ▼
Server-Side Export (MP4 Video / Chroma Key / SRT)
```

### Working with External Tools

Caption Studio fits seamlessly into existing creator workflows alongside tools you already use:

1. **Get your transcript**: Export an `.srt` subtitle file from any transcription tool or video editor (such as Microsoft Clipchamp).
2. **Generate your creative plan**: Pass your transcript or idea to ChatGPT using the **Creative Director** system prompt (`CREATIVE_DIRECTOR_SYSTEM_PROMPT.md`) to create a schema-validated Creative JSON.
3. **Multilingual support**: Caption Studio accepts transcripts in any language, but the generated captions/subtitles are **English only**. Non-English transcripts are translated into English while preserving the original meaning, sequence, and exact source timestamps.
4. **Style and customize**: Import the JSON into Caption Studio to fine-tune typography, timing, transitions, audio, and visual composition.
5. **Preview & export**: Verify in the real-time player and render the final video.

---

## Features & Capabilities

- **SRT & Transcript Parsing**: Ingest standard `.srt` files and automatically partition them into word-level timestamps.
- **Creative JSON Import & Export**: Full bidirectional serialization of project state, beats, overrides, and creative choices.
- **Semantic Narrative Beats**: Segment video pacing into distinct narrative beats with start/end frames and beat-specific overrides.
- **Typography & Styling**:
  - Curated fonts (Inter, Montserrat, Bebas Neue, Anton, Playfair Display, etc.)
  - Text transforms (uppercase, lowercase), alignment, letter spacing, line height
  - Text colors, fill gradients, outlines, drop shadows, and background highlight boxes
  - Word-level typography overrides for targeted keyword emphasis
- **Kinetic Caption Animations**:
  - Karaoke word-by-word highlight
  - Kinetic word stamp
  - Bounce and fade
  - Typewriter
  - Slide in / out
  - Street split
- **Video Motion & Framing**:
  - Dynamic pan, zoom in/out, Ken Burns camera drift, and subtle sway animations
  - Composition layouts: Full Bleed, Floating Card, Top/Bottom Split, and Left/Right Split
- **Textures & Overlays**:
  - Film grain, chromatic aberration, scanlines, vignettes, and audio-reactive pulse
  - Brand watermark and dynamic progress bars
- **Configurable Gradient Overlay**:
  - Directional video dimming (top, bottom, left, right, diagonals)
  - Configurable opacity and strength for optimal caption contrast
  - Global defaults with beat-level overrides
- **Transitions & SFX**:
  - Frame-accurate video transition overlays (`film_burn`, `flash`)
  - 20 registered sound effects (impacts, bass drops, whooshes, risers, clicks, pops)
  - User-friendly time input in decimal seconds (auto-converted to frame accuracy)
- **Responsive Workspace**:
  - Desktop: Multi-panel creative studio with persistent video preview, category navigation, and inspector.
  - Mobile & Tablet: Responsive layout for project loading, previewing, and mobile-friendly setting edits.

---

## Creative JSON

**Creative JSON** is the canonical, portable project format used by Caption Studio. It encapsulates the complete artistic direction of a video:

- **Document Metadata**: Version, mode (`idea`, `srt`, `transcript`, `plain_text`), author, and source.
- **Timeline & Media**: Duration in frames, frame rate (30fps default), canvas dimensions (e.g., 1080x1920), and media asset bindings.
- **Global Settings**: Default typography, caption position, animations, layouts, motion, textures, and gradient overlay.
- **Semantic Beats Array**: Chronological narrative segments with word-level captions, custom beat styling, gradient overrides, transition triggers, and SFX cues.
- **Strict Validation**: Validated against JSON schemas (`src/creative/schema.ts`) with zero-tolerance checks for frame overlap, unregistered assets, or duration limits (5-minute maximum).

---

## Creative Director System Prompt

The repository includes a production-tested system prompt for LLMs located at:

[`CREATIVE_DIRECTOR_SYSTEM_PROMPT.md`](./CREATIVE_DIRECTOR_SYSTEM_PROMPT.md)

This prompt guides AI models (such as ChatGPT) to act as an automated creative director:
- Converts unstructured ideas, transcripts, or multilingual SRT files into valid Creative JSON.
- Segments continuous speech into punchy narrative beats.
- Selects appropriate animations, keyword highlights, SFX placements, and composition layouts based on content sentiment.

---

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later recommended)
- npm

### Installation

```bash
git clone <repository-url>
cd caption-studio
npm install
```

### Running Locally

```bash
# Start both Vite client (port 5173) and Express rendering server (port 5175)
npm run dev
```

The web application will be available at [http://localhost:5173](http://localhost:5173).

### Available Scripts

- `npm run dev`: Starts Vite frontend and Express server concurrently.
- `npm run dev:client`: Runs the Vite frontend development server only.
- `npm run dev:server`: Runs the Express Remotion backend server only.
- `npm run build`: Type-checks TypeScript (`tsc -b`) and builds the Vite production bundle.
- `npm run lint`: Runs ESLint across the codebase.
- `npm run preview`: Previews the production build locally.

### Verification Test Suites

You can run the built-in test suites using `tsx`:

```bash
# Verify Creative JSON schemas, validation, serialization, and beat partitioning
npx tsx scripts/verifyCreativeJson.ts

# Verify asset catalog and registry integrity
npx tsx scripts/verifyAssetLibrary.ts

# Verify multilingual prompt requirements and translation rules
npx tsx scripts/verifyMultilingualPrompt.ts

# Verify gradient overlay system and beat overrides
npx tsx scripts/verifyGradientOverlay.ts

# Verify custom card and composition layouts
npx tsx scripts/verifyCustomCards.ts

# Verify video motion calculations
npx tsx scripts/verifyVideoMotion.ts

# Verify seconds-to-frames transition & SFX placement UX
npx tsx scripts/verifyManualPlacementUx.ts
```

---

## Rendering Pipeline

Caption Studio uses a dual-engine architecture:

1. **Client-Side Live Preview**: Rendered in real-time via `@remotion/player`, allowing creators to scrub, play, and preview caption animations, transitions, and overlays instantly.
2. **Server-Side Render Engine** (`server/index.ts`): Express server powered by `@remotion/renderer` and `@remotion/bundler`:
   - **Video Export (MP4)**: Bundles the Remotion composition with `<OffthreadVideo>` and hardware-accelerated H.264 rendering.
   - **Green Screen Export (MP4)**: Renders animated captions and graphics against a pure chroma-key background for importing into external NLEs (Premiere, Final Cut, DaVinci Resolve).
   - **SRT Subtitle Export**: Generates clean, timestamped `.srt` subtitle files with edited text.

---

## Project Structure

```
caption-studio/
├── CREATIVE_DIRECTOR_SYSTEM_PROMPT.md  # LLM system prompt for Creative JSON generation
├── server/                             # Express backend for Remotion bundling & MP4 rendering
│   └── index.ts
├── public/assets/                      # Sound effects, transition assets, and static media
├── scripts/                            # Verification and test suites
└── src/
    ├── captions/                       # Caption parsing, layout, and kinetic animation components
    ├── components/                     # Shared UI components, layout shell, inspector panels
    ├── context/                        # ProjectContext state management & persistence
    ├── creative/                       # Creative JSON schema, capability catalog, and validation
    ├── frames/                         # Visual composition frames and borders
    ├── motion/                         # Text and graphic animation presets
    ├── overlay/                        # Gradient overlays, watermarks, progress bars
    ├── pages/                          # WelcomePage, ImportPage, StylePage, ExportPage
    ├── preview/                        # Remotion Player integration and canvas wrappers
    ├── remotion/                       # Remotion Root compositions and video pipelines
    ├── textures/                       # Film grain, scanlines, chromatic aberration shaders
    └── videoMotion/                    # Dynamic camera pans, zooms, and sway transforms
```

---

## Status

Caption Studio is an actively developed creator tool. It focuses on fast, reliable, and expressive caption creation for short-form UGC and storytelling video production.
