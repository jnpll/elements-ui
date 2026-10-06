# Elements UI

Shared shadcn Base Nova components, Elements light/dark tokens, and glass surfaces
for React 19 applications using Tailwind CSS 4.

## Build

```sh
npm install
npm run build
```

The build emits ESM JavaScript and declarations into `dist`, preserving per-file
`"use client"` directives. React is a peer dependency and is not bundled.

## Consume

For the sibling Elements app, run `npm install` in this package, build it, then
run `npm install` in `../elements`. Elements already declares `file:../elements-ui`.
Rebuild this package after changing its source.

The initial local verification used a `node_modules` symlink to Elements' installed
dependencies because the npm registry could not be reached. Before installing
this package independently, remove that symlink with `unlink node_modules`, then
run `npm install`. This does not remove Elements' dependencies.

```tsx
import { Button } from "@jnpl/elements-ui/button";
import { GlassPanel } from "@jnpl/elements-ui/glass-panel";
import { cn } from "@jnpl/elements-ui/utils";
```

In the consuming app's global stylesheet:

```css
@import "tailwindcss";
@import "@jnpl/elements-ui/styles.css";

@source "../../node_modules/@jnpl/elements-ui/dist";
```

Adjust `@source` relative to that stylesheet. The package includes animation and
shadcn variant imports; consumers should not duplicate them. The stylesheet is
Tailwind input, so the consuming app must process it through Tailwind 4.

Add `.dark` to the document element to select the dark theme. The shared stylesheet
supplies semantic colors, radius values, base colors, glass surfaces, gradient text,
and eyebrow text. Load fonts in the app and expose `--elements-font-sans` and
`--elements-font-mono`; system fonts are used when these are absent.

Elements keeps its existing theme preference provider, font loading, scrolling,
prism layout, avatar effects, and print styles locally. Its old UI paths re-export
this package so existing imports continue working.

## Add components

Run the shadcn CLI from this package, using its `base-nova` configuration. After
adding a component, use relative internal imports with `.js` extensions, add it
to `src/index.ts`, and install any required runtime dependencies here. Exported
component files are available as `@jnpl/elements-ui/<name>` after building.

## Release

`npm pack` builds the package before creating a tarball. Publishing and registry
authentication are not configured yet; choose npm or GitHub Packages before
publishing. The sibling folder can become its own Git repository.
