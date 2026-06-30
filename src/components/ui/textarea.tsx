import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-slate-300",
        "focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100/60",
        "dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 dark:focus-visible:border-blue-500 dark:focus-visible:ring-blue-950/40",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
