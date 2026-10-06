import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const files = (await readdir(new URL("../dist/components/", import.meta.url))).filter((file) => file.endsWith(".js"));
for (const file of files) {
  const module = await import(`@jnpll/elements-ui/${file.slice(0, -3)}`);
  assert.ok(Object.keys(module).length, `${file} must export its components`);
  const source = await readFile(new URL(`../dist/components/${file}`, import.meta.url), "utf8");
  const original = await readFile(new URL(`../src/components/${file.slice(0, -3)}.tsx`, import.meta.url), "utf8");
  if (/^["']use client["']/.test(original)) assert.match(source, /^["']use client["']/, `${file} must preserve its client directive`);
  await readFile(new URL(`../dist/components/${file.slice(0, -3)}.d.ts`, import.meta.url));
}
const root = await import("@jnpll/elements-ui");
assert.ok(root.Button && root.Dialog && root.Calendar && root.ChartContainer && root.toast);
const hooks = await import("@jnpll/elements-ui/hooks/use-mobile");
assert.equal(typeof hooks.useIsMobile, "function");
const alpha = JSON.parse(await readFile(new URL(import.meta.resolve("@jnpll/elements-ui/collections/alpha/theme.json")), "utf8"));
assert.equal(alpha.id, "alpha");
assert.equal(alpha.defaultPalette, "neutral");
assert.ok(alpha.palettes.some(palette => palette.id === alpha.defaultPalette));
for (const palette of alpha.palettes) {
  const css = await readFile(new URL(import.meta.resolve(palette.stylesheet)), "utf8");
  assert.match(css, /:root\s*\{/);
  assert.match(css, /\.dark\s*\{/);
  const [light, dark] = css.split(".dark {");
  const tokens = source => [...source.matchAll(/(--[\w-]+):/g)].map(match => match[1]).sort();
  assert.deepEqual(tokens(light), tokens(dark), "Palette modes must define the same semantic tokens");
  assert.ok(!css.includes("--radius:"), "Palettes must not change theme geometry");
}
await readFile(new URL(import.meta.resolve("@jnpll/elements-ui/collections/alpha/theme.css")), "utf8");
console.log(`Verified ${files.length} component exports, type declarations, root exports, and hooks.`);
