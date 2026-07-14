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
     cinematic, no text, no people's faces, clean frame". Example: "Slow
     push-in on a glowing jellyfish drifting upward through dark
     deep-sea water, bioluminescent particles floating around it, soft
     blue light, vertical 9:16 format, cinematic, no text, no people's
     faces, clean frame."

Cleanup suffix note: always end with "clean frame, no text" — prevents
AI video engines from baking in stray on-screen text/artifacts that
would fight with your actual captions layered on top.

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
8. **Default to manual verification over automated browser verification.** After a code change: verify via tsc/build, then describe exactly what to check and where — let the user check in their own browser and report back. Only attempt browser automation (Playwright etc.) if explicitly asked, or if a fix genuinely cannot be confirmed any other way. Don't spin up dev servers/sleep/read logs after every small edit — batch verification to once per phase/step.
9. **When debugging a reported issue** (screenshot, error, description): read the relevant code FIRST and form a hypothesis before running/restarting any server. Only reproduce live if the cause isn't identifiable from the code, or to confirm a fix after making it.

**Session flow tomorrow:** CLAUDE.md + PLAN.md in repo → "implement Session 1 step 1" → verify → step 2 → ... → /clear → Session 2 steps. One scoped instruction at a time beats one giant "build everything" prompt on both cost and quality.

---

