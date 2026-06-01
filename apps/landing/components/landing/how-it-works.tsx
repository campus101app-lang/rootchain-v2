"use client";

import { Section, SectionHeader } from "./section";
import { Card } from "@/components/ui/card";

const steps = [
  {
    n: "01",
    title: "Farmers launch verified projects",
    desc: "Upload land proof, farm plans, and funding targets. Admin verification before going live.",
  },
  {
    n: "02",
    title: "Investors fund with USDC",
    desc: "Capital flows on-chain to escrow. Clear ROI, duration, and risk signals upfront.",
  },
  {
    n: "03",
    title: "Transparency end-to-end",
    desc: "Milestones, updates, and settlements are trackable by every stakeholder.",
  },
];

export function HowItWorks() {
  return (
    <Section id="about" className="bg-white/[0.02]">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader label="Process" title="How Rootchain works" />
        <div className="relative grid gap-6 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-12 hidden h-px bg-gradient-to-r from-transparent via-lime/40 to-transparent md:block" />
          {steps.map((s) => (
            <Card key={s.n} className="relative p-6">
              <span className="text-4xl font-bold text-lime/20">{s.n}</span>
              <h3 className="mt-2 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{s.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
