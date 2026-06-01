import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { resolveAssetUrl } from "../lib/assets";
import type { Project } from "../types/project";
import { Shell, Glass, Btn } from "../components/ui";

export function MarketplacePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api<Project[]>("/projects/marketplace", { auth: false })
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Shell>
      <header className="flex justify-between items-center mb-8">
        <Link to="/" className="font-black text-xl">
          ROOT<span className="text-lime">CHAIN</span>
        </Link>
        <div className="flex gap-2">
          <Link to="/dashboard">
            <Btn variant="ghost">Dashboard</Btn>
          </Link>
          <Link to="/login">
            <Btn variant="outline">Sign in</Btn>
          </Link>
        </div>
      </header>

      <div className="mb-8">
        <h1 className="text-3xl font-black">Live farm projects</h1>
        <p className="text-sm text-slate-500 mt-2">
          Verified listings · Invest with USDC on Stellar testnet
        </p>
      </div>

      {loading && <p className="text-slate-500">Loading marketplace…</p>}

      {!loading && projects.length === 0 && (
        <Glass className="p-8 text-center text-slate-500">
          No live projects yet. Farmers can publish after creating a project.
        </Glass>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map((p) => (
          <Glass key={p.id} className="overflow-hidden hover:border-lime/20 transition-colors">
            {p.landPhotoUrls[0] && (
              <img
                src={resolveAssetUrl(p.landPhotoUrls[0])}
                alt=""
                className="w-full h-40 object-cover border-b border-white/[0.06]"
              />
            )}
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <h2 className="font-bold text-lg leading-snug">{p.title}</h2>
                <span className="text-[10px] uppercase font-bold text-lime shrink-0">{p.category}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
              <div className="text-xs text-slate-400">
                {p.farmer?.farmName} · {p.farmer?.location}
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-lime transition-all"
                  style={{ width: `${p.percentFunded}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">
                  ${p.raisedAmount} / ${p.fundingGoal} USDC
                </span>
                <span className="text-lime font-bold">{p.expectedRoi}% ROI</span>
              </div>
              <div className="text-[10px] text-slate-600">
                {p.durationDays} days · {p.startDate} → {p.endDate}
              </div>
              <Link to={`/projects/${p.id}`}>
                <Btn className="w-full">View & invest</Btn>
              </Link>
            </div>
          </Glass>
        ))}
      </div>
    </Shell>
  );
}
