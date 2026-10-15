import { icon, hydrateIcons } from "./icons.js";
import { mountTool } from "./tools.js";

export const categories = {
  pdf: {
    name: "PDF tools",
    short: "PDF",
    icon: "pdf",
    description:
      "A fresh start for your paperwork. Merge, split, convert, and annotate.",
  },
  images: {
    name: "Image tools",
    short: "Images",
    icon: "image",
    description:
      "Give your images the right size, format, and finishing touch.",
  },
  documents: {
    name: "Document tools",
    short: "Documents",
    icon: "document",
    description:
      "From a blank page to a finished document. Make words work for you.",
  },
  everyday: {
    name: "Everyday tools",
    short: "Everyday",
    icon: "shapes",
    description:
      "Small, useful things that make a surprisingly big difference.",
  },
};
export const catalog = [
  {
    id: "merge-pdf",
    name: "Merge PDF",
    category: "pdf",
    icon: "merge",
    description: "Bring your PDFs together in one tidy document.",
    badge: "Popular",
    keywords: "combine join files",
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    category: "pdf",
    icon: "split",
    description: "Keep the pages you need. Leave the rest behind.",
    keywords: "separate extract separator pages",
  },
  {
    id: "resize-image",
    name: "Resize image",
    category: "images",
    icon: "resize",
    description: "The perfect fit, whatever the destination.",
    badge: "Popular",
    keywords: "size dimensions photo picture pixels",
  },
  {
    id: "document-editor",
    name: "Word editor",
    category: "documents",
    icon: "document",
    description: "A fresh page for your next bright idea.",
    badge: "New",
    keywords: "docx write word edit text document",
  },
  {
    id: "edit-pdf",
    name: "Edit PDF",
    category: "pdf",
    icon: "edit",
    description: "Add a note, a name, or that final little detail.",
    keywords: "annotate text annotation editor",
  },
  {
    id: "compress-image",
    name: "Compress image",
    category: "images",
    icon: "compress",
    description: "Less file size. Just as much good stuff.",
    keywords: "photo smaller reduce optimize jpeg jpg webp quality",
  },
  {
    id: "convert-image",
    name: "Convert image",
    category: "images",
    icon: "convert",
    description: "JPG, PNG, or WebP. A change of format made easy.",
    keywords: "converter photo picture jpeg",
  },
  {
    id: "qr-code",
    name: "QR code generator",
    category: "everyday",
    icon: "qr",
    description: "Turn a link into a little square of possibility.",
    keywords: "url barcode website wifi",
  },
  {
    id: "images-to-pdf",
    name: "Images to PDF",
    category: "pdf",
    icon: "image",
    description: "Give your photos a home in a single PDF.",
    keywords: "jpg jpeg png webp photo convert converter",
  },
  {
    id: "pdf-to-images",
    name: "PDF to images",
    category: "pdf",
    icon: "convert",
    description: "Turn each page into a shareable PNG or JPG.",
    keywords: "convert converter png jpeg jpg photo",
  },
  {
    id: "rotate-pdf",
    name: "Rotate PDF",
    category: "pdf",
    icon: "rotate",
    description: "Get every page looking the right way up.",
    keywords: "orientation turn flip",
  },
  {
    id: "pdf-to-text",
    name: "PDF to text",
    category: "pdf",
    icon: "text",
    description: "Take the words off the page and put them to work.",
    keywords: "extract copy convert converter",
  },
  {
    id: "page-numbers",
    name: "Add page numbers",
    category: "pdf",
    icon: "number",
    description: "A little order for your longer documents.",
    keywords: "numbering footer pagination",
  },
  {
    id: "crop-image",
    name: "Crop image",
    category: "images",
    icon: "crop",
    description: "Find the good part. Make it the whole picture.",
    keywords: "photo trim cut picture aspect ratio",
  },
  {
    id: "edit-image",
    name: "Photo editor",
    category: "images",
    icon: "palette",
    description: "A little brighter, warmer, or more you.",
    keywords:
      "image photo edit filters brightness contrast saturation grayscale",
  },
  {
    id: "rotate-image",
    name: "Rotate & flip image",
    category: "images",
    icon: "rotate",
    description: "A fresh perspective in just a click.",
    keywords: "photo orientation mirror turn picture",
  },
  {
    id: "docx-to-text",
    name: "Word to text",
    category: "documents",
    icon: "text",
    description: "Just the words, ready for whatever’s next.",
    keywords: "docx document convert converter txt",
  },
  {
    id: "docx-to-html",
    name: "Word to HTML",
    category: "documents",
    icon: "code",
    description: "From your document to something web-ready.",
    keywords: "docx document convert converter website",
  },
  {
    id: "text-to-pdf",
    name: "Text to PDF",
    category: "documents",
    icon: "pdf",
    description: "Turn your words into a neatly wrapped PDF.",
    keywords: "convert converter document export txt",
  },
  {
    id: "word-count",
    name: "Word counter",
    category: "everyday",
    icon: "text",
    description: "Every word, character, and minute accounted for.",
    keywords: "count letters reading time paragraphs sentences",
  },
  {
    id: "text-case",
    name: "Text case converter",
    category: "everyday",
    icon: "text",
    description: "UPPER, lower, and everything in between.",
    keywords: "uppercase lowercase title sentence capital letters",
  },
  {
    id: "json",
    name: "JSON formatter",
    category: "everyday",
    icon: "code",
    description: "Untangle your JSON. Make it nice and readable.",
    keywords: "validate pretty minify code developer",
  },
  {
    id: "password",
    name: "Password generator",
    category: "everyday",
    icon: "key",
    description: "Make a strong, random password in a moment.",
    keywords: "secure random secret passphrase",
  },
  {
    id: "units",
    name: "Unit converter",
    category: "everyday",
    icon: "ruler",
    description: "Miles to kilometers. A whole world made simpler.",
    keywords: "length weight temperature volume area mass celsius fahrenheit",
  },
  {
    id: "colors",
    name: "Color picker",
    category: "everyday",
    icon: "palette",
    description: "Find your shade. Copy it in the format you need.",
    keywords: "hex rgb hsl colour palette",
  },
  {
    id: "base64",
    name: "Base64 encoder",
    category: "everyday",
    icon: "code",
    description: "Encode a little text. Decode a little mystery.",
    keywords: "decode developer unicode",
  },
  {
    id: "url",
    name: "URL encoder",
    category: "everyday",
    icon: "link",
    description: "Make your text ready for its next link.",
    keywords: "decode percent encode uri developer",
  },
  {
    id: "timestamp",
    name: "Timestamp converter",
    category: "everyday",
    icon: "clock",
    description: "Make a Unix timestamp a little more human.",
    keywords: "date time epoch milliseconds seconds",
  },
];
const $ = (s) => document.querySelector(s);
const safeRead = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
let favorites = new Set(safeRead("handy-favorites", [])),
  recent = safeRead("handy-recent", []),
  category = "all",
  view = "grid",
  sort = "recommended",
  expanded = false,
  cleanup = null;
