"use client";

import {
  Activity,
  Brain,
  BadgeCheck,
  Eye,
  Landmark,
  Wallet,
} from "lucide-react";
import { GlowCard } from "@/components/ui/card";
import { Section, SectionHeader } from "./section";

const items = [
  {
    icon: Eye,
    title: "On-Chain Transparency",
    desc: "Every investment, milestone, and payout is verifiable on Stellar.",
  },
  {
    icon: Brain,
    title: "AI Risk Analysis",
    desc: "Machine learning scores farms, crops, and repayment probability.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Farms",
    desc: "Land, identity, and production plans reviewed before listing.",
  },
  {
    icon: Activity,
    title: "Real-Time Monitoring",
    desc: "Photo and video updates visible to all project investors.",
  },
  {
    icon: Wallet,
    title: "USDC Payments",
    desc: "Stablecoin funding with clear settlement on Stellar testnet & mainnet.",
  },
  {
    icon: Landmark,
    title: "Stellar Infrastructure",
    desc: "Built on battle-tested blockchain rails for global capital.",
  },
];

export function Features() {
  return (
    <Section id="features">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          label="Platform"
          title="Infrastructure, not crowdfunding"
          description="Rootchain is the financial layer for agricultural capital — transparent, auditable, and built for scale."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <GlowCard key={f.title} className="p-6 transition-transform hover:-translate-y-1">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-lime/10 text-lime">
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </GlowCard>
          ))}
        </div>
      </div>
    </Section>
  );
}
