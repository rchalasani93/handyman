import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { once } from "node:events";
import { test } from "node:test";
import { createStaticServer } from "../server.mjs";

const artifact = new URL("../_site/", import.meta.url);

test("Pages artifact contains only public assets and preserves file contents", async () => {
  const entries = await readdir(artifact, { recursive: true });
  assert.ok(entries.includes(".nojekyll"));
  for (const forbidden of [
    ".git",
    ".openai",
    "node_modules",
    "test-results",
    "package.json",
  ])
    assert.ok(
      !entries.some((entry) => entry.split(/[\\/]/).includes(forbidden)),
      forbidden,
    );
  for (const name of [
    "index.html",
    "styles.css",
    "app.js",
    "tools.js",
    "icons.js",
    "favicon.svg",
  ]) {
    assert.deepEqual(
      await readFile(new URL(name, artifact)),
      await readFile(new URL("../dist/" + name, import.meta.url)),
    );
  }
});

test("Pages subpath serves the app, lazy libraries, PDF worker, and font", async (t) => {
  const server = createStaticServer({
    directory: fileURLToPath(artifact),
    basePath: "/handyman/",
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(
    () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  );
  const origin = `http://127.0.0.1:${server.address().port}`;
  const page = new URL("/handyman/", origin);
  const response = await fetch(page);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Handy — Your everyday toolbox/);
  const assets = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(
    (match) => match[1],
  );
  assets.push(
    "tools.js",
    "icons.js",
    "vendor/pdf-lib.js",
    "vendor/fontkit.js",
    "vendor/pdf.mjs",
    "vendor/pdf.worker.mjs",
    "vendor/mammoth.js",
    "vendor/docx.js",
    "vendor/purify.js",
    "vendor/qrcode.js",
    "vendor/fflate.js",
    "vendor/NotoSans-Regular.ttf",
    "vendor/standard_fonts/LiberationSans-Regular.ttf",
    "vendor/cmaps/UniJIS-UTF16-H.bcmap",
  );
  for (const asset of assets) {
    const url = new URL(asset, page);
    assert.equal(url.origin, page.origin);
    assert.ok(url.pathname.startsWith("/handyman/"), asset);
    const result = await fetch(url);
    assert.equal(result.status, 200, asset);
    assert.ok((await result.arrayBuffer()).byteLength > 0, asset);
    if (/\.m?js$/.test(asset))
      assert.match(result.headers.get("content-type"), /javascript/);
  }
  assert.equal(
    (await fetch(new URL("vendor/does-not-exist.js", page))).status,
    404,
  );
  assert.equal((await fetch(origin + "/app.js")).status, 404);
  assert.equal(
    (await fetch(origin + "/handyman", { redirect: "manual" })).status,
    308,
  );
});
