import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

const styles: Record<Variant, string> = {
  primary: "bg-lime text-black hover:bg-lime/90 shadow-[0_0_24px_rgba(163,230,53,0.35)]",
  secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/10",
  ghost: "text-slate-400 hover:text-white hover:bg-white/5",
  outline: "border border-white/15 text-white hover:border-lime/40 hover:text-lime",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(({ className, variant = "primary", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50",
      styles[variant],
      className,
    )}
    {...props}
  />
));
Button.displayName = "Button";
