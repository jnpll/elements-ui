"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultThemeSelection, elementsThemes, elementsThemeStorageKey, resolveThemeSelection, type ElementsTheme, type ElementsThemeSelection } from "./registry.js";
import type { ElementsThemeOptions } from "./bootstrap.js";

interface ElementsThemeContextValue {
  selection: ElementsThemeSelection;
  themes: readonly ElementsTheme[];
  setTheme: (selection: ElementsThemeSelection) => void;
}
const ThemeContext = createContext<ElementsThemeContextValue | null>(null);

function apply(selection: ElementsThemeSelection) {
  document.documentElement.dataset.elementsTheme = selection.theme;
  document.documentElement.dataset.elementsPalette = selection.palette;
}

export function ElementsThemeProvider({ children, themes = elementsThemes, defaultSelection = defaultThemeSelection, storageKey = elementsThemeStorageKey, persist = true }: ElementsThemeOptions & { children: ReactNode }) {
  const fallback = useMemo(() => resolveThemeSelection(defaultSelection, themes), [defaultSelection.theme, defaultSelection.palette, themes]);
  const [selection, setSelection] = useState(fallback);
  useEffect(() => {
    let current = fallback;
    if (persist) {
      try { current = resolveThemeSelection(JSON.parse(localStorage.getItem(storageKey) || "null"), themes, fallback); } catch {}
    }
    apply(current);
    setSelection(current);
    if (!persist) return;
    const sync = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      try { if (event.storageArea && event.storageArea !== localStorage) return; } catch { return; }
      let next = fallback;
      try { next = resolveThemeSelection(JSON.parse(event.newValue || "null"), themes, fallback); } catch {}
      apply(next);
      setSelection(next);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [fallback, themes, storageKey, persist]);
  const setTheme = useCallback((value: ElementsThemeSelection) => {
    const next = resolveThemeSelection(value, themes, fallback);
    apply(next);
    setSelection(next);
    if (persist) {
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
    }
  }, [themes, fallback, storageKey, persist]);
  const context = useMemo(() => ({ selection, setTheme, themes }), [selection, setTheme, themes]);
  return <ThemeContext.Provider value={context}>{children}</ThemeContext.Provider>;
}

export function useElementsTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useElementsTheme must be used inside ElementsThemeProvider.");
  return context;
}
