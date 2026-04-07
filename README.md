# Cider UI

Apple-aesthetic UI components as a Tailwind CSS v4 plugin. Semantic class names like `btn`, `card`, `input` — no utility soup in your markup.

**Docs & demos:** [ciderui.com](https://ciderui.com)

## Install

```bash
pnpm add ciderui@github:newlix/ciderui
# or: npm install ciderui@github:newlix/ciderui
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

Some components (dialog, popover, tabs, etc.) need JS. Include the bundle:

```js
import "ciderui/cider.js";
```

Or via CDN:

```html
<script src="https://cdn.jsdelivr.net/gh/newlix/ciderui@main/js/cider.js"></script>
```

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
