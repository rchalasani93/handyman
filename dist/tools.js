import { icon } from "./icons.js";
const scripts = new Map();
async function script(file, global) {
  if (window[global]) return window[global];
  if (!scripts.has(file))
    scripts.set(
      file,
      new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "./vendor/" + file;
        s.onload = () => resolve(window[global]);
        s.onerror = () => {
          scripts.delete(file);
          s.remove();
          reject(
            new Error(
              "The tool library could not load. Please refresh and try again.",
            ),
          );
        };
        document.head.append(s);
      }),
    );
  return scripts.get(file);
}
const pdfLib = () => script("pdf-lib.js", "PDFLib");
let pdfjsPromise;
async function pdfjs() {
  if (!pdfjsPromise)
    pdfjsPromise = import("./vendor/pdf.mjs")
      .then((m) => {
        m.GlobalWorkerOptions.workerSrc = new URL(
          "./vendor/pdf.worker.mjs",
          import.meta.url,
        ).href;
        return m;
      })
      .catch((e) => {
        pdfjsPromise = null;
        throw e;
      });
  return pdfjsPromise;
}
const zipLib = () => script("fflate.js", "fflate");
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const size = (n) =>
  n < 1024
    ? n + " B"
    : n < 1048576
      ? (n / 1024).toFixed(1) + " KB"
      : (n / 1048576).toFixed(1) + " MB";
const base = (name) => name.replace(/\.[^.]+$/, "");
const mime = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };
const extName = (t) => (t === "image/jpeg" ? "jpg" : t.split("/")[1]);
const tick = () =>
  new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const btn = (id, label, glyph = "download", primary = true) =>
  `<button class="${primary ? "primary" : "secondary"}-button" id="${id}">${icon(glyph)}${label}</button>`;
const field = (label, input) => `<label class="field">${label}${input}</label>`;
const number = (id, value, min, max, step = 1) =>
  `<input id="${id}" type="number" value="${value}" min="${min}" max="${max}" step="${step}">`;
const select = (id, options) =>
  `<select id="${id}">${options.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select>`;
function validateNumber(el, min, max, label = "Value") {
  const n = Number(el.value);
  if (el.value.trim() === "" || !Number.isFinite(n) || n < min || n > max)
    throw new Error(`${label} must be between ${min} and ${max}.`);
  return n;
}
export function parsePages(value, total) {
  if (!value.trim()) return Array.from({ length: total }, (_, i) => i);
  const result = [];
  for (const p of value.split(",")) {
    const match = p.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error("Use page numbers such as 1-3, 5, 8.");
    const a = +match[1],
      b = +(match[2] || match[1]);
    if (a < 1 || b > total || a > b)
      throw new Error(
        `Page ranges must be between 1 and ${total}, in ascending order.`,
      );
    for (let i = a; i <= b; i++)
      if (!result.includes(i - 1)) result.push(i - 1);
  }
  if (!result.length) throw new Error("Choose at least one page.");
  return result;
}
async function loadPDF(file) {
  const lib = await pdfLib();
  try {
    return await lib.PDFDocument.load(await file.arrayBuffer());
  } catch (e) {
    if (/encrypt|password/i.test(e.message))
      throw new Error(
        "This PDF is password protected. Unlock it before using this tool.",
      );
    throw new Error(
      "We couldn’t open this PDF. Please choose a valid, unencrypted PDF.",
    );
  }
}
async function readablePDF(file) {
  const m = await pdfjs();
  return m.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    standardFontDataUrl: new URL("./vendor/standard_fonts/", import.meta.url)
      .href,
    cMapUrl: new URL("./vendor/cmaps/", import.meta.url).href,
    cMapPacked: true,
    isEvalSupported: false,
  }).promise;
}
let fontBytes;
async function embedFont(doc) {
  const fontkit = await script("fontkit.js", "fontkit");
  doc.registerFontkit(fontkit);
  if (!fontBytes) {
    const r = await fetch("./vendor/NotoSans-Regular.ttf");
    if (!r.ok)
      throw new Error("The document font could not load. Please try again.");
    fontBytes = await r.arrayBuffer();
  }
  return doc.embedFont(fontBytes, { subset: true });
}
function dropzone(
  ctx,
  { accept, multiple = false, label = "files", note = "", onFiles },
) {
  const el = document.createElement("div");
  el.className = "dropzone";
  el.innerHTML = `<div class="drop-icon">${icon("upload")}</div><strong>Drop your ${label} here, or <span>browse files</span></strong><p>${note || "Processed on your device. Your files stay yours."}</p><input type="file" accept="${accept}" ${multiple ? "multiple" : ""} aria-label="Choose ${label}">`;
  const receive = (files) => {
    const list = Array.from(files);
    if (!list.length) return;
    try {
      if (!multiple && list.length > 1)
        throw new Error("Please choose one file at a time.");
      for (const f of list)
        if (f.size > 50 * 1024 * 1024)
          throw new Error(
            "Choose files smaller than 50 MB for a smoother experience.",
          );
      onFiles(list);
    } catch (e) {
      ctx.error(e.message);
    }
  };
  ctx.on(el.querySelector("input"), "change", (e) => {
    receive(e.target.files);
    e.target.value = "";
  });
  ctx.on(el, "dragover", (e) => {
    e.preventDefault();
    el.classList.add("dragover");
  });
  ctx.on(el, "dragleave", () => el.classList.remove("dragover"));
  ctx.on(el, "drop", (e) => {
    e.preventDefault();
    el.classList.remove("dragover");
    receive(e.dataTransfer.files);
  });
  return el;
}
function createContext(root, helpers) {
  const controller = new AbortController(),
    urls = [];
  let active = true;
  const q = (s) => root.querySelector(s);
  const ctx = {
    root,
    q,
    get active() {
      return active;
    },
    on: (el, event, fn) =>
      el.addEventListener(event, fn, { signal: controller.signal }),
    urls,
    status: (t) => {
      if (active) helpers.status(t);
    },
    toast: helpers.toast,
    error(message) {
      if (!active) return;
      let el = q(".tool-error");
      if (!el) {
        el = document.createElement("div");
        el.className = "tool-error";
        el.setAttribute("role", "alert");
        root.append(el);
      }
      el.textContent = message;
      helpers.status("");
    },
    clearError() {
      q(".tool-error")?.remove();
    },
    html: (html) => {
      root.innerHTML = html;
    },
    result(data, name, type = "application/octet-stream") {
      if (!active) return;
      const blob = data instanceof Blob ? data : new Blob([data], { type });
      const url = URL.createObjectURL(blob);
      urls.push(url);
      let el = q(".tool-result");
      if (!el) {
        el = document.createElement("div");
        el.className = "tool-result";
        root.append(el);
      }
      el.innerHTML = `${icon("check")}<span>Ready! ${esc(name)} <small>(${size(blob.size)})</small></span><a class="result-download" href="${url}" download="${esc(name)}">${icon("download")}Download</a>`;
      el.style.display = "flex";
      el.style.gap = "9px";
      el.style.alignItems = "center";
      el.style.flexWrap = "wrap";
      helpers.status("All done. A little task, handled.");
      el.querySelector("a").click();
    },
    cleanup() {
      active = false;
      controller.abort();
      urls.forEach(URL.revokeObjectURL);
      ctx.disposers.forEach((fn) => fn());
    },
    disposers: [],
  };
  ctx.run = async (fn) => {
    if (!active) return;
    ctx.clearError();
    const buttons = [...root.querySelectorAll("button")],
      disabled = new Map(buttons.map((b) => [b, b.disabled]));
    buttons.forEach((b) => (b.disabled = true));
    helpers.status("Working on your device…");
    await tick();
    try {
      await fn();
      if (active && q(".tool-result") === null)
        helpers.status("Ready when you are.");
    } catch (e) {
      ctx.error(
        e.message || "Something went wrong. Please try a smaller file.",
      );
      console.error(e);
    } finally {
      if (active) buttons.forEach((b) => (b.disabled = disabled.get(b)));
    }
  };
  ctx.copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      helpers.toast("Copied. One less thing to do.");
    } catch {
      ctx.error(
        "Clipboard access isn’t available. Select and copy the text directly.",
      );
    }
  };
  return ctx;
}

export async function mountTool(id, root, helpers) {
  const ctx = createContext(root, helpers);
  const pdfIDs = [
    "merge-pdf",
    "split-pdf",
    "rotate-pdf",
    "images-to-pdf",
    "pdf-to-images",
    "pdf-to-text",
    "page-numbers",
  ];
  if (pdfIDs.includes(id)) mountPDF(ctx, id);
  else if (id === "edit-pdf") mountPDFEditor(ctx);
  else if (
    [
      "resize-image",
      "compress-image",
      "convert-image",
      "crop-image",
      "edit-image",
      "rotate-image",
    ].includes(id)
  )
    mountImage(ctx, id);
  else if (id === "document-editor") mountDocument(ctx);
  else if (id === "docx-to-text" || id === "docx-to-html")
    mountDocConverter(ctx, id);
  else if (id === "text-to-pdf") mountTextPDF(ctx);
  else mountUtility(ctx, id);
  return () => ctx.cleanup();
}

