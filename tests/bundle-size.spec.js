/**
 * Bundle-size canary — alerts when js/cider.js or dist/ciderui.cdn.min.css
 * balloons unexpectedly. Thresholds are intentionally generous; they catch
 * bloat, not prevent growth. Bump the ceiling with a commit if a real
 * new component justifies the increase.
 *
 * Why bother: gzip smooths over a lot of accidental verbosity; duplicated
 * rules or unminified debug blobs slip through review. A raw byte gate
 * on the emitted artefacts is a cheap backstop.
 */
import { test, expect } from "@playwright/test";
import { stat } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

const BUDGETS = {
  "js/cider.js": 120 * 1024, // current ~94KB, 20% headroom
  "dist/ciderui.cdn.min.css": 180 * 1024, // current ~136KB
};

for (const [relPath, limit] of Object.entries(BUDGETS)) {
  test(`${relPath} stays under ${(limit / 1024).toFixed(0)}KB`, async () => {
    const s = await stat(resolve(here, "..", relPath));
    expect(
      s.size,
      `${relPath} is ${s.size} bytes; raise ceiling in tests/bundle-size.spec.js if intentional`,
    ).toBeLessThan(limit);
  });
}
