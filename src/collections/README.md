# Theme collections

Each folder is a design style. `alpha` is the original Elements theme.

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
