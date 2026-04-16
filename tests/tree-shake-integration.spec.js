/**
 * Integration check that per-component ESM imports actually tree-shake:
 * load only js/components/hud.js + its _shared dependency, assert that
 * dialog / popover / etc. do NOT attach to window.CiderUI.
 *
 * Static analysis (scripts/check-shared-imports.js) ensures each
 * component declares its dependency on _shared; this spec verifies
 * the runtime side — a bundler picking up `ciderui/components/hud`
 * really won't drag in siblings.
 */
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

test("loading only one component does not attach siblings", async ({
  page,
}) => {
  // Blank page — no pre-existing CiderUI state from a docs layout.
  await page.goto("about:blank");

  const here = resolve(new URL(".", import.meta.url).pathname);
  const shared = await readFile(
    resolve(here, "../js/components/_shared.js"),
    "utf8",
  );
  const hud = await readFile(resolve(here, "../js/components/hud.js"), "utf8");
  // Drop the `import "./_shared.js"` declaration — addScriptTag runs as
  // a classic script, so ESM syntax would throw. _shared is injected
  // manually just before.
  const hudNoImport = hud.replace(/^\s*import\s+[^\n]*\n/gm, "");

  await page.addScriptTag({ content: shared });
  await page.addScriptTag({ content: hudNoImport });

  const state = await page.evaluate(() => {
    const w = /** @type {any} */ (window);
    return {
      hasHud: typeof w.CiderUI?.hud?.show === "function",
      hasScrollLock: typeof w.CiderUI?._scrollLock?.lock === "function",
      hasFocusable: typeof w.CiderUI?._FOCUSABLE === "string",
      siblings: [
        "dialog",
        "actionSheet",
        "picker",
        "popover",
        "sidebar",
        "slider",
        "stepper",
        "tabs",
        "tokenField",
        "verificationCode",
      ].filter((k) => w.CiderUI?.[k] !== undefined),
      hasShowHUD: typeof w.showHUD === "function",
      hasOpenDialog: typeof w.openDialog === "function",
    };
  });

  expect(state.hasHud, "hud component should have loaded").toBe(true);
  expect(state.hasScrollLock, "_shared.js should have loaded").toBe(true);
  expect(state.hasFocusable, "_FOCUSABLE should be defined").toBe(true);
  expect(state.hasShowHUD, "window.showHUD should be defined").toBe(true);
  expect(state.siblings, "no sibling components should be attached").toEqual(
    [],
  );
  expect(
    state.hasOpenDialog,
    "window.openDialog must not appear (dialog.js not loaded)",
  ).toBe(false);
});
