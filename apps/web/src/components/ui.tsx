import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#06080c] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(132,204,22,0.12),transparent)]" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}

export function Btn({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-lime text-black hover:bg-lime/90"
      : variant === "outline"
        ? "border border-white/15 text-white hover:border-lime/50"
        : "text-slate-400 hover:text-white";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

export function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <input
        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none focus:border-lime/60"
        {...props}
      />
    </label>
  );
}

export function TextArea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <textarea
        className="w-full min-h-[100px] rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none focus:border-lime/60 resize-y"
        {...props}
      />
    </label>
  );
}

export function Select({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <select
        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none focus:border-lime/60"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Glass({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
