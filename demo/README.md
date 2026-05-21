# fraud-autoencoder — In-Browser Demo (v2)

A static, client-side demo of the v1 fraud-detection autoencoder. Inference runs entirely in your browser via ONNX Runtime Web — no data leaves your device.

**[Live demo →](https://JorgePulgar.github.io/fraud-autoencoder/)**

## What it does

- **Preset transactions** — 6 curated rows (3 legit, 3 fraud). One click runs the model and shows the reconstruction error, verdict, and Isolation Forest side-by-side.
- **Manual input** — V1–V28 sliders + Time/Amount fields. Defaults from the first preset; tweak any feature and re-run.
- **CSV batch upload** — drag-drop a file with columns `Time, V1–V28, Amount`. Returns a sortable table with per-row error and verdict.
- **Threshold slider** — drag to adjust the decision boundary in real time; all loaded rows and the histogram re-classify instantly.

## Architecture

React 18 + Vite + TypeScript · Tailwind CSS + shadcn/ui · ONNX Runtime Web (wasm) · GitHub Pages

## Local development

```bash
cd demo
npm ci
npm run dev      # dev server at http://localhost:5173/fraud-autoencoder/
```

## Build

```bash
cd demo
npm ci
npm run build    # outputs to demo/dist/
npm run preview  # preview at http://localhost:4173/fraud-autoencoder/
```

Asset paths are configured for the `/fraud-autoencoder/` GitHub Pages subpath via `vite.config.ts`.

## Deployment

Pushing to `main` when files under `demo/` change triggers the GitHub Actions workflow (`.github/workflows/deploy-demo.yml`), which builds and deploys `demo/dist/` to GitHub Pages automatically.

**One-time manual step (do this once per repo):**

1. Go to the repo on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. The next push to `main` that touches `demo/` will deploy automatically.

The deployed URL is `https://JorgePulgar.github.io/fraud-autoencoder/`.

## Related

- [v1 research project — README](../README.md)
- [v1 project spec — CONTEXT.md](../CONTEXT.md)
- [v2 demo spec — CONTEXT-v2.md](../CONTEXT-v2.md)

## License

MIT — see [LICENSE](../LICENSE).
