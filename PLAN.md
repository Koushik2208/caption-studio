# Faceless Content System — FINAL MASTER PLAN

Daily output: 45–60s vertical videos. Positive/fascinating facts (science, nature, space, tech, human achievement, health, animals, unusual history). English first, Telugu later. No face, no filming — voiceover + animated visuals + word-synced captions.

---

# PART A — DAILY WORKFLOW (the routine)

```
1. Morning research prompt → Perplexity + Grok (2 copy-pastes)
2. Both responses → Claude (with interview system prompt)
3. Claude picks best hook fact, asks 3-4 simple questions one at a time
4. You answer honestly → Claude outputs:
   - 130-160 word voiceover script with **keywords** bolded
   - Scene pacing suggestion
   - Visual plan: per segment, 1 stock search term + 1 Google Flow prompt
5. Record voiceover (phone is fine, quiet moment, clean audio)
6. Search stock sites with the given terms; any segment with no good result → paste the Flow prompt, generate the clip
7. Transcribe → captions.json (script from Part B)
8. Fill scene-manifest.json (3-6 scenes), drop files in folders
9. Preview in Remotion Studio → render → post
```

## A1. Morning research prompt (paste in BOTH Perplexity and Grok)
```
Give me 5 genuinely surprising, feel-good, or fascinating facts/stories
from the last 24-48 hours (or recent if nothing new fits). Only positive
or neutral topics — science, nature, space, technology, human achievement,
health/medical breakthroughs, animals, unusual history. Do NOT include
anything about politics, religion, war, tragedy, or divisive/controversial
topics.

For each item give:
- A one-line summary
- Why it's surprising or uplifting
- The source (name + link)

Prioritize things that would make someone stop scrolling — genuinely
unexpected over merely informative.
```
Different engines surface different stories; overlap between them = signal the story is genuinely notable.

## A2. Interview system prompt (set once in Claude, then just paste digests)
```
You are a script-writing partner for my faceless short-form video channel.
Topic: positive, uplifting, or fascinating facts — science, nature, space,
technology, human achievement, health/medical breakthroughs, animals,
unusual history. NEVER use political or religious topics, even if one
slips into my digest — skip it and pick the best remaining fact instead.
Videos are 45-60 seconds, English voiceover, vertical (9:16) format, with
animated word-by-word captions and keyword highlighting.

Each session I will paste today's fact digest (from Perplexity + Grok,
3-5+ facts with sources, may overlap).

Your job, in order:

1. Read the facts. Silently pick the ONE most hook-worthy fact — the one
   most likely to make someone stop scrolling in the first 3 seconds.
   (Surprising or counterintuitive beats merely interesting.)

2. Ask me 3-4 SIMPLE questions, ONE AT A TIME, waiting for my answer
   before the next. Each must be answerable in 1-2 sentences and must
   surface MY reaction or opinion, not restate the fact. Shapes like:
   - "Does this surprise you, or confirm something you suspected?"
   - "If you had to guess why this happens, what's your gut theory?"
   - "What's the one sentence you'd say to someone who doesn't believe this?"
   Vary questions to fit the fact — never the same set daily.

3. After my last answer, write the voiceover script:
   - Hook line (first 3-5 sec): boldest claim or question, under 12 words
   - Body: facts + my answers woven together, spoken rhythm, short
     sentences, my phrasing kept, zero AI-sounding filler
   - **Bold** 4-8 words/phrases for caption keyword highlights
   - Close with a punchy line or open question — never "like and subscribe"
   - 130-160 words total (45-60 sec natural pace)

4. Add one line of scene pacing, e.g.:
   "Pacing: hook 0-5s, calm explanation 5-30s, energetic close 30-45s"

5. VISUAL PLAN — split the script into 3-5 visual segments. For EACH:
   - One concise stock-footage search term (2-4 words, generic enough to
     get results on Pexels/Pixabay/NASA, e.g. "coral reef macro",
     "telescope night sky", "laboratory microscope closeup")
   - One AI video generation prompt as fallback, formatted for Google
     Flow/Veo: one flowing sentence covering subject + motion + camera
     movement + lighting/mood, ending with "vertical 9:16 format,
     cinematic, no text, no people's faces". Example: "Slow push-in on a
     glowing jellyfish drifting upward through dark deep-sea water,
     bioluminescent particles floating around it, soft blue light,
     vertical 9:16 format, cinematic, no text, no people's faces."

Rules:
- Never invent facts beyond my digest or my answers
- Keep MY voice — don't polish personality away
- If my answer contradicts a fact, ask a follow-up instead of smoothing it
- If I paste only 1-2 facts, proceed the same way with the best one
```

