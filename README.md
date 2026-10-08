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

For the sibling portfolio app, run `npm install` in this package, build it, then
run `npm install` in `../jnpl`. The portfolio uses `file:../elements-ui`;
the `elements` documentation app installs the published GitHub package.
Rebuild this package after changing its source.

For a registry installation, add `@jnpll:registry=https://npm.pkg.github.com`
to your app's `.npmrc`, authenticate with a classic personal access token that
has `read:packages`, then install the version you want:

```sh
npm login --scope=@jnpll --auth-type=legacy --registry=https://npm.pkg.github.com
npm install @jnpll/elements-ui@0.4.0
```

Keep credentials in your local npm configuration or CI secrets, not in source.
GitHub Packages requires authentication even for public npm packages.

```tsx
import { Button } from "@jnpll/elements-ui/button";
import { GlassPanel } from "@jnpll/elements-ui/glass-panel";
import { cn } from "@jnpll/elements-ui/utils";
```

Theme icons are exported as typed SVG data URLs; no SVG loader or public-file
copying is required. Use them in an image or a current-color CSS mask:

Glass-panel gradient rings and the `text-gradient` utility derive their colours
from `--primary` and `--secondary`. Palettes do not need separate glow tokens.

`Pattern` provides dotted, grid, or plain backgrounds. It defaults to
`--background` and `--border`, with adjustable `spacing` and `size` in pixels,
optional `color`/`background` overrides, and `fade` for soft pattern edges.
Its decorative layer does not intercept input or fade children. Use `className`
for surface dimensions and padding; there is no built-in card border or radius.

```tsx
import { Pattern } from "@jnpll/elements-ui/pattern";

<Pattern pattern="dots" spacing={12} size={0.7} className="min-h-64 p-6">
  <button>New project</button>
</Pattern>
```

`alphaIcon` uses `src/assets/icons/token/atomic.svg`. The public
export name and `icons/alpha.svg` asset path remain stable.

```tsx
import { alphaIcon, crown2BoldIcon } from "@jnpll/elements-ui/icons";

<span style={{ maskImage: `url("${alphaIcon}")`, background: "currentColor", width: 24, height: 24 }} />
```

Raw SVGs are also available at `@jnpll/elements-ui/icons/alpha.svg` and
`@jnpll/elements-ui/icons/crown-2-bold.svg` for bundlers with asset support.
The source SVGs remain in `src/assets/icons`; the build generates the published
assets and URL exports. Only these two supported icons are included in this release.

In the consuming app's global stylesheet:

```css
@import "tailwindcss";
@import "@jnpll/elements-ui/styles.css";

@source "../../node_modules/@jnpll/elements-ui/dist";
```

Adjust `@source` relative to that stylesheet. The package includes animation and
shadcn variant imports; consumers should not duplicate them. The stylesheet is
Tailwind input, so the consuming app must process it through Tailwind 4.

Add `.dark` to the document element to select the dark theme. The shared stylesheet
supplies semantic colors, radius values, base colors, glass surfaces, gradient text,
and eyebrow text. Load fonts in the app and expose `--elements-font-sans` and
`--elements-font-mono`; system fonts are used when these are absent.

The `jnpl` portfolio keeps its existing theme preference provider, font loading, scrolling,
prism layout, avatar effects, and print styles locally. Its old UI paths re-export
this package so existing imports continue working.

## Switch themes and palettes

Version 0.4.0 exports a shared registry, provider, hook, and selector.
Import `@jnpll/elements-ui/themes.css` instead of `styles.css` to load Alpha and
all Britanniae palettes, retaining the Tailwind `@source` configuration above.

