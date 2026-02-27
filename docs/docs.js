// Cider UI Docs — Layout Injector + Preview/Code tabs + Theme toggle
// Single source of truth for sidebar navigation

const NAV = [
  {
    title: "Getting Started",
    items: [
      { label: "Introduction", href: "introduction.html" },
      { label: "Installation", href: "installation.html" },
      { label: "llms.txt", href: "llms.txt" },
    ],
  },
  {
    title: "Components",
    items: [
      { label: "Accordion", href: "components/accordion.html" },
      { label: "Alert", href: "components/alert.html" },
      { label: "Alert Dialog", href: "components/alert-dialog.html" },
      { label: "Aspect Ratio", href: "components/aspect-ratio.html" },
      { label: "Avatar", href: "components/avatar.html" },
      { label: "Badge", href: "components/badge.html" },
      { label: "Breadcrumb", href: "components/breadcrumb.html" },
      { label: "Button", href: "components/button.html" },
      { label: "Button Group", href: "components/button-group.html" },
      { label: "Card", href: "components/card.html" },
      { label: "Carousel", href: "components/carousel.html" },
      { label: "Checkbox", href: "components/checkbox.html" },
      { label: "Collapsible", href: "components/collapsible.html" },
      { label: "Combobox", href: "components/combobox.html" },
      { label: "Command", href: "components/command.html" },
      { label: "Context Menu", href: "components/context-menu.html" },
      { label: "Dialog", href: "components/dialog.html" },
      { label: "Drawer", href: "components/drawer.html" },
      { label: "Dropdown Menu", href: "components/dropdown-menu.html" },
      { label: "Empty", href: "components/empty.html" },
      { label: "Field", href: "components/field.html" },
      { label: "File Tree", href: "components/file-tree.html" },
      { label: "Form", href: "components/form.html" },
      { label: "Hover Card", href: "components/hover-card.html" },
      { label: "Input", href: "components/input.html" },
      { label: "Input Group", href: "components/input-group.html" },
      { label: "Input OTP", href: "components/input-otp.html" },
      { label: "Item", href: "components/item.html" },
      { label: "Kbd", href: "components/kbd.html" },
      { label: "Label", href: "components/label.html" },
      { label: "Pagination", href: "components/pagination.html" },
      { label: "Popover", href: "components/popover.html" },
      { label: "Progress", href: "components/progress.html" },
      { label: "Radio Group", href: "components/radio-group.html" },
      { label: "Scroll Area", href: "components/scroll-area.html" },
      { label: "Select", href: "components/select.html" },
      { label: "Separator", href: "components/separator.html" },
      { label: "Sheet", href: "components/sheet.html" },
      { label: "Sidebar", href: "components/sidebar.html" },
      { label: "Skeleton", href: "components/skeleton.html" },
      { label: "Slider", href: "components/slider.html" },
      { label: "Spinner", href: "components/spinner.html" },
      { label: "Switch", href: "components/switch.html" },
      { label: "Table", href: "components/table.html" },
      { label: "Tabs", href: "components/tabs.html" },
      { label: "Textarea", href: "components/textarea.html" },
      { label: "Theme Switcher", href: "components/theme-switcher.html" },
      { label: "Toast", href: "components/toast.html" },
      { label: "Toggle", href: "components/toggle.html" },
      { label: "Toggle Group", href: "components/toggle-group.html" },
      { label: "Tooltip", href: "components/tooltip.html" },
      { label: "Typography", href: "components/typography.html" },
    ],
  },
];

// ─── Resolve base path ───
const isSubpage = location.pathname.includes("/components/");
const base = isSubpage ? "../" : "";

// ─── Current page matching ───
function currentHref() {
  const path = location.pathname;
  const idx = path.indexOf("/docs/");
  if (idx === -1) return "";
  return path.slice(idx + 6); // strip "/docs/"
}

// ─── Theme ───
function initTheme() {
  if (
    localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  }
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const isDark = document.documentElement.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateHljsTheme(isDark);
}

function updateHljsTheme(isDark) {
  const el = document.getElementById("hljs-theme");
  if (el) {
    el.href = isDark
      ? "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github-dark.min.css"
      : "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github.min.css";
  }
}

// ─── Build sidebar HTML ───
function buildSidebar() {
  const current = currentHref();
  let html = `
    <div class="docs-sidebar-brand">
      <a href="${base}introduction.html" class="flex items-center gap-2.5 no-underline">
        <svg width="20" height="22" viewBox="0 0 64 72" fill="none" class="text-foreground">
          <path d="M 10 6 C 10 4 54 4 54 6 L 48 32 C 46 40 38 44 34 46 L 34 54 L 44 56 C 48 57 48 62 44 62 L 20 62 C 16 62 16 57 20 56 L 30 54 L 30 46 C 26 44 18 40 16 32 Z" fill="currentColor"/>
        </svg>
        <h1>Cider UI</h1>
      </a>
    </div>`;

  for (const section of NAV) {
    html += `<div class="docs-sidebar-section"><h2>${section.title}</h2><div class="flex flex-col gap-0.5">`;
    for (const item of section.items) {
      const href = base + item.href;
      const active = current === item.href ? ' data-active' : '';
      html += `<a href="${href}"${active}>${item.label}</a>`;
    }
    html += `</div></div>`;
  }
  return html;
}

