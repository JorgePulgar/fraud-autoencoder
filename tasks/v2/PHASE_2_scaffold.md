# Phase 2 — Demo Scaffold

**Goal:** Initialize the Vite + React + TS + Tailwind + shadcn project inside `demo/`, configured for GitHub Pages deployment, with a working dark theme and Geist Mono font.

**Depends on:** Phase 1 complete (`demo/public/` already contains the artifacts).

**Estimated time:** 1–1.5 h.

## Pre-session checklist

- [ ] Node 20+ installed (`node --version`)
- [ ] npm 10+ installed
- [ ] `demo/public/` artifacts from Phase 1 are present
- [ ] You're in the project root in a fresh terminal

## Tasks

- [ ] **Task 2.1** — Initialize Vite in `demo/`. Run `npm create vite@latest demo-tmp -- --template react-ts`, then move its contents into `demo/` (preserving the existing `demo/public/`). Delete `demo-tmp/`. Run `npm install` inside `demo/`. Verify: `cd demo && npm run dev` starts the dev server and the default Vite page renders at `http://localhost:5173/`.
  - Commit: `chore(demo): scaffold vite + react + ts project`

- [ ] **Task 2.2** — Configure Vite `base` for GitHub Pages subpath. Edit `demo/vite.config.ts` to set `base: '/fraud-autoencoder/'`. Verify: `npm run build` produces `demo/dist/` with asset paths under `/fraud-autoencoder/assets/...` (inspect the built `index.html`).
  - Commit: `feat(demo): configure vite base for github pages subpath`

- [ ] **Task 2.3** — Install Tailwind and configure it. `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`. Set `darkMode: 'class'` in `tailwind.config.js` and add the standard content paths. Replace `demo/src/index.css` with the Tailwind directives plus a `@layer base` block that sets `html { class="dark" }` defaults. Verify: a Tailwind class like `bg-zinc-950 text-zinc-50` on the root element renders dark.
  - Commit: `feat(demo): add tailwind with dark-mode default`

- [ ] **Task 2.4** — Initialize shadcn/ui. Run `npx shadcn@latest init` and accept: style `new-york`, base color `zinc`, CSS variables `yes`, `src/components/ui` location, `tailwind.config.js` and `index.css` as expected. Verify by running `npx shadcn@latest add button` and rendering a `<Button>` on the home page.
  - Commit: `feat(demo): add shadcn/ui with new-york style`

- [ ] **Task 2.5** — Add Geist Mono. `npm install @fontsource/geist-mono`. Import the 400 + 600 weights in `src/main.tsx`. Extend `tailwind.config.js` with `fontFamily: { mono: ['Geist Mono', 'monospace'] }`. Verify: a heading with `className="font-mono"` renders in Geist Mono.
  - Commit: `feat(demo): add geist mono font`

- [ ] **Task 2.6** — Create the folder structure under `demo/src/`: `components/` (already exists from shadcn), `components/ui/` (already exists), `lib/`, `hooks/`, `store/`, `types/`. Add a `lib/utils.ts` that re-exports the `cn` helper shadcn already created (or leave shadcn's in place). Verify: directories exist and `tsc --noEmit` passes.
  - Commit: `chore(demo): create src folder structure`

- [ ] **Task 2.7** — Replace the Vite default `App.tsx` with a minimal dark-mode landing page: full-bleed dark background, a centered card with the project title in Geist Mono, a subtitle, and a placeholder "Demo loading…" line. No real logic yet. Verify by visual inspection at `npm run dev`.
  - Commit: `feat(demo): minimal landing page with dark theme`

- [ ] **Task 2.8** — Create `demo/README.md` with: project description (one paragraph), local dev instructions (`npm ci && npm run dev`), build instructions (`npm run build`), and a link back to the v1 `README.md` and `CONTEXT.md`. Verify: file renders correctly in the GitHub preview (or any markdown viewer).
  - Commit: `docs(demo): add local dev readme`

## Definition of done for Phase 2

- `cd demo && npm run dev` shows the dark-themed landing page with Geist Mono heading.
- `cd demo && npm run build` produces `demo/dist/` with subpath asset URLs.
- `cd demo && npx tsc --noEmit` passes with no errors.
- `git status` is clean.
- All boxes above are checked.

## End-of-phase commit

After all tasks above are checked:
- Commit: `chore(phase-v2-2): complete demo scaffold`
- Update `tasks/v2/PHASES.md` to check off Phase 2.
- Commit: `docs(phases-v2): mark phase 2 as complete`