function persist() {
  try {
    localStorage.setItem("handy-favorites", JSON.stringify([...favorites]));
    localStorage.setItem("handy-recent", JSON.stringify(recent));
  } catch {}
}
let toastTimer;
export function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 2600);
}
function navButton(key, name, glyph, count = "") {
  return `<button class="nav-item ${category === key ? "active" : ""}" data-category="${key}" ${category === key ? 'aria-current="page"' : ""}>${icon(glyph)}<span>${name}</span>${count !== "" ? `<span class="nav-count">${count}</span>` : ""}</button>`;
}
function renderNav() {
  $("#main-nav").innerHTML =
    navButton("all", "All tools", "grid") +
    navButton("favorites", "Favorites", "star", favorites.size || "") +
    navButton("recent", "Recently used", "clock");
  $("#category-nav").innerHTML = Object.entries(categories)
    .map(([key, c]) =>
      navButton(
        key,
        c.name,
        c.icon,
        catalog.filter((t) => t.category === key).length,
      ),
    )
    .join("");
  $("#filters").innerHTML = [
    ["all", "All tools", "grid"],
    ...Object.entries(categories).map(([key, c]) => [key, c.short, c.icon]),
  ]
    .map(
      ([key, label, glyph]) =>
        `<button class="filter-button ${category === key ? "active" : ""}" data-category="${key}" aria-pressed="${category === key}">${icon(glyph)}${label}<span class="filter-count">${key === "all" ? catalog.length : catalog.filter((t) => t.category === key).length}</span></button>`,
    )
    .join("");
}
function renderCards() {
  const query = $("#tool-search").value.trim().toLowerCase();
  let tools = catalog.filter(
    (t) =>
      (category === "all" ||
        category === t.category ||
        (category === "favorites" && favorites.has(t.id)) ||
        (category === "recent" && recent.includes(t.id))) &&
      (!query ||
        query
          .split(/\s+/)
          .every((q) =>
            `${t.name} ${t.description} ${t.keywords} ${categories[t.category].name}`
              .toLowerCase()
              .includes(q),
          )),
  );
  if (category === "recent" && sort === "recommended")
    tools.sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id));
  if (sort === "alphabetical")
    tools.sort((a, b) => a.name.localeCompare(b.name));
  const count = tools.length;
  const limited = category === "all" && !query && !expanded;
  if (limited) tools = tools.slice(0, 8);
  $("#tools-grid").classList.toggle("list-view", view === "list");
  $("#tools-grid").innerHTML = tools
    .map(
      (t) =>
        `<article class="tool-card ${t.category}"><button class="card-open" data-tool="${t.id}" aria-label="Open ${t.name}"></button><div class="card-top"><span class="tool-icon">${icon(t.icon)}</span>${t.badge ? `<span class="card-badge ${t.badge === "New" ? "new" : ""}">${t.badge}</span>` : ""}</div><button class="favorite-button ${favorites.has(t.id) ? "saved" : ""}" data-favorite="${t.id}" aria-label="${favorites.has(t.id) ? "Remove " + t.name + " from" : "Add " + t.name + " to"} favorites" aria-pressed="${favorites.has(t.id)}">${icon("star")}</button><h3>${t.name}</h3><p>${t.description}</p><div class="card-footer"><span class="card-category">${categories[t.category].name}</span>${icon("arrow-right")}</div></article>`,
    )
    .join("");
  if (!tools.length) {
    const empty =
      category === "favorites" && !query
        ? [
            "star",
            "A place for your go-to tools",
            "Tap the star on any tool to keep it close.",
          ]
        : category === "recent" && !query
          ? [
              "clock",
              "Your next little task starts here",
              "Tools you open will appear here for an easy return.",
            ]
          : [
              "search",
              "No tools found just yet",
              "Try “PDF”, “resize”, “Word”, or a shorter search.",
            ];
    $("#tools-grid").innerHTML =
      `<div class="empty-state">${icon(empty[0])}<h3>${empty[1]}</h3><p>${empty[2]}</p><button class="secondary-button" id="reset-search">Explore the toolbox ${icon("arrow-right")}</button></div>`;
  }
  $("#results-count").textContent =
    `${tools.length} ${tools.length === 1 ? "tool" : "tools"}${limited ? " of " + count : ""}`;
  $("#results-label").textContent = query
    ? `Results for “${$("#tool-search").value.trim()}”`
    : category === "favorites"
      ? "Your tools, always within reach"
      : category === "recent"
        ? "A shortcut to where you left off"
        : limited
          ? "A few favorites to get you started"
          : "A little help for whatever’s next";
  $("#show-more").hidden = !limited;
  $("#show-more").innerHTML =
    `Explore all ${catalog.length} tools ${icon("arrow-right")}`;
}
function selectCategory(key) {
  category = key;
  $("#tool-search").value = "";
  expanded = false;
  document.body.classList.toggle("filtered", key !== "all");
  $("#breadcrumb-title").textContent =
    categories[key]?.name ||
    { all: "All tools", favorites: "Favorites", recent: "Recently used" }[key];
  $("#section-title").textContent =
    categories[key]?.name ||
    {
      all: "Find your next little lifesaver",
      favorites: "Your kind of handy",
      recent: "Right where you left off",
    }[key];
  $("#section-description").textContent =
    categories[key]?.description ||
    {
      all: "The right tool is closer than you think.",
      favorites: "The tools you love, with a little less searching.",
      recent: "Good to see you again. Let’s keep things moving.",
    }[key];
  renderNav();
  renderCards();
  closeMenu();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function closeMenu() {
  $("#sidebar").classList.remove("mobile-open");
  $("#mobile-scrim").classList.remove("active");
  $("#mobile-menu").setAttribute("aria-expanded", "false");
}
function showInfo(kind) {
  const content = {
    privacy: `<div class="info-symbol">${icon("shield-check")}</div><h2 id="info-title">Your files, just yours.</h2><p>Your PDFs, photos, and documents are processed <strong>right here in your browser</strong>. Handy doesn’t send your file contents to a server.</p><p>Favorites and recently used tool names are saved on this device. Your uploaded files aren’t saved by Handy. Close a tool to clear its current workspace.</p><p class="info-detail">Handy loads its fonts from Google Fonts. Document conversion focuses on content; complex layouts may change. Use smaller files if your browser is running low on memory.</p>`,
    help: `<div class="info-symbol">✳</div><h2 id="info-title">A little help, right here.</h2><p><strong>1. Find your tool.</strong><br>Browse a category or search for what you need. Press Ctrl K (or ⌘ K on Mac) to jump to search.</p><p><strong>2. Make it yours.</strong><br>Drop in a file or start typing. Adjust the options, then download your result.</p><p><strong>3. Keep the good ones close.</strong><br>Tap a star to save a favorite. Recently used tools remember where you’ve been.</p><p class="info-detail">All ${catalog.length} tools work in your browser. Word tools support modern .docx files. PDF editing adds text annotations; it doesn’t replace existing text. Scanned PDFs need OCR before text extraction.</p>`,
    new: `<div class="info-symbol">✦</div><h2 id="info-title">Meet your everyday toolbox.</h2><p><strong>${catalog.length} little ways to get things done.</strong><br>PDFs, images, documents, and the everyday tasks in between.</p><p>Start with the Word editor, add text to a PDF, or give a photo a fresh look. Pin your favorites and make this space feel like yours.</p><p class="info-detail">A calm workspace. Private file processing. No sign-up to use the tools.</p>`,
  };
  $("#info-content").innerHTML = content[kind];
  $("#info-dialog").showModal();
}
async function openTool(id) {
  const tool = catalog.find((t) => t.id === id);
  if (!tool) return;
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
  recent = [id, ...recent.filter((x) => x !== id)].slice(0, 12);
  persist();
  renderCards();
  $("#tool-dialog-title").textContent = tool.name;
  $("#tool-dialog-description").textContent = tool.description;
  $("#dialog-icon").className = "tool-icon " + tool.category;
  $("#dialog-icon").innerHTML = icon(tool.icon);
  $("#tool-status").textContent = "";
  $("#tool-body").innerHTML = "";
  if (!$("#tool-dialog").open) $("#tool-dialog").showModal();
  history.replaceState(null, "", "#tool=" + id);
  try {
    cleanup = await mountTool(id, $("#tool-body"), {
      toast,
      status: (t) => ($("#tool-status").textContent = t),
    });
  } catch (e) {
    $("#tool-body").textContent =
      "This tool couldn’t load. Close it and try again.";
    console.error(e);
  }
}
$("#tool-dialog").addEventListener("close", () => {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
  $("#tool-body").innerHTML = "";
  history.replaceState(null, "", location.pathname + location.search);
});
$("#close-tool").addEventListener("click", () => $("#tool-dialog").close());
$("#tool-dialog").addEventListener("click", (e) => {
  if (
    e.target === $("#tool-dialog") &&
    (e.clientX < e.target.getBoundingClientRect().left ||
      e.clientX > e.target.getBoundingClientRect().right ||
      e.clientY < e.target.getBoundingClientRect().top ||
      e.clientY > e.target.getBoundingClientRect().bottom)
  )
    e.target.close();
});
$("#close-info").addEventListener("click", () => $("#info-dialog").close());
$("#privacy-link").onclick = () => showInfo("privacy");
$("#footer-privacy").onclick = () => showInfo("privacy");
$("#help-button").onclick = () => showInfo("help");
$("#whats-new").onclick = () => showInfo("new");
$("#mobile-menu").onclick = () => {
  const opened = $("#sidebar").classList.toggle("mobile-open");
  $("#mobile-scrim").classList.toggle("active", opened);
  $("#mobile-menu").setAttribute("aria-expanded", opened);
};
$("#mobile-scrim").onclick = closeMenu;
$("#tool-search").addEventListener("input", renderCards);
$("#sort-button").onclick = () => {
  sort = sort === "recommended" ? "alphabetical" : "recommended";
  $("#sort-label").textContent = sort === "recommended" ? "Recommended" : "A–Z";
  renderCards();
};
$("#grid-view").onclick = () => setView("grid");
$("#list-view").onclick = () => setView("list");
function setView(v) {
  view = v;
  for (const name of ["grid", "list"]) {
    $("#" + name + "-view").classList.toggle("active", name === v);
    $("#" + name + "-view").setAttribute("aria-pressed", String(name === v));
  }
  renderCards();
}
$("#show-more").onclick = () => {
  expanded = true;
  renderCards();
};
document.addEventListener("click", (e) => {
  const c = e.target.closest("[data-category]");
  if (c) selectCategory(c.dataset.category);
  const f = e.target.closest("[data-favorite]");
  if (f) {
    const id = f.dataset.favorite;
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    persist();
    renderNav();
    renderCards();
  }
  const t = e.target.closest("[data-tool]");
  if (t) openTool(t.dataset.tool);
  if (e.target.closest("#reset-search")) selectCategory("all");
  if (e.target.closest(".brand")) {
    e.preventDefault();
    selectCategory("all");
  }
});
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if ($("#tool-dialog").open) $("#tool-dialog").close();
    if ($("#info-dialog").open) $("#info-dialog").close();
    $("#tool-search").focus();
    $("#tool-section").scrollIntoView({ behavior: "smooth" });
  }
  if (e.key === "Escape") closeMenu();
});
hydrateIcons();
renderNav();
renderCards();
if (location.hash.startsWith("#tool=")) openTool(location.hash.slice(6));
