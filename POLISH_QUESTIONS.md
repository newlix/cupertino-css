# Polish Questions

## [docs/_includes/macros.njk — figure without figcaption]
- **Problem**: `example()` macro wraps preview in `<figure>` but the label `<h3>` is outside — no `<figcaption>`, screen reader announces unnamed figure
- **Options**: A) Move h3 inside figure as figcaption / B) Replace `<figure>` with `<div>` (simpler but breaks ~40 test selectors using `.snippet-preview > figure`)
- **Status**: Skipped — needs coordinated test selector update
