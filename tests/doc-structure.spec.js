/**
 * Every component doc page should have a Selectors section — users
 * land there to find class names, and skipping it breaks discovery.
 * kitchen-sink + essentials + installation are showcase/overview
 * pages and exempt.
 */
import { test, expect } from "@playwright/test";
import { readFile, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const EXEMPT = new Set(["kitchen-sink.njk", "essentials.njk"]);

test("every component doc page has a Selectors section", async () => {
  const dir = resolve(here, "../docs/components");
  const files = await readdir(dir);
  const missing = [];
  for (const f of files) {
    if (!f.endsWith(".njk") || EXEMPT.has(f)) continue;
    const src = await readFile(resolve(dir, f), "utf8");
    if (!/<h2[^>]*>\s*Selectors\s*<\/h2>/.test(src)) {
      missing.push(f);
    }
  }
  expect(missing, "component pages without Selectors section").toEqual([]);
});
