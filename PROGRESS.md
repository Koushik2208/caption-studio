# PROGRESS.md

## CURRENT STATE (update after every completed step)
Verification backlog (items 1-5 below) is CLEARED — all confirmed live by the user, including real export checks for position, Cinematic Scope inset, and texture overlays. G4 (frame+overlay+caption compositing, live AND export) is satisfied by that same pass.

Next action: Part H (Reel Craft ports + transcript editing) is **fully done and verified**. H5 confirmed via a real 4-minute Chroma Key export that reflected the user's transcript edits correctly. Also confirmed during H5 checking: the Chroma Key export intentionally has no audio track (captions-only overlay meant to be composited over real footage in an editor) — this is by design, not a bug, and matches the already-logged "Video/MP4-with-footage export — deferred" gap.

Session 6 (PLAN.md Part I) — orientation-aware fonts + global legibility — **fully done and verified**. I1-I4 all complete, live-verified by the user including frames/textures at both orientations.

Next: PLAN.md has no further parts defined past Part I — Session 7 scope not yet chosen. Candidates from the existing backlog (see "Known non-bugs / accepted gaps" and Part G/E status below): (a) Part G later phases — remaining frames/overlays/motion graphics beyond the 4 frames + 3 textures already ported; (b) Part E's deferred MP4-with-footage export (needs real footage compositing, not just the Green Screen/captions-only export). Waiting on user direction for which to pick up, or a new item.

Blockers: none.

## Session summaries (condensed — see PLAN.md for full technical detail per part)

**Session 1-2 (faceless-app):** Full caption pipeline (SRT/interpolation → captions.json, processCaptions split/merge/contiguous-frames, signature style, MasterComposition, WaveBackground/LineGrid/registry, hook scenes, subject scenes, legibility scrim). All done, verified.

**Session 3 (Caption Studio scaffold, PLAN.md Part E):** Vite+React+TS+Tailwind v4 app, 5 routes, persistent shell, DESIGN.md tokens, local transcription server (own Whisper.cpp `small.en`, self-contained — not shared with faceless-app), Style tab live-wired, Green Screen + SRT exports real, Overlay tab (watermark/progress bar) real. Plus polish passes: project naming/autosave/real resolution scaling, aspect-ratio-toggle bugfixes. All done, verified.

**Session 4 (Caption customization, PLAN.md Part F):** Keyword highlighting decoupled from animation choice (shared `applyKeywordEmphasis` helper), glow made a real tunable `highlightIntensity`, original 8-preset font table added via `@remotion/google-fonts` (verified real typefaces render in the export path, not silent Arial fallback), 3 new animations built (Typewriter, Slide-up, Outline Draw-on — the last took 3 iterations, two-overlaid-text-nodes drift bug fixed via single-element `background-clip: text` gradient technique, see LEARNINGS.md), editable keyword list UI done. Font-per-category auto-suggest deferred, folded into Session 6 instead. All done, verified live.

**Session 5 (Reel Craft ports + transcript editing, PLAN.md Parts G/H) — DONE:**
- [x] G1. 4 frame components ported (Minimal Bezel, Gradient Border, Neon Glow, Cinematic Scope) — live-verified
- [x] G2. Frame selector wired into ProjectContext/PreviewPlayer/CaptionExportComposition — live-verified
- [x] G3. 3 texture overlays ported (Film Dust, Halation, Grid) — live-verified (Film Dust/Halation/Grid all confirmed live + in a real export)
- [x] G4. Frame+overlay+captions compositing verified live AND via real export
- [x] H1. TranscriptEditor.tsx read-only rendering — verified live (Playwright, 261-word transcript, scroll/wrap confirmed)
- [x] H2. Click-to-edit tokens — `TranscriptEditor.tsx` tokens editable, `ProjectContext.updateCaptionText` writes back into `captions` + keeps the localStorage transcript cache in sync; `tsc`/`build` clean; live-verified via H4
- [x] H4. Entry points — `TranscriptEditorModal.tsx` auto-opens post-transcription + persistent Sidebar "Transcript" trigger from any tab; **live-verified**, all 7 checklist items passed (auto-open, sidebar trigger from all tabs, click-to-edit Enter/Escape/blur, persistence through modal close/reopen and page reload)
- [x] H3. Empty-text deletion + processCaptions.ts filter-before-pipeline fix — **live-verified**, all 3 checklist items passed
- [x] H5. Final verify — **live-verified** via a real 4-minute Chroma Key export reflecting the user's transcript edits correctly