```tsx
"use client";
import type { ReactNode } from "react";
import { ElementsThemeProvider, useElementsTheme } from "@jnpll/elements-ui/theme-provider";
import { ThemeSelector } from "@jnpll/elements-ui/theme-selector";

export function App({ children }: { children: ReactNode }) {
  return <ElementsThemeProvider storageKey="my-app-design">
    <ThemeSelector />
    {children}
  </ElementsThemeProvider>;
}

function ArthurAction() {
  const { selection, setTheme } = useElementsTheme();
  return <button onClick={() => setTheme({ theme: "britanniae", palette: "arthur" })}>
    Arthur {selection.palette === "arthur" ? "(active)" : ""}
  </button>;
}
```

The provider sets `data-elements-theme` and `data-elements-palette` on the
document element, validates selections, persists them, and synchronizes tabs.
Light/dark mode remains independent: manage `.dark` using your app's existing
appearance controls. Use semantic utilities (`bg-background`, `text-primary`,
`border-border`); hardcoded colors and geometry will not adapt to themes.
Mount one provider for the entire document, not one per preview.

Options are `defaultSelection`, `storageKey`, `persist` (default true), and
`themes` (a custom registry). Custom registry stylesheets must be imported by
your app; the registry does not fetch CSS. Disable persistence for temporary
selections. The hook must be called within the provider. `ThemeSelector` supplies
an accessible icon trigger, tooltip, grouped palette choices, and active state.

For server-rendered apps, `getElementsThemeScript` from the server-safe
`@jnpll/elements-ui/themes` export returns an escaped inline script. Place it
in the document head before content to restore a saved selection before paint.
Pass the same options to the script and provider; authorize it with your CSP
nonce or hash. In Next.js, use `suppressHydrationWarning` on `<html>` because
the script updates its attributes. The registry export also provides
`elementsThemes`, `resolveThemeSelection`, and typed theme/palette definitions.

## Add components

The library contains 57 component modules. Alongside the original Button, Badge,
Card, GlassPanel, Tabs, Tooltip, Separator, and ScrollArea, it now includes:

- Forms: Input, Textarea, Checkbox, RadioGroup, Switch, Select, NativeSelect,
  Combobox, Slider, InputOTP, InputGroup, Field, and Label.
- Overlays: Dialog, AlertDialog, Sheet, Drawer, Popover, HoverCard, DropdownMenu,
  ContextMenu, and Menubar.
- Navigation: Accordion, Collapsible, Breadcrumb, NavigationMenu, Pagination,
  Sidebar, and Command.
- Display and layout: Avatar, AspectRatio, Carousel, Chart, Table, Resizable,
  Calendar, Item, and ButtonGroup.
- Feedback and actions: Alert, Empty, Progress, Skeleton, Spinner, Kbd, Toggle,
  ToggleGroup, and Sonner notifications.

`Toaster` accepts a `theme` prop and does not require a Next.js theme provider.
Mount one Toaster per application and import `toast` from the same package export.
The expanded set is included starting with version 0.2.0.

`npm test` builds and checks every public component export and declaration.
Live examples are in the sibling `elements` documentation application.

Run the shadcn CLI from this package, using its `base-nova` configuration. After
adding a component, use relative internal imports with `.js` extensions, add it
to `src/index.ts`, and install any required runtime dependencies here. Exported
component files are available as `@jnpll/elements-ui/<name>` after building.

## Release

Version 0.4.0 adds reusable theme switching and Pattern, updates the Alpha icon
and Britanniae palettes, and derives glow effects from primary/secondary tokens.
Migration: replace custom `--glow-*` tokens and `glow-*` color utilities with
semantic primary/secondary tokens. Import `themes.css` when using the selector.

`npm pack` builds the package before creating a tarball. The publish registry is
GitHub Packages, linked to https://github.com/jnpll/elements-ui.

The Publish package workflow installs from the lockfile, typechecks, and publishes
with the repository's `GITHUB_TOKEN`. It runs on `v*` tags or manual dispatch.
To release a new version from a clean checkout:

```sh
npm version patch
git push origin main --follow-tags
```

Each package version can only be published once. See
https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry
for authentication and visibility settings.
