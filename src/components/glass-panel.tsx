import * as React from "react";

import { cn } from "../lib/utils.js";

/** A reusable frosted-glass surface. `ring` adds the animated gradient hairline. */
export function GlassPanel({
  className,
  ring = false,
  strong = false,
  ...props
}: React.ComponentProps<"div"> & { ring?: boolean; strong?: boolean }) {
  return (
    <div
      className={cn(
        strong ? "glass-strong" : "glass",
        ring && "glass-ring",
        "rounded-2xl",
        className,
      )}
      {...props}
    />
  );
}
