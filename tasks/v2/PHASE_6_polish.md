# Phase 6 — Polish, Copy, Framing

**Goal:** Take the working demo from "feature-complete" to "shareable portfolio piece." Final copy, framing, tooltips, loading skeletons, error states, mobile breakpoint, typography hierarchy.

**Depends on:** Phase 5 complete (all features wired up).

**Estimated time:** 2–3 h.

## Pre-session checklist

- [ ] All features from Phase 5 work end-to-end
- [ ] You've used the demo for 5 minutes and noted any rough edges (jot them in DEVLOG if helpful)

## Tasks

- [x] **Task 6.1** — Write final English copy. Update the header subtitle, page intro, section labels, button labels, and form helper text to remove placeholder strings and marketing language. Tone matches v1's README: professional, direct, technically honest. Verify by reading every visible string aloud — none should sound salesy or vague.
  - Commit: `docs(demo): final english copy pass`

- [x] **Task 6.2** — Add the always-visible disclaimer banner near the header: "Portfolio project on public Kaggle data. Not a production fraud system." Use a muted shadcn `Alert` with no dismiss button. Verify: visible on first paint.
  - Commit: `feat(ui): add portfolio disclaimer banner`

- [x] **Task 6.3** — Build `src/components/WhyPRAUCPopover.tsx`: a shadcn `Popover` triggered by a help icon next to the histogram. Body explains in 3–4 short sentences why supervised methods would beat the autoencoder on raw F1, and why the autoencoder framing is still the right one. Mirror the language from v1 README's "Why an autoencoder" section. Verify: clicking the icon opens the popover; clicking outside closes it.
  - Commit: `feat(ui): add 'why PR-AUC 0.37' popover`

- [x] **Task 6.4** — Build `src/components/Footer.tsx`: short Spanish blurb (3–5 lines summarizing the project), links to v1 README, v1 DEVLOG, MIT license, and the author's contact (GitHub + email placeholder). Verify visually that Spanish text is correct and links resolve.
  - Commit: `feat(ui): add footer with spanish blurb and links`

- [x] **Task 6.5** — Replace ad-hoc loading states with shadcn `Skeleton` placeholders. Before `useModel()` resolves: skeleton for the preset cards, manual form, histogram, and bar chart. After resolution, fade in real content. Verify by throttling network in dev tools to "Slow 3G" — skeletons appear, then the real UI.
  - Commit: `feat(ui): add skeleton loading states`

- [ ] **Task 6.6** — Add error states. If `useModel()` rejects (e.g., a 404 on `autoencoder.onnx`), render a friendly error card with the error message and a "Reload" button. Verify by temporarily renaming the ONNX file in `demo/public/` and reloading — error card shows; rename it back; reload — UI returns.
  - Commit: `feat(ui): add model-load error state`

- [ ] **Task 6.7** — Mobile breakpoint pass. At `< 768px`: PresetRunner and ManualInputForm stack vertically; the threshold slider is replaced by a number input with min/max/step; charts stack and shrink to viewport width; the manual input form's 30 fields move into a shadcn `Accordion` to avoid an overwhelming wall. Verify in Chrome DevTools mobile viewport (iPhone 12, Pixel 5): every interactive element is reachable and readable.
  - Commit: `feat(ui): responsive layout for mobile breakpoint`

- [ ] **Task 6.8** — Typography and spacing pass. Audit headings (h1 → h3 hierarchy), padding consistency between sections (use a 4/8/16/24/32 px scale), color contrast (zinc-50 on zinc-950 base, zinc-400 for muted), hover states on every interactive element. Verify by walking through the page and noting any inconsistency; fix until none remain.
  - Commit: `style(demo): final typography and spacing pass`

## Definition of done for Phase 6

- The demo is presentable as-is in a portfolio review (a stranger could land on it, understand what it is in 10 seconds, and try a feature).
- Skeleton states show during the model-loading window; no flashes of empty content.
- Error state recovers cleanly if assets fail to load.
- Mobile (iPhone 12 viewport) is fully usable, even if not pixel-perfect.
- No raw "Lorem ipsum" or "TODO" copy left anywhere.
- `tsc --noEmit` passes; all Vitest tests still pass.
- `git status` is clean.
- All boxes above are checked.

## End-of-phase commit

After all tasks above are checked:
- Commit: `chore(phase-v2-6): complete polish phase`
- Update `tasks/v2/PHASES.md` to check off Phase 6.
- Commit: `docs(phases-v2): mark phase 6 as complete`