function mountPDF(ctx, id) {
  let files = [],
    pageCount = 0;
  const multi = id === "merge-pdf" || id === "images-to-pdf";
  const images = id === "images-to-pdf";
  ctx.html(
    '<div id="upload"></div><div class="file-list" id="file-list"></div><div id="pdf-options"></div><div class="tool-action-row" id="pdf-actions"></div><p class="tool-hint" id="pdf-hint"></p>',
  );
  ctx.q("#upload").append(
    dropzone(ctx, {
      accept: images
        ? "image/png,image/jpeg,image/webp"
        : ".pdf,application/pdf",
      multiple: multi,
      label: images ? "images" : multi ? "PDFs" : "PDF",
      note: images
        ? "JPG, PNG & WebP · Up to 50 MB per file"
        : "PDF files · Up to 50 MB per file · No uploads",
      onFiles: (incoming) =>
        ctx.run(async () => {
          if (
            !images &&
            incoming.some((f) => !f.name.toLowerCase().endsWith(".pdf"))
          )
            throw new Error("Please choose PDF files.");
          if (
            images &&
            incoming.some(
              (f) =>
                !["image/png", "image/jpeg", "image/webp"].includes(f.type),
            )
          )
            throw new Error("Choose a JPG, PNG, or WebP image.");
          if (
            incoming.reduce((n, f) => n + f.size, 0) +
              (multi ? files : []).reduce((n, f) => n + f.size, 0) >
            150 * 1024 * 1024
          )
            throw new Error("Please keep the total size below 150 MB.");
          const next = multi ? [...files, ...incoming] : incoming;
          if (!images) {
            for (const f of incoming) {
              const doc = await loadPDF(f);
              if (!multi) pageCount = doc.getPageCount();
            }
          }
          if (!ctx.active) return;
          files = next;
          renderFiles();
          ctx.status(
            files.length +
              " " +
              (images ? "images" : "PDF" + (files.length > 1 ? "s" : "")) +
              " ready" +
              (!multi ? " · " + pageCount + " pages" : ""),
          );
        }),
    }),
  );
  function renderFiles() {
    ctx.q("#file-list").innerHTML = files
      .map(
        (f, i) =>
          `<div class="file-row">${icon(images ? "image" : "pdf")}<div><div class="file-name">${esc(f.name)}</div><div class="file-size">${size(f.size)}${!multi ? " · " + pageCount + " pages" : ""}</div></div><div class="file-row-actions">${multi ? `<button class="icon-button" data-move="${i}" data-direction="-1" aria-label="Move ${esc(f.name)} up" ${i === 0 ? "disabled" : ""}>${icon("up")}</button><button class="icon-button" data-move="${i}" data-direction="1" aria-label="Move ${esc(f.name)} down" ${i === files.length - 1 ? "disabled" : ""}>${icon("down")}</button>` : ""}<button class="icon-button" data-remove="${i}" aria-label="Remove ${esc(f.name)}">${icon("trash")}</button></div></div>`,
      )
      .join("");
  }
  ctx.on(ctx.q("#file-list"), "click", (e) => {
    const rm = e.target.closest("[data-remove]");
    if (rm) {
      files.splice(+rm.dataset.remove, 1);
      renderFiles();
      ctx.q(".tool-result")?.remove();
    }
    const mv = e.target.closest("[data-move]");
    if (mv) {
      const i = +mv.dataset.move,
        n = i + +mv.dataset.direction;
      if (n >= 0 && n < files.length) {
        [files[i], files[n]] = [files[n], files[i]];
        renderFiles();
        ctx.q(".tool-result")?.remove();
      }
    }
  });
  const options = {
    "merge-pdf":
      '<p class="tool-hint">Add two or more PDFs. Use the arrows to arrange their order before merging.</p>',
    "split-pdf": `<div class="tool-options">${field("Pages to keep (leave blank for all)", '<input id="pages" placeholder="e.g. 1-3, 5, 8">')}${field(
      "Download as",
      select("split-mode", [
        ["combined", "One PDF with selected pages"],
        ["individual", "Individual pages in a ZIP"],
      ]),
    )}</div>`,
    "rotate-pdf": `<div class="tool-options">${field(
      "Rotate by",
      select("rotation", [
        ["90", "90° clockwise"],
        ["180", "180°"],
        ["270", "90° counterclockwise"],
      ]),
    )}${field("Pages (leave blank for all)", '<input id="pages" placeholder="e.g. 1-3, 5">')}</div>`,
    "images-to-pdf": `<div class="tool-options">${field(
      "Page size",
      select("paper", [
        ["fit", "Fit to image"],
        ["a4", "A4 portrait"],
        ["letter", "US Letter portrait"],
      ]),
    )}${field(
      "Page margin",
      select("margin", [
        ["0", "No margin"],
        ["24", "Small (24 pt)"],
        ["48", "Large (48 pt)"],
      ]),
    )}</div><p class="tool-hint">One image per page. Use the arrows above to arrange the order.</p>`,
    "pdf-to-images": `<div class="tool-options">${field(
      "Image format",
      select("format", [
        ["png", "PNG · Lossless"],
        ["jpg", "JPG · Smaller files"],
      ]),
    )}${field(
      "Resolution",
      select("scale", [
        ["1.5", "Standard · 108 DPI"],
        ["2", "High · 144 DPI"],
        ["3", "Extra high · 216 DPI"],
      ]),
    )}${field("Pages (leave blank for all)", '<input id="pages" placeholder="e.g. 1-3, 5">')}</div>`,
    "pdf-to-text":
      '<p class="tool-hint">Extracts selectable text from a PDF. Scanned pages and text in images need OCR, which isn’t included.</p>',
    "page-numbers": `<div class="tool-options">${field(
      "Position",
      select("position", [
        ["center", "Bottom center"],
        ["left", "Bottom left"],
        ["right", "Bottom right"],
      ]),
    )}${field("Start numbering at", number("start", 1, 1, 99999))}${field(
      "Number style",
      select("number-style", [
        ["simple", "1, 2, 3…"],
        ["total", "1 / total"],
        ["page", "Page 1 of total"],
      ]),
    )}</div>`,
  };
  ctx.q("#pdf-options").innerHTML = options[id];
  const label = {
    "merge-pdf": "Merge PDFs",
    "split-pdf": "Split & download",
    "rotate-pdf": "Rotate & download",
    "images-to-pdf": "Create PDF",
    "pdf-to-images": "Convert to images",
    "pdf-to-text": "Extract text",
    "page-numbers": "Number & download",
  }[id];
  ctx.q("#pdf-actions").innerHTML = btn("process", label);
  ctx.on(ctx.q("#process"), "click", () =>
    ctx.run(async () => {
      if (!files.length)
        throw new Error("Add a file first, and we’ll take it from there.");
      const lib = await pdfLib();
      if (id === "merge-pdf") {
        if (files.length < 2)
          throw new Error("Add at least two PDFs to merge.");
        const out = await lib.PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
          ctx.status(`Merging document ${i + 1} of ${files.length}…`);
          const src = await loadPDF(files[i]);
          (await out.copyPages(src, src.getPageIndices())).forEach((p) =>
            out.addPage(p),
          );
        }
        ctx.result(await out.save(), "handy-merged.pdf", "application/pdf");
      }
      if (id === "split-pdf") {
        const src = await loadPDF(files[0]),
          pages = parsePages(ctx.q("#pages").value, src.getPageCount());
        if (ctx.q("#split-mode").value === "combined") {
          const out = await lib.PDFDocument.create();
          (await out.copyPages(src, pages)).forEach((p) => out.addPage(p));
          ctx.result(
            await out.save(),
            base(files[0].name) + "-selected.pdf",
            "application/pdf",
          );
        } else {
          const zip = await zipLib(),
            entries = {};
          for (const p of pages) {
            const out = await lib.PDFDocument.create();
            out.addPage((await out.copyPages(src, [p]))[0]);
            entries[`page-${String(p + 1).padStart(3, "0")}.pdf`] =
              await out.save();
          }
          ctx.result(
            zip.zipSync(entries, { level: 0 }),
            base(files[0].name) + "-pages.zip",
            "application/zip",
          );
        }
      }
      if (id === "rotate-pdf") {
        const doc = await loadPDF(files[0]),
          angle = +ctx.q("#rotation").value;
        for (const p of parsePages(ctx.q("#pages").value, doc.getPageCount())) {
          const page = doc.getPage(p);
          page.setRotation(
            lib.degrees((page.getRotation().angle + angle) % 360),
          );
        }
        ctx.result(
          await doc.save(),
          base(files[0].name) + "-rotated.pdf",
          "application/pdf",
        );
      }
      if (id === "images-to-pdf") {
        const doc = await lib.PDFDocument.create(),
          paper = ctx.q("#paper").value,
          margin = +ctx.q("#margin").value;
        for (let i = 0; i < files.length; i++) {
          ctx.status(`Preparing image ${i + 1} of ${files.length}…`);
          const image = await readImage(files[i], ctx);
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          canvas.getContext("2d").drawImage(image, 0, 0);
          const embedded = await doc.embedPng(
            await (await canvasBlob(canvas, "image/png")).arrayBuffer(),
          );
          let dims =
            paper === "a4"
              ? lib.PageSizes.A4
              : paper === "letter"
                ? lib.PageSizes.Letter
                : [
                    embedded.width * 0.75 + margin * 2,
                    embedded.height * 0.75 + margin * 2,
                  ];
          const page = doc.addPage(dims),
            fit = embedded.scaleToFit(
              dims[0] - margin * 2,
              dims[1] - margin * 2,
            );
          page.drawImage(embedded, {
            x: (dims[0] - fit.width) / 2,
            y: (dims[1] - fit.height) / 2,
            width: fit.width,
            height: fit.height,
          });
        }
        ctx.result(await doc.save(), "handy-images.pdf", "application/pdf");
      }
      if (id === "pdf-to-images") {
        const doc = await readablePDF(files[0]);
        try {
          const pages = parsePages(ctx.q("#pages").value, doc.numPages),
            entries = {},
            format = ctx.q("#format").value,
            scale = +ctx.q("#scale").value;
          for (let i = 0; i < pages.length; i++) {
            ctx.status(`Converting page ${i + 1} of ${pages.length}…`);
            const page = await doc.getPage(pages[i] + 1),
              vp = page.getViewport({ scale });
            if (vp.width * vp.height > 40000000)
              throw new Error(
                "This page is very large. Try a lower resolution.",
              );
            const canvas = document.createElement("canvas");
            canvas.width = Math.ceil(vp.width);
            canvas.height = Math.ceil(vp.height);
            await page.render({
              canvasContext: canvas.getContext("2d"),
              viewport: vp,
              background: "white",
            }).promise;
            entries[`page-${pages[i] + 1}.${format}`] = new Uint8Array(
              await (
                await canvasBlob(canvas, mime[format], 0.92)
              ).arrayBuffer(),
            );
            page.cleanup();
          }
          if (pages.length === 1) {
            const name = Object.keys(entries)[0];
            ctx.result(
              entries[name],
              base(files[0].name) + "-" + name,
              mime[format],
            );
          } else {
            const zip = await zipLib();
            ctx.result(
              zip.zipSync(entries, { level: 0 }),
              base(files[0].name) + "-images.zip",
              "application/zip",
            );
          }
        } finally {
          await doc.destroy();
        }
      }
      if (id === "pdf-to-text") {
        const doc = await readablePDF(files[0]);
        try {
          const texts = [];
          for (let i = 1; i <= doc.numPages; i++) {
            ctx.status(`Reading page ${i} of ${doc.numPages}…`);
            const page = await doc.getPage(i),
              content = await page.getTextContent();
            let line = "";
            for (const item of content.items) {
              if ("str" in item) line += item.str + (item.hasEOL ? "\n" : " ");
            }
            texts.push(line.trim());
          }
          if (!texts.some((t) => t.trim()))
            throw new Error(
              "No selectable text was found. This PDF may contain scanned pages that need OCR.",
            );
          ctx.result(
            texts.join("\n\n"),
            base(files[0].name) + ".txt",
            "text/plain;charset=utf-8",
          );
        } finally {
          await doc.destroy();
        }
      }
      if (id === "page-numbers") {
        const doc = await loadPDF(files[0]),
          font = await embedFont(doc),
          start = validateNumber(ctx.q("#start"), 1, 99999, "Starting number"),
          style = ctx.q("#number-style").value,
          position = ctx.q("#position").value;
        doc.getPages().forEach((page, i) => {
          const current = start + i,
            total = start + doc.getPageCount() - 1,
            text =
              style === "total"
                ? `${current} / ${total}`
                : style === "page"
                  ? `Page ${current} of ${total}`
                  : String(current),
            w = font.widthOfTextAtSize(text, 10),
            width = page.getWidth();
          page.drawText(text, {
            x:
              position === "left"
                ? 24
                : position === "right"
                  ? width - w - 24
                  : (width - w) / 2,
            y: 18,
            size: 10,
            font,
            color: lib.rgb(0.4, 0.4, 0.45),
          });
        });
        ctx.result(
          await doc.save(),
          base(files[0].name) + "-numbered.pdf",
          "application/pdf",
        );
      }
    }),
  );
}

