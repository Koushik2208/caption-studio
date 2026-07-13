# CLAUDE.md — Orchestrator (keep this file LEAN, it loads every turn)

## Project
Remotion faceless-content video system: voiceover + word-synced animated captions + template backgrounds + scene manifest. Vertical 1080x1920, 30fps, English.

## File map — read ONLY what the current task needs
- `PLAN.md` — full build spec. Implement by section (e.g. "Part B1").
- `PROGRESS.md` — phase status + exact next action. READ FIRST after any session start or /clear.
- `LEARNINGS.md` — errors already hit + their fixes. Read before debugging anything.

## Protocol (do these WITHOUT being asked)
- After completing a phase/step: update PROGRESS.md (mark done, write the exact next action)
- After fixing any bug: append one line to LEARNINGS.md (symptom → cause → fix)
- Never merge small component files into bigger ones "for convenience"
- Verify ONCE per phase/step, not after every small edit. Make all changes for the current step first, then run a single verification pass (tsc/build, plus one live check only if the step is visual/UI). Don't spin up dev servers, sleep, and read logs after every individual file change.
- When debugging a reported issue (screenshot, error, description): read the relevant code FIRST and form a hypothesis before running/restarting any server. Only reproduce live if the cause isn't identifiable from the code, or to confirm a fix after making it.
- Default to manual verification by the user over automated browser verification (Playwright, headless Chrome, etc.). After a code change: verify via tsc/build, then describe exactly what to check and where (specific page, specific action, specific expected result) — let the user check in their own browser and report back. Only attempt to set up/run browser automation if explicitly asked, or if a fix genuinely cannot be confirmed any other way.

## Non-negotiable technical facts
- Captions/timestamps are in MILLISECONDS; Remotion works in FRAMES. Convert: timeMs = (frame/fps)*1000
- Caption pipeline order: createTikTokStyleCaptions → char-budget split → min-duration merge → contiguous frame conversion
- Pages must be contiguous: each page ends where next begins; durationInFrames = max(1, nextFrom - from)
- Active token = LAST token with fromMs <= currentTimeMs (never a from/to range check)
- Fixed caption font size (~85px bold), maxWidth 85%, max 2 lines — never auto-shrink