## A3. B-roll sources (in priority order)
1. **Pexels Videos / Pixabay Videos** — biggest free libraries, commercial use, no attribution
2. **NASA (images.nasa.gov) / NOAA / Wikimedia Commons** — public domain, zero licensing risk ever; perfect fit for space/ocean/nature/history topics
3. **Mixkit / Coverr** — curated abstract/aesthetic clips (light, water, clouds) that back almost any fact
4. **Google Flow (AI)** — fallback when search fails; the visual plan gives you the exact prompt, just paste

**Batch rule:** don't hunt daily. Once a week, download 15-20 clips across recurring themes (space, ocean, forest, lab, animals, timelapse) into folders named after your registry categories. Generic themed footage that matches the *emotion* works for most facts — you rarely need the literal subject.

---

# PART B — REMOTION BUILD (tomorrow's session)

## System model
One audio+transcript timeline; three independent layers:
1. **Visual track** — scenes from scene-manifest.json (hook / loop / subject / broll)
2. **Caption track** — continuous word-synced overlay across the whole video
3. **Subject track** — transparent character over template backgrounds, only in subject scenes

You "edit" by filling a JSON array. No timeline UI.

## Tech stack (verified current)
- Remotion (`npx create-video@latest`, or the official TikTok template which pre-wires Whisper)
- `@remotion/captions` — Caption type, parseSrt(), createTikTokStyleCaptions()
- **Voiceover source: Clipchamp TTS (current), own voice + Telugu (later).**
  - TTS path (now): script text = ground truth (you typed it, no ASR guessing needed). Get timing from Clipchamp's auto-caption SRT export via `parseSrt()`. SRT is phrase-level, not word-level — approximate per-word timing by splitting each block's duration proportionally by character length (TTS pacing is even, so this works well). No Whisper model download needed for this path.
  - Own-voice path (later): switch to Whisper.cpp local transcription for real word-level timestamps (natural speech pacing is too uneven for interpolation to hold up). Same for Telugu — use a non-`.en` multilingual model then.
  - If Clipchamp SRT text ever disagrees with your script (rare — numbers/abbreviations can trip ASR), trust your script, keep the SRT's timestamps.

## B1. Captions — build exactly three
1. **Signature style** (pick ONE, commit — recommend Word Pop + brand-color karaoke fill combined). Consistency = brand recognition.
2. **Keyword highlight** — words bolded in the script get color + scale + glow automatically. Maintain a small keyword list or parse the **bold** marks.
3. **Calm phrase mode** — whole phrase fades as a block. Alternated via `captionMode` per scene so word-by-word stays special. 5 minutes of nonstop bounce fatigues viewers.

Defer all other styles (typewriter, blur-in, flips, emotion palettes) — renderer supports adding each in ~20 lines later.

### Caption splitting — no 4-5 line blocks (Session 1, mandatory)
1. **Word-level timestamps at source.** Sentence-level segments can never be split. Sanity check: if any captions.json entry has >2 words of text, fix transcription first.
2. **`combineTokensWithinMilliseconds: 700-1000`** for vertical.
3. **Character-budget splitter** — createTikTokStyleCaptions groups only by TIME; post-process any page over ~20 chars into sub-pages, rebuilding startMs/durationMs from first/last token.
Layout net: fixed ~80-90px bold at 1080×1920 (never auto-shrink), maxWidth 85%, container capped at 2 lines. ~15-20 chars/line at that size.

