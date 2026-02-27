import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import nunjucks from "nunjucks";
import hljs from "highlight.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const DOCS = path.join(ROOT, "docs");
const SITE = path.join(ROOT, "site");

// ─── 1. Build CSS ───
console.log("Building CSS...");
execSync(
  `npx @tailwindcss/cli -i docs/docs.css -o site/docs.built.css`,
  { cwd: ROOT, stdio: "inherit" }
);

// ─── 2. Configure Nunjucks ───
const env = nunjucks.configure(DOCS, {
  autoescape: false,
  trimBlocks: true,
  lstripBlocks: true,
});

// dedent filter: trim leading/trailing blank lines, strip common indentation
env.addFilter("dedent", (str) => {
  if (!str) return "";
  // Trim leading/trailing blank lines
  const trimmed = str.replace(/^\s*\n/, "").replace(/\n\s*$/, "");
  const lines = trimmed.split("\n");
  const indents = lines
    .filter((l) => l.trim())
    .map((l) => l.match(/^\s*/)[0].length);
  const minIndent = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(minIndent)).join("\n");
});

// highlight filter: syntax highlight via highlight.js, HTML-escape is done by hljs
env.addFilter("highlight", (str, lang) => {
  if (!str) return "";
  if (lang && hljs.getLanguage(lang)) {
    return hljs.highlight(str, { language: lang }).value;
  }
  return hljs.highlightAuto(str).value;
});

// ─── 3. Load nav data ───
const nav = JSON.parse(
  fs.readFileSync(path.join(DOCS, "_data", "nav.json"), "utf-8")
);

// ─── 4. Glob .njk pages ───
function globNjk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...globNjk(full));
    } else if (entry.name.endsWith(".njk")) {
      results.push(full);
    }
  }
  return results;
}

const pages = globNjk(DOCS);
console.log(`Found ${pages.length} .njk pages`);

// ─── 5. Render each page ───
for (const pagePath of pages) {
  const rel = path.relative(DOCS, pagePath); // e.g. "components/button.njk"
  const outRel = rel.replace(/\.njk$/, ".html");
  const outPath = path.join(SITE, outRel);

  // Compute base path and page href for active nav
  const depth = rel.split(path.sep).length - 1;
  const base = depth > 0 ? "../".repeat(depth) : "";
  const pageHref = outRel.replace(/\\/g, "/"); // e.g. "components/button.html"

  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const html = env.render(rel, { nav, base, page: pageHref });
  fs.writeFileSync(outPath, html);
  console.log(`  ${outRel}`);
}

// ─── 6. Copy static assets ───
function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// favicon
if (fs.existsSync(path.join(DOCS, "favicon.svg"))) {
  copyFile(path.join(DOCS, "favicon.svg"), path.join(SITE, "favicon.svg"));
}

// llms.txt
if (fs.existsSync(path.join(DOCS, "llms.txt"))) {
  copyFile(path.join(DOCS, "llms.txt"), path.join(SITE, "llms.txt"));
}

// demos (HTML fragments for homepage lazy-load)
if (fs.existsSync(path.join(DOCS, "demos"))) {
  copyDir(path.join(DOCS, "demos"), path.join(SITE, "demos"));
}

// JS files
copyDir(path.join(ROOT, "js"), path.join(SITE, "js"));

console.log("Static assets copied.");
console.log(`Build complete → ${SITE}`);
