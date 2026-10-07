# Theme collections

Each folder is a design style. `alpha` is the original Elements theme.

`britanniae` is a restrained, crafted theme with Arthur, Guinevere, Merlin,
Mordred, Percival, Lancelot, and Galahad palettes. All seven define exactly the
same semantic colors as Alpha in both light and dark modes. Its geometry and
heading typography live in `britanniae/theme.css`, not in its palettes.

Import the base `styles.css` and then `collections/britanniae/theme.css`.
Set `data-elements-theme="britanniae"` and `data-elements-palette="arthur"`
on the root HTML element. The `dark` class controls appearance independently.
Changing only the palette attribute keeps the theme's structure unchanged.
Remove/change those attributes to return to Alpha. These exports are not yet
published in version 0.2.0.

- `theme.json` stores the versioned design contract and palette catalog.
- `theme.css` stores structural tokens and selects the default palette.
- `palettes/*.css` stores only semantic color tokens in `:root` and `.dark`.

All palettes of a theme must define the same tokens. Components retain semantic
HTML and Base UI interactions, using the shared radius scale, control sizes,
spacing utilities, and color tokens. A palette must not alter geometry or markup.
Host apps can override the documented font variables.

`@jnpll/elements-ui/styles.css` remains the backwards-compatible Alpha entry point.
After importing it, import a different palette to override colors without
duplicating component code. New palette exports must be added to `package.json`.
The collection-specific exports require a new package release; 0.2.0 consumers
continue to use `styles.css` until that release is published.
