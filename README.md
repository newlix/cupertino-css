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
<button class="btn">Click me</button>
<button class="btn-destructive">Delete</button>
<div class="card">
  <header><h2>Title</h2></header>
  <section>Content</section>
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
| Button | `btn` `btn-primary` `btn-secondary` `btn-outline` `btn-ghost` `btn-destructive` `btn-pill` `btn-sm` `btn-lg` `btn-icon` | — |
| Badge | `badge` `badge-primary` `badge-success` `badge-warning` `badge-destructive` `badge-outline` | — |
| Card | `card` `card-interactive` (children: `header` `section` `footer`) | — |
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
| Accordion | `accordion` (native `<details>`) | — |
| Avatar | `avatar` `avatar-sm` `avatar-lg` `avatar-group` | — |
| Breadcrumb | `breadcrumb` | — |
| Button Group | `btn-group` | — |
| Kbd | `kbd` | — |
| Pagination | `pagination` `pagination-item` | — |
| Progress | `progress` > `.progress-bar` `progress-sm` `progress-indeterminate` | — |
| Skeleton | `skeleton` `skeleton-circle` | — |
| Slider | `slider` | — |
| Spinner | `spinner` `spinner-sm` `spinner-lg` | — |
| Toast | `toast` `toast-container` | `js/toast.js` |
| Tooltip | `tooltip` `tooltip-content` `tooltip-bottom` | — |

### ES Module / Bundler (Vite, Webpack, etc.)

JS files work with bundlers. Import them as side effects in your entry file:

```js
import "ciderui/dialog.js";
import "ciderui/tabs.js";
import "ciderui/select.js";
import "ciderui/toast.js";
```

## Dark Mode

Add `class="dark"` to your `<html>` element. All components automatically adapt.

```js
// Toggle dark mode
document.documentElement.classList.toggle('dark');
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
