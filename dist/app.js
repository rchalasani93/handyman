import { icon, hydrateIcons } from "./icons.js";
import { mountTool } from "./tools.js";

export const categories = {
  pdf: {
    name: "PDF tools",
    short: "PDF",
    icon: "pdf",
    description:
      "Merge, split, rotate, number and annotate PDFs, or convert them to images and text.",
  },
  images: {
    name: "Image tools",
    short: "Images",
    icon: "image",
    description:
      "Resize, crop, compress, convert and adjust JPG, PNG and WebP images.",
  },
  documents: {
    name: "Document tools",
    short: "Documents",
    icon: "document",
    description:
      "Write and convert .docx files, and turn plain text into a PDF.",
  },
  everyday: {
    name: "Everyday tools",
    short: "Everyday",
    icon: "shapes",
    description:
      "Text, JSON, encoding, unit, color and time utilities.",
  },
};
export const catalog = [
  {
    id: "merge-pdf",
    name: "Merge PDF",
    category: "pdf",
    icon: "merge",
    description: "Combine several PDFs into one file, in the order you choose.",
    keywords: "combine join files",
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    category: "pdf",
    icon: "split",
    description: "Extract a page range, or save every page as its own PDF.",
    keywords: "separate extract separator pages",
  },
  {
    id: "resize-image",
    name: "Resize image",
    category: "images",
    icon: "resize",
    description: "Set exact pixel dimensions or scale by percentage.",
    keywords: "size dimensions photo picture pixels",
  },
  {
    id: "document-editor",
    name: "Word editor",
    category: "documents",
    icon: "document",
    description: "Write a document and download it as .docx.",
    keywords: "docx write word edit text document",
  },
  {
    id: "edit-pdf",
    name: "Edit PDF",
    category: "pdf",
    icon: "edit",
    description: "Place text on any page of an existing PDF.",
    keywords: "annotate text annotation editor",
  },
  {
    id: "compress-image",
    name: "Compress image",
    category: "images",
    icon: "compress",
    description: "Shrink JPG and WebP files by adjusting quality.",
    keywords: "photo smaller reduce optimize jpeg jpg webp quality",
  },
  {
    id: "convert-image",
    name: "Convert image",
    category: "images",
    icon: "convert",
    description: "Convert between JPG, PNG and WebP.",
    keywords: "converter photo picture jpeg",
  },
  {
    id: "qr-code",
    name: "QR code generator",
    category: "everyday",
    icon: "qr",
    description: "Make a QR code from a link or text and save it as PNG.",
    keywords: "url barcode website wifi",
  },
  {
    id: "images-to-pdf",
    name: "Images to PDF",
    category: "pdf",
    icon: "image",
    description: "Put one or more images into a PDF, one per page.",
    keywords: "jpg jpeg png webp photo convert converter",
  },
  {
    id: "pdf-to-images",
    name: "PDF to images",
    category: "pdf",
    icon: "convert",
    description: "Save each PDF page as a PNG or JPG.",
    keywords: "convert converter png jpeg jpg photo",
  },
  {
    id: "rotate-pdf",
    name: "Rotate PDF",
    category: "pdf",
    icon: "rotate",
    description: "Rotate all pages or selected pages by 90° steps.",
    keywords: "orientation turn flip",
  },
  {
    id: "pdf-to-text",
    name: "PDF to text",
    category: "pdf",
    icon: "text",
    description: "Copy the text layer out of a PDF. Scanned pages need OCR first.",
    keywords: "extract copy convert converter",
  },
  {
    id: "page-numbers",
    name: "Add page numbers",
    category: "pdf",
    icon: "number",
    description: "Stamp page numbers on a PDF, with position and start number.",
    keywords: "numbering footer pagination",
  },
  {
    id: "crop-image",
    name: "Crop image",
    category: "images",
    icon: "crop",
    description: "Crop to a free area or a fixed aspect ratio.",
    keywords: "photo trim cut picture aspect ratio",
  },
  {
    id: "edit-image",
    name: "Photo editor",
    category: "images",
    icon: "palette",
    description: "Adjust brightness, contrast, saturation and warmth.",
    keywords:
      "image photo edit filters brightness contrast saturation grayscale",
  },
  {
    id: "rotate-image",
    name: "Rotate & flip image",
    category: "images",
    icon: "rotate",
    description: "Rotate 90° or flip horizontally and vertically.",
    keywords: "photo orientation mirror turn picture",
  },
  {
    id: "docx-to-text",
    name: "Word to text",
    category: "documents",
    icon: "text",
    description: "Extract the plain text from a .docx file.",
    keywords: "docx document convert converter txt",
  },
  {
    id: "docx-to-html",
    name: "Word to HTML",
    category: "documents",
    icon: "code",
    description: "Convert a .docx file to clean HTML.",
    keywords: "docx document convert converter website",
  },
  {
    id: "text-to-pdf",
    name: "Text to PDF",
    category: "documents",
    icon: "pdf",
    description: "Type or paste text and download it as a PDF.",
    keywords: "convert converter document export txt",
  },
  {
    id: "word-count",
    name: "Word counter",
    category: "everyday",
    icon: "text",
    description: "Count words, characters, sentences and reading time.",
    keywords: "count letters reading time paragraphs sentences",
  },
  {
    id: "text-case",
    name: "Text case converter",
    category: "everyday",
    icon: "text",
    description: "Switch text between UPPER, lower, Title and other cases.",
    keywords: "uppercase lowercase title sentence capital letters",
  },
  {
    id: "json",
    name: "JSON formatter",
    category: "everyday",
    icon: "code",
    description: "Validate, pretty-print or minify JSON.",
    keywords: "validate pretty minify code developer",
  },
  {
    id: "password",
    name: "Password generator",
    category: "everyday",
    icon: "key",
    description: "Generate random passwords with the length and characters you pick.",
    keywords: "secure random secret passphrase",
  },
  {
    id: "units",
    name: "Unit converter",
    category: "everyday",
    icon: "ruler",
    description: "Convert length, weight, temperature, volume and more.",
    keywords: "length weight temperature volume area mass celsius fahrenheit",
  },
  {
    id: "colors",
    name: "Color picker",
    category: "everyday",
    icon: "palette",
    description: "Pick a color and copy it as HEX, RGB or HSL.",
    keywords: "hex rgb hsl colour palette",
  },
  {
    id: "base64",
    name: "Base64 encoder",
    category: "everyday",
    icon: "code",
    description: "Encode text to Base64 or decode it back.",
    keywords: "decode developer unicode",
  },
  {
    id: "url",
    name: "URL encoder",
    category: "everyday",
    icon: "link",
    description: "Percent-encode or decode text for use in URLs.",
    keywords: "decode percent encode uri developer",
  },
  {
    id: "timestamp",
    name: "Timestamp converter",
    category: "everyday",
    icon: "clock",
    description: "Convert Unix timestamps to dates and back.",
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
            "No favorites yet",
            "Star a tool to pin it here.",
          ]
        : category === "recent" && !query
          ? [
              "clock",
              "Nothing opened yet",
              "Tools you open will be listed here.",
            ]
          : [
              "search",
              "No matching tools",
              "Try “PDF”, “resize”, “Word”, or a shorter search.",
            ];
    $("#tools-grid").innerHTML =
      `<div class="empty-state">${icon(empty[0])}<h3>${empty[1]}</h3><p>${empty[2]}</p><button class="secondary-button" id="reset-search">Show all tools</button></div>`;
  }
  $("#results-count").textContent =
    `${tools.length} ${tools.length === 1 ? "tool" : "tools"}${limited ? " of " + count : ""}`;
  $("#results-label").textContent = query
    ? `Results for “${$("#tool-search").value.trim()}”`
    : category === "favorites"
      ? "Favorites"
      : category === "recent"
        ? "Recently used"
        : limited
          ? "Most used"
          : "All tools";
  $("#show-more").hidden = !limited;
  $("#show-more").innerHTML =
    `Show all ${catalog.length} tools`;
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
      all: "All tools",
      favorites: "Favorites",
      recent: "Recently used",
    }[key];
  $("#section-description").textContent =
    categories[key]?.description ||
    {
      all: `${catalog.length} tools in four categories.`,
      favorites: "Tools you starred. Saved in this browser only.",
      recent: "The last 12 tools you opened on this device.",
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
    privacy: `<div class="info-symbol">${icon("shield-check")}</div><h2 id="info-title">Privacy</h2><p>Your PDFs, photos, and documents are processed <strong>right here in your browser</strong>. Handy doesn’t send your file contents to a server.</p><p>Favorites and recently used tool names are saved on this device. Your uploaded files aren’t saved by Handy. Close a tool to clear its current workspace.</p><p class="info-detail">Handy makes no network requests while you use a tool. Document conversion focuses on content; complex layouts may change. Use smaller files if your browser is running low on memory.</p>`,
    help: `<h2 id="info-title">How it works</h2><p><strong>1. Find your tool.</strong><br>Browse a category or search for what you need. Press Ctrl K (or ⌘ K on Mac) to jump to search.</p><p><strong>2. Add your file.</strong><br>Drop in a file or start typing. Adjust the options, then download your result.</p><p><strong>3. Pin what you use.</strong><br>Star a tool to add it to Favorites. Recently used keeps your last 12.</p><p class="info-detail">All ${catalog.length} tools work in your browser. Word tools support modern .docx files. PDF editing adds text annotations; it doesn’t replace existing text. Scanned PDFs need OCR before text extraction.</p>`,
    new: `<h2 id="info-title">Changelog</h2><p><strong>${catalog.length} tools.</strong> Added the Word editor, PDF text annotations and the photo editor.</p><p>The full history is in the <a href="https://github.com/rchalasani93/handyman/commits/main">commit log</a>.</p>`,
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
