import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import nunjucks from "nunjucks";
import hljs from "highlight.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const DOCS = path.join(ROOT, "docs");
const SITE = path.join(ROOT, "site");
const CSS_OUT = "docs.built.css";

// ─── Configure Nunjucks ───
// No autoescape — all template data comes from version-controlled source files.
// Do not pass user-supplied or external data to env.render() without manual escaping.
const env = nunjucks.configure(DOCS, {
  autoescape: false,
  trimBlocks: true,
  lstripBlocks: true,
  noCache: true,
});

env.addFilter("dedent", (str) => {
  if (!str) return "";
  const trimmed = str.replace(/^\s*\n/, "").replace(/\n\s*$/, "");
  const lines = trimmed.split("\n");
  const indents = lines
    .filter((l) => l.trim())
    .map((l) => l.match(/^\s*/)[0].length);
  const minIndent = indents.length
    ? indents.reduce((a, b) => Math.min(a, b))
    : 0;
  return lines.map((l) => l.slice(minIndent)).join("\n");
});

env.addFilter("highlight", (str, lang) => {
  if (!str) return "";
  if (lang && hljs.getLanguage(lang)) {
    return hljs.highlight(str, { language: lang }).value;
  }
  return hljs.highlightAuto(str).value;
});

// ─── Helpers ───
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

// ─── Build ───
function build() {
  const start = performance.now();

  // Build CSS first — if this fails, existing site/ stays intact for the dev server
  fs.mkdirSync(SITE, { recursive: true });
  execSync(`npx @tailwindcss/cli -i docs/docs.css -o site/${CSS_OUT}`, {
    cwd: ROOT,
    stdio: "inherit",
  });

  // CSS succeeded — now safe to clean stale output (preserve the CSS we just built)
  if (!SITE.startsWith(ROOT))
    throw new Error(`SITE ${SITE} is outside ROOT ${ROOT}`);
  for (const entry of fs.readdirSync(SITE)) {
    if (entry === CSS_OUT) continue;
    fs.rmSync(path.join(SITE, entry), { recursive: true });
  }

  // Nav
  const nav = JSON.parse(
    fs.readFileSync(path.join(DOCS, "_data", "nav.json"), "utf-8"),
  );

  // Render pages
  const pages = globNjk(DOCS);
  for (const pagePath of pages) {
    const rel = path.relative(DOCS, pagePath);
    const outRel = rel.replace(/\.njk$/, ".html");
    const outPath = path.join(SITE, outRel);
    const depth = rel.split(path.sep).length - 1;
    const base = depth > 0 ? "../".repeat(depth) : "";
    const pageHref = outRel.replace(/\\/g, "/");

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, env.render(rel, { nav, base, page: pageHref }));
  }

  // Static assets
  if (fs.existsSync(path.join(DOCS, "favicon.svg")))
    copyFile(path.join(DOCS, "favicon.svg"), path.join(SITE, "favicon.svg"));
  if (fs.existsSync(path.join(DOCS, "llms.txt")))
    copyFile(path.join(DOCS, "llms.txt"), path.join(SITE, "llms.txt"));
  if (fs.existsSync(path.join(DOCS, "demos")))
    copyDir(path.join(DOCS, "demos"), path.join(SITE, "demos"));
  copyDir(path.join(ROOT, "js"), path.join(SITE, "js"));
  if (fs.existsSync(path.join(DOCS, "snippet.js")))
    copyFile(path.join(DOCS, "snippet.js"), path.join(SITE, "snippet.js"));
  fs.writeFileSync(path.join(SITE, "CNAME"), "ciderui.com\n");

  const ms = Math.round(performance.now() - start);
  console.log(`Built ${pages.length} pages → ${SITE} (${ms}ms)`);
}

// ─── Initial build ───
build();

// ─── Watch mode ───
if (process.argv.includes("--watch")) {
  let timer;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        build();
      } catch (e) {
        console.error(e.stack || e.message);
      }
    }, 200);
  };

  fs.watch(DOCS, { recursive: true }, rebuild).on("error", (e) =>
    console.error("Watch error:", e.message),
  );
  fs.watch(path.join(ROOT, "src", "css"), { recursive: true }, rebuild).on(
    "error",
    (e) => console.error("Watch error:", e.message),
  );
  fs.watch(path.join(ROOT, "js"), { recursive: true }, rebuild).on(
    "error",
    (e) => console.error("Watch error:", e.message),
  );
  console.log("Watching for changes...");
}