# Open decisions (settled)
- Transcription: local Whisper.cpp, `medium.en` (faceless-app); Caption Studio uses its own local Whisper.cpp `small.en` install (self-contained as of the repo split, no longer references faceless-app's copy)
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
**Implementation note:** built as React Router routes (originally 5: `/`, `/import`, `/style`, `/overlay`, `/export`) rather than in-page tab state — same persistent-shell UX, different mechanism. A `/` Welcome landing page was added as the entry point/CTA, not in the original spec but a sensible fit. Since Session 5, `/style` and `/overlay` are further split into condensed + nested full-list sub-routes — see Part G/H session notes and the PROGRESS.md nested-routing entry for the current actual structure.
- **Persistent shell:** top bar (`Caption Studio` + project name, Import/Style/Overlay/Export tabs, Saving indicator, help, settings, primary Export button) + left icon rail (Upload/Style/Overlay/Export) + center preview canvas (fixed position/size, resizes cleanly between 9:16 and 16:9) + right contextual tool panel (changes per active tab, current tool highlighted in rail).
- **Import tab:** empty state ("Ready to start?" + drag-drop), Upload File card (MP4/MOV/MP3/WAV) + Import SRT card, file-size/duration note.
- **Style tab:** Font Preset grid, Color & Highlight swatches, Position control, live-updating preview.
- **Overlay tab:** toggleable cards (Watermark, Progress Bar, Frame, Texture Overlays) — extension point for future frames/stickers/overlays, same card pattern.
- **Export tab:** format radio group (Video MP4 / **Green Screen Video** / SRT Only), resolution dropdown, watermark toggle, estimated file size, primary Export Project button.

## Reusability mechanism (how future expansion slots in)
Preview canvas + right tool panel is the shell; each top-bar tab swaps only the tool panel's content. Adding a new capability later (frame overlays, sticker overlays, orientation switching) = a new card in the Overlay tab or a new top-bar tab — never a layout change. The 9:16 ⟷ 16:9 toggle is the pattern reused for any orientation-dependent tool. As of Session 5, condensed-panel + "More X" nested sub-route (`CondensedCard`/`SubPanelView` generic components) is the pattern for any category that grows past a few options — fonts, animations, frames, texture overlays all use it; applying it to a new category means one options array + one full-list page, no routing/layout changes.

## Technical approach
- **Preview:** Remotion's `<Player>` component (not Remotion Studio) — embeddable, matches "preview stays fixed" requirement exactly. Hoisted into the persistent `ToolLayout` route (Session 5) so it survives navigation without remounting/resetting playback.
- **Caption engine reused as-is:** `processCaptions.ts`, `CaptionRenderer.tsx`, and the style components from `faceless-app` are the actual rendering logic — Caption Studio's Style tab is a UI wrapper selecting/configuring these, not a reimplementation. Copied from the `faceless-app` repo at scaffold time (not a live shared dependency).
- **Green Screen export:** minimal composition (`CaptionExportComposition`) — captions only, solid chroma-key background (`#00B140`, DaVinci Ultra Key-compatible), no scenes/backgrounds/subject. Reuses `CaptionRenderer` directly. Now also composes Frame/Texture Overlay rendering (Session 5) and orientation-aware dimensions (Session 5).
- **SRT Only export:** serializeSrt() from `@remotion/captions`, no rendering needed.
- **Upload → captions.json:** local Express server (`server/index.ts`) wrapping Whisper.cpp transcription (own local install, self-contained).

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
Today `CaptionStyleVariant` = `'signature' | 'keywordHighlight' | 'calmPhrase'` conflates "which animation plays" with "are keywords emphasized." These are orthogonal and must become independent settings — implemented via a shared `applyKeywordEmphasis.ts` helper both animations call per-token, plus independent `animation`/`keywordHighlightEnabled`/`highlightIntensity`/`keywords` state.

## Font presets (research-backed, replacing the original 4 informal ones)
Originally an 8-entry table (Viral Hook/Bebas Neue, Clean Standard/Roboto, Soft Modern/Montserrat, Minimal/Open Sans, Tech-Mono/JetBrains Mono, Editorial/Source Sans 3, Impact Punch/Archivo Black, Rounded Friendly/Poppins) — see Part I for the Session 6 expansion/orientation-aware revision (Editorial and Rounded Friendly identified as redundant and cut there, 9 new presets added, orientation tagging introduced).

## Animation styles (5 total)
Signature (word-pop + karaoke fill), Calm Phrase (fade block), Typewriter (char reveal), Slide-up (spring entrance), Outline Draw-on (stroke fill sweep, single-element `background-clip: text` gradient technique — see LEARNINGS.md for the two-overlaid-text-nodes drift bug this replaced).

## Style tab structure (current, post Session 5 nested-routing)
Condensed Animation Style / Font Preset / Keyword Highlight (toggle+slider+editable list) / Color & Highlight / Position cards on `/style`; full Font list at `/style/fonts`, full Animation list at `/style/animations`.

## Status
All phases done: Phase 1 (decoupling), Phase 2 (8-preset table — superseded by Part I), Phase 3a-c (Typewriter/Slide-up/Outline Draw-on), Phase 4 partial (editable keyword list done; auto-suggest font per category deferred, folded into Part I's orientation tagging instead).

---

# PART G — PORTING FRAMES & OVERLAYS FROM REEL CRAFT

## Context
A prior project (`reel-craft`, github.com/Koushik2208/reel-craft) built a broader visual toolkit — 18 frames, 10 texture overlays, 6 motion graphics, 12 named text styles, transitions, image effects — but lacked real transcription (Whisper modeled but never wired) and had a less intuitive UI. Caption Studio's caption engine (real local Whisper, verified split/sync correctness) is more solid; Reel Craft's peripheral visual features (frames/overlays) are more developed. Porting the reusable pieces rather than rebuilding from scratch.

## What transfers cleanly vs. what doesn't
**Transfers directly:** the frame and overlay React/Remotion components themselves — driven by frame/spring interpolation, not CSS animation, so they render identically live and server-side. No Zustand dependency in practice (the ported components already took plain props).

**Does NOT transfer:** Reel Craft's WebCodecs in-browser rendering pipeline, Manual/Linked project-mode split, transitions/SceneSeries system.

## Scope (phased)
**Phase 1 (done):**
- **Frames (4):** Minimal Bezel, Gradient Border, Neon Glow, Cinematic Scope — ported into `src/frames/`, switch-rendered via `FrameRenderer.tsx` wrapping the whole composition, dimensions read from `useVideoConfig()` (not hardcoded), so both orientations work by construction.
- **Overlays (3):** Film Dust, Halation, Grid — ported into `src/textures/`, rendered via `TextureOverlayRenderer.tsx` in Reel Craft's documented stack order (grid → film dust → halation), positioned between background/media and the caption layer.

**Later phases (not started):** remaining frames, remaining overlays, motion graphics beyond the existing Progress Bar.

## Integration point
`FrameSettings`/`TextureOverlaySettings` in `ProjectContext`, rendered by the same `PreviewPlayer` every tab uses, baked into both live preview and the Green Screen export via `CaptionExportComposition`. Overlay tab (now nested: condensed + `/overlay/frames` + `/overlay/texture-overlays`) is the UI home.

## Status
G1 (frame port), G2 (frame selector wiring), G3 (texture overlay port), and G4 (live + real-export compositing verification) are all done — confirmed live in browser and via real Green Screen export.

---

# PART H — TRANSCRIPT EDITING (fix Whisper mistakes before they're locked in)

## Problem
Whisper transcription is good but not perfect — occasional mis-heard words, especially on names, numbers, or unusual terms. Right now there's no way to fix a wrong word without either (a) not noticing until final export, or (b) re-recording. The SRT wording-cross-check (script wins wording) already covers this IF an SRT/script is attached — but for audio-only uploads with no reference script, there's no ground truth to check against, so errors go unnoticed.

## Design (deliberately narrow scope for v1)
- **In scope:** editing a token's text (fix a wrong word); deleting a token (clear its text — treated as a skip) for Whisper hallucinations
- **Out of scope (defer):** inserting a new word, merging/splitting tokens, adjusting timestamps manually

## UI placement
Not a new top-level tab — reachable from Import right after transcription, and from a persistent "Edit Transcript" entry point elsewhere.

## Technical approach
`TranscriptEditor.tsx` renders `ProjectContext`'s `captions` array as inline-editable tokens, writing straight back into context (no new state shape). Deletion = empty-text token; `processCaptions.ts` (or a filter step immediately before it) must skip empty-text tokens so they don't break char-budget/min-duration merge math.

## Status
H1 done (read-only token rendering, verified live via Playwright — scroll/wrap behavior confirmed for a 261-word transcript). H2 done (click-to-edit tokens, writing back into `ProjectContext.captions` via `updateCaptionText`). H4 done (entry points: `TranscriptEditorModal` auto-opens after a fresh transcription and via a persistent Sidebar trigger, rendered once at the App root so it's reachable from any tab). H2/H4 are `tsc`/`build` clean but not yet live-verified together. **H3 (empty-text deletion + processCaptions.ts filter) and H5 (final verification) not started.**

---

# PART I — ORIENTATION-AWARE FONT SYSTEM + GLOBAL LEGIBILITY

## Problem
Font presets (Part F) are shown identically regardless of orientation. Real research shows vertical short-form and horizontal long-form want genuinely different typefaces — vertical rewards personality/energy (Bebas Neue, Anton), horizontal rewards restraint/legibility over long view times (Roboto, Atkinson Hyperlegible). Also: 2 pairs of the original 8 presets are redundant (Editorial≈Minimal, Soft Modern≈Rounded Friendly) — cut to make room.

## New preset table (~16 entries, all real Google Fonts — commercial fonts from research swapped for closest free equivalent)
**Vertical/short-form:** Viral Hook (Bebas Neue), Impact Punch (Archivo Black), Meme Energy (Anton, new), Screenplay (Courier Prime, new), Playful Comic (Bangers, new — Komika Axis substitute), Business Bold (League Spartan, new), Handwritten (Caveat or Permanent Marker, new — user-requested category, nothing prior covered this).
**Both:** Clean Standard (Roboto — also literally YouTube's caption default), Minimal (Open Sans).
**Horizontal-leaning:** Cinematic (Jost, new — Futura substitute), Elegant Serif (Cinzel or EB Garamond, new), Essay Slab (Arvo, new), Calm Organic (Quicksand, new), Accessible (Atkinson Hyperlegible, new — genuine BBC/Netflix-grade accessibility font, real substitute for the proprietary Tiresias Screenfont), Sci-Fi Tech (Rajdhani, new — Uni Sans substitute), Luxury Display (Marcellus, new — Kiona substitute).
Cut: Editorial, Rounded Friendly (redundant with Minimal/Soft Modern).
Each preset can carry an optional `suggestedAnimation` hint (from the research pairings) — a default when that font is selected, not a forced constraint, since animation/font stay decoupled per Part F.

## Orientation-conditional display
Each preset gets an `orientation: 'vertical' | 'horizontal' | 'both'` tag. StylePage's condensed Font card shows a few presets filtered/prioritized by current `layoutMode`; the full tagged list lives at `/style/fonts` (the nested route from Session 5), filterable by orientation there too.

## Global legibility treatment (the "High-Contrast Safe Zone Rule")
Applies regardless of font/color choice, computed as a ratio of the responsive font size (Session 5's height-based `getResponsiveFontSize`, not fixed px), so it holds at both orientations:
- Stroke: 4-6% of font size (dark, always present)
- Drop shadow: 80% opacity, 10% blur
This is legibility infrastructure, applied in the shared caption rendering path, not a per-preset style choice.

## Build order
1. I1: trim 2 redundant presets, add new ones (verify each is a real Google Fonts entry before wiring), add `orientation`/`suggestedAnimation` fields
2. I2: global legibility layer (stroke/shadow as font-size ratio), applied once in the shared rendering path
3. I3: StylePage condensed Font card filters by `layoutMode`; `/style/fonts` full list filterable by orientation tag
4. I4: verify at both orientations — condensed picks change correctly, all fonts legible via global stroke/shadow regardless of background/frame

## Status
Not started — queued as Session 6.