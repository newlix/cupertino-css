# Cider UI

[![Test](https://github.com/newlix/ciderui/actions/workflows/test.yml/badge.svg)](https://github.com/newlix/ciderui/actions/workflows/test.yml)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Apple-aesthetic UI components as a Tailwind CSS v4 plugin. Semantic class names like `btn`, `card`, `input` — no utility soup in your markup.

**Docs & demos:** [ciderui.com](https://ciderui.com) · **Changelog:** [CHANGELOG.md](CHANGELOG.md)

## Install

Pin a released tag to get a stable version:

```bash
pnpm add ciderui@github:newlix/ciderui#v0.5.1
# or: npm install ciderui@github:newlix/ciderui#v0.5.1
```

Omitting the tag tracks `main` and can break between commits:

```bash
pnpm add ciderui@github:newlix/ciderui   # ⚠ unstable
```

## Starter Examples

Copy-paste-ready integration examples in [`examples/`](./examples):

- [`examples/vanilla-html`](./examples/vanilla-html) — open in browser, no build step (CDN)
- [`examples/vite`](./examples/vite) — Vite + Tailwind v4 + tree-shakeable imports
- [`examples/nextjs`](./examples/nextjs) — Next.js 15 App Router, SSR-safe CSS

## Usage

### Tailwind CSS v4 plugin

```css
@import "tailwindcss";
@import "ciderui";
```

Add `.cider` to an ancestor element to activate styles:

```html
<body class="cider">
  <h1>Auto-styled heading</h1>
  <button class="btn-filled">Click me</button>
  <div class="card">
    <h2>Title</h2>
    <p>Content goes here.</p>
  </div>
</body>
```

### Interactive components

Some components (dialog, popover, tabs, etc.) need JS. Include the full bundle:

```js
import "ciderui/cider.js";
```

Or import only what you need (tree-shakeable):

```js
import "ciderui/components/dialog";
import "ciderui/components/popover";
```

Or via CDN:

```html
<script src="https://cdn.jsdelivr.net/gh/newlix/ciderui@main/js/cider.js"></script>
```

TypeScript types are shipped alongside — `window.CiderUI.*` and the global
helpers (`openDialog`, `showHUD`, etc.) are fully typed.

### CDN (no build step)

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/newlix/ciderui@main/dist/ciderui.cdn.min.css"
/>
```

## Dark Mode

```js
document.documentElement.classList.toggle("dark");
```

## Components

- **Actions** — button, action-sheet, dialog, toolbar, hud, tooltip
- **Input** — text-field, textarea, search-field, select, checkbox,
  radio-group, switch, slider, stepper, token-field, verification-code
- **Display** — card, list, table, badge, avatar, tag, kbd, callout,
  progress, activity-indicator, gauge, separator
- **Navigation** — navbar, sidebar, tabs, tab-bar, breadcrumb,
  pagination, page-control, segmented-control
- **Overlay** — popover, picker, disclosure-group

See [ciderui.com](https://ciderui.com) for live examples and markup.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the dev workflow.

## License

[MIT](LICENSE)
