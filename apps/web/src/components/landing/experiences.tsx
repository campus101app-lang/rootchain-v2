import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "./section";
import { Card } from "../marketing-ui/card";
import { Button } from "../marketing-ui/button";

export function InvestorExperience() {
  return (
    <Section id="investors">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          label="Investors"
          title="Portfolio intelligence"
          description="Bloomberg-grade clarity for agricultural capital allocation."
        />
        <Card className="overflow-hidden p-0">
          <div className="grid md:grid-cols-4">
            {[
              { label: "Portfolio value", val: "$124,500" },
              { label: "Active projects", val: "6" },
              { label: "Weighted ROI", val: "+22.4%" },
              { label: "AI picks", val: "3 new" },
            ].map((m) => (
              <div key={m.label} className="border-b border-white/[0.06] p-5 md:border-b-0 md:border-r last:border-0">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{m.label}</p>
                <p className="mt-1 text-xl font-bold text-white">{m.val}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] p-5">
            <div className="flex h-24 items-end gap-1">
              {[30, 45, 40, 60, 55, 75, 70, 90, 85].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-lime/20 to-lime/60"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">ROI tracking · USDC settlements · on-chain history</p>
          </div>
        </Card>
      </div>
    </Section>
  );
}

export function FarmerExperience() {
  return (
    <Section id="farmers" className="bg-white/[0.02]">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          label="Farmers"
          title="Raise capital with proof"
          description="Funding analytics, milestones, and investor trust in one workspace."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Funding progress", d: "Real-time USDC raised vs goal" },
            { t: "Milestones", d: "Photo & video proof for investors" },
            { t: "Engagement", d: "See who backed your farm" },
            { t: "Withdrawals", d: "Transparent settlement rails" },
          ].map((x) => (
            <Card key={x.t} className="p-5">
              <h3 className="font-semibold text-white">{x.t}</h3>
              <p className="mt-2 text-sm text-slate-400">{x.d}</p>
            </Card>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/signup/farmer">
            <Button className="px-8 py-3">
              Create farm owner account <ArrowRight size={16} />
            </Button>
          </Link>
          <p className="mt-3 text-xs text-slate-500">
            After signup: wallet setup → dashboard → publish your first project.
          </p>
        </div>
      </div>
    </Section>
  );
}