async function readImage(file, ctx) {
  if (
    ![
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/bmp",
    ].includes(file.type)
  )
    throw new Error(
      "Choose a JPG, PNG, WebP, GIF, or BMP image. SVG and HEIC aren’t supported.",
    );
  const url = URL.createObjectURL(file);
  ctx.urls.push(url);
  const img = new Image();
  img.src = url;
  try {
    await img.decode();
  } catch {
    throw new Error("We couldn’t read this image. Please try another file.");
  }
  if (img.naturalWidth * img.naturalHeight > 40000000)
    throw new Error(
      "Please choose an image with fewer than 40 million pixels.",
    );
  return img;
}
function canvasBlob(canvas, type, quality) {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) =>
        b
          ? resolve(b)
          : reject(
              new Error(
                "This image is too large to export. Try a smaller size.",
              ),
            ),
      type,
      quality,
    ),
  );
}

function mountImage(ctx, id) {
  let source = null,
    file = null,
    angle = 0,
    flipX = 1,
    flipY = 1,
    dragStart = null;
  ctx.html(
    '<div id="upload"></div><div id="image-settings" hidden><div class="tool-options" id="image-options"></div><div id="image-extra"></div><div class="image-preview" id="image-preview"></div><p class="image-meta" id="image-meta"></p><div class="tool-action-row">' +
      btn("save-image", "Download image") +
      btn("reset-image", "Reset", "undo", false) +
      '</div><p class="tool-hint" id="image-hint"></p></div>',
  );
  const outputOptions = field(
    "Save as",
    select("format", [
      ["png", "PNG"],
      ["jpg", "JPG"],
      ["webp", "WebP"],
    ]),
  );
  const options = {
    "resize-image": `${field("Width (px)", number("width", 1200, 1, 16000))}${field("Height (px)", number("height", 800, 1, 16000))}<label class="checkbox-field"><input type="checkbox" id="lock-ratio" checked> Keep proportions</label>${outputOptions}`,
    "compress-image": `${field(
      "Format",
      select("format", [
        ["jpg", "JPG · smaller files"],
        ["webp", "WebP · modern & small"],
      ]),
    )}${field('Quality <span id="quality-value">80%</span>', '<input id="quality" type="range" min="10" max="100" value="80">')}${field(
      "Longest edge",
      select("max-edge", [
        ["0", "Keep original size"],
        ["2560", "2560 pixels"],
        ["1920", "1920 pixels"],
        ["1280", "1280 pixels"],
        ["800", "800 pixels"],
      ]),
    )}`,
    "convert-image": `${outputOptions}${field('JPG / WebP quality <span id="quality-value">92%</span>', '<input id="quality" type="range" min="10" max="100" value="92">')}`,
    "crop-image": `${field(
      "Crop preset",
      select("crop-preset", [
        ["free", "Free selection"],
        ["1", "Square · 1:1"],
        ["1.333333", "Landscape · 4:3"],
        ["1.777778", "Widescreen · 16:9"],
        ["0.8", "Portrait · 4:5"],
        ["0.5625", "Story · 9:16"],
      ]),
    )}${outputOptions}`,
    "edit-image": outputOptions,
    "rotate-image": outputOptions,
  };
  ctx.q("#image-options").innerHTML = options[id];
  if (id === "crop-image")
    ctx.q("#image-extra").innerHTML =
      `<div class="tool-options">${field("Left (px)", number("crop-x", 0, 0, 40000))}${field("Top (px)", number("crop-y", 0, 0, 40000))}${field("Width (px)", number("crop-width", 100, 1, 40000))}${field("Height (px)", number("crop-height", 100, 1, 40000))}</div>`;
  if (id === "edit-image")
    ctx.q("#image-extra").innerHTML =
      `<div class="image-controls">${["brightness", "contrast", "saturation"].map((n) => field(n[0].toUpperCase() + n.slice(1) + ` <span id="${n}-value">100%</span>`, `<input id="${n}" type="range" min="0" max="200" value="100">`)).join("")}<label class="checkbox-field"><input type="checkbox" id="grayscale"> Black & white</label><label class="checkbox-field"><input type="checkbox" id="sepia"> A little vintage (sepia)</label></div>`;
  if (id === "rotate-image")
    ctx.q("#image-extra").innerHTML =
      `<div class="tool-action-row">${btn("rotate-left", "Rotate left", "rotate", false)}${btn("rotate-right", "Rotate right", "rotate", false)}${btn("flip-x", "Flip horizontally", "convert", false)}${btn("flip-y", "Flip vertically", "convert", false)}</div>`;
  const hints = {
    "resize-image":
      "Resize up to 16,000 pixels per side, with a maximum of 40 million pixels.",
    "compress-image":
      "JPG and WebP use lossy compression. The actual file size depends on the image and chosen quality. Transparent areas become white in JPG.",
    "convert-image":
      "Works with JPG, PNG, WebP, GIF, and BMP. Animated images export their first frame. Transparent areas become white in JPG.",
    "crop-image":
      "Drag on the image to select a crop, choose a preset, or enter exact pixel coordinates.",
    "edit-image":
      "Adjust the sliders to preview your changes. Download when it feels just right.",
    "rotate-image":
      "Rotate in 90° steps or flip your image. Changes are applied to your download.",
  };
  ctx.q("#image-hint").textContent = hints[id];
  function reset() {
    if (!source) return;
    angle = 0;
    flipX = 1;
    flipY = 1;
    if (id === "resize-image") {
      ctx.q("#width").value = source.naturalWidth;
      ctx.q("#height").value = source.naturalHeight;
    }
    if (id === "crop-image") {
      ctx.q("#crop-x").value = 0;
      ctx.q("#crop-y").value = 0;
      ctx.q("#crop-width").value = source.naturalWidth;
      ctx.q("#crop-height").value = source.naturalHeight;
      ctx.q("#crop-preset").value = "free";
    }
    for (const n of ["brightness", "contrast", "saturation"])
      if (ctx.q("#" + n)) {
        ctx.q("#" + n).value = 100;
        ctx.q("#" + n + "-value").textContent = "100%";
      }
    for (const n of ["grayscale", "sepia"])
      if (ctx.q("#" + n)) ctx.q("#" + n).checked = false;
    ctx.q(".tool-result")?.remove();
    preview();
  }
  function dimensions() {
    let w = source.naturalWidth,
      h = source.naturalHeight;
    if (id === "resize-image") {
      w = validateNumber(ctx.q("#width"), 1, 16000, "Width");
      h = validateNumber(ctx.q("#height"), 1, 16000, "Height");
    }
    if (id === "crop-image") {
      w = validateNumber(
        ctx.q("#crop-width"),
        1,
        source.naturalWidth,
        "Crop width",
      );
      h = validateNumber(
        ctx.q("#crop-height"),
        1,
        source.naturalHeight,
        "Crop height",
      );
    }
    if (id === "compress-image") {
      const max = +ctx.q("#max-edge").value;
      if (max && Math.max(w, h) > max) {
        const scale = max / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
    }
    if (id === "rotate-image" && angle % 180 !== 0) [w, h] = [h, w];
    w = Math.round(w);
    h = Math.round(h);
    if (w * h > 40000000)
      throw new Error("Please keep the image below 40 million pixels.");
    return { w, h };
  }
  function draw(exporting) {
    const { w, h } = dimensions(),
      c = document.createElement("canvas"),
      ratio = exporting ? 1 : Math.min(1, 1000 / Math.max(w, h));
    c.width = Math.max(1, Math.round(w * ratio));
    c.height = Math.max(1, Math.round(h * ratio));
    const g = c.getContext("2d");
    if (ctx.q("#format").value === "jpg") {
      g.fillStyle = "white";
      g.fillRect(0, 0, c.width, c.height);
    }
    if (id === "edit-image") {
      g.filter = `brightness(${ctx.q("#brightness").value}%) contrast(${ctx.q("#contrast").value}%) saturate(${ctx.q("#saturation").value}%) grayscale(${ctx.q("#grayscale").checked ? 1 : 0}) sepia(${ctx.q("#sepia").checked ? 0.55 : 0})`;
    }
    if (id === "crop-image") {
      const x = validateNumber(
          ctx.q("#crop-x"),
          0,
          source.naturalWidth - 1,
          "Left coordinate",
        ),
        y = validateNumber(
          ctx.q("#crop-y"),
          0,
          source.naturalHeight - 1,
          "Top coordinate",
        );
      if (x + w > source.naturalWidth || y + h > source.naturalHeight)
        throw new Error("The crop must fit inside the original image.");
      g.drawImage(source, x, y, w, h, 0, 0, c.width, c.height);
    } else if (id === "rotate-image") {
      g.translate(c.width / 2, c.height / 2);
      g.rotate((angle * Math.PI) / 180);
      g.scale(flipX, flipY);
      const dw = angle % 180 !== 0 ? c.height : c.width,
        dh = angle % 180 !== 0 ? c.width : c.height;
      g.drawImage(source, -dw / 2, -dh / 2, dw, dh);
    } else g.drawImage(source, 0, 0, c.width, c.height);
    return c;
  }
  function preview() {
    if (!source || !ctx.active) return;
    ctx.clearError();
    try {
      let canvas;
      if (id === "crop-image") {
        const ratio = Math.min(
          1,
          1000 / Math.max(source.naturalWidth, source.naturalHeight),
        );
        canvas = document.createElement("canvas");
        canvas.width = Math.round(source.naturalWidth * ratio);
        canvas.height = Math.round(source.naturalHeight * ratio);
        const g = canvas.getContext("2d");
        g.drawImage(source, 0, 0, canvas.width, canvas.height);
        const x = +ctx.q("#crop-x").value * ratio,
          y = +ctx.q("#crop-y").value * ratio,
          w = +ctx.q("#crop-width").value * ratio,
          h = +ctx.q("#crop-height").value * ratio;
        g.fillStyle = "#2b203b77";
        g.fillRect(0, 0, canvas.width, canvas.height);
        g.save();
        g.beginPath();
        g.rect(x, y, w, h);
        g.clip();
        g.drawImage(source, 0, 0, canvas.width, canvas.height);
        g.restore();
        g.strokeStyle = "#fff";
        g.lineWidth = 2;
        g.strokeRect(x, y, w, h);
        g.strokeStyle = "#ffffff66";
        g.lineWidth = 1;
        for (let i = 1; i < 3; i++) {
          g.beginPath();
          g.moveTo(x + (w * i) / 3, y);
          g.lineTo(x + (w * i) / 3, y + h);
          g.stroke();
          g.beginPath();
          g.moveTo(x, y + (h * i) / 3);
          g.lineTo(x + w, y + (h * i) / 3);
          g.stroke();
        }
        canvas.style.cursor = "crosshair";
        canvas.style.touchAction = "none";
      } else canvas = draw(false);
      ctx.q("#image-preview").replaceChildren(canvas);
      const { w, h } = dimensions();
      ctx.q("#image-meta").textContent =
        `${source.naturalWidth} × ${source.naturalHeight} px original · ${w} × ${h} px output · ${size(file.size)} original`;
    } catch (e) {
      ctx.error(e.message);
    }
  }
  ctx.q("#upload").append(
    dropzone(ctx, {
      accept: "image/png,image/jpeg,image/webp,image/gif,image/bmp",
      label: "image",
      note: "JPG, PNG, WebP, GIF & BMP · Up to 50 MB",
      onFiles: (incoming) =>
        ctx.run(async () => {
          const next = await readImage(incoming[0], ctx);
          if (!ctx.active) return;
          source = next;
          file = incoming[0];
          ctx.q("#image-settings").hidden = false;
          ctx.q("#format").value =
            id === "compress-image"
              ? "jpg"
              : ["image/jpeg", "image/webp"].includes(file.type)
                ? extName(file.type)
                : "png";
          reset();
          ctx.status(file.name + " · Ready to make it yours.");
        }),
    }),
  );
  ctx.on(ctx.q("#image-settings"), "input", (e) => {
    if (!source) return;
    if (id === "resize-image" && ctx.q("#lock-ratio").checked) {
      if (e.target.id === "width")
        ctx.q("#height").value = Math.max(
          1,
          Math.round(
            (+e.target.value * source.naturalHeight) / source.naturalWidth,
          ),
        );
      if (e.target.id === "height")
        ctx.q("#width").value = Math.max(
          1,
          Math.round(
            (+e.target.value * source.naturalWidth) / source.naturalHeight,
          ),
        );
    }
    if (e.target.type === "range")
      ctx.q("#" + e.target.id + "-value").textContent = e.target.value + "%";
    if (e.target.id === "crop-preset" && e.target.value !== "free") {
      const ratio = +e.target.value,
        w = Math.min(source.naturalWidth, source.naturalHeight * ratio),
        h = w / ratio;
      ctx.q("#crop-width").value = Math.floor(w);
      ctx.q("#crop-height").value = Math.floor(h);
      ctx.q("#crop-x").value = Math.floor((source.naturalWidth - w) / 2);
      ctx.q("#crop-y").value = Math.floor((source.naturalHeight - h) / 2);
    }
    ctx.q(".tool-result")?.remove();
    preview();
  });
  ctx.on(ctx.q("#reset-image"), "click", reset);
  if (id === "rotate-image")
    for (const [key, fn] of [
      ["rotate-left", () => (angle = (angle + 270) % 360)],
      ["rotate-right", () => (angle = (angle + 90) % 360)],
      ["flip-x", () => (flipX *= -1)],
      ["flip-y", () => (flipY *= -1)],
    ])
      ctx.on(ctx.q("#" + key), "click", () => {
        fn();
        ctx.q(".tool-result")?.remove();
        preview();
      });
  if (id === "crop-image") {
    const previewBox = ctx.q("#image-preview");
    const position = (e) => {
      const rect = previewBox.querySelector("canvas").getBoundingClientRect();
      return {
        x: Math.round(
          Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) *
            source.naturalWidth,
        ),
        y: Math.round(
          Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)) *
            source.naturalHeight,
        ),
      };
    };
    ctx.on(previewBox, "pointerdown", (e) => {
      if (e.target.tagName !== "CANVAS" || !source) return;
      e.preventDefault();
      dragStart = position(e);
      previewBox.setPointerCapture(e.pointerId);
      ctx.q("#crop-preset").value = "free";
    });
    ctx.on(previewBox, "pointermove", (e) => {
      if (!dragStart) return;
      const p = position(e),
        x = Math.min(dragStart.x, p.x),
        y = Math.min(dragStart.y, p.y);
      ctx.q("#crop-x").value = Math.min(x, source.naturalWidth - 1);
      ctx.q("#crop-y").value = Math.min(y, source.naturalHeight - 1);
      ctx.q("#crop-width").value = Math.max(1, Math.abs(p.x - dragStart.x));
      ctx.q("#crop-height").value = Math.max(1, Math.abs(p.y - dragStart.y));
      preview();
    });
    const end = () => {
      dragStart = null;
    };
    ctx.on(previewBox, "pointerup", end);
    ctx.on(previewBox, "pointercancel", end);
  }
  ctx.on(ctx.q("#save-image"), "click", () =>
    ctx.run(async () => {
      if (!source) throw new Error("Choose an image first.");
      const format = ctx.q("#format").value,
        quality = +(ctx.q("#quality")?.value || 92) / 100,
        canvas = draw(true),
        blob = await canvasBlob(canvas, mime[format], quality);
      if (blob.type !== mime[format])
        throw new Error(
          "Your browser cannot export that format. Choose PNG or JPG instead.",
        );
      ctx.result(blob, base(file.name) + "-handy." + format);
      if (id === "compress-image") {
        const delta = (100 * (file.size - blob.size)) / file.size;
        ctx.status(
          delta >= 0
            ? `${delta.toFixed(1)}% smaller · ${size(file.size)} → ${size(blob.size)}`
            : `${size(file.size)} → ${size(blob.size)} · Try lower quality or a smaller edge.`,
        );
      }
    }),
  );
}

