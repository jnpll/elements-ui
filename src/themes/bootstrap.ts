import { defaultThemeSelection, elementsThemes, elementsThemeStorageKey, resolveThemeSelection, type ElementsTheme, type ElementsThemeSelection } from "./registry.js";

export interface ElementsThemeOptions {
  themes?: readonly ElementsTheme[];
  defaultSelection?: ElementsThemeSelection;
  storageKey?: string;
  persist?: boolean;
}

export function getElementsThemeScript({ themes = elementsThemes, defaultSelection = defaultThemeSelection, storageKey = elementsThemeStorageKey, persist = true }: ElementsThemeOptions = {}): string {
  const fallback = resolveThemeSelection(defaultSelection, themes);
  const data = JSON.stringify({
    themes: themes.map(theme => ({ id: theme.id, defaultPalette: theme.defaultPalette, palettes: theme.palettes.map(palette => palette.id) })),
    fallback, storageKey, persist,
  }).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  return `(()=>{const config=${data};let selected=config.fallback;try{if(config.persist){const stored=JSON.parse(localStorage.getItem(config.storageKey)||'null');const theme=config.themes.find(item=>item.id===stored?.theme);if(theme)selected={theme:theme.id,palette:theme.palettes.includes(stored?.palette)?stored.palette:theme.defaultPalette};}}catch{}document.documentElement.dataset.elementsTheme=selected.theme;document.documentElement.dataset.elementsPalette=selected.palette;})();`;
}
