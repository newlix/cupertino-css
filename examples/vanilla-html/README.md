# Cider UI — Vanilla HTML example

The absolute minimum: one HTML file, two CDN URLs, no build step.

## Run

Open `index.html` directly in any modern browser. That's it.

Or serve with any static server:

```bash
python -m http.server 8080
# → http://localhost:8080/index.html
```

## What's in here

- A `<link>` to the prebuilt CDN CSS (`ciderui.cdn.min.css`).
- A `<script defer>` for the interactive JS bundle (`cider.js`).
- Optional: one inline script that applies `.dark` on load when the OS
  prefers dark mode, so components render dark from first paint.

## Pinning

The example pins `@v0.7.0`. To follow the latest release tag:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/newlix/ciderui@latest/dist/ciderui.cdn.min.css"
/>
```

`@main` is also valid but unstable — use a tag in production.

## Next step

For a build-tooled setup with tree-shake and Tailwind customisation,
see [`../vite`](../vite).
