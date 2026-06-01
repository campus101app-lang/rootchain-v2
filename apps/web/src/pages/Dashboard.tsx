import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";
import type { Project } from "../types/project";
import type { Investment } from "../types/project";
import { Shell, Btn, Glass } from "../components/ui";

export function DashboardPage() {
  const nav = useNavigate();
  const [me, setMe] = useState<{
    user: { fullName: string; role: string; email: string };
    wallet: { publicKey: string; funded: boolean; usdcTrustline: boolean } | null;
    farmerProfile?: { farmName: string; verificationStatus: string };
  } | null>(null);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [myInvestments, setMyInvestments] = useState<Investment[]>([]);

  useEffect(() => {
    void api<NonNullable<typeof me>>("/auth/me")
      .then(async (data) => {
        setMe(data);
        if (data.user.role === "farmer") {
          const projects = await api<Project[]>("/projects/mine");
          setMyProjects(projects);
        }
        if (data.user.role === "investor") {
          const inv = await api<Investment[]>("/investments/mine");
          setMyInvestments(inv);
        }
      })
      .catch(() => nav("/login"));
  }, [nav]);

  if (!me) return <Shell><p className="text-slate-500">Loading…</p></Shell>;

  const isFarmer = me.user.role === "farmer";
  const isInvestor = me.user.role === "investor";

  return (
    <Shell>
      <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <Link to="/" className="font-black text-xl">
          ROOT<span className="text-lime">CHAIN</span>
        </Link>
        <div className="flex gap-2 flex-wrap">
          <Link to="/marketplace">
            <Btn variant="outline">Marketplace</Btn>
          </Link>
          <Btn
            variant="ghost"
            onClick={() => {
              setToken(null);
              nav("/");
            }}
          >
            Sign out
          </Btn>
        </div>
      </header>

      <Glass className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-black">Welcome, {me.user.fullName}</h1>
          <p className="text-sm text-slate-400 capitalize">{me.user.role} workspace</p>
        </div>

        {me.wallet && (
          <div className="rounded-xl border border-white/[0.06] p-4 space-y-2 text-sm">
            <div className="text-[10px] uppercase text-slate-500 font-bold">Stellar wallet</div>
            <div className="font-mono text-xs break-all text-lime/90">{me.wallet.publicKey}</div>
            <div className="text-slate-400">
              Funded: {me.wallet.funded ? "Yes" : "No"} · USDC: {me.wallet.usdcTrustline ? "Yes" : "No"}
            </div>
          </div>
        )}

        {me.farmerProfile && (
          <div className="text-sm">
            <span className="text-slate-500">Farm:</span> {me.farmerProfile.farmName} ·{" "}
            <span className="text-lime">{me.farmerProfile.verificationStatus}</span>
          </div>
        )}

        {isFarmer && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold">Your projects</h2>
              <Link to="/farmer/projects/new">
                <Btn>Create project</Btn>
              </Link>
            </div>
            {myProjects.length === 0 ? (
              <p className="text-sm text-slate-500">No projects yet. Create one to appear on the marketplace.</p>
            ) : (
              <ul className="space-y-2">
                {myProjects.map((p) => (
                  <li key={p.id} className="flex justify-between items-center text-sm border border-white/[0.06] rounded-xl px-4 py-3">
                    <div>
                      <div className="font-bold">{p.title}</div>
                      <div className="text-slate-500 text-xs capitalize">{p.status} · {p.percentFunded}% funded</div>
                    </div>
                    <Link to={`/projects/${p.id}`} className="text-lime text-xs font-bold">
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {isInvestor && (
          <div className="space-y-4">
            <h2 className="font-bold">Your investments</h2>
            {myInvestments.length === 0 ? (
              <p className="text-sm text-slate-500">
                No investments yet.{" "}
                <Link to="/marketplace" className="text-lime hover:underline">
                  Browse projects
                </Link>
              </p>
            ) : (
              <ul className="space-y-2">
                {myInvestments.map((inv) => (
                  <li key={inv.id} className="text-sm border border-white/[0.06] rounded-xl px-4 py-3 space-y-1">
                    <div className="font-bold">{inv.project.title}</div>
                    <div className="text-slate-500">${inv.amountUsdc} USDC</div>
                    <div className="font-mono text-[10px] text-slate-600 break-all">{inv.stellarTxHash}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Glass>
    </Shell>
  );
}