**Also shipped this session, not a PLAN.md phase:**
- Horizontal/16:9 orientation bug fixed and **live-verified** (Playwright + real export render at both orientations confirmed correct dimensions)
- Dev-workflow transcript caching (localStorage, not IndexedDB — captions-only, no media blob) — `tsc` clean, not live-verified
- PreviewPlayer remount-on-navigate fix — **live-verified** (playback survives Import/Style/Overlay/Export navigation, selection changes don't restart it, Import empty state works from both dropzone and panel button)
- Nested routing restructure (Style/Overlay condensed + sub-routes, `CondensedCard`/`SubPanelView` reusable pattern) — **live-verified** (condensed cards, "More X" drill-in/back, selection persistence, Minimal Bezel shell color + Halation/Grid intensity pickers all confirmed)
- Position control simplified to Top/Center/Bottom with safe-margin inset — **live-verified**, including real Green Screen export at both orientations
- Responsive font size (height-based) + Cinematic Scope content-inset fix + z-order fix — **live-verified**, including real Green Screen export of Cinematic Scope + Bottom position

## Known non-bugs / accepted gaps
- TopBar Help button, ImportPage history icon — intentionally non-functional, no content to wire yet
- Video/MP4-with-footage export — deferred, needs real footage compositing
- `npx tsc --noEmit`'s pre-existing `CalculateMetadataFunction<Props>` type error — predates Session 3, not fixed, cosmetic
- Reported keyword-overlap bug ("PUT THOSE TOGETHER") — could not reproduce against the fontSize-based emphasis fix in any variation tried; likely stale HMR/cache. Re-test with a hard refresh if it recurs.

## Session 6 — Orientation-aware fonts + global legibility (PLAN.md Part I)
- [x] I1. Trimmed Editorial (Source Sans 3) and Rounded Friendly (Poppins) as redundant; added all 12 researched presets (Meme Energy/Anton, Screenplay/Courier Prime, Playful Comic/Bangers, Business Bold/League Spartan, Handwritten/Caveat, Cinematic/Jost, Elegant Serif/Cinzel, Essay Slab/Arvo, Calm Organic/Quicksand, Accessible/Atkinson Hyperlegible, Sci-Fi Tech/Rajdhani, Luxury Display/Marcellus) — all 12 verified as real `@remotion/google-fonts` entries against the installed package's font list before wiring, no substitutes needed. 18 total presets now in `src/captions/styles/presets.ts`, each tagged with `orientation` (`vertical`/`horizontal`/`both`) and `suggestedAnimation`. Verified via `tsc`/`build` clean AND a real `bundle()` → `selectComposition()` → `renderStill()` pass through the actual export composition (the real risk path per LEARNINGS.md — loadFont() only gets exercised through the Remotion bundler, not plain `vite build`) — all 18 fonts' `loadFont()` calls resolved with no errors. Not yet live-verified in the browser Style tab UI (I3 will wire the condensed/full-list filtering that surfaces these); orientation/suggestedAnimation fields exist on the data but aren't consumed by StylePage yet.
- [x] I2. Added `src/captions/styles/legibility.ts` (`getLegibilityStroke`/`getLegibilityShadow`/`combineTextShadow`), both ratios computed off `getResponsiveFontSize` so they hold at both orientations. Signature/CalmPhrase/Typewriter/SlideUp: replaced their old fixed `WebkitTextStroke: "3px black"` with the font-size-scaled stroke; all 5 animations (incl. OutlineDraw) now combine the legibility drop shadow with whatever keyword-emphasis glow `applyKeywordEmphasis` produces via `combineTextShadow` (CSS text-shadow accepts a comma list) instead of one clobbering the other. OutlineDraw's own white 2px outline was left untouched — that's the animation's core visual effect (a real stroke, not a legibility one), only the drop shadow was layered on top of it. Verified via a real `bundle()` → `selectComposition()` → `renderStill()` pass through the export composition for all 5 animations, visually confirmed (dark stroke + soft halo visible behind text, keyword glow still layers correctly on top) — not just tsc/build clean.
- [x] I3. `presets.ts` gained `getPrioritizedFontPresets(activeOrientation)` — reorders `FONT_PRESETS` so the active orientation's own presets lead (in table order), then 'both' presets, then the rest, so a `slice(0, CONDENSED_FONT_COUNT)` off it surfaces the Part I research picks first instead of whichever 'both' preset happened to sit earliest. `StylePage.tsx`'s condensed Font card now reads `useLayout().layoutMode` and slices this reordered list instead of the raw `FONT_PRESETS` array. `StyleFontsPage.tsx` (`/style/fonts`) gained an All/Vertical/Horizontal/Both segmented filter (local `useState`, defaults to All so nothing's hidden by default when arriving via "More fonts"). `tsc`/`build` clean; not yet live-verified in the browser (I4 covers that).
- [x] I4. Live-verified by the user: condensed picks change correctly by orientation, full-list filter works, and stroke/shadow legibility holds up against real frames + texture overlays at both orientations. User flagged that fonts aren't restricted by orientation (a vertical-tagged font can still be picked while in horizontal mode, and vice versa) — deliberate, matches the existing "hint not constraint" pattern already used for `suggestedAnimation` (Part F); decided to leave as-is rather than add a hard restriction.