"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Section, SectionHeader } from "./section";

const feed = [
  { time: "2m ago", text: "USDC 2,500 → Maize Project escrow", hash: "8f2a…c91" },
  { time: "14m ago", text: "Milestone: Land prep verified", hash: "4b1e…7d2" },
  { time: "1h ago", text: "Farmer KYC approved — ONOS FARMS", hash: "a903…11f" },
  { time: "3h ago", text: "Investor portfolio +$10 USDC yield", hash: "77c2…e04" },
];

export function Transparency() {
  return (
    <Section id="transparency" className="bg-white/[0.02]">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
        <SectionHeader
          align="left"
          label="Transparency"
          title="Every investment verified on-chain"
          description="Stakeholders see the same source of truth — from funding to farm milestones."
        />
        <Card className="relative overflow-hidden border-lime/10 p-0">
          <div className="border-b border-white/[0.06] px-4 py-3 text-xs font-medium text-slate-400">
            Live activity · Stellar testnet
          </div>
          <ul className="max-h-72 divide-y divide-white/[0.04] overflow-hidden">
            {feed.map((item, i) => (
              <motion.li
                key={item.hash}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="flex gap-3 px-4 py-3 text-sm"
              >
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-lime" />
                <div className="min-w-0 flex-1">
                  <p className="text-slate-300">{item.text}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-slate-600">
                    {item.time} · {item.hash}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0c10] to-transparent" />
        </Card>
      </div>
    </Section>
  );
}
