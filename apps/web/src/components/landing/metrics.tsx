
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Section } from "./section";

const stats = [
  { label: "Total Investment Volume", value: 4.2, suffix: "M", prefix: "$" },
  { label: "Active Farms", value: 128, suffix: "+" },
  { label: "Verified Farmers", value: 96, suffix: "%" },
  { label: "Avg. Investor Returns", value: 22, suffix: "%" },
  { label: "On-Chain Transactions", value: 18400, suffix: "+" },
];

function AnimatedValue({
  target,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      setN(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  const display =
    decimals > 0 ? n.toFixed(decimals) : target >= 1000 ? Math.round(n).toLocaleString() : Math.round(n);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export function Metrics() {
  return (
    <Section className="border-y border-white/[0.06] bg-white/[0.02] py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="text-center md:text-left">
            <p className="text-2xl font-bold text-white md:text-3xl">
              <AnimatedValue
                target={s.value}
                prefix={s.prefix}
                suffix={s.suffix}
                decimals={s.prefix === "$" ? 1 : 0}
              />
            </p>
            <p className="mt-1 text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