async function importDocx(file) {
  if (file.size > 50 * 1024 * 1024)
    throw new Error("Choose a Word document smaller than 50 MB.");
  if (!file.name.toLowerCase().endsWith(".docx"))
    throw new Error(
      "Choose a modern Word document (.docx). Older .doc files aren’t supported.",
    );
  const mammoth = await script("mammoth.js", "mammoth");
  return mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
}
async function sanitize(html) {
  const purify = await script("purify.js", "DOMPurify");
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "div",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "ul",
      "ol",
      "li",
      "blockquote",
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
      "span",
      "a",
    ],
    ALLOWED_ATTR: ["href"],
    ALLOW_DATA_ATTR: false,
  });
}
function plainText(element) {
  return element.innerText || element.textContent || "";
}
function mountDocument(ctx) {
  ctx.html(
    `<div class="doc-open-row">${field("Document name", '<input id="doc-name" value="My bright idea" aria-label="Document name">')}<label class="secondary-button file-button">${icon("upload")}Open .docx<input type="file" id="open-doc" accept=".docx" aria-label="Open Word document"></label></div><div class="editor-toolbar" role="toolbar" aria-label="Document formatting"><select id="heading" aria-label="Paragraph style"><option value="p">Normal text</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option></select><button class="toolbar-button" data-command="bold" aria-label="Bold">${icon("bold")}</button><button class="toolbar-button" data-command="italic" aria-label="Italic">${icon("italic")}</button><button class="toolbar-button" data-command="underline" aria-label="Underline"><u>U</u></button><button class="toolbar-button" data-command="insertUnorderedList" aria-label="Bulleted list">${icon("list")}</button><button class="toolbar-button" data-command="insertOrderedList" aria-label="Numbered list">1.</button><button class="toolbar-button" data-command="undo" aria-label="Undo">${icon("undo")}</button><button class="toolbar-button" data-command="removeFormat" aria-label="Clear text formatting">Tx</button></div><div class="document-editor" id="document-editor" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Document editor" data-placeholder="A blank page. A fresh start. What’s on your mind?"></div><div class="tool-action-row">${btn("export-docx", "Download Word (.docx)")}${btn("export-html", "HTML", "code", false)}${btn("export-txt", "Plain text", "text", false)}<span class="image-meta" id="doc-word-count">0 words</span></div><p class="tool-hint">Open a .docx or start fresh. Basic headings, bold, italic, and lists are supported. Complex Word layouts may change when imported or exported.</p>`,
  );
  const editor = ctx.q("#document-editor");
  const formatButtons = [...ctx.root.querySelectorAll("[data-command]")].filter(
    (button) => !["undo", "removeFormat"].includes(button.dataset.command),
  );
  let editorRange;
  formatButtons.forEach((button) =>
    button.setAttribute("aria-pressed", "false"),
  );
  function updateToolbar() {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    editorRange = range.cloneRange();
    for (const button of formatButtons)
      button.setAttribute(
        "aria-pressed",
        String(document.queryCommandState(button.dataset.command)),
      );
    const block = document.queryCommandValue("formatBlock").toLowerCase();
    ctx.q("#heading").value = ["h1", "h2", "h3"].includes(block) ? block : "p";
  }
  function focusEditor() {
    editor.focus();
    if (editorRange && editor.contains(editorRange.commonAncestorContainer)) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(editorRange);
    }
  }
  ctx.on(document, "selectionchange", updateToolbar);
  ctx.on(ctx.q(".editor-toolbar"), "mousedown", (e) => {
    if (e.target.closest("button")) e.preventDefault();
  });
  ctx.on(ctx.q(".editor-toolbar"), "click", (e) => {
    const b = e.target.closest("[data-command]");
    if (!b) return;
    focusEditor();
    document.execCommand(b.dataset.command, false, null);
    wordCount();
  });
  ctx.on(ctx.q("#heading"), "change", (e) => {
    focusEditor();
    document.execCommand("formatBlock", false, e.target.value);
    wordCount();
  });
  function wordCount() {
    const t = plainText(editor).trim();
    ctx.q("#doc-word-count").textContent =
      (t ? t.split(/\s+/).length : 0) + " words";
    ctx.q(".tool-result")?.remove();
    updateToolbar();
  }
  ctx.on(editor, "input", wordCount);
  ctx.on(editor, "paste", (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    wordCount();
  });
  ctx.on(ctx.q("#open-doc"), "change", (e) =>
    ctx.run(async () => {
      const file = e.target.files[0];
      if (!file) return;
      const result = await importDocx(file),
        html = await sanitize(result.value);
      if (!ctx.active) return;
      editor.innerHTML = html;
      ctx.q("#doc-name").value = base(file.name);
      wordCount();
      ctx.status("Document opened. Make it yours.");
      e.target.value = "";
    }),
  );
  const name = () =>
    ctx
      .q("#doc-name")
      .value.trim()
      .replace(/[<>:"/\\|?*]/g, "-") || "handy-document";
  ctx.on(ctx.q("#export-txt"), "click", () =>
    ctx.run(async () => {
      if (!plainText(editor).trim())
        throw new Error("Add a few words to your document first.");
      ctx.result(
        plainText(editor),
        name() + ".txt",
        "text/plain;charset=utf-8",
      );
    }),
  );
  ctx.on(ctx.q("#export-html"), "click", () =>
    ctx.run(async () => {
      if (!plainText(editor).trim())
        throw new Error("Add a few words to your document first.");
      const html = await sanitize(editor.innerHTML);
      ctx.result(
        `<!doctype html><html lang="en"><meta charset="utf-8"><title>${esc(name())}</title><body>${html}</body></html>`,
        name() + ".html",
        "text/html;charset=utf-8",
      );
    }),
  );
  ctx.on(ctx.q("#export-docx"), "click", () =>
    ctx.run(async () => {
      if (!plainText(editor).trim())
        throw new Error("Add a few words to your document first.");
      const d = await script("docx.js", "docx");
      function runs(node, style = {}) {
        if (node.nodeType === Node.TEXT_NODE)
          return [new d.TextRun({ text: node.textContent, ...style })];
        if (node.nodeType !== Node.ELEMENT_NODE) return [];
        const tag = node.tagName;
        if (tag === "BR") return [new d.TextRun({ break: 1 })];
        const st = {
          ...style,
          ...(["B", "STRONG"].includes(tag) ? { bold: true } : {}),
          ...(["I", "EM"].includes(tag) ? { italics: true } : {}),
          ...(tag === "U"
            ? { underline: { type: d.UnderlineType.SINGLE } }
            : {}),
          ...(["S", "STRIKE"].includes(tag) ? { strike: true } : {}),
        };
        return [...node.childNodes].flatMap((n) => runs(n, st));
      }
      const paragraphs = [];
      const blocks = new Set([
        "P",
        "H1",
        "H2",
        "H3",
        "H4",
        "LI",
        "BLOCKQUOTE",
        "DIV",
      ]);
      function visit(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent.trim())
            paragraphs.push(new d.Paragraph({ children: runs(node) }));
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const nested = [...node.children].some(
          (c) => blocks.has(c.tagName) || ["UL", "OL"].includes(c.tagName),
        );
        if ((blocks.has(node.tagName) && !nested) || node.tagName === "LI") {
          let children = runs(node),
            opts = {};
          if (/^H[1-4]$/.test(node.tagName))
            opts.heading = d.HeadingLevel["HEADING_" + node.tagName[1]];
          if (node.tagName === "LI") {
            if (node.parentElement.tagName === "UL") opts.bullet = { level: 0 };
            else
              children.unshift(
                new d.TextRun({
                  text:
                    [...node.parentElement.children].indexOf(node) + 1 + ". ",
                }),
              );
          }
          paragraphs.push(new d.Paragraph({ children, ...opts }));
        } else [...node.childNodes].forEach(visit);
      }
      [...editor.childNodes].forEach(visit);
      if (!paragraphs.length)
        paragraphs.push(
          new d.Paragraph({ children: [new d.TextRun(plainText(editor))] }),
        );
      const doc = new d.Document({
        creator: "Handy",
        title: name(),
        sections: [{ children: paragraphs }],
      });
      ctx.result(await d.Packer.toBlob(doc), name() + ".docx");
    }),
  );
}
function mountDocConverter(ctx, id) {
  let file = null;
  ctx.html(
    '<div id="upload"></div><div id="doc-preview" hidden><div class="field-title" style="margin-top:20px">Your converted document</div><textarea id="doc-output" class="tool-textarea" aria-label="Converted document"></textarea><div class="tool-action-row">' +
      btn(
        "save-conversion",
        id === "docx-to-html" ? "Download HTML" : "Download text",
      ) +
      btn("copy-conversion", "Copy", "copy", false) +
      '</div></div><p class="tool-hint">Supports .docx files. Conversion keeps the content and basic structure; complex layouts may change.</p>',
  );
  ctx.q("#upload").append(
    dropzone(ctx, {
      accept: ".docx",
      label: "Word document",
      note: "Modern Word files (.docx) · Processed in your browser",
      onFiles: (incoming) =>
        ctx.run(async () => {
          const result = await importDocx(incoming[0]);
          let output;
          if (id === "docx-to-html") {
            output = await sanitize(result.value);
            output = `<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><title>${esc(base(incoming[0].name))}</title></head>\n<body>\n${output}\n</body>\n</html>`;
          } else {
            const m = await script("mammoth.js", "mammoth");
            output = (
              await m.extractRawText({
                arrayBuffer: await incoming[0].arrayBuffer(),
              })
            ).value;
          }
          if (!ctx.active) return;
          file = incoming[0];
          ctx.q("#doc-preview").hidden = false;
          ctx.q("#doc-output").value = output;
          ctx.q(".tool-result")?.remove();
          ctx.status("Converted. Ready for its next chapter.");
        }),
    }),
  );
  ctx.on(ctx.q("#save-conversion"), "click", () => {
    if (file)
      ctx.result(
        ctx.q("#doc-output").value,
        base(file.name) + (id === "docx-to-html" ? ".html" : ".txt"),
        id === "docx-to-html"
          ? "text/html;charset=utf-8"
          : "text/plain;charset=utf-8",
      );
  });
  ctx.on(ctx.q("#copy-conversion"), "click", () =>
    ctx.copy(ctx.q("#doc-output").value),
  );
}

