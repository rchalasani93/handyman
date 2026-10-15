import { mkdir, writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
await mkdir("test-results", { recursive: true });
for (const [name, count] of [
  ["sample-a", 2],
  ["sample-b", 1],
]) {
  const doc = await PDFDocument.create(),
    font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < count; i++) {
    const page = doc.addPage([595, 842]);
    page.drawText(`Handy sample ${name} - page ${i + 1}`, {
      x: 50,
      y: 750,
      font,
      size: 20,
      color: rgb(0.3, 0.2, 0.5),
    });
    page.drawText("A small task. A useful result.", {
      x: 50,
      y: 710,
      font,
      size: 12,
    });
  }
  await writeFile(`test-results/${name}.pdf`, await doc.save());
}
const doc = new Document({
  sections: [
    {
      children: [
        new Paragraph({
          text: "A bright idea",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun("Everyday tools, "),
            new TextRun({ text: "together.", bold: true }),
          ],
        }),
        new Paragraph({ text: "A little help goes a long way." }),
      ],
    },
  ],
});
await writeFile("test-results/sample.docx", await Packer.toBuffer(doc));
const w = 320,
  h = 200,
  pixels = Buffer.alloc((w * 4 + 1) * h);
for (let y = 0; y < h; y++) {
  pixels[y * (w * 4 + 1)] = 0;
  for (let x = 0; x < w; x++) {
    const o = y * (w * 4 + 1) + 1 + x * 4;
    pixels[o] = Math.round(110 + (100 * x) / w);
    pixels[o + 1] = Math.round(90 + (100 * y) / h);
    pixels[o + 2] = 210;
    pixels[o + 3] = 255;
  }
}
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const n of buffer) {
    crc ^= n;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type),
    length = Buffer.alloc(4),
    crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([length, t, data, crc]);
}
const header = Buffer.alloc(13);
header.writeUInt32BE(w);
header.writeUInt32BE(h, 4);
header[8] = 8;
header[9] = 6;
await writeFile(
  "test-results/sample.png",
  Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(pixels)),
    chunk("IEND", Buffer.alloc(0)),
  ]),
);
console.log("Created 2 PDFs, 1 Word document, and a 320 × 200 PNG.");
