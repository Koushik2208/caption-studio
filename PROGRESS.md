# PROGRESS.md

## CURRENT STATE (update after every completed step)
Next action: Session 5 H1 (read-only TranscriptEditor) is done. Next is H2 - make tokens click-to-edit, wired to `ProjectContext.captions` (see PLAN.md Part H build order step 2). G (Reel Craft frame/overlay ports) is still untouched and independent - either can go next.
Blockers: none

Session 5 H1 done: `src/transcript/TranscriptEditor.tsx` (new top-level feature dir, matching `src/preview`/`src/overlay`/`src/export` convention - not nested under `components/`). Reads `captions` straight from `ProjectContext`, renders each `Caption` as a `<span>` in a `flex flex-wrap` token stream inside a `flex-1 overflow-y-auto` region below a fixed header (word count), sized to fill whatever container it's dropped into (`h-full flex flex-col`) since PLAN.md's UI placement is a modal/panel, not a new route. Verified live via Playwright against the real dev server: mocked a 261-word (~90s) transcript through `page.route('**/api/transcribe', ...)`, confirmed the token stream wraps correctly and the scroll region actually clips content (`scrollHeight` 780 vs `clientHeight` 495 in a 556px-tall test container) - a marker token placed at the very end was outside the container's visible bounds before scrolling and inside after. Verification used a temporary route (`/transcript-debug` in `App.tsx`) + a one-line temp redirect in `ImportPage.tsx`, both fully reverted after (`git diff` on those two files is empty) - the component itself has no wiring into the app yet, that's H4's job. `npx tsc -b` clean.