function mountTextPDF(ctx) {
  ctx.html(
    `<div class="tool-options">${field("Document title", '<input id="pdf-title" placeholder="My document">')}${field(
      "Page size",
      select("paper", [
        ["a4", "A4"],
        ["letter", "US Letter"],
      ]),
    )}${field("Font size", number("font-size", 12, 8, 36))}</div><textarea class="tool-textarea" id="pdf-text" aria-label="Text for PDF" placeholder="A few words, a big idea, or the next chapter…"></textarea><div class="tool-action-row">${btn("create-pdf", "Create PDF")}</div><p class="tool-hint">A clean, paginated PDF with selectable text. Supports Latin, Greek, and Cyrillic text. For other scripts, use your document editor’s PDF export.</p>`,
  );
  ctx.on(ctx.q("#create-pdf"), "click", () =>
    ctx.run(async () => {
      const text = ctx.q("#pdf-text").value;
      if (!text.trim()) throw new Error("Write or paste some text first.");
      if (text.length > 500000)
        throw new Error("Please keep your text under 500,000 characters.");
      const lib = await pdfLib(),
        doc = await lib.PDFDocument.create(),
        font = await embedFont(doc),
        fontSize = validateNumber(ctx.q("#font-size"), 8, 36, "Font size"),
        dims =
          ctx.q("#paper").value === "a4"
            ? lib.PageSizes.A4
            : lib.PageSizes.Letter,
        margin = 50,
        lineHeight = fontSize * 1.6,
        maxWidth = dims[0] - margin * 2;
      let page = doc.addPage(dims),
        y = dims[1] - margin - fontSize;
      const draw = (line) => {
        if (y < margin) {
          page = doc.addPage(dims);
          y = dims[1] - margin - fontSize;
        }
        if (line)
          page.drawText(line, {
            x: margin,
            y,
            size: fontSize,
            font,
            color: lib.rgb(0.2, 0.2, 0.25),
          });
        y -= lineHeight;
      };
      const title = ctx.q("#pdf-title").value.trim();
      if (title) {
        draw(title);
        draw("");
        doc.setTitle(title);
      }
      for (const paragraph of text.replace(/\t/g, "    ").split("\n")) {
        let line = "";
        for (const word of paragraph.split(" ")) {
          const candidate = line ? line + " " + word : word;
          if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
            line = candidate;
            continue;
          }
          if (line) {
            draw(line);
            line = "";
          }
          if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
            for (const char of word) {
              if (font.widthOfTextAtSize(line + char, fontSize) > maxWidth) {
                draw(line);
                line = "";
              }
              line += char;
            }
          } else line = word;
        }
        draw(line);
      }
      ctx.result(
        await doc.save(),
        (title || "handy-document").replace(/[<>:"/\\|?*]/g, "-") + ".pdf",
        "application/pdf",
      );
    }),
  );
}

