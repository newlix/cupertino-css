# Cider UI — Integration Examples

Minimal starters for the most common ways to use Cider UI.

Each directory is self-contained — copy one and go.

## [vanilla-html](./vanilla-html)

Open an HTML file in a browser. No Node, no build.
Uses the prebuilt CDN bundle. Best for prototypes, demos, and
scenarios where you don't want a build step.

## [vite](./vite)

Vite + Tailwind CSS v4 + ESM imports with tree-shakeable per-component
subpaths (`import "ciderui/components/dialog"`). Best for SPAs and
anyone already using Vite.

## [nextjs](./nextjs)

Next.js 15 App Router integration. CSS is SSR-safe; interactive JS
lazy-loads in a client component.

---

All three pin `ciderui@v0.7.0`. Bump the version in `package.json` (or
the CDN URL for vanilla) to upgrade.
