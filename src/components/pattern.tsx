import * as React from "react";
import { cn } from "../lib/utils.js";

export type PatternProps = React.ComponentProps<"div"> & {
  pattern?: "dots" | "grid" | "none";
  spacing?: number;
  size?: number;
  color?: string;
  background?: string;
  fade?: boolean;
};

export function Pattern({
  pattern = "dots", spacing = 12, size = 0.7,
  color = "var(--border)", background = "var(--background)", fade = false,
  className, style, children, ...props
}: PatternProps) {
  const gap = Number.isFinite(spacing) ? Math.max(2, spacing) : 12;
  const weight = Number.isFinite(size) ? Math.min(gap / 2, Math.max(0.1, size)) : 0.7;
  const image = pattern === "dots"
    ? `radial-gradient(var(--pattern-color) ${weight}px, transparent ${weight}px)`
    : pattern === "grid"
      ? `linear-gradient(to right, var(--pattern-color) ${weight}px, transparent ${weight}px), linear-gradient(to bottom, var(--pattern-color) ${weight}px, transparent ${weight}px)`
      : "none";
  return <div {...props} data-slot="pattern" data-pattern={pattern}
    className={cn("relative isolate", className)}
    style={{ backgroundColor: background, "--pattern-color": color, ...style } as React.CSSProperties}>
    <span aria-hidden="true" data-slot="pattern-pattern" className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit]"
      style={{ backgroundImage: image, backgroundSize: `${gap}px ${gap}px`, ...(fade ? { maskImage: "radial-gradient(ellipse at center, black 35%, transparent 75%)" } : {}) }} />
    {children}
  </div>;
}
