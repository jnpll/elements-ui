import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

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
const themeAPI = await import("@jnpll/elements-ui/themes");
const provider = await import("@jnpll/elements-ui/theme-provider");
assert.equal(root.ElementsThemeProvider, provider.ElementsThemeProvider);
assert.equal(root.useElementsTheme, provider.useElementsTheme);
assert.equal(typeof root.ThemeSelector, "function");
assert.equal(themeAPI.elementsThemes.length, 2);
assert.equal(typeof themeAPI.getElementsThemeScript(), "string");
assert.deepEqual(themeAPI.resolveThemeSelection({ theme: "britanniae", palette: "merlin" }), { theme: "britanniae", palette: "merlin" });
assert.match(await readFile(new URL("../dist/themes/provider.js", import.meta.url), "utf8"), /^"use client"/);
await readFile(new URL("../dist/themes/index.d.ts", import.meta.url));
assert.match(await readFile(new URL(import.meta.resolve("@jnpll/elements-ui/themes.css")), "utf8"), /britanniae\/theme.css/);
const { Pattern } = await import("@jnpll/elements-ui/pattern");
assert.equal(root.Pattern, Pattern);
for (const pattern of ["dots", "grid", "none"]) {
  const html = renderToStaticMarkup(createElement(Pattern, { pattern, fade: true, spacing: 24, size: 1, id: "surface" }, "Content"));
  assert.match(html, /data-slot="pattern"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /background-size:24px 24px/);
  assert.match(html, /mask-image:radial-gradient/);
  assert.match(html, /Content/);
  assert.ok(html.includes(pattern === "dots" ? "background-image:radial-gradient" : pattern === "grid" ? "background-image:linear-gradient" : "background-image:none"));
}
const styles = await readFile(new URL(import.meta.resolve("@jnpll/elements-ui/styles.css")), "utf8");
assert.doesNotMatch(styles, /--(?:color-)?glow-/);
assert.match(styles, /\.glass-ring::after\s*\{[^}]*var\(--primary\),\s*var\(--secondary\),\s*var\(--primary\)/);
assert.match(styles, /\.text-gradient\s*\{[^}]*var\(--primary\),\s*var\(--secondary\) 55%,\s*var\(--primary\)/);
const icons = await import("@jnpll/elements-ui/icons");
for (const [name, file, source] of [["alphaIcon", "alpha.svg", "token/atomic.svg"], ["crown2BoldIcon", "crown-2-bold.svg", "glyphs/crown-2-bold.svg"]]) {
  const original = await readFile(new URL(`../src/assets/icons/${source}`, import.meta.url), "utf8");
  const exported = await readFile(new URL(import.meta.resolve(`@jnpll/elements-ui/icons/${file}`)), "utf8");
  assert.equal(exported, original);
  assert.equal(decodeURIComponent(icons[name].split(",").slice(1).join(",")), original.trim());
}
await readFile(new URL("../dist/icons.d.ts", import.meta.url));
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
const britanniae = JSON.parse(await readFile(new URL(import.meta.resolve("@jnpll/elements-ui/collections/britanniae/theme.json")), "utf8"));
assert.equal(britanniae.palettes.length, 7);
assert.deepEqual(britanniae.palettes.map(palette => palette.element), [2, 10, 18, 36, 54, 86, 118]);
const tokenNames = source => [...source.matchAll(/(--[\w-]+):/g)].map(match => match[1]).sort();
const alphaCSS = await readFile(new URL(import.meta.resolve(alpha.palettes[0].stylesheet)), "utf8");
const expectedTokens = tokenNames(alphaCSS.split(".dark {")[0]);
for (const palette of britanniae.palettes) {
  const css = await readFile(new URL(import.meta.resolve(palette.stylesheet)), "utf8");
  const [light, dark] = css.split(/:root[^\n]+\.dark\s*\{/);
  assert.ok(dark, `${palette.id} must support dark mode`);
  assert.deepEqual(tokenNames(light), expectedTokens);
  assert.deepEqual(tokenNames(dark), expectedTokens);
  assert.ok(!css.includes("--radius:"), "Palettes must not change geometry");
  assert.doesNotMatch(css, /--glow-/, "Effects must derive colors from semantic palette tokens");
  if (["arthur", "percival", "lancelot", "galahad"].includes(palette.id)) {
    assert.match(dark, /--primary: #e1be67;/);
    assert.match(dark, /--ring: #e1be67;/);
    assert.doesNotMatch(light, /--primary: #e1be67;/);
  }
  if (palette.id === "mordred") {
    assert.match(light, /--primary: #702638;/);
    assert.match(dark, /--primary: #a34860;/);
    assert.match(dark, /--primary-foreground: #ffffff;/);
    assert.match(dark, /--background: #101010;/);
  }
}
await readFile(new URL(import.meta.resolve("@jnpll/elements-ui/collections/britanniae/theme.css")), "utf8");
console.log(`Verified ${files.length} component exports, type declarations, root exports, and hooks.`);