function mountPDFEditor(ctx) {
  let file = null,
    reader = null,
    viewport = null,
    renderTask = null,
    annotations = [],
    renderVersion = 0;
  ctx.html(
    '<div id="upload"></div><div id="pdf-editor" hidden><div class="pdf-editor-layout"><div class="pdf-toolbar">' +
      field("Page", '<select id="edit-page"></select>') +
      field(
        "Your text",
        '<textarea id="annotation-text" rows="3" placeholder="A note, a name, a little detail…"></textarea>',
      ) +
      field("Font size (pt)", number("annotation-size", 14, 6, 72)) +
      field(
        "Text color",
        '<input type="color" id="annotation-color" value="#292b3b">',
      ) +
      '<p class="tool-hint">Type your text, then click on the page to place it. Click again to add another note.</p><div class="annotation-list" id="annotations"></div></div><div class="pdf-outer"><div class="pdf-stage" id="pdf-stage"><canvas id="pdf-canvas"></canvas><div id="pdf-annotations"></div></div></div></div><div class="tool-action-row">' +
      btn("save-edited-pdf", "Download edited PDF") +
      btn("clear-annotations", "Clear notes", "trash", false) +
      '</div><p class="tool-hint">Adds text on top of your PDF. Existing text, images, and layout stay in place. Editing or replacing existing PDF text isn’t supported.</p></div>',
  );
  const stage = ctx.q("#pdf-stage");
  function renderAnnotations() {
    if (!viewport || !ctx.active) return;
    const current = +ctx.q("#edit-page").value,
      scale = stage.getBoundingClientRect().width / viewport.width;
    ctx.q("#pdf-annotations").innerHTML = annotations
      .filter((a) => a.page === current)
      .map(
        (a) =>
          `<span class="annotation" style="left:${(a.x / viewport.width) * 100}%;top:${(a.y / viewport.height) * 100}%;font-size:${a.size * scale}px;color:${a.color}">${esc(a.text)}</span>`,
      )
      .join("");
    ctx.q("#annotations").innerHTML = annotations
      .map(
        (a, i) =>
          `<div class="annotation-item"><span>p${a.page} · ${esc(a.text)}</span><button data-remove-note="${i}" aria-label="Remove annotation ${i + 1}">×</button></div>`,
      )
      .join("");
  }
  async function renderPage() {
    if (!reader) return;
    const version = ++renderVersion;
    if (renderTask) renderTask.cancel();
    const page = await reader.getPage(+ctx.q("#edit-page").value);
    if (!ctx.active || version !== renderVersion) return;
    viewport = page.getViewport({ scale: 1 });
    const renderViewport = page.getViewport({ scale: 1.5 }),
      canvas = ctx.q("#pdf-canvas");
    canvas.width = Math.ceil(renderViewport.width);
    canvas.height = Math.ceil(renderViewport.height);
    stage.style.width = viewport.width + "px";
    stage.style.maxWidth = "100%";
    renderTask = page.render({
      canvasContext: canvas.getContext("2d"),
      viewport: renderViewport,
      background: "white",
    });
    try {
      await renderTask.promise;
      renderAnnotations();
    } catch (e) {
      if (e.name !== "RenderingCancelledException") throw e;
    }
  }
  ctx.q("#upload").append(
    dropzone(ctx, {
      accept: ".pdf,application/pdf",
      label: "PDF",
      note: "Add text annotations · Up to 50 MB",
      onFiles: (incoming) =>
        ctx.run(async () => {
          await loadPDF(incoming[0]);
          const next = await readablePDF(incoming[0]);
          if (!ctx.active) {
            await next.destroy();
            return;
          }
          if (reader) await reader.destroy();
          reader = next;
          file = incoming[0];
          annotations = [];
          ctx.q("#edit-page").innerHTML = Array.from(
            { length: reader.numPages },
            (_, i) =>
              `<option value="${i + 1}">Page ${i + 1} of ${reader.numPages}</option>`,
          ).join("");
          ctx.q("#pdf-editor").hidden = false;
          await renderPage();
          ctx.status("Type a note, then click on the page.");
        }),
    }),
  );
  ctx.on(ctx.q("#edit-page"), "change", () => ctx.run(renderPage));
  ctx.on(stage, "click", (e) => {
    if (!viewport) return;
    ctx.clearError();
    const text = ctx.q("#annotation-text").value.trim();
    if (!text) {
      ctx.toast("Type a little text first, then click to place it.");
      ctx.q("#annotation-text").focus();
      return;
    }
    try {
      const size = validateNumber(
          ctx.q("#annotation-size"),
          6,
          72,
          "Font size",
        ),
        rect = stage.getBoundingClientRect(),
        x = ((e.clientX - rect.left) / rect.width) * viewport.width,
        y = ((e.clientY - rect.top) / rect.height) * viewport.height;
      annotations.push({
        page: +ctx.q("#edit-page").value,
        x,
        y,
        size,
        text,
        color: ctx.q("#annotation-color").value,
        rotation: viewport.rotation,
      });
      renderAnnotations();
      ctx.q(".tool-result")?.remove();
    } catch (e) {
      ctx.error(e.message);
    }
  });
  ctx.on(ctx.q("#annotations"), "click", (e) => {
    const b = e.target.closest("[data-remove-note]");
    if (b) {
      annotations.splice(+b.dataset.removeNote, 1);
      renderAnnotations();
      ctx.q(".tool-result")?.remove();
    }
  });
  ctx.on(ctx.q("#clear-annotations"), "click", () => {
    annotations = [];
    renderAnnotations();
    ctx.q(".tool-result")?.remove();
  });
  const resize = new ResizeObserver(renderAnnotations);
  resize.observe(stage);
  ctx.disposers.push(() => {
    resize.disconnect();
    if (renderTask) renderTask.cancel();
    if (reader) reader.destroy();
  });
  ctx.on(ctx.q("#save-edited-pdf"), "click", () =>
    ctx.run(async () => {
      if (!file) throw new Error("Choose a PDF first.");
      if (!annotations.length)
        throw new Error("Add a text note to the PDF first.");
      const lib = await pdfLib(),
        doc = await loadPDF(file),
        font = await embedFont(doc);
      for (const a of annotations) {
        const readerPage = await reader.getPage(a.page),
          vp = readerPage.getViewport({ scale: 1 }),
          point = vp.convertToPdfPoint(a.x, a.y + a.size),
          r = parseInt(a.color.slice(1, 3), 16) / 255,
          g = parseInt(a.color.slice(3, 5), 16) / 255,
          b = parseInt(a.color.slice(5, 7), 16) / 255;
        doc.getPage(a.page - 1).drawText(a.text, {
          x: point[0],
          y: point[1],
          size: a.size,
          font,
          color: lib.rgb(r, g, b),
          rotate: lib.degrees(a.rotation),
          lineHeight: a.size * 1.15,
        });
      }
      ctx.result(
        await doc.save(),
        base(file.name) + "-edited.pdf",
        "application/pdf",
      );
    }),
  );
}

