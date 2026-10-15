import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
const files = {
  "pdf-lib/dist/pdf-lib.min.js": "pdf-lib.js",
  "@pdf-lib/fontkit/dist/fontkit.umd.min.js": "fontkit.js",
  "pdfjs-dist/build/pdf.mjs": "pdf.mjs",
  "pdfjs-dist/build/pdf.worker.mjs": "pdf.worker.mjs",
  "mammoth/mammoth.browser.min.js": "mammoth.js",
  "docx/dist/index.umd.cjs": "docx.js",
  "dompurify/dist/purify.min.js": "purify.js",
  "qrcode-generator/dist/qrcode.js": "qrcode.js",
  "fflate/umd/index.js": "fflate.js",
};
await mkdir("dist/vendor", { recursive: true });
for (const [source, target] of Object.entries(files))
  await cp("node_modules/" + source, "dist/vendor/" + target);
await cp(
  "node_modules/pdfjs-dist/standard_fonts",
  "dist/vendor/standard_fonts",
  { recursive: true },
);
await cp("node_modules/pdfjs-dist/cmaps", "dist/vendor/cmaps", {
  recursive: true,
});
const packages = [
  "pdf-lib",
  "@pdf-lib/fontkit",
  "pdfjs-dist",
  "mammoth",
  "docx",
  "dompurify",
  "qrcode-generator",
  "fflate",
];
const notices = [];
for (const name of packages) {
  const meta = JSON.parse(
    await readFile("node_modules/" + name + "/package.json", "utf8"),
  );
  let license = "";
  for (const filename of [
    "LICENSE",
    "LICENSE.txt",
    "LICENSE.md",
    "LICENSE-MIT",
    "LICENSE-MIT.txt",
  ]) {
    try {
      license = await readFile("node_modules/" + name + "/" + filename, "utf8");
      break;
    } catch {}
  }
  // Some packages ship additional license texts (DOMPurify: LICENSE-MPL).
  for (const filename of ["LICENSE-MPL", "LICENSE-APACHE"]) {
    try {
      license +=
        "\n" +
        "-".repeat(77) +
        "\n" +
        (await readFile("node_modules/" + name + "/" + filename, "utf8"));
    } catch {}
  }
  notices.push(
    name + " " + meta.version + "\nLicense: " + meta.license + "\n" + license,
  );
}
await writeFile(
  "dist/vendor/THIRD-PARTY-NOTICES.txt",
  notices.join("\n\n" + "=".repeat(72) + "\n\n"),
);
console.log("Browser dependencies copied.");
