# Cider UI

Apple-aesthetic UI components as a Tailwind CSS v4 plugin. Semantic class names like `btn`, `card`, `input` — no utility soup in your markup.

**Docs & demos:** [ciderui.com](https://ciderui.com)

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

## License

[MIT](LICENSE)
