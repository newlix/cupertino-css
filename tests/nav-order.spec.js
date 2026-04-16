/**
 * Enforce CLAUDE.md / CONTRIBUTING.md convention: the "Components"
 * section of docs/_data/nav.json is alphabetical by label. Drift here
 * is cosmetic until it isn't — a new component slotted in randomly
 * makes the sidebar harder to scan.
 *
 * Other sections (Getting Started, Resources) are free to order by
 * intent; only Components is gated.
 */
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

test("Components section of nav.json is alphabetical", async () => {
  const nav = JSON.parse(
    await readFile(
      resolve(new URL("../docs/_data/nav.json", import.meta.url).pathname),
      "utf8",
    ),
  );
  const components = nav.find((s) => s.title === "Components");
  expect(components, 'nav.json missing "Components" section').toBeTruthy();

  const labels = components.items.map((i) => i.label);
  const sorted = [...labels].sort((a, b) => a.localeCompare(b));
  expect(labels).toEqual(sorted);
});
