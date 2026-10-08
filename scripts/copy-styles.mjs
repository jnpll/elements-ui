import { copyFile, cp, mkdir, readFile, writeFile } from "node:fs/promises";

await copyFile(new URL("../src/styles.css", import.meta.url), new URL("../dist/styles.css", import.meta.url));
await copyFile(new URL("../src/themes.css", import.meta.url), new URL("../dist/themes.css", import.meta.url));
await cp(new URL("../src/collections", import.meta.url), new URL("../dist/collections", import.meta.url), { recursive: true });

const icons = [
  { name: "alphaIcon", source: "token/atomic.svg", file: "alpha.svg" },
  { name: "crown2BoldIcon", source: "glyphs/crown-2-bold.svg", file: "crown-2-bold.svg" },
];
await mkdir(new URL("../dist/icons/", import.meta.url), { recursive: true });
const exports = [];
for (const icon of icons) {
  const source = new URL(`../src/assets/icons/${icon.source}`, import.meta.url);
  const svg = await readFile(source, "utf8");
  await copyFile(source, new URL(`../dist/icons/${icon.file}`, import.meta.url));
  const url = `data:image/svg+xml,${encodeURIComponent(svg.trim()).replaceAll("'", "%27")}`;
  exports.push(`export const ${icon.name} = ${JSON.stringify(url)};`);
}
await writeFile(new URL("../dist/icons.js", import.meta.url), `${exports.join("\n")}\n`);
await writeFile(new URL("../dist/icons.d.ts", import.meta.url), `${icons.map(icon => `export declare const ${icon.name}: string;`).join("\n")}\n`);
