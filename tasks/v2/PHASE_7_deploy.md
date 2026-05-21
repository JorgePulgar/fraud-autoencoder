# Phase 7 — Deployment + Cross-linking

**Goal:** Ship the demo to GitHub Pages via GitHub Actions, then update the v1 README to link to the live URL and the v2 README to link back.

**Depends on:** Phase 6 complete (demo is polished and presentable).

**Estimated time:** 1.5–2 h.

## Pre-session checklist

- [ ] You have push access to the repo on GitHub
- [ ] The repo's GitHub Pages tab is reachable in your account settings
- [ ] `npm run build` works cleanly in `demo/`

## Tasks

- [x] **Task 7.1** — Confirm Vite `base` is correct for the deployed URL. The deployed URL will be `https://<github-user>.github.io/fraud-autoencoder/`, so `base: '/fraud-autoencoder/'`. Build locally and inspect `demo/dist/index.html` — all asset hrefs must start with `/fraud-autoencoder/`. Confirm `demo/public/*.json` paths are loaded via `import.meta.env.BASE_URL` (or as relative URLs from the bundle), not as hard-coded `/...` paths. Fix any absolute paths that don't respect the base. Verify: `python -m http.server 8000` from `demo/dist/` and visit `http://localhost:8000/fraud-autoencoder/` — everything loads.
  - Commit: `fix(demo): ensure all asset paths respect vite base`

- [x] **Task 7.2** — Create `.github/workflows/deploy-demo.yml`. Trigger: `on: push: branches: [main]; paths: ['demo/**', '.github/workflows/deploy-demo.yml']`. Permissions: `pages: write, id-token: write`. Job: checkout, setup-node@v4 with cache for `demo/package-lock.json`, `npm ci` in `demo/`, `npm run build` in `demo/`, `actions/upload-pages-artifact@v3` with `path: demo/dist`, then `actions/deploy-pages@v4`. Verify locally with `act` if installed, otherwise lint the YAML by eye.
  - Commit: `ci(demo): add github actions workflow for pages deploy`

- [x] **Task 7.3** — One-time GitHub configuration. In the repo's Pages settings, set "Source" to "GitHub Actions". Document this step in `demo/README.md` under a "Deployment" section so future readers know it's a one-time manual switch.
  - Commit: `docs(demo): document pages source configuration step`

- [ ] **Task 7.4** — Push to `main` (user does this manually — Claude must ask first). Watch the workflow at `https://github.com/<user>/fraud-autoencoder/actions`. Once green, visit the deployed URL and verify: model loads, presets run, manual form works, CSV upload accepts a small file, threshold slider drags correctly, histogram updates. If anything 404s, find the path issue and fix in a follow-up commit.
  - Commit: (only if a fix is needed) `fix(demo): correct deployed asset path`

- [ ] **Task 7.5** — Update v1 `README.md`. Add a "Live demo" section near the top (after the project title, before the architecture section) with: link to the deployed URL, a short paragraph framing the demo as the interactive face of the project, and a screenshot or GIF if easy to produce (optional). Verify by reading the README top-to-bottom — flow is natural.
  - Commit: `docs(readme): link to live in-browser demo`

- [ ] **Task 7.6** — Add a deploy-status badge to v1 `README.md`. Format: `![Deploy](https://github.com/<user>/fraud-autoencoder/actions/workflows/deploy-demo.yml/badge.svg)`. Place near the top, next to any existing badges. Verify by opening the rendered README on GitHub — badge shows green.
  - Commit: `docs(readme): add deploy status badge`

- [ ] **Task 7.7** — Finalize `demo/README.md`. Sections: project description (one paragraph), link to the deployed URL, architecture (4-line summary: React + Vite + ONNX Runtime Web + GitHub Pages), local dev (`cd demo && npm ci && npm run dev`), build (`npm run build`), deployment notes (push to main triggers the action; Pages source must be set to "GitHub Actions"), link back to v1 `README.md` and `CONTEXT.md`, MIT license note. Verify by reading on GitHub.
  - Commit: `docs(demo): finalize demo readme`

- [ ] **Task 7.8** — Final cross-check. Visit the deployed URL from a fresh incognito tab on a phone (or use BrowserStack / Chrome DevTools mobile emulation). Walk through: load → preset → manual form → CSV → threshold slider → histogram → footer link to v1 → back. Note any issues in `DEVLOG.md` (under a new "v2 deploy" entry) and fix or defer to "future work" with a justification.
  - Commit: (only if fixes needed) `fix(demo): post-deploy polish`
  - DEVLOG: append v2 deploy entry regardless.

## Definition of done for Phase 7

- The deployed URL loads in incognito and runs end-to-end with no console errors.
- v1 `README.md` has a "Live demo" link and a status badge.
- `demo/README.md` has the deployed URL, local dev, build, and deploy notes.
- GitHub Actions workflow is green on the latest `main` commit.
- DEVLOG has a v2 deploy entry.
- `git status` is clean.
- All boxes above are checked.

## End-of-phase commit

After all tasks above are checked:
- Commit: `chore(phase-v2-7): complete deployment and cross-linking`
- Update `tasks/v2/PHASES.md` to check off Phase 7.
- Commit: `docs(phases-v2): mark phase 7 as complete — v2 project done`
