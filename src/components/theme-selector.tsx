"use client";

import { useState } from "react";
import { Check, ChevronDown, Palette } from "lucide-react";
import { Button } from "./button.js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.js";
import { useElementsTheme } from "../themes/provider.js";

export function ThemeSelector({ className, label = "Select theme and palette", showLabel = false }: { className?: string; label?: string; showLabel?: boolean }) {
  const { selection, setTheme, themes } = useElementsTheme();
  const [open, setOpen] = useState(false);
  const [viewThemeId, setViewThemeId] = useState(selection.theme);
  const activeTheme = themes.find(theme => theme.id === selection.theme) ?? themes[0];
  const activePalette = activeTheme.palettes.find(palette => palette.id === selection.palette) ?? activeTheme.palettes[0];
  const viewTheme = themes.find(theme => theme.id === viewThemeId) ?? activeTheme;

  const trigger = <PopoverTrigger
    aria-label={label}
    render={<Button variant={showLabel ? "outline" : "ghost"} size={showLabel ? "default" : "icon"} className={className} />}
  >
    <Palette aria-hidden="true" />
    {showLabel && <><span className="max-w-40 truncate">{activeTheme.name} / {activePalette.name}</span><ChevronDown aria-hidden="true" className="ml-auto" /></>}
  </PopoverTrigger>;

  return <Popover open={open} onOpenChange={(next) => { setOpen(next); if (next) setViewThemeId(selection.theme); }}>
    {showLabel ? trigger : <Tooltip><TooltipTrigger render={trigger} /><TooltipContent role="tooltip">Theme and palette: {activeTheme.name} / {activePalette.name}</TooltipContent></Tooltip>}
    <PopoverContent align="end" sideOffset={8} className="w-[min(27rem,calc(100vw-1rem))] gap-3 p-3" aria-label="Theme and palette picker" data-theme-picker>
      <div className="flex items-center justify-between gap-2 px-1"><span className="text-xs font-semibold text-foreground">Collection</span><span className="text-[11px] text-muted-foreground">{themes.length} themes</span></div>
      <div role="group" aria-label="Collections" className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {themes.map(theme => <Button key={theme.id} type="button" variant={theme.id === viewTheme.id ? "secondary" : "outline"} size="sm" className="min-w-0 justify-center" aria-pressed={theme.id === viewTheme.id} onClick={() => setViewThemeId(theme.id)}>{theme.name}</Button>)}
      </div>
      <div className="h-px bg-border" />
      <div className="flex items-center justify-between gap-2 px-1"><span className="text-xs font-semibold text-foreground">{viewTheme.name} palettes</span><span className="text-[11px] text-muted-foreground">{viewTheme.palettes.length} choices</span></div>
      <div role="group" aria-label={`${viewTheme.name} palettes`} className="grid grid-cols-3 gap-1.5">
        {viewTheme.palettes.map(palette => {
          const selected = selection.theme === viewTheme.id && selection.palette === palette.id;
          return <Button key={palette.id} type="button" variant={selected ? "secondary" : "outline"} className="relative h-14 min-w-0 flex-col items-start gap-0.5 px-3 py-2 text-left" aria-label={palette.name} aria-pressed={selected} onClick={() => { setTheme({ theme: viewTheme.id, palette: palette.id }); setOpen(false); }}>
            <span className="flex w-full items-center justify-between gap-1 text-[10px] leading-none text-muted-foreground"><span>{palette.element ? String(palette.element).padStart(2, "0") : viewTheme.id.slice(0, 2).toUpperCase()}</span>{selected && <Check aria-hidden="true" className="size-3.5 text-primary" />}</span>
            <span className="w-full truncate text-xs font-semibold text-foreground">{palette.name}</span>
          </Button>;
        })}
      </div>
    </PopoverContent>
  </Popover>;
}