// ─── Build header HTML ───
function buildHeader() {
  const sunIcon = `<svg class="size-4 hidden dark:block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`;
  const moonIcon = `<svg class="size-4 dark:hidden" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`;
  const hamburgerIcon = `<svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>`;

  return `
    <div class="docs-header-inner">
      <button class="docs-hamburger" id="docs-hamburger">${hamburgerIcon}</button>
      <div></div>
      <div class="flex items-center gap-2">
        <a href="https://github.com/newlix/ciderui" target="_blank" rel="noopener" class="docs-theme-toggle" title="GitHub">
          <svg class="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        </a>
        <button class="docs-theme-toggle" id="docs-theme-toggle" title="Toggle theme">${sunIcon}${moonIcon}</button>
      </div>
    </div>`;
}

// ─── Inject layout ───
function injectLayout() {
  initTheme();

  const main = document.querySelector("main");
  if (!main) return;

  const title = main.dataset.title || "";
  const description = main.dataset.description || "";

  // Build header with title
  let contentHeader = "";
  if (title) {
    contentHeader = `<h1 class="docs-title">${title}</h1>`;
    if (description) {
      contentHeader += `<p class="docs-description">${description}</p>`;
    }
  }

  // Wrap main content
  const originalContent = main.innerHTML;
  document.body.innerHTML = `
    <nav class="docs-sidebar" id="docs-sidebar">${buildSidebar()}</nav>
    <div class="docs-overlay" id="docs-overlay"></div>
    <div class="docs-main">
      <header class="docs-header">${buildHeader()}</header>
      <div class="docs-content">
        ${contentHeader}
        ${originalContent}
      </div>
    </div>
    <div class="toast-container" id="toast-container"></div>
  `;

  // Bind events
  document.getElementById("docs-theme-toggle").addEventListener("click", toggleTheme);

  const hamburger = document.getElementById("docs-hamburger");
  const sidebar = document.getElementById("docs-sidebar");
  const overlay = document.getElementById("docs-overlay");

  hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("open");
  });
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  });
}

// ─── Preview/Code tabs ───
function initExamples() {
  document.querySelectorAll(".docs-example").forEach((section) => {
    const template = section.querySelector("template");
    if (!template) return;

    const exampleLabel = section.dataset.example || "";
    const rawHTML = template.innerHTML;
    // Trim leading/trailing blank lines but preserve internal whitespace
    const trimmed = rawHTML.replace(/^\s*\n/, "").replace(/\n\s*$/, "");

    // De-indent: find min indentation and strip it
    const lines = trimmed.split("\n");
    const indents = lines.filter(l => l.trim()).map(l => l.match(/^\s*/)[0].length);
    const minIndent = Math.min(...indents);
    const dedented = lines.map(l => l.slice(minIndent)).join("\n");

    const escaped = dedented
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    section.innerHTML = `
      ${exampleLabel ? `<h3 class="docs-example-label">${exampleLabel}</h3>` : ""}
      <div class="docs-example-card">
        <div class="docs-example-preview">${trimmed}</div>
        <div class="docs-example-code" data-active>
          <button class="docs-copy-btn">Copy</button>
          <pre><code class="language-html">${escaped}</code></pre>
        </div>
      </div>
    `;

    // Copy button
    const copyBtn = section.querySelector(".docs-copy-btn");
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(dedented).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      });
    });
  });
}

// ─── Load component JS files ───
function loadComponentScripts() {
  const scripts = [
    "dialog.js",
    "dropdown-menu.js",
    "tabs.js",
    "toast.js",
    "select.js",
    "sheet.js",
    "popover.js",
    "toggle.js",
    "command.js",
    "combobox.js",
    "otp.js",
    "context-menu.js",
    "carousel.js",
  ];
  const jsBase = isSubpage ? "../../js/" : "../js/";
  for (const src of scripts) {
    const script = document.createElement("script");
    script.src = jsBase + src;
    document.body.appendChild(script);
  }
}

// ─── Load highlight.js from CDN ───
function loadHighlightJS() {
  const isDark = document.documentElement.classList.contains("dark");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.id = "hljs-theme";
  link.href = isDark
    ? "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github-dark.min.css"
    : "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github.min.css";
  document.head.appendChild(link);

  const script = document.createElement("script");
  script.src =
    "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/highlight.min.js";
  script.onload = () => {
    const htmlLang = document.createElement("script");
    htmlLang.src =
      "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/languages/xml.min.js";
    htmlLang.onload = () => {
      hljs.highlightAll();
    };
    document.head.appendChild(htmlLang);
  };
  document.head.appendChild(script);
}

// ─── Favicon ───
function injectFavicon() {
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/svg+xml";
  link.href = isSubpage ? "../favicon.svg" : "favicon.svg";
  document.head.appendChild(link);
}

// ─── Init ───
injectFavicon();
injectLayout();
initExamples();
loadComponentScripts();
loadHighlightJS();
