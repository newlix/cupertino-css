/**
 * Every custom property set at :root should have a matching definition
 * in .dark { } (or explicitly inherit). A missing dark override means
 * the component carries the light value into dark mode, which usually
 * breaks contrast.
 *
 * Exempted: tokens that are semantically theme-invariant (radii,
 * shadows, spring curves, transition timings, peculiar static fills
 * like --segmented-active), and --color-primary-foreground /
 * --color-destructive-foreground (both remain #fff in light + dark).
 */
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

const THEME_INVARIANT = new Set([
  // Radii + shapes
  "--radius-xs",
  "--radius-sm",
  "--radius",
  "--radius-lg",
  "--radius-xl",
  "--radius-pill",
  // Transitions / easings — no reason to differ per mode
  "--apple-press-scale",
  "--apple-spring",
  "--apple-ease",
  "--transition-fast",
  "--transition-normal",
  // Foregrounds that stay white
  "--color-primary-foreground",
  "--color-destructive-foreground",
]);

test("every :root token has a matching .dark override (or is exempt)", async () => {
  const src = await readFile(resolve(here, "../src/css/ciderui.css"), "utf8");

  // Extract the :root and .dark blocks' declaration names.
  const rootMatch = src.match(/:root\s*{([^}]*(?:{[^}]*}[^}]*)*)}/s);
  const darkMatch = src.match(/\n\.dark\s*{([^}]*(?:{[^}]*}[^}]*)*)}/s);
  expect(rootMatch).toBeTruthy();
  expect(darkMatch).toBeTruthy();

  const propRe = /(--[a-z0-9-]+)\s*:/gi;
  const rootProps = new Set(
    [...rootMatch[1].matchAll(propRe)].map((m) => m[1]),
  );
  const darkProps = new Set(
    [...darkMatch[1].matchAll(propRe)].map((m) => m[1]),
  );

  const missing = [...rootProps].filter(
    (p) => !darkProps.has(p) && !THEME_INVARIANT.has(p),
  );

  expect(
    missing,
    "tokens in :root without a .dark counterpart (either add one or exempt in test)",
  ).toEqual([]);
});
