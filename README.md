# Cider UI

Apple-aesthetic UI components as a Tailwind CSS v4 plugin. Semantic class names like `btn`, `card`, `input` — no utility soup in your markup.

**Docs & demos:** [ciderui.com](https://ciderui.com)

## Install

```bash
npm install ciderui@github:newlix/ciderui
```

## Usage

### Tailwind CSS v4 plugin

```css
/* your main CSS file */
@import "tailwindcss";
@import "ciderui";
```

All Cider UI styles are scoped with CSS `@scope`. Add `.cider` to an ancestor element to activate them:

```html
<!-- Add .cider to <body> for full-page styling -->
<body class="cider">
  <button class="btn-filled">Click me</button>
  <div class="card">
    <h2>Title</h2>
    <p>Content goes here.</p>
  </div>
</body>

<!-- Or scope to a specific section -->
<main class="cider">
  <h1>Auto-styled heading</h1>
  <p>Native elements are styled automatically inside .cider.</p>
</main>
```

### CDN

For quick prototyping without a build step:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/newlix/ciderui@main/dist/ciderui.cdn.min.css" />

<body class="cider">
  <h1>Hello</h1>
  <button class="btn-filled">Click me</button>
</body>
```

## Components (27)

| Component | Class | JS |
|---|---|---|
| Activity Indicator | `activity-indicator` `activity-indicator-sm` `activity-indicator-lg` | — |
| Avatar | `avatar` `avatar-group` | — |
| Badge | `badge` | — |
| Breadcrumb | `breadcrumb` | — |
| Button | `btn-filled` `btn-gray` `btn-tinted` `btn-plain` `btn-destructive` `btn-capsule` `btn-sm` `btn-lg` | — |
| Button Group | `btn-group` | — |
| Callout | `callout` | — |
| Card | `card` `card-interactive` | — |
| Checkbox | `checkbox` | — |
| Dialog | `dialog` | `dialog.js` |
| HUD | `hud` `hud-container` | `hud.js` |
| Input | `input` | — |
| Kbd | `kbd` | — |
| List | `list` `list-inset` `list-inset-grouped` | — |
| Page Control | `page-control` | — |
| Pagination | `pagination` | — |
| Popover | `popover` | `popover.js` |
| Progress | `progress` `progress-sm` `progress-indeterminate` | — |
| Radio | `radio` | — |
| Segmented Control | `segmented-control` | — |
| Select | `select` | — |
| Separator | `separator` | — |
| Slider | `slider` | `slider.js` |
| Switch | `switch` | — |
| Table | `table` `table-striped` | — |
| Tag | `tag` | — |
| Textarea | `textarea` | — |
| Verification Code | `verification-code` | `verification-code.js` |

### Interactive JS

JS files are optional and self-contained. Load via CDN or import as ES modules:

```html
<!-- CDN -->
<script src="https://cdn.jsdelivr.net/gh/newlix/ciderui@main/js/dialog.js"></script>
```

```js
// ES module / bundler
import "ciderui/dialog.js";
import "ciderui/hud.js";
import "ciderui/popover.js";
import "ciderui/slider.js";
import "ciderui/verification-code.js";
```

## Dark Mode

Add `class="dark"` to your `<html>` element. All components automatically adapt. Use `.light` inside a `.dark` container to create light sections — nesting works at any depth.

```js
// Toggle dark mode
document.documentElement.classList.toggle('dark');
```

```html
<!-- Light section inside dark page -->
<div class="light" style="background: var(--background); color: var(--foreground);">
  <button class="btn-filled">Always light</button>
</div>
```

## Design Tokens

CSS variables that you can override:

| Variable | Light | Dark |
|---|---|---|
| `--primary` | Apple Blue | Apple Blue |
| `--background` | white | gray-950 |
| `--foreground` | gray-900 | gray-100 |
| `--border` | gray-200/60 | gray-800 |
| `--radius` | 0.625rem | 0.625rem |
| `--apple-press-scale` | 0.97 | 0.97 |

## License

[MIT](LICENSE)
