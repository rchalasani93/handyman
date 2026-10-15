import { cp, lstat, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const project = fileURLToPath(new URL("../", import.meta.url));
const source = path.join(project, "dist");
const output = path.join(project, "_site");

// Only public static assets belong in the Pages artifact.
async function checkTree(directory) {
  for (const name of await readdir(directory)) {
    const file = path.join(directory, name);
    const info = await lstat(file);
    if (info.isSymbolicLink()) throw new Error(`Unexpected symlink: ${file}`);
    if (info.isDirectory()) await checkTree(file);
    else if (!info.isFile()) throw new Error(`Unexpected asset: ${file}`);
  }
}
await checkTree(source);
if (path.dirname(output) !== project.replace(/[\\/]$/, ""))
  throw new Error("The build output must stay inside the project.");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });
await writeFile(path.join(output, ".nojekyll"), "");
console.log("Built GitHub Pages website in _site/.");