function mountUtility(ctx, id) {
  if (id === "word-count") {
    ctx.html(
      '<div class="text-stats">' +
        [
          ["words", "Words"],
          ["characters", "Characters"],
          ["sentences", "Sentences"],
          ["read-time", "Reading time"],
        ]
          .map(
            ([key, label]) =>
              `<div class="stat"><strong id="${key}">0</strong><span>${label}</span></div>`,
          )
          .join("") +
        '</div><textarea id="input-text" class="tool-textarea" aria-label="Text to count" placeholder="Every word counts. Paste yours here…"></textarea><div class="tool-action-row">' +
        btn("copy-text", "Copy text", "copy", false) +
        btn("clear-text", "Clear", "trash", false) +
        '</div><p class="tool-hint">Characters include spaces. Reading time is estimated at 200 words per minute. Sentence counts are approximate.</p>',
    );
    const update = () => {
      const t = ctx.q("#input-text").value.trim(),
        words = t ? t.split(/\s+/).length : 0;
      ctx.q("#words").textContent = words.toLocaleString();
      ctx.q("#characters").textContent = ctx
        .q("#input-text")
        .value.length.toLocaleString();
      ctx.q("#sentences").textContent = t
        ? (t.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).filter((s) => s.trim())
            .length
        : 0;
      ctx.q("#read-time").textContent = words
        ? Math.max(1, Math.ceil(words / 200)) + " min"
        : "0 min";
    };
    ctx.on(ctx.q("#input-text"), "input", update);
    ctx.on(ctx.q("#copy-text"), "click", () =>
      ctx.copy(ctx.q("#input-text").value),
    );
    ctx.on(ctx.q("#clear-text"), "click", () => {
      ctx.q("#input-text").value = "";
      update();
    });
    return;
  }
  if (["text-case", "json", "base64", "url"].includes(id)) {
    mountTextUtility(ctx, id);
    return;
  }
  if (id === "qr-code") {
    mountQR(ctx);
    return;
  }
  if (id === "password") {
    mountPassword(ctx);
    return;
  }
  if (id === "units") {
    mountUnits(ctx);
    return;
  }
  if (id === "colors") {
    mountColors(ctx);
    return;
  }
  if (id === "timestamp") {
    mountTimestamp(ctx);
    return;
  }
}
function mountTextUtility(ctx, id) {
  const label = {
    json: "JSON",
    base64: "Text to encode or decode",
    url: "Text or URL",
    "text-case": "Your text",
  }[id];
  ctx.html(
    `<div class="tool-two-column"><div><div class="field-title">${label}</div><textarea id="text-input" class="tool-textarea ${id === "json" ? "code-input" : ""}" spellcheck="${id === "json" ? "false" : "true"}" aria-label="${label}" placeholder="${id === "json" ? "Paste your JSON here…" : "A little text goes a long way…"}"></textarea></div><div><div class="field-title">Your result</div><textarea id="text-output" class="tool-textarea ${id === "json" ? "code-input" : ""}" readonly aria-label="Output" placeholder="Your result will appear here."></textarea></div></div><div class="tool-action-row" id="text-actions"></div><div class="tool-action-row">${btn("copy-output", "Copy result", "copy", false)}${btn("download-output", "Download", "download", false)}${btn("clear-output", "Clear", "trash", false)}</div>`,
  );
  const actions =
    id === "text-case"
      ? [
          ["upper", "UPPERCASE"],
          ["lower", "lowercase"],
          ["title", "Title Case"],
          ["sentence", "Sentence case"],
        ]
      : id === "json"
        ? [
            ["format", "Format JSON"],
            ["minify", "Minify JSON"],
          ]
        : [
            ["encode", "Encode"],
            ["decode", "Decode"],
          ];
  ctx.q("#text-actions").innerHTML = actions
    .map(
      ([key, label], i) =>
        `<button class="${i === 0 ? "primary" : "secondary"}-button" data-transform="${key}" aria-pressed="${i === 0}">${label}</button>`,
    )
    .join("");
  ctx.q("#text-actions").setAttribute("role", "group");
  ctx
    .q("#text-actions")
    .setAttribute(
      "aria-label",
      id === "text-case"
        ? "Text case"
        : id === "json"
          ? "JSON format"
          : "Encoding action",
    );
  ctx.on(ctx.q("#text-actions"), "click", (e) => {
    const key = e.target.closest("[data-transform]")?.dataset.transform;
    if (!key) return;
    ctx
      .q("#text-actions")
      .querySelectorAll("[data-transform]")
      .forEach((button) => {
        const selected = button.dataset.transform === key;
        button.classList.toggle("primary-button", selected);
        button.classList.toggle("secondary-button", !selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    ctx.clearError();
    const text = ctx.q("#text-input").value;
    try {
      if (!text.length) throw new Error("Add some text first.");
      let out;
      if (id === "text-case")
        out =
          key === "upper"
            ? text.toUpperCase()
            : key === "lower"
              ? text.toLowerCase()
              : key === "title"
                ? text
                    .toLowerCase()
                    .replace(
                      /(^|[^\p{L}\p{N}])(\p{L})/gu,
                      (_, a, b) => a + b.toUpperCase(),
                    )
                : text
                    .toLowerCase()
                    .replace(
                      /(^\s*|[.!?]\s+)(\p{L})/gu,
                      (_, a, b) => a + b.toUpperCase(),
                    );
      if (id === "json") {
        const parsed = JSON.parse(text);
        out = JSON.stringify(parsed, null, key === "format" ? 2 : 0);
      }
      if (id === "url")
        out =
          key === "encode"
            ? encodeURIComponent(text)
            : decodeURIComponent(text);
      if (id === "base64") {
        if (key === "encode") {
          const bytes = new TextEncoder().encode(text);
          let binary = "";
          for (let i = 0; i < bytes.length; i += 8192)
            binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
          out = btoa(binary);
        } else {
          const binary = atob(text.replace(/\s/g, ""));
          out = new TextDecoder("utf-8", { fatal: true }).decode(
            Uint8Array.from(binary, (c) => c.charCodeAt(0)),
          );
        }
      }
      ctx.q("#text-output").value = out;
      ctx.q(".tool-result")?.remove();
      ctx.status(
        id === "json"
          ? "Valid JSON. Looking a little more organized."
          : "Done. A little task, handled.",
      );
    } catch (e) {
      ctx.q("#text-output").value = "";
      ctx.error(
        id === "json"
          ? "That JSON needs a little attention: " + e.message
          : id === "base64" && key === "decode"
            ? "This isn’t valid UTF-8 Base64 text. Check your input and try again."
            : id === "url" && key === "decode"
              ? "This isn’t valid percent-encoded text. Check the % sequences."
              : e.message,
      );
    }
  });
  ctx.on(ctx.q("#copy-output"), "click", () => {
    const text = ctx.q("#text-output").value;
    if (text) ctx.copy(text);
    else ctx.error("Convert some text first.");
  });
  ctx.on(ctx.q("#download-output"), "click", () => {
    const text = ctx.q("#text-output").value;
    if (text)
      ctx.result(
        text,
        id === "json" ? "handy-formatted.json" : "handy-text.txt",
        id === "json" ? "application/json" : "text/plain;charset=utf-8",
      );
    else ctx.error("Convert some text first.");
  });
  ctx.on(ctx.q("#clear-output"), "click", () => {
    ctx.q("#text-input").value = "";
    ctx.q("#text-output").value = "";
    ctx.clearError();
    ctx.q(".tool-result")?.remove();
    ctx.status("");
  });
}
function mountQR(ctx) {
  let svg = "";
  ctx.html(
    `<div class="tool-two-column"><div>${field("Your link or text", '<textarea id="qr-text" rows="4" placeholder="https://your-bright-idea.com"></textarea>')}<div class="tool-options">${field(
      "Error correction",
      select("qr-level", [
        ["M", "Medium · 15%"],
        ["L", "Low · 7%"],
        ["Q", "High · 25%"],
        ["H", "Highest · 30%"],
      ]),
    )}</div><div class="tool-action-row">${btn("create-qr", "Create QR code", "qr")}</div><p class="tool-hint">Works with links or plain text, including international characters. Scan your downloaded code once to check it before sharing.</p></div><div class="qr-output" id="qr-output"><span class="tool-hint">A little square, ready for your link.</span></div></div><div class="tool-action-row" id="qr-downloads" hidden>${btn("download-qr-svg", "Download SVG")}${btn("download-qr-png", "Download PNG", "download", false)}</div>`,
  );
  ctx.on(ctx.q("#create-qr"), "click", () =>
    ctx.run(async () => {
      const text = ctx.q("#qr-text").value;
      if (!text.trim()) throw new Error("Add a link or some text first.");
      if (new TextEncoder().encode(text).length > 2200)
        throw new Error("Try a shorter message (under 2,200 UTF-8 bytes).");
      const factory = await script("qrcode.js", "qrcode");
      factory.stringToBytes = (s) => Array.from(new TextEncoder().encode(s));
      const qr = factory(0, ctx.q("#qr-level").value);
      qr.addData(text, "Byte");
      try {
        qr.make();
      } catch {
        throw new Error(
          "This message is too long for that error correction level. Try less text or a lower level.",
        );
      }
      svg = qr.createSvgTag({ cellSize: 6, margin: 24, scalable: true });
      if (!ctx.active) return;
      ctx.q("#qr-output").innerHTML = svg;
      ctx
        .q("#qr-output")
        .querySelector("svg")
        .setAttribute("aria-label", "Generated QR code");
      ctx.q("#qr-downloads").hidden = false;
      ctx.q(".tool-result")?.remove();
    }),
  );
  ctx.on(ctx.q("#download-qr-svg"), "click", () =>
    ctx.result(svg, "handy-qr-code.svg", "image/svg+xml"),
  );
  ctx.on(ctx.q("#download-qr-png"), "click", () =>
    ctx.run(async () => {
      const blob = new Blob(
          [svg.replace("<svg ", '<svg width="1200" height="1200" ')],
          { type: "image/svg+xml" },
        ),
        url = URL.createObjectURL(blob);
      ctx.urls.push(url);
      const img = new Image();
      img.src = url;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = c.height = 1200;
      c.getContext("2d").drawImage(img, 0, 0, 1200, 1200);
      ctx.result(await canvasBlob(c, "image/png"), "handy-qr-code.png");
    }),
  );
}

export function securePassword(length, groups) {
  if (!groups.length) throw new Error("Choose at least one type of character.");
  const random = (max) => {
    const x = new Uint32Array(1),
      limit = Math.floor(4294967296 / max) * max;
    do {
      crypto.getRandomValues(x);
    } while (x[0] >= limit);
    return x[0] % max;
  };
  const all = groups.join(""),
    chars = groups.map((g) => g[random(g.length)]);
  while (chars.length < length) chars.push(all[random(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
function mountPassword(ctx) {
  ctx.html(
    `<div class="password-output"><code id="password-value" aria-live="polite"></code><button class="icon-button" id="copy-password" aria-label="Copy password">${icon("copy")}</button></div>${field('Password length <span id="length-label">20 characters</span>', '<input type="range" id="password-length" min="8" max="64" value="20">')}<div class="password-options">${[
      ["upper", "Uppercase (A–Z)"],
      ["lower", "Lowercase (a–z)"],
      ["digits", "Numbers (0–9)"],
      ["symbols", "Symbols (!@#)"],
    ]
      .map(
        ([key, label]) =>
          `<label class="checkbox-field"><input type="checkbox" id="${key}" checked>${label}</label>`,
      )
      .join(
        "",
      )}</div><div class="tool-action-row">${btn("generate-password", "A fresh password", "key")}${btn("copy-password-button", "Copy", "copy", false)}</div><p class="tool-hint">Uses your browser’s cryptographic random generator. Passwords are generated on this device and aren’t saved by Handy. Save yours in a password manager.</p>`,
  );
  const generate = () => {
    ctx.clearError();
    try {
      const groups = [
          ["upper", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"],
          ["lower", "abcdefghijklmnopqrstuvwxyz"],
          ["digits", "0123456789"],
          ["symbols", "!@#$%^&*()-_=+[]{}:,.?"],
        ]
          .filter(([key]) => ctx.q("#" + key).checked)
          .map(([, g]) => g),
        length = +ctx.q("#password-length").value;
      ctx.q("#length-label").textContent = length + " characters";
      ctx.q("#password-value").textContent = securePassword(length, groups);
    } catch (e) {
      ctx.q("#password-value").textContent = "";
      ctx.error(e.message);
    }
  };
  ctx.on(ctx.q("#generate-password"), "click", generate);
  ctx.on(ctx.q("#password-length"), "input", generate);
  for (const key of ["upper", "lower", "digits", "symbols"])
    ctx.on(ctx.q("#" + key), "change", generate);
  for (const key of ["copy-password", "copy-password-button"])
    ctx.on(ctx.q("#" + key), "click", () => {
      const p = ctx.q("#password-value").textContent;
      if (p) ctx.copy(p);
    });
  generate();
}

const unitGroups = {
  length: {
    m: ["Meters", 1],
    km: ["Kilometers", 1000],
    cm: ["Centimeters", 0.01],
    mm: ["Millimeters", 0.001],
    in: ["Inches", 0.0254],
    ft: ["Feet", 0.3048],
    yd: ["Yards", 0.9144],
    mi: ["Miles", 1609.344],
  },
  weight: {
    kg: ["Kilograms", 1],
    g: ["Grams", 0.001],
    mg: ["Milligrams", 0.000001],
    lb: ["Pounds", 0.45359237],
    oz: ["Ounces", 0.028349523125],
  },
  temperature: {
    c: ["Celsius (°C)", 1],
    f: ["Fahrenheit (°F)", 1],
    k: ["Kelvin (K)", 1],
  },
  volume: {
    l: ["Liters", 1],
    ml: ["Milliliters", 0.001],
    gal: ["US gallons", 3.785411784],
    cup: ["US cups", 0.2365882365],
    floz: ["US fluid ounces", 0.0295735295625],
  },
  area: {
    m2: ["Square meters", 1],
    km2: ["Square kilometers", 1000000],
    ft2: ["Square feet", 0.09290304],
    ac: ["Acres", 4046.8564224],
    ha: ["Hectares", 10000],
  },
};
export function convertUnit(value, from, to, group) {
  if (group === "temperature") {
    const c =
      from === "f"
        ? ((value - 32) * 5) / 9
        : from === "k"
          ? value - 273.15
          : value;
    return to === "f" ? (c * 9) / 5 + 32 : to === "k" ? c + 273.15 : c;
  }
  return (value * unitGroups[group][from][1]) / unitGroups[group][to][1];
}
function mountUnits(ctx) {
  ctx.html(
    `<div class="tool-options">${field(
      "What are we converting?",
      select("unit-type", [
        ["length", "Length"],
        ["weight", "Weight"],
        ["temperature", "Temperature"],
        ["volume", "Volume"],
        ["area", "Area"],
      ]),
    )}</div><div class="tool-two-column"><div>${field("From", '<input type="number" id="unit-input" value="1" step="any">')}<div class="tool-options">${field("Unit", '<select id="unit-from"></select>')}</div></div><div>${field("To", '<input id="unit-output" readonly aria-label="Converted value">')}<div class="tool-options">${field("Unit", '<select id="unit-to"></select>')}</div></div></div><div class="tool-action-row">${btn("swap-units", "Swap units", "convert", false)}${btn("copy-unit", "Copy result", "copy", false)}</div><p class="tool-hint">US customary units are used for volume. Results are rounded to 12 significant digits.</p>`,
  );
  function update() {
    ctx.clearError();
    const input = ctx.q("#unit-input");
    if (input.value === "") {
      ctx.q("#unit-output").value = "";
      return;
    }
    const n = Number(input.value),
      group = ctx.q("#unit-type").value;
    if (!Number.isFinite(n)) {
      ctx.error("Enter a valid number.");
      return;
    }
    const result = convertUnit(
      n,
      ctx.q("#unit-from").value,
      ctx.q("#unit-to").value,
      group,
    );
    ctx.q("#unit-output").value = Number(result.toPrecision(12)).toString();
  }
  function setUnits() {
    const options = Object.entries(unitGroups[ctx.q("#unit-type").value])
      .map(([key, [label]]) => `<option value="${key}">${label}</option>`)
      .join("");
    ctx.q("#unit-from").innerHTML = options;
    ctx.q("#unit-to").innerHTML = options;
    ctx.q("#unit-to").selectedIndex = 1;
    update();
  }
  ctx.on(ctx.q("#unit-type"), "change", setUnits);
  for (const key of ["unit-input", "unit-from", "unit-to"])
    ctx.on(ctx.q("#" + key), "input", update);
  ctx.on(ctx.q("#swap-units"), "click", () => {
    const from = ctx.q("#unit-from").value;
    ctx.q("#unit-from").value = ctx.q("#unit-to").value;
    ctx.q("#unit-to").value = from;
    ctx.q("#unit-input").value = ctx.q("#unit-output").value;
    update();
  });
  ctx.on(ctx.q("#copy-unit"), "click", () =>
    ctx.copy(ctx.q("#unit-output").value),
  );
  setUnits();
}

function mountColors(ctx) {
  ctx.html(
    `<div class="color-swatch" id="color-swatch"><span id="color-swatch-label">#7860D5</span></div><div class="tool-options">${field("Choose a shade", '<input type="color" id="color-input" value="#7860d5">')}${field("HEX", '<input id="hex-input" value="#7860d5" maxlength="7" spellcheck="false">')}</div><div class="tool-options">${field("RGB", '<input id="rgb-output" readonly>')}${field("HSL", '<input id="hsl-output" readonly>')}</div><div class="tool-action-row">${btn("copy-hex", "Copy HEX", "copy", false)}${btn("copy-rgb", "Copy RGB", "copy", false)}${btn("copy-hsl", "Copy HSL", "copy", false)}</div><p class="tool-hint">Choose a color or enter a 3- or 6-digit HEX code.</p>`,
  );
  function update(hex) {
    ctx.clearError();
    if (!/^#?([a-f0-9]{3}|[a-f0-9]{6})$/i.test(hex)) return;
    hex = hex.replace("#", "");
    if (hex.length === 3)
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    hex = "#" + hex.toLowerCase();
    ctx.q("#color-input").value = hex;
    ctx.q("#color-swatch").style.backgroundColor = hex;
    ctx.q("#color-swatch-label").textContent = hex.toUpperCase();
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
    ctx.q("#rgb-output").value = `rgb(${r}, ${g}, ${b})`;
    const [rr, gg, bb] = [r / 255, g / 255, b / 255],
      max = Math.max(rr, gg, bb),
      min = Math.min(rr, gg, bb),
      delta = max - min,
      l = (max + min) / 2;
    let h = 0,
      s = 0;
    if (delta) {
      s = delta / (1 - Math.abs(2 * l - 1));
      h =
        max === rr
          ? ((gg - bb) / delta) % 6
          : max === gg
            ? (bb - rr) / delta + 2
            : (rr - gg) / delta + 4;
      h = (h * 60 + 360) % 360;
    }
    ctx.q("#hsl-output").value =
      `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }
  ctx.on(ctx.q("#color-input"), "input", (e) => {
    ctx.q("#hex-input").value = e.target.value;
    update(e.target.value);
  });
  ctx.on(ctx.q("#hex-input"), "input", (e) => update(e.target.value));
  ctx.on(ctx.q("#hex-input"), "change", (e) => {
    if (!/^#?([a-f0-9]{3}|[a-f0-9]{6})$/i.test(e.target.value))
      ctx.error("Enter a valid HEX code, such as #7860d5 or #abc.");
  });
  for (const key of ["hex", "rgb", "hsl"])
    ctx.on(ctx.q("#copy-" + key), "click", () =>
      ctx.copy(
        key === "hex"
          ? ctx.q("#color-input").value
          : ctx.q("#" + key + "-output").value,
      ),
    );
  update("#7860d5");
}

function mountTimestamp(ctx) {
  ctx.html(
    `<div class="tool-two-column"><div><div class="tool-options">${field("Unix timestamp", '<input id="timestamp-input" type="number" placeholder="e.g. 1735689600">')}${field(
      "Unit",
      select("timestamp-unit", [
        ["seconds", "Seconds"],
        ["milliseconds", "Milliseconds"],
      ]),
    )}</div>${btn("timestamp-convert", "Convert to date", "convert")}<div class="tool-options">${field("UTC date", '<input id="utc-output" readonly>')}${field("Your local time", '<input id="local-output" readonly>')}</div></div><div><div class="tool-options">${field("Date & time (your timezone)", '<input type="datetime-local" id="date-input" step="1">')}</div><div class="tool-action-row">${btn("date-convert", "Convert to timestamp", "convert")}${btn("use-now", "Use now", "clock", false)}</div><div class="tool-options">${field("Unix seconds", '<input id="seconds-output" readonly>')}${field("Unix milliseconds", '<input id="milliseconds-output" readonly>')}</div></div></div><div class="tool-action-row">${btn("copy-timestamp", "Copy Unix seconds", "copy", false)}</div><p class="tool-hint">Unix time measures the time since January 1, 1970, 00:00:00 UTC. Date input uses your browser’s timezone.</p>`,
  );
  function fromDate() {
    ctx.clearError();
    const d = new Date(ctx.q("#date-input").value);
    if (!Number.isFinite(d.getTime())) {
      ctx.error("Choose a valid date and time.");
      return;
    }
    ctx.q("#seconds-output").value = Math.floor(d.getTime() / 1000);
    ctx.q("#milliseconds-output").value = d.getTime();
  }
  ctx.on(ctx.q("#timestamp-convert"), "click", () => {
    ctx.clearError();
    const input = ctx.q("#timestamp-input").value;
    if (!input.trim()) {
      ctx.error("Enter a Unix timestamp first.");
      return;
    }
    const n = Number(input),
      d = new Date(
        n * (ctx.q("#timestamp-unit").value === "seconds" ? 1000 : 1),
      );
    if (!Number.isFinite(d.getTime())) {
      ctx.error("That timestamp is outside the supported date range.");
      return;
    }
    ctx.q("#utc-output").value = d.toISOString();
    ctx.q("#local-output").value = d.toLocaleString();
  });
  ctx.on(ctx.q("#date-convert"), "click", fromDate);
  function now() {
    const d = new Date(),
      offset = d.getTimezoneOffset() * 60000;
    ctx.q("#date-input").value = new Date(d.getTime() - offset)
      .toISOString()
      .slice(0, 19);
    ctx.q("#timestamp-input").value = Math.floor(d.getTime() / 1000);
    fromDate();
  }
  ctx.on(ctx.q("#use-now"), "click", now);
  ctx.on(ctx.q("#copy-timestamp"), "click", () =>
    ctx.copy(ctx.q("#seconds-output").value),
  );
  now();
}
