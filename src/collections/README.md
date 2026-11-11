# Theme collections

Each folder is a design style. `alpha` is the original Elements theme.

`britanniae` is a serif-led, crafted theme with a subtle paper-grain background.
Its Arthur, Guinevere, Merlin, Percival, Lancelot, and Galahad palettes occupy
the six alkaline earth metal tiles. Alpha remains at Hydrogen.

`cosmo` uses all seven noble-gas tiles for Astral, Solar, Lunar, Nebular,
Quasar, Pulsar, and Stellar. Its geometric headings, mono labels, translucent
panels, and a sparse drifting starfield over atmospheric light are shared by
every palette. The starfield is a small vector layer and stops moving for
reduced-motion users. Host apps can load Space Grotesk and JetBrains Mono to use
the preferred faces; the theme includes local fallbacks. Stellar uses the
black-and-white semantic colors from
the `jnpl` portfolio, paired with Cosmo's geometry.

For the exact animated `jnpl` backdrop, mount `CosmoBackdrop` from
`@jnpll/elements-ui/cosmo-backdrop` once near the application root and position
page content above its canvas layer. It uses the same GLSL shader as the
portfolio, follows light/dark mode, and freezes for reduced motion. The CSS
starfield remains as a fallback when WebGL is unavailable or the component is
not mounted.

`pantheon` occupies the first thirteen transition-metal tiles with Apollo,
Artemis, Loki, Freya, Ishtar, Shiva, Kali, Hades, Amun-Ra, Anubis, Osiris,
Horus, and Isis. The remaining transition-metal tiles are open for later work.
All palettes define the same semantic tokens in light and dark modes.

`alpha` has two neutral monochrome palettes. `000` is the original flat Base
palette; `001` uses Apple-like glass material with pill controls, soft edge
highlights, and blurred floating surfaces. Both have light and dark modes.
Only destructive actions use red. Joshua Esca's portfolio keeps its paper,
artwork, and accent colors as app-specific overrides.

Import `themes.css` to load every bundled collection, or import `styles.css`
and a specific collection's `theme.css`. Set `data-elements-theme` and
`data-elements-palette` on the root HTML element. The `dark` class controls
appearance independently. Most collections keep structural treatment constant
across palettes. Alpha's `001` is an intentional material variant: it changes
surface and control treatment while keeping its colors monochrome.

- `theme.json` stores the versioned design contract and palette catalog.
- `theme.css` stores structural tokens and palette-scoped material treatments.
- `palettes/*.css` stores only semantic color tokens in `:root` and `.dark`.

All palettes of a theme must define the same tokens. Components retain semantic
HTML and Base UI interactions, using the shared radius scale, control sizes,
spacing utilities, and color tokens. Palettes must not alter markup. Alpha `001`
is the only palette that also changes component geometry and material treatment.
Host apps can override the documented font variables.

`@jnpll/elements-ui/styles.css` remains the backwards-compatible Alpha entry
point. New palette exports must be added to `package.json`.
