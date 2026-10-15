import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".png": "image/png",
  ".json": "application/json",
};
export function createStaticServer({
  directory = "dist",
  basePath = "/",
} = {}) {
  const root = path.resolve(directory);
  const prefix = "/" + basePath.split("/").filter(Boolean).join("/");
  const base = prefix === "/" ? "/" : prefix + "/";
  return http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (base !== "/" && pathname === prefix) {
        res.writeHead(308, { Location: base }).end();
        return;
      }
      if (!pathname.startsWith(base)) {
        res.writeHead(404).end("Not found");
        return;
      }
      let file = path.resolve(root, pathname.slice(base.length) || ".");
      if (!file.startsWith(root + path.sep) && file !== root) {
        res.writeHead(403).end();
        return;
      }
      if ((await stat(file)).isDirectory())
        file = path.join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end("Not found");
    }
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const port = Number(process.env.PORT || 5327);
  const basePath = process.env.BASE_PATH || "/";
  createStaticServer({
    directory: process.env.STATIC_DIR || "dist",
    basePath,
  }).listen(port, "127.0.0.1", () =>
    console.log(`Local: http://127.0.0.1:${port}${basePath}`),
  );
}
