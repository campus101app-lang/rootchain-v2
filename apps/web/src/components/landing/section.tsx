
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id={id} ref={ref} className={cn("relative py-24 md:py-32", className)}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </section>
  );
}

export function SectionHeader({
  label,
  title,
  description,
  align = "center",
}: {
  label?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("mb-14 max-w-3xl", align === "center" && "mx-auto text-center")}>
      {label && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-lime/80">{label}</p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">{title}</h2>
      {description && <p className="mt-4 text-base text-slate-400 md:text-lg">{description}</p>}
    </div>
  );
}
