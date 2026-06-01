"use client";

import { Card } from "@/components/ui/card";
import { Section, SectionHeader } from "./section";

const quotes = [
  {
    role: "Investor · Lagos",
    text: "Finally, agricultural deals with the same transparency I expect from fintech and crypto rails.",
    name: "Adaeze O.",
  },
  {
    role: "Farm Owner · Niger Delta",
    text: "We raised USDC in weeks with on-chain proof. Investors trusted the milestones we published.",
    name: "Emmanuel K.",
  },
  {
    role: "Ag Finance Advisor",
    text: "Rootchain is the missing infrastructure layer between African farms and global capital.",
    name: "Dr. Funke A.",
  },
];

export function Testimonials() {
  return (
    <Section>
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader label="Voices" title="Built for both sides of the market" />
        <div className="grid gap-5 md:grid-cols-3">
          {quotes.map((q) => (
            <Card key={q.name} className="p-6">
              <p className="text-sm leading-relaxed text-slate-300">&ldquo;{q.text}&rdquo;</p>
              <p className="mt-4 font-semibold text-white">{q.name}</p>
              <p className="text-xs text-slate-500">{q.role}</p>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