### Fast-speech sync — no omitted words (Session 1, mandatory)
1. **Contiguous pages:** each page ends where the next begins. Frames: `from = round(startMs/1000*fps)`, `durationInFrames = max(1, nextFrom - from)`. Nothing falls between frames.
2. **Highlight = latest started token:** active token = LAST token with `fromMs <= currentTimeMs` (range checks miss zero-duration words).
3. **Min-duration merge:** after splitting, merge pages under ~350-500ms into a neighbor (respecting char cap). Fast bursts → more words/page, slow speech → fewer. Display rhythm mirrors speech rhythm.

**Pipeline order (one processCaptions() function, all styles inherit it):**
createTikTokStyleCaptions → char split → min-duration merge → contiguous frame conversion.

## B2. Hook layer (the retention work)
- **`hook` scene type**, first ~5s: 1-3 words per screen at 140-200px, cuts every 0.8-1.5s driven by caption timing, highest-contrast palette
- **Punch-in zooms (global):** whole frame springs 1.0 → ~1.06 at each sentence start (sentence starts come free from captions.json). ~10 lines wrapping the composition; the cheapest "this feels edited" effect that exists.
- Pacing: hook = energetic captions + fast bg; body alternates calm/energetic every 2-3 scenes.

## B3. Backgrounds — 2 components + registry
Build only **WaveBackground** (SVG sine waves) and **LineGrid** (drifting lines). Shared props: `{ primaryColor, secondaryColor, speed, density?, jitter? }`.

```ts
export const TEMPLATE_REGISTRY = {
  science:  { component: LineGrid,       palette: ["#00f7ff", "#001018"], speed: 1.0 },
  nature:   { component: WaveBackground,  palette: ["#2ecc71", "#04170c"], speed: 0.6 },
  space:    { component: LineGrid,       palette: ["#8e7bff", "#050014"], speed: 0.5 },
  happy:    { component: WaveBackground,  palette: ["#ffd23f", "#241d00"], speed: 1.2 },
  excited:  { component: WaveBackground,  palette: ["#ff9500", "#1a0a00"], speed: 1.8 },
  hook:     { component: LineGrid,       palette: ["#ffffff", "#000000"], speed: 2.0 },
  default:  { component: WaveBackground,  palette: ["#333333", "#0d0d0d"], speed: 0.6 },
};
```
New category/emotion = one line, never new code. FloatingRectangles / GradientBlob / PulseRings are Day 3+.

**Legibility scrim** — one shared component: subtle dark gradient behind the caption zone in EVERY scene. Build tomorrow or bright palettes make captions unreadable.

## B4. Subject scenes
Transparent PNG/WebP character over registry background. **Idle float** (sine ±8px) + **spring pop-in** on scene start (~15 lines). Defer nod-on-sentence and Ken Burns.

