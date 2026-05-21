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

## Related

- [v1 research project — README](../README.md)
- [v1 project spec — CONTEXT.md](../CONTEXT.md)
- [v2 demo spec — CONTEXT-v2.md](../CONTEXT-v2.md)
