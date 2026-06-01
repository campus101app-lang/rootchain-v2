"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlowCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section, SectionHeader } from "./section";
import { APP_URL } from "@/lib/utils";

type FeaturedProject = {
  id: string;
  title: string;
  category: string;
  expectedRoi: string;
  percentFunded: number;
  verifiedAt: string | null;
  landPhotoUrls: string[];
  farmer?: { farmName: string; location: string };
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1").replace(/\/$/, "");

function formatCategory(category: string) {
  const labels: Record<string, string> = {
    crops: "Crops",
    fish: "Fish",
    livestock: "Livestock",
    poultry: "Poultry",
  };
  return labels[category.toLowerCase()] ?? category.charAt(0).toUpperCase() + category.slice(1);
}

export function MarketplacePreview() {
  const [projects, setProjects] = useState<FeaturedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch(`${API_BASE}/projects/marketplace/featured`)
      .then((r) => r.json())
      .then((json: { success: boolean; data?: FeaturedProject[] }) => {
        if (json.success && json.data) setProjects(json.data);
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section id="marketplace">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          label="Marketplace"
          title="Live farm projects"
          description="Verified listings with funding progress and expected ROI — updated as farmers publish."
        />

        {loading && (
          <p className="text-center text-sm text-slate-500 py-12">Loading projects…</p>
        )}

        {!loading && projects.length === 0 && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-14 text-center">
            <p className="text-slate-400">No open projects yet.</p>
            <p className="mt-2 text-sm text-slate-500">
              When verified farmers publish listings, the top opportunities by funding progress will appear here.
            </p>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="grid gap-5 md:grid-cols-3">
            {projects.map((p) => (
              <Link key={p.id} href={`${APP_URL}/projects/${p.id}`}>
                <GlowCard className="overflow-hidden h-full hover:border-lime/20 transition-colors">
                  {p.landPhotoUrls[0] ? (
                    <img
                      src={p.landPhotoUrls[0]}
                      alt=""
                      className="h-36 w-full object-cover"
                    />
                  ) : (
                    <div className="h-36 bg-gradient-to-br from-[#1a2e1a] to-[#0d1f0d]" />
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white leading-snug">{p.title}</h3>
                      {p.verifiedAt && <Badge className="shrink-0">Verified</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{formatCategory(p.category)}</p>
                    {p.farmer && (
                      <p className="mt-1 text-xs text-slate-600 truncate">
                        {p.farmer.farmName} · {p.farmer.location}
                      </p>
                    )}
                    <div className="mt-4 flex justify-between text-sm">
                      <span className="text-lime font-semibold">{p.expectedRoi}% ROI</span>
                      <span className="text-slate-400">{p.percentFunded}% funded</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-lime transition-all"
                        style={{ width: `${p.percentFunded}%` }}
                      />
                    </div>
                  </div>
                </GlowCard>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href={`${APP_URL}/marketplace`}>
            <Button variant="outline">
              View marketplace <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
}
