/**
 * Every .njk file under docs/components/ must have a matching entry in
 * docs/_data/nav.json (Components section), and vice versa. A new
 * component added without a nav entry becomes invisible in the sidebar;
 * a stale nav entry points at a 404.
 */
import { test, expect } from "@playwright/test";
import { readFile, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

test("every docs/components/*.njk is linked from nav.json", async () => {
  const nav = JSON.parse(
    await readFile(resolve(here, "../docs/_data/nav.json"), "utf8"),
  );
  const files = (await readdir(resolve(here, "../docs/components")))
    .filter((f) => f.endsWith(".njk"))
    .map((f) => f.replace(/\.njk$/, ""));

  const linkedHrefs = nav
    .flatMap((section) => section.items)
    .map((item) => item.href)
    .filter((href) => href.startsWith("components/"))
    .map((href) => href.replace(/^components\//, "").replace(/\.html$/, ""));

  const missingFromNav = files.filter((f) => !linkedHrefs.includes(f));
  const missingFromDisk = linkedHrefs.filter((l) => !files.includes(l));

  expect(
    missingFromNav,
    "components present on disk but absent from nav.json",
  ).toEqual([]);
  expect(missingFromDisk, "nav.json references files that don't exist").toEqual(
    [],
  );
});
