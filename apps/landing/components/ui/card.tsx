import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}

export function GlowCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("group relative", className)}>
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-lime/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <Card className="relative" {...props} />
    </div>
  );
}
