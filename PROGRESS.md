# PROGRESS.md

## CURRENT STATE (update after every completed step)
Verification backlog (items 1-5 below) is CLEARED — all confirmed live by the user, including real export checks for position, Cinematic Scope inset, and texture overlays. G4 (frame+overlay+caption compositing, live AND export) is satisfied by that same pass.

Next action: H4 (entry points) is done — `TranscriptEditor` is now reachable two ways: (1) `TranscriptEditorModal.tsx` auto-opens right after a fresh `transcribe()` call succeeds (`useImportUpload.ts`, not triggered by the cached-transcript restore path), and (2) a persistent "Transcript" item in the Sidebar (`icon="subtitles"`) opens it on demand from any tab, since the modal is rendered once at the App root (`App.tsx`, alongside `SettingsModal`) rather than per-route. Both just flip `LayoutContext.isTranscriptEditorOpen`. `tsc`/`build` clean. **This is what makes H2's click-to-edit testable for the first time — needs a live check before H3.**

Live-verification checklist for H4 (unblocks re-verifying H2 for real):
1. Import a fresh file (not a cached transcript) and let transcription finish — the transcript modal should pop open automatically, landing on top of whichever page you're on (should be Style, since navigate('/style') fires first).
2. Close it (X button or click the backdrop), then click the Sidebar's new "Transcript" item from Style, Overlay, and Export in turn — modal should open over each without navigating away from that tab.
3. Inside the modal, click a word — it should become an editable input, pre-filled and text-selected. Type a fix, press Enter — it should commit and go back to being a plain word matching the new text.
4. Click another word, this time press Escape — it should revert to the original text, discarding the edit.
5. Click a word, edit it, then click elsewhere in the page (not Enter) — blur should also commit, same as Enter.
6. Close the modal, reopen it (Sidebar trigger) — edited word(s) should still show the fix (confirms the write actually landed in `ProjectContext.captions`, not just local input state).
7. Reload the page (if a cached transcript was in play) — edited text should survive, since `updateCaptionText` also rewrites the localStorage transcript cache.

Remaining Part H steps, in order:
- H3. Empty-text deletion support: `processCaptions.ts` needs a filter-before-pipeline step to skip empty-text tokens (editing a token to empty already works in the UI/context via H2, but an empty token isn't yet guaranteed safe through char-budget/min-duration merge math)
- H5. Final live verify: introduce a wrong word (or use a real Whisper mis-transcription), fix it via the editor, confirm both the live preview and a real export reflect the corrected word

Blockers: none.

## Session summaries (condensed — see PLAN.md for full technical detail per part)

**Session 1-2 (faceless-app):** Full caption pipeline (SRT/interpolation → captions.json, processCaptions split/merge/contiguous-frames, signature style, MasterComposition, WaveBackground/LineGrid/registry, hook scenes, subject scenes, legibility scrim). All done, verified.

**Session 3 (Caption Studio scaffold, PLAN.md Part E):** Vite+React+TS+Tailwind v4 app, 5 routes, persistent shell, DESIGN.md tokens, local transcription server (own Whisper.cpp `small.en`, self-contained — not shared with faceless-app), Style tab live-wired, Green Screen + SRT exports real, Overlay tab (watermark/progress bar) real. Plus polish passes: project naming/autosave/real resolution scaling, aspect-ratio-toggle bugfixes. All done, verified.

**Session 4 (Caption customization, PLAN.md Part F):** Keyword highlighting decoupled from animation choice (shared `applyKeywordEmphasis` helper), glow made a real tunable `highlightIntensity`, original 8-preset font table added via `@remotion/google-fonts` (verified real typefaces render in the export path, not silent Arial fallback), 3 new animations built (Typewriter, Slide-up, Outline Draw-on — the last took 3 iterations, two-overlaid-text-nodes drift bug fixed via single-element `background-clip: text` gradient technique, see LEARNINGS.md), editable keyword list UI done. Font-per-category auto-suggest deferred, folded into Session 6 instead. All done, verified live.

**Session 5 (Reel Craft ports + transcript editing, PLAN.md Parts G/H) — IN PROGRESS:**
- [x] G1. 4 frame components ported (Minimal Bezel, Gradient Border, Neon Glow, Cinematic Scope) — live-verified
- [x] G2. Frame selector wired into ProjectContext/PreviewPlayer/CaptionExportComposition — live-verified
- [x] G3. 3 texture overlays ported (Film Dust, Halation, Grid) — live-verified (Film Dust/Halation/Grid all confirmed live + in a real export)
- [x] G4. Frame+overlay+captions compositing verified live AND via real export
- [x] H1. TranscriptEditor.tsx read-only rendering — verified live (Playwright, 261-word transcript, scroll/wrap confirmed)
- [x] H2. Click-to-edit tokens — `TranscriptEditor.tsx` tokens editable, `ProjectContext.updateCaptionText` writes back into `captions` + keeps the localStorage transcript cache in sync; `tsc`/`build` clean; now reachable live via H4, not yet re-verified live (see checklist above)
- [x] H4. Entry points — `TranscriptEditorModal.tsx` auto-opens post-transcription + persistent Sidebar "Transcript" trigger from any tab; `tsc`/`build` clean, not yet live-verified (see checklist above)
- [ ] H3. Empty-text deletion + processCaptions.ts filter-before-pipeline fix
- [ ] H5. Final verify: introduce wrong word, fix via editor, confirm preview + export reflect it

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

## Session 6 — Orientation-aware fonts + global legibility (PLAN.md Part I) — queued, not started
- [ ] I1. Trim 2 redundant presets (Editorial, Rounded Friendly), add new researched presets (verify real Google Fonts first), add orientation/suggestedAnimation fields
- [ ] I2. Global legibility layer: stroke (4-6% of font size) + drop shadow (80%/10% blur), applied in shared rendering path
- [ ] I3. StylePage condensed Font card filters by layoutMode; /style/fonts full list filterable by orientation
- [ ] I4. Verify at both orientations: condensed picks change correctly, new fonts legible via global stroke/shadow