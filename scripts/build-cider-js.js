#!/usr/bin/env node
// Concatenate js/components/*.js → js/cider.js for CDN/classic-script use.
// Source of truth: js/components/. Regenerate after editing a component file.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const compDir = resolve(here, "../js/components");
const outFile = resolve(here, "../js/cider.js");

// Order matters — _shared defines window.CiderUI.* utilities used by the rest.
const order = [
  "_shared.js",
  "actionSheet.js",
  "dialog.js",
  "hud.js",
  "picker.js",
  "popover.js",
  "sidebar.js",
  "slider.js",
  "stepper.js",
  "tabs.js",
  "tokenField.js",
  "verificationCode.js",
];

const out = order
  .map((f) => readFileSync(resolve(compDir, f), "utf8"))
  .join("");

writeFileSync(outFile, out);
console.log(`Wrote ${outFile} (${out.length} bytes)`);
