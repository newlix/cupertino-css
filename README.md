# Cider UI

Apple-aesthetic UI components as a Tailwind CSS v4 plugin. Semantic class names like `btn`, `card`, `input` — no utility soup in your markup.

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

```html
<button class="btn-filled">Click me</button>
<button class="btn-filled btn-destructive">Delete</button>
<div class="card">
  <h2>Title</h2>
  <p>Content goes here.</p>
</div>
```

### CDN

For quick prototyping without a build step:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/newlix/ciderui@main/dist/ciderui.cdn.min.css" />
```

## Components (27)

| Component | Class | JS |
|-----------|-------|----|
| Button | `btn-filled` `btn-gray` `btn-tinted` `btn-plain` `btn-destructive` `btn-capsule` `btn-sm` `btn-lg` | — |
| Tag | `tag` | — |
| Badge | `badge` (notification count) | — |
| Card | `card` `card-interactive` | — |
| Alert | `alert-info` `alert-success` `alert-warning` `alert-destructive` | — |
| Input | `input` | — |
| Textarea | `textarea` | — |
| Select | `select` (native) | `js/select.js` (custom) |
| Checkbox | `checkbox` | — |
| Radio | `radio` | — |
| Switch | `switch` | — |
| Label | `label` | — |
| Field | `field` (auto-styles children) | — |
| Dialog | `dialog` (children: `header` `section` `footer`) | `js/dialog.js` (optional) |
| Dropdown | `dropdown-menu` | `js/dropdown-menu.js` |
| Tabs | `tabs` `tabs-list` `tabs-trigger` `tabs-content` `tabs-pill` | `js/tabs.js` |
| Table | `table` `table-striped` | — |
| Avatar | `avatar` `avatar-group` | — |
| Button Group | `btn-group` | — |
| Kbd | `kbd` | — |
| Pagination | `pagination` `pagination-item` | — |
| Progress | `progress` > `.progress-bar` `progress-sm` `progress-indeterminate` | — |
| Skeleton | `skeleton` `skeleton-circle` | — |
| Slider | `slider` | — |
| Activity Indicator | `activity-indicator` `activity-indicator-sm` `activity-indicator-lg` | — |
| HUD | `hud` `hud-container` | `js/hud.js` |
| Help Tag | `help-tag` `help-tag-content` `help-tag-bottom` | — |

### ES Module / Bundler (Vite, Webpack, etc.)

JS files work with bundlers. Import them as side effects in your entry file:

```js
import "ciderui/dialog.js";
import "ciderui/tabs.js";
import "ciderui/select.js";
import "ciderui/hud.js";
```

## Dark Mode

Add `class="dark"` to your `<html>` element. All components automatically adapt. Use `.light` inside a `.dark` container to create light sections — nesting works at any depth.

```js
// Toggle dark mode
document.documentElement.classList.toggle('dark');
```

```html
<!-- Scoped theme: light section inside dark page -->
<div class="light" style="background: var(--background); color: var(--foreground);">
  <button class="btn-filled">Always light</button>
</div>
```

## Design Tokens

CSS variables that you can override:

| Variable | Light | Dark |
|----------|-------|------|
| `--primary` | Apple Blue | Apple Blue |
| `--background` | white | gray-950 |
| `--foreground` | gray-900 | gray-100 |
| `--border` | gray-200/60 | gray-800 |
| `--radius` | 0.625rem | 0.625rem |
| `--apple-press-scale` | 0.97 | 0.97 |

## License

MIT