Session 4 Phase 4 (partial) done: `keywords: string[]` added to `ProjectContext` (default `DEFAULT_KEYWORDS`, persisted to localStorage, flows into `styleOverrides.keywords` — no changes needed in the 5 style components, they already read `overrides?.keywords ?? DEFAULT_KEYWORDS` since Phase 1). StylePage's Keyword Highlight card gained a comma-separated text input (local `keywordsText` mirrors raw typing so a trailing comma/space isn't collapsed mid-edit; parsed+trimmed array is written to context on every keystroke). Verified live via Playwright against the real dev server (note: default port 5173 was occupied by an unrelated project on this machine — caption-studio's vite dev server was actually on 5174, API server on 5175): default keyword glows pre-edit, typing a custom list swaps which token glows, value survives a full reload via localStorage. `npx tsc -b` and `npm run build` clean.

Open item to sanity-check next session (not a confirmed bug): a user-reported keyword-overlap visual bug ("PUT THOSE TOGETHER") couldn't be reproduced against the current fontSize-based emphasis fix in any variation tried — likely a stale HMR/cache screenshot. If it recurs, get a hard-refreshed repro noting live Player vs. exported render, and which font preset.

Session 4 (PLAN.md Part F) full summary, all phases:
- **Phase 1** (keyword/animation decoupling): `CaptionStyleVariant` narrowed to `'signature' | 'calmPhrase'` — keywordHighlight is no longer its own variant, its logic moved to a shared `applyKeywordEmphasis.ts` helper both animations call per-token. Glow reduced from flat 18px to intensity-scaled 4-16px/25-80% alpha (default 40%), `highlightIntensity` is a real 0-1 prop driven by a slider. StylePage split into Animation Style / Font Preset / Keyword Highlight (toggle+slider) cards. Verified live via Playwright.
- **Phase 2** (font presets): `FONT_PRESETS` replaced with the 8-entry researched table (Viral Hook/Bebas Neue, Clean Standard/Roboto, Soft Modern/Montserrat, Minimal/Open Sans, Tech-Mono/JetBrains Mono, Editorial/Source Sans 3, Impact Punch/Archivo Black, Rounded Friendly/Poppins). Fonts loaded via `@remotion/google-fonts` (not an index.html link tag) since the server-side export bundle never sees index.html — same root cause as the earlier icon-font issue in LEARNINGS.md. Verified both live (Playwright) and via a real export-composition render confirming actual distinct typefaces, not a silent Arial fallback.
- **Phase 3a** (Typewriter): char-by-char reveal per token between its own fromMs and the next token's fromMs, blinking cursor on the active word only. Verified live.
- **Phase 3b** (Slide-up): per-token spring-driven opacity+translateY entrance, medium energy, distinct from Signature's pop and Typewriter's flat reveal. Verified live.
- **Phase 3c** (Outline Draw-on): hollow-outline text that fills solid left-to-right as spoken. Required 3 iterations — two overlaid text nodes (stroke layer + fill layer) drift out of sync token-by-token regardless of matched stroke widths; fixed via a single element using `background-clip: text` with a gradient hard-stop for the reveal. Root cause + fix pattern logged in LEARNINGS.md.
- **Post-ship fix** (all animations): a keyword-emphasized word visually overlapped its neighbor. Root cause: `transform: scale()` doesn't reflow — the browser kept the original box width while glyphs rendered larger. Fixed by using a real `fontSize` bump instead (inherited by fill-overlay spans so layers stay aligned). Confirmed via `getBoundingClientRect` before/after. Note: Signature/SlideUp/Typewriter share the same scale mechanism and could have latent versions of this issue for long keyword words — not fixed there (unreported), and their scale is animated per-frame so this fontSize fix isn't a drop-in replacement for those three.
- **Phase 4** (partial — editable keyword list only): comma-separated keyword input in StylePage's Keyword Highlight card, backed by new `ProjectContext.keywords` state (persisted). Auto-suggest font per content category not attempted (deferred by user).
- [x] Phase 1, [x] Phase 2, [x] Phase 3a, [x] Phase 3b, [x] Phase 3c, [~] Phase 4 (stretch — keyword list UI done, font auto-suggest not attempted)

Session 3 (Steps 1-6) plus polish passes (project naming/ID/autosave/resolution/mock-cleanup, aspect-ratio-toggle fix) all complete. Two non-functional UI elements remain by design (TopBar Help, ImportPage history icon — no content to wire yet). Still-deferred: Video/MP4-with-footage export, true horizontal/16:9 render pipeline (toggle currently resizes the preview container only, composition itself stays fixed 1080x1920), multi-aspect export.

Pre-existing note: `npx tsc --noEmit` surfaces a `CalculateMetadataFunction<Props>` vs `Record<string,unknown>` type error (predates Session 3) — not fixed, flagged for later cleanup.

## Session 1 — pipeline proof (faceless-app)
- [x] 1. SRT/interpolation → captions.json, script-wins-wording cross-check.
- [x] 2. CaptionRenderer + signature style + processCaptions (split/merge/contiguous frames) + 2-line cap.
- [x] 3. MasterComposition, 3-scene loop manifest.
- [x] 4. Sync verified incl. fast-spoken section.

## Session 2 — template system (faceless-app)
- [x] 5. WaveBackground + LineGrid + registry (5-6 entries)
- [x] 6. Hook scene type + punch-in zoom wrapper
- [x] 7. Keyword highlight + calm phrase mode + captionMode switching
- [x] 8. SubjectScene (idle float + spring pop-in) + LegibilityScrim

## Deferred (Day 2+, faceless-app)
Extra backgrounds (FloatingRectangles, GradientBlob, PulseRings) · emotion-reactive palettes · sentence-timestamp helper script · batch rendering · multi-aspect export · caption-editing mini UI

## Session 3 — Caption Studio UI (separate repo: caption-studio, PLAN.md Part E)
- [x] 1. Scaffolded (Vite+React+TS, Tailwind v4, React Router 5 routes)
- [x] 2. Persistent shell + 4 tool screens + Welcome page, DESIGN.md tokens
- [x] 3. Import tab wired to local transcription server
- [x] 4. Style tab wired live to CaptionRenderer
- [x] 5. Export tab: Green Screen Video + SRT Only real; MP4 disabled
- [x] 6. Overlay tab: watermark + progress bar real, baked into export

## Session 4 — Caption Customization Upgrade (PLAN.md Part F)
- [x] Phase 1: keyword/animation decoupling, real glow intensity
- [x] Phase 2: 8-entry researched font preset table via @remotion/google-fonts
- [x] Phase 3a: Typewriter
- [x] Phase 3b: Slide-up
- [x] Phase 3c: Outline Draw-on (3 iterations, see LEARNINGS.md)
- [~] Phase 4 (stretch): editable keyword list UI done; auto-suggest font per content category not attempted (deferred)

## Session 5 — Reel Craft ports + Transcript Editing (PLAN.md Parts G, H) — queued, not started
- [ ] G1. Port 4-5 frame components (Minimal Bezel, Gradient Border, Neon Glow, Cinematic Scope)
- [ ] G2. Frame selector UI wired into ProjectContext + PreviewPlayer + CaptionExportComposition
- [ ] G3. Port 3 overlay components (Film Dust, Halation, Grid)
- [ ] G4. Verify frame+overlay+captions compositing in live preview AND real Green Screen export
- [x] H1. TranscriptEditor.tsx — read-only token rendering first
- [ ] H2. Click-to-edit tokens, wired to ProjectContext.captions
- [ ] H3. Empty-text deletion + processCaptions.ts filter-before-pipeline fix
- [ ] H4. Entry points: auto-show post-transcription + persistent trigger from other tabs
- [ ] H5. Verify: introduce a wrong word, fix via editor, confirm preview + real export reflect it