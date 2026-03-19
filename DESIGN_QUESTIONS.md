# Design Questions

Items flagged during Apple HIG design review that need design decisions.

## Correctness

### 1. Sidebar active state too low-contrast (sidebar.css)

Default active state uses `--surface-4` (12% opacity overlay) — only a 4% delta from hover's `--surface-3` (8%). At 13px font, the visual distinction relies almost entirely on `font-semibold`. Apple HIG uses a more prominent filled pill.

**Options:**

- (a) Raise active background to `--surface-5` (16%) for better non-color contrast
- (b) Add a left accent border (2px solid `--color-tertiary-foreground`) on active items
- (c) Keep current — the tinted variant (`data-tinted`) covers users who want stronger active states

### 2. Navbar title overflow on long text (navbar.css)

Grid layout `1fr auto 1fr` lets the center `auto` column expand before `truncate` kicks in, potentially pushing side slots off-screen.

**Options:**

- (a) Add `max-width: 60%; min-width: 0;` to the title slot to constrain it
- (b) Keep current — users are expected to keep titles short

### 3. Page control active dot uses opacity only (page-control.css)

Active dot is distinguished only by `opacity: 1` vs `0.3`. Color-blind users or low-vision users may struggle. Apple's native UIPageControl does the same, but web 96dpi has lower contrast.

**Options:**

- (a) Make active dot slightly larger (9px vs 7px) for non-color distinction
- (b) Keep current — matches native Apple behavior

### 4. Toolbar missing `[aria-pressed]` toggle state (toolbar.css)

`.toolbar-group` buttons have no styling for `[aria-pressed="true"]` or `[data-active]`. For formatting toolbars (Bold/Italic), users can't see which format is applied.

**Options:**

- (a) Add `[aria-pressed="true"]` / `[data-active]` styling with `--surface-5` background + `--color-primary` text
- (b) Keep current — let users add their own toggle styling

### 5. Segmented control no CSS-only fallback if JS fails (segmented-control.css)

The sliding indicator pill starts at `opacity: 0; width: 0` and relies on JS to position it. If JS fails, active segment is identified only by font-weight + text color.

**Options:**

- (a) Add a CSS-only `background` fallback on `[data-active]` / `[aria-selected="true"]` that gets visually overridden when JS positions the indicator
- (b) Keep current — JS is required for this component anyway

## Aesthetics

### 6. h5/h6 typography collapse (elements.css)

h5 (17px) equals body text size; h6 (15px) is smaller than body. Both faithfully match Apple HIG iOS text styles, but on web with wider viewports the hierarchy is too subtle.

**Options:**

- (a) Bump h5 to 18px and h6 to 16px for minimum distinction
- (b) Keep current — Apple HIG values are intentional; h5/h6 are de-emphasized headings

### 7. Homepage stats section floating (index.njk)

The 30+ / ~10 KB / 1 stats feel detached — no enclosing container, no shared background. Apple marketing pages typically ground proof points in a card or separator.

**Options:**

- (a) Add a subtle container (`rounded-xl border bg-card p-6`) around the stats
- (b) Keep current — the minimalist floating design is intentional
