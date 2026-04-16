#!/usr/bin/env node
// Verify each js/components/*.js that reads window.CiderUI._*
// (shared utilities defined in _shared.js) also declares an
// `import "./_shared.js"`. Without the import, tree-shaken consumers
// that only load one component would crash because _shared never ran.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dir = resolve(here, "../js/components");
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".js") && f !== "_shared.js")
  .sort();

let fail = false;
for (const f of files) {
  const src = readFileSync(resolve(dir, f), "utf8");
  const usesShared = /window\.CiderUI\._[A-Za-z]/.test(src);
  const hasImport = /import\s+["']\.\/_shared\.js["']/.test(src);
  if (usesShared && !hasImport) {
    console.error(
      `${f}: reads window.CiderUI._* but missing \`import "./_shared.js"\``,
    );
    fail = true;
  }
}

if (fail) {
  console.error(
    '\nAdd `import "./_shared.js";` near the top of each flagged file.',
  );
  process.exit(1);
}
console.log(`check-shared-imports: ${files.length} component files OK`);
