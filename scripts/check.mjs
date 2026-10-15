import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parsePages, convertUnit, securePassword } from "../dist/tools.js";
import { PDFDocument } from "pdf-lib";
import mammoth from "mammoth";
assert.deepEqual(parsePages("1-3, 5, 2", 5), [0, 1, 2, 4]);
assert.deepEqual(parsePages("", 3), [0, 1, 2]);
for (const input of ["0", "6", "3-1", "1-two", "1,"])
  assert.throws(() => parsePages(input, 5));
assert.equal(convertUnit(32, "f", "c", "temperature"), 0);
assert.equal(convertUnit(100, "c", "f", "temperature"), 212);
assert.equal(convertUnit(1, "mi", "m", "length"), 1609.344);
assert.equal(convertUnit(1, "gal", "l", "volume"), 3.785411784);
assert.equal(convertUnit(1, "lb", "kg", "weight"), 0.45359237);
const groups = ["ABC", "abc", "123", "!@#"];
const passwords = new Set();
for (let i = 0; i < 50; i++) {
  const password = securePassword(20, groups);
  assert.equal(password.length, 20);
  for (const group of groups)
    assert.ok([...password].some((c) => group.includes(c)));
  passwords.add(password);
}
assert.equal(passwords.size, 50);
assert.throws(() => securePassword(20, []));
const a = await PDFDocument.load(await readFile("test-results/sample-a.pdf")),
  b = await PDFDocument.load(await readFile("test-results/sample-b.pdf")),
  merged = await PDFDocument.create();
for (const source of [a, b]) {
  for (const page of await merged.copyPages(source, source.getPageIndices()))
    merged.addPage(page);
}
const saved = await PDFDocument.load(await merged.save());
assert.equal(saved.getPageCount(), 3);
const text = await mammoth.extractRawText({
  buffer: await readFile("test-results/sample.docx"),
});
assert.ok(text.value.includes("A bright idea"));
assert.ok(text.value.includes("Everyday tools, together."));
for (const file of [
  "pdf-lib.js",
  "fontkit.js",
  "pdf.mjs",
  "pdf.worker.mjs",
  "mammoth.js",
  "docx.js",
  "purify.js",
  "qrcode.js",
  "fflate.js",
  "NotoSans-Regular.ttf",
])
  assert.ok((await readFile("dist/vendor/" + file)).length > 500);
console.log(
  "Passed: page-range validation, unit conversions, secure passwords, PDF merge/reopen, Word text extraction, and required assets.",
);
