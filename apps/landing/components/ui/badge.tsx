import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-lime/30 bg-lime/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime",
        className,
      )}
      {...props}
    />
  );
}
