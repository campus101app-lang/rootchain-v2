
import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import { Badge } from "../marketing-ui/badge";
import { GlowCard } from "../marketing-ui/card";
import { Button } from "../marketing-ui/button";
import { Section, SectionHeader } from "./section";

const farms = [
  {
    title: "Cassava Expansion — Ogun",
    crop: "Crops",
    roi: "28%",
    raised: 72,
    trust: 94,
    investors: 48,
    image: "linear-gradient(135deg,#1a2e1a,#0d1f0d)",
  },
  {
    title: "Aquaculture Cluster — Delta",
    crop: "Fish",
    roi: "32%",
    raised: 45,
    trust: 91,
    investors: 31,
    image: "linear-gradient(135deg,#0f1f2e,#061018)",
  },
  {
    title: "Poultry Feed Integration",
    crop: "Livestock",
    roi: "24%",
    raised: 88,
    trust: 89,
    investors: 62,
    image: "linear-gradient(135deg,#2a1f0f,#141008)",
  },
];

export function MarketplacePreview() {
  return (
    <Section id="marketplace">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          label="Marketplace"
          title="Live farm projects"
          description="Institutional-grade listings with funding progress, ROI, and AI trust scores."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {farms.map((f) => (
            <GlowCard key={f.title} className="overflow-hidden">
              <div className="h-36" style={{ background: f.image }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white">{f.title}</h3>
                  <Badge className="shrink-0">Verified</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">{f.crop}</p>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-lime font-semibold">{f.roi} ROI</span>
                  <span className="text-slate-400">Trust {f.trust}</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-lime" style={{ width: `${f.raised}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{f.raised}% funded</span>
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {f.investors}
                  </span>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/marketplace">
            <Button variant="outline">
              View marketplace <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
}