## B5. Scene manifest
```json
[
  { "type": "hook",    "category": "hook",                                   "startSec": 0,  "endSec": 5,  "captionMode": "energetic" },
  { "type": "broll",   "source": "broll/jellyfish.mp4",                      "startSec": 5,  "endSec": 22, "captionMode": "calm" },
  { "type": "subject", "category": "happy", "image": "subject/ghibli.png",   "startSec": 22, "endSec": 34, "captionMode": "energetic" },
  { "type": "loop",    "category": "space",                                  "startSec": 34, "endSec": 50, "captionMode": "calm" }
]
```
- `broll` = `<OffthreadVideo>` in a Sequence (5 lines); `loop` = registry background full-screen (your no-footage safety net — since it's code-driven it loops seamlessly, unlike sourced gifs)
- **Picking times:** read sentence timestamps from captions.json; boundaries always land on sentence starts. Optional 10-line helper that prints each sentence with its timestamp.

## File structure
```
src/
  Root.tsx
  compositions/MasterComposition.tsx     # reads manifest, stitches scenes, punch-in wrapper
  captions/
    processCaptions.ts                    # split + merge + contiguous conversion
    CaptionRenderer.tsx                   # style + captionMode switch
    styles/ Signature.tsx  KeywordHighlight.tsx  CalmPhrase.tsx
  scenes/ HookScene.tsx  BrollScene.tsx  SubjectScene.tsx  LoopScene.tsx
  templates/
    registry.ts
    backgrounds/ WaveBackground.tsx  LineGrid.tsx
  subject/SubjectLayer.tsx
  shared/LegibilityScrim.tsx
scripts/transcribe.mjs
public/ audio/  broll/  subject/  captions/*.json  scene-manifest/*.json
```

## Build order (realistic: ~2 focused hours; Claude Code compresses this a lot)
**Session 1 — pipeline proof (~55 min, in order):**
1. Scaffold + transcribe real voiceover → captions.json (15)
2. CaptionRenderer, signature style over solid color, WITH processCaptions (split + merge + contiguous frames) and 2-line cap (20)
3. MasterComposition reading a 3-scene manifest of loop scenes, hardcoded colors (15)
4. Preview, verify sync incl. a fast-spoken section (5)

**Session 2 — the interesting parts (~60 min):**
5. WaveBackground + LineGrid + registry, 5-6 entries (20)
6. Hook scene + punch-in zoom wrapper (15)
7. Keyword highlight + calm mode + captionMode switching (15)
8. SubjectScene (float + pop-in) + legibility scrim (10)

**Stop-loss:** if Session 1 overruns, do NOT half-start Session 2 — captions over a solid color is already a postable video.

**Day 2+:** extra backgrounds & caption styles, emotion-reactive palettes, sentence-timestamp helper, batch rendering, multi-aspect export, minimal caption-editing UI.

---

# PART C — PREP TONIGHT
- [ ] Node + npx working
- [ ] Whisper model downloaded; test-transcribe one clip TONIGHT (the 1.5GB download must not eat tomorrow's session); verify word-level timestamps in the output
- [ ] Real voiceover file ready; 1 transparent subject image
- [ ] 2-3 brand colors decided (feeds registry + signature style)
- [ ] Keyword list for the test video (5-10 words)
- [ ] Paper sketch of test manifest: hook + 2 loops + 1 subject is plenty
- [ ] Set up the two prompts (A1 in a note for morning use, A2 as Claude system prompt)
- [ ] Create CLAUDE.md in the repo (see Part D) and copy this plan in as PLAN.md

---

# PART D — TOKEN-COST STRATEGY FOR CLAUDE CODE (single-session build)

1. **CLAUDE.md = persistent memory.** Auto-read every session. Seed it with: file structure, processCaptions pipeline order, "captions are ms / Remotion is frames", registry pattern, brand font/colors. Include an `## Errors & Fixes` section — every time a bug gets fixed, say "add that to errors in CLAUDE.md" (one line each). Lessons survive /clear and stop repeat mistakes without re-teaching.
2. **/clear between components, /compact mid-task.** After captions work → /clear. After backgrounds+registry → /clear. Finished component = clear; unfinished but bloated context = compact. This is the biggest single saving.
3. **PLAN.md in the repo, referenced by section.** "Implement Part B1 from PLAN.md" — never paste the plan into chat.
4. **Name exact files in every instruction** ("edit src/captions/processCaptions.ts"), so Claude never explores the repo to orient itself.
5. **Paste trimmed errors only** — last ~10 relevant lines, never full Remotion render logs.
6. **Keep components in separate small files** (architecture already does this) — don't let Claude merge them "for convenience."
7. **Model per task:** strongest model for processCaptions/frame math/spring tuning; Sonnet or Haiku for pattern-following work (new registry entries, LoopScene copied from BrollScene's shape).

**Session flow tomorrow:** CLAUDE.md + PLAN.md in repo → "implement Session 1 step 1" → verify → step 2 → ... → /clear → Session 2 steps. One scoped instruction at a time beats one giant "build everything" prompt on both cost and quality.

---

# Open decisions (settled)
- Transcription: local Whisper.cpp, `medium.en`
- Language: English now; Telugu later = swap to non-`.en` model + retune char budget down (Telugu glyphs render wider). Everything else is language-agnostic.
- Video length: 45-60s while tuning; same system handles 5 min untouched
- B-roll: stock-first (search term per segment), Google Flow as AI fallback (prompt per segment, both auto-generated by the script workflow)

---

# PART E — CAPTION STUDIO UI (separate app, building now)

## Why separate from the video-generation repo
The Remotion pipeline (`faceless-app`) generates videos from scripted JSON manifests. Caption Studio is a different tool: a fast, visual way to turn any audio+SRT into a captioned export without touching JSON or Remotion Studio's engineering-oriented UI. Different audience (fast daily use vs. one-time pipeline build), different repo — new project folder, not mixed into `faceless-app`.

## Design source of truth
`DESIGN.md` (Pro-Tool Minimalist system — colors, type, spacing, elevation, shapes, components), plus Stitch-generated HTML reference for each screen. Both live in the new repo. Build against them directly — don't restate values inline in instructions.

## Structure (4 tabs, confirmed via approved screens)
**Implementation note:** built as 5 React Router routes (`/`, `/import`, `/style`, `/overlay`, `/export`) rather than in-page tab state — same persistent-shell UX, different mechanism. A `/` Welcome landing page was added as the entry point/CTA, not in the original spec but a sensible fit.
- **Persistent shell:** top bar (`Caption Studio` + project name, Import/Style/Overlay/Export tabs, Saving indicator, help, settings, primary Export button) + left icon rail (Upload/Style/Overlay/Export) + center preview canvas (fixed position/size, resizes cleanly between 9:16 and 16:9) + right contextual tool panel (changes per active tab, current tool highlighted in rail).
- **Import tab:** empty state ("Ready to start?" + drag-drop), Upload File card (MP4/MOV/MP3/WAV) + Import SRT card, file-size/duration note.
- **Style tab:** Font Preset grid (4 options), Color & Highlight swatches, Position grid (9-point), live-updating preview.
- **Overlay tab:** toggleable cards (Watermark w/ opacity slider + position grid, Progress Bar w/ color + position) — extension point for future frames/stickers/overlays, same card pattern.
- **Export tab:** format radio group (Video MP4 / **Green Screen Video** / SRT Only), resolution dropdown, watermark toggle, estimated file size, primary Export Project button.

## Reusability mechanism (how future expansion slots in)
Preview canvas + right tool panel is the shell; each top-bar tab swaps only the tool panel's content. Adding a new capability later (frame overlays, sticker overlays, orientation switching) = a new card in the Overlay tab or a new top-bar tab — never a layout change. The 9:16 ⟷ 16:9 toggle already seen in the Style tab is the pattern to reuse for any future orientation-dependent tool.

## Technical approach
- **Preview:** Remotion's `<Player>` component (not Remotion Studio) — embeddable, matches "preview stays fixed" requirement exactly.
- **Caption engine reused as-is:** `processCaptions.ts`, `CaptionRenderer.tsx`, and the style components from `faceless-app` are the actual rendering logic — Caption Studio's Style tab is a UI wrapper selecting/configuring these, not a reimplementation. Copy or share these files from the `faceless-app` repo when scaffolding.
- **Green Screen export:** new minimal composition (`CaptionExport`) — captions only, solid chroma-key background (`#00FF00` or `#00B140`, DaVinci Ultra Key-compatible), no scenes/backgrounds/subject. Reuses `CaptionRenderer` directly.
- **SRT Only export:** serializeSrt() from `@remotion/captions`, no rendering needed.
- **Upload → captions.json:** reuses the SRT/interpolation or Whisper pipeline already built in `faceless-app`.

## Build order
1. Scaffold new repo/folder (React/Next.js), install Remotion `<Player>`
2. Build persistent shell: top bar + icon rail + preview canvas (empty state) + right panel container, matching DESIGN.md + Stitch HTML
3. Import tab: upload handlers (audio + SRT), wire to existing captions pipeline → `<Player>` shows result
4. Style tab: font/color/position controls wired live to `CaptionRenderer` props
5. Export tab: Green Screen Video (primary use case) + SRT Only first; MP4-with-footage and Overlay tab deferred
6. Overlay tab: watermark + progress bar (lowest priority — not needed for immediate green-screen workflow)

---

# PART F — CAPTION CUSTOMIZATION UPGRADE (post Session 3)

## Problems being fixed
1. Keyword highlighting is currently baked into one of the 4 Font Presets (BOLD → `keywordHighlight` variant) — can't toggle it independently of picking a font/animation.
2. `keywordHighlight`'s glow is too strong — a hardcoded shadow value, not a tunable setting.
3. Only 3 base animations exist (Signature/CalmPhrase, plus keywordHighlight which is really "Signature + forced emphasis"); user wants real variety.
4. Only 4 font presets, informally chosen; user did real research on caption-readable fonts and wants that reflected.

## Core architectural fix: decouple animation from keyword emphasis
Today `CaptionStyleVariant` = `'signature' | 'keywordHighlight' | 'calmPhrase'` conflates "which animation plays" with "are keywords emphasized." These are orthogonal and must become independent settings:

```ts
type BaseAnimation = 'signature' | 'calmPhrase' | 'typewriter' | 'slideUp' | 'outlineDraw';

type CaptionStyleConfig = {
  animation: BaseAnimation;
  keywordHighlightEnabled: boolean;      // independent toggle
  keywords: string[];                     // user-editable list, or parsed from **bold** in script
  highlightColor: string;
  highlightIntensity: number;             // 0-1, replaces the hardcoded glow value
  fontFamily: string; fontWeight: string; fontStyle?: string;
  justifyContent: string; alignItems: string;   // position, unchanged
};
```
Every base animation component gets a shared `applyKeywordEmphasis(baseStyle, isKeyword, intensity, color)` helper it calls on matching tokens — one implementation, not duplicated per component. `keywordHighlight` stops being its own variant; its current logic becomes the shared emphasis helper, usable on top of ANY animation.

## Expanded font presets (research-backed, replacing the current 4 informal ones)
| Preset name | Font | Use case |
|---|---|---|
| Viral Hook | Bebas Neue or Anton, Bold | Hook/punch captions, vertical |
| Clean Standard | Roboto, Medium | General dialogue, high legibility |
| Soft Modern | Montserrat, SemiBold | Brand-forward, friendly |
| Minimal | Open Sans, Regular | Calm/explanatory scenes |
| Tech/Mono | IBM Plex Sans or JetBrains Mono | Matches "science"/"tech" content category |
| Editorial | Source Sans Pro, Regular | Accessibility-focused, clean |
| Impact Punch | Archivo Black | One-word punch captions, center |
| Rounded Friendly | Poppins, SemiBold | Softer alternative to Soft Modern |

Skip Helvetica/Helvetica Neue (not freely web-licensed) despite appearing in research — Inter/Roboto cover the same visual space without licensing risk.
Stretch idea: auto-suggest a font preset per content category (Tech/Mono for `science` registry category, Soft Modern for `happy`, etc.) — same pairing pattern as `TEMPLATE_REGISTRY`, not required for this phase.

## New animation styles (adding 3 to the existing 2 base animations)
Priority order — build in this sequence, each is independently shippable:
1. **Typewriter** — characters reveal left to right, no bounce. Easiest to build, highest contrast against existing bouncy Signature style, good for calm/explanatory scenes.
2. **Slide-up** — each word slides up + fades in on activation. Medium energy, good hook-adjacent option.
3. **Outline Draw-on** — stroke-only text fills solid as spoken. More stylish/distinctive, slightly more CSS work (stroke via `-webkit-text-stroke` or SVG text). Built via a single-element `background-clip: text` gradient-reveal technique (not two overlaid text nodes — see LEARNINGS.md for why two-node approaches drift out of sync token by token).

Deferred further (not this phase): rotate/3D flip, elastic bounce, gradient sweep — same "~20 lines each" pattern as noted in Part B1.

## Style tab UI restructure
Current single "Font Preset" grid (4 buttons, conflating animation+font+highlight) becomes three independent sections:
- **Animation Style** — 5 cards (Signature/Calm/Typewriter/Slide-up/Outline Draw)
- **Font** — 8 cards from the table above, independent of animation choice
- **Keyword Highlight** — toggle switch (on/off) + intensity slider (replaces hardcoded glow) + editable keyword list (comma-separated input, or "parse from **bold** in script" if a script/SRT with markdown is available)
- Color & Highlight swatches — unchanged, now scoped clearly to highlight/emphasis color
- Position grid — unchanged

## Build order (phased, each phase independently shippable)
**Phase 1 (done — fixed both stated pain points):** decoupled keywordHighlightEnabled from animation; reduced glow, exposed highlightIntensity; Style tab split into Animation Style selector + Keyword Highlight toggle/slider.

**Phase 2:** Expand font presets to the 8-preset table above, wire into the now-separate Font section.

**Phase 3 (done):** Typewriter, Slide-up, and Outline Draw-on all built and verified. Outline Draw-on required 3 iterations to get right — see LEARNINGS.md for the two-overlaid-text-nodes drift bug and the single-element gradient-clip fix.

**Phase 4 (stretch, optional):** Editable keyword list UI (currently keywords may be hardcoded/parsed from bold-script only), auto-suggest font per content category.

---

# PART G — PORTING FRAMES & OVERLAYS FROM REEL CRAFT

## Context
A prior project (`reel-craft`, github.com/Koushik2208/reel-craft) built a broader visual toolkit — 18 frames, 10 texture overlays, 6 motion graphics, 12 named text styles, transitions, image effects — but lacked real transcription (Whisper modeled but never wired) and had a less intuitive UI. Caption Studio's caption engine (real local Whisper, verified split/sync correctness) is more solid; Reel Craft's peripheral visual features (frames/overlays) are more developed. Porting the reusable pieces rather than rebuilding from scratch.

## What transfers cleanly vs. what doesn't
**Transfers directly:** the frame and overlay React/Remotion components themselves. Reel Craft's own docs confirm they're driven purely by frame/spring interpolation, not CSS animation or DOM timers — meaning they render identically in live preview and in a server-side render, same discipline Caption Studio's caption engine already follows. No dependency on Reel Craft's Zustand store or Manual/Linked mode system.

**Does NOT transfer, don't attempt:** Reel Craft's WebCodecs in-browser rendering pipeline, its Manual/Linked project-mode split, transitions/SceneSeries system. None of this applies to Caption Studio's single continuous-caption-track model.

## Scope (phased — do not port all 18 frames + 10 overlays at once)
**Phase 1:**
- **Frames (4-5):** Minimal Bezel, Gradient Border, Neon Glow, Cinematic Scope. These suit vertical caption-first content without adding visual clutter; skip device-mockup frames (Browser Window, TV Frame, Floating Device) for now — lower relevance to this use case.
- **Overlays (3):** Film Dust, Halation, Grid — Reel Craft's own documented "film look" combo (Halation + Film Dust + Noise), Grid added as a cheap "digital/tech" texture option.

**Later phases (not now):** remaining frames, remaining overlays, motion graphics beyond the Progress Bar already built (Step Badge and Number Counter are the next most broadly useful if revisited).

## Integration point
Same pattern as Overlay tab's existing watermark/progress-bar: new `FrameSettings`/`TextureOverlaySettings` in `ProjectContext`, rendered by the same `PreviewPlayer` every tab already uses, baked into both the live preview and the actual Green Screen export via `CaptionExportComposition`. Frames wrap the whole composition (outermost layer); texture overlays sit between the background/media and the caption layer (don't obscure captions) — confirm this stacking order explicitly when building, since Reel Craft's fixed-stack-order note (subtle textures first, expressive effects on top) implies this matters for combinability.

## Build order
1. Port the 4-5 frame components as-is, adapt props to Caption Studio's existing style (no Zustand, plain props/context)
2. Wire a Frame selector into a relevant tab (Overlay tab, alongside watermark/progress bar, or a new Frames section)
3. Port the 3 overlay components, wire similarly with on/off + intensity where applicable
4. Verify: live preview shows frame+overlay+captions all compositing correctly, AND a real Green Screen export confirms the same via ffmpeg frame extraction (same verification standard used throughout this project)

---

# PART H — TRANSCRIPT EDITING (fix Whisper mistakes before they're locked in)

## Problem
Whisper transcription is good but not perfect — occasional mis-heard words, especially on names, numbers, or unusual terms. Right now there's no way to fix a wrong word without either (a) not noticing until final export, or (b) re-recording. The SRT wording-cross-check (script wins wording) already covers this IF an SRT/script is attached — but for audio-only uploads with no reference script, there's no ground truth to check against, so errors go unnoticed.

## Design
A lightweight **Transcript Editor**: after transcription completes, the word-level `Caption[]` already in `ProjectContext` becomes editable in place — click a word, fix the text, timestamp stays untouched. This is deliberately narrow in scope for v1:
- **In scope:** editing a token's text (fix a wrong word)
- **In scope:** deleting a token (clear its text — treated as a skip, not rendered) for Whisper hallucinations (rare but real — an extra word Whisper inserted that was never actually spoken)
- **Out of scope (defer):** inserting a new word, merging/splitting tokens, adjusting timestamps manually — these require recalculating neighboring timing and add real complexity for a rare need; text-only edits cover the overwhelming majority of real mistakes

## UI placement
Not a new top-level tab — an inline editable view, reachable from the Import tab right after transcription completes (review before moving on) AND from anywhere later (in case a mistake is spotted while previewing on the Style tab) via a small "Edit Transcript" entry point, likely near the Import tab's upload summary or as a modal/panel triggered from any tab.

## Technical approach
- `TranscriptEditor.tsx`: renders `ProjectContext`'s `captions` array as a sequence of inline-editable spans (click → contentEditable or a small input, blur/enter → save). Directly updates `captions` in context — no new state shape needed, since it's editing the same `Caption[]` everything else already consumes.
- Deletion: setting a token's text to empty string. `processCaptions.ts` (or a filter step immediately before it) must skip empty-text tokens entirely so they don't produce a blank rendered "word" or break the char-budget/min-duration merge math — filter before the pipeline runs, not after.
- No new API/server work — this is pure client-side state editing on data that's already local.

## Build order
1. `TranscriptEditor.tsx`: read-only rendering of tokens first (verify layout/scrolling works for a full 45-60s transcript's worth of words)
2. Make tokens click-to-edit, wire saves back into `ProjectContext.captions`
3. Empty-text deletion + the `processCaptions.ts` filter-before-pipeline fix
4. Entry points: auto-show after transcription, plus a persistent small "Edit Transcript" trigger accessible from other tabs
5. Verify: intentionally introduce a wrong word, fix it via the editor, confirm the Player preview and a real export both reflect the corrected text with unaffected timestamps