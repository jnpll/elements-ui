import alpha from "../collections/alpha/theme.json" with { type: "json" };
import britanniae from "../collections/britanniae/theme.json" with { type: "json" };

export interface ElementsPalette {
  id: string;
  name: string;
  stylesheet: string;
  modes: readonly string[];
  element?: number;
}
export interface ElementsTheme {
  id: string;
  name: string;
  defaultPalette: string;
  palettes: readonly ElementsPalette[];
}
export interface ElementsThemeSelection { theme: string; palette: string }
export const elementsThemes: readonly ElementsTheme[] = [alpha, britanniae];
export const defaultThemeSelection: ElementsThemeSelection = { theme: "alpha", palette: "neutral" };
export const elementsThemeStorageKey = "elements-design-selection";

export function resolveThemeSelection(
  value: unknown,
  themes: readonly ElementsTheme[] = elementsThemes,
  fallback: ElementsThemeSelection = defaultThemeSelection,
): ElementsThemeSelection {
  const candidate = typeof value === "object" && value !== null ? value as Partial<ElementsThemeSelection> : {};
  const selected = themes.find(theme => theme.id === candidate.theme);
  const theme = selected ?? themes.find(theme => theme.id === fallback.theme) ?? themes[0];
  if (!theme || !theme.palettes.some(palette => palette.id === theme.defaultPalette)) {
    throw new Error("An Elements theme registry must contain themes with valid default palettes.");
  }
  const palette = selected ? candidate.palette : fallback.palette;
  return { theme: theme.id, palette: theme.palettes.some(item => item.id === palette) ? palette! : theme.defaultPalette };
}
