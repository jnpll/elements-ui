"use client";

import { Palette } from "lucide-react";
import { Button } from "./button.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.js";
import { useElementsTheme } from "../themes/provider.js";

export function ThemeSelector({ className, label = "Select theme and palette" }: { className?: string; label?: string }) {
  const { selection, setTheme, themes } = useElementsTheme();
  const theme = themes.find(theme => theme.id === selection.theme) ?? themes[0];
  const palette = theme.palettes.find(palette => palette.id === selection.palette) ?? theme.palettes[0];
  return <DropdownMenu>
    <Tooltip><TooltipTrigger render={<DropdownMenuTrigger aria-label={label} render={<Button variant="ghost" size="icon" className={className} />} />}>
      <Palette aria-hidden="true" />
    </TooltipTrigger><TooltipContent role="tooltip">Theme and palette: {theme.name} / {palette.name}</TooltipContent></Tooltip>
    <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-24px)]" aria-label="Theme and palette">
      <DropdownMenuRadioGroup value={JSON.stringify(selection)} onValueChange={value => {
        const next = themes.flatMap(theme => theme.palettes.map(palette => ({ theme: theme.id, palette: palette.id }))).find(item => JSON.stringify(item) === value);
        if (next) setTheme(next);
      }}>
        {themes.map((theme, index) => <DropdownMenuGroup key={theme.id}>
          {index > 0 && <DropdownMenuSeparator />}
          <DropdownMenuLabel>{theme.name}</DropdownMenuLabel>
          {theme.palettes.map(palette => <DropdownMenuRadioItem key={palette.id} value={JSON.stringify({ theme: theme.id, palette: palette.id })} closeOnClick>{palette.name}</DropdownMenuRadioItem>)}
        </DropdownMenuGroup>)}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>;
}
