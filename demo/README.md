# fraud-autoencoder — In-Browser Demo (v2)

A static, client-side demo of the v1 fraud-detection autoencoder. Inference runs entirely in your browser via ONNX Runtime Web — no data leaves your device.

Built with React 18 + Vite + TypeScript, Tailwind CSS, shadcn/ui, and Recharts. Hosted on GitHub Pages.

## Local development

```bash
cd demo
npm ci
npm run dev      # dev server at http://localhost:5173/
```

## Production build

```bash
cd demo
npm ci
npm run build    # outputs to demo/dist/
```

Asset paths are configured for the `/fraud-autoencoder/` GitHub Pages subpath.

## Deployment

Pushing to `main` when files under `demo/` change triggers the GitHub Actions workflow (`.github/workflows/deploy-demo.yml`), which builds and deploys `demo/dist/` to GitHub Pages automatically.

**One-time manual step (do this once per repo):**

1. Go to the repo on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Save. The next push to `main` that touches `demo/` will deploy automatically.

The deployed URL will be `https://<your-username>.github.io/fraud-autoencoder/`.

## Related

- [v1 research project — README](../README.md)
- [v1 project spec — CONTEXT.md](../CONTEXT.md)
- [v2 demo spec — CONTEXT-v2.md](../CONTEXT-v2.md)
