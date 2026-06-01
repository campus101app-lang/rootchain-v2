import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, getToken } from "../lib/api";
import { resolveAssetUrl } from "../lib/assets";
import type { Project } from "../types/project";
import { Shell, Glass, Btn, Field } from "../components/ui";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void api<Project>(`/projects/${id}`, { auth: false })
      .then(setProject)
      .catch(() => setError("Project not found"))
      .finally(() => setLoading(false));
  }, [id]);

  async function invest() {
    if (!id || !getToken()) {
      nav("/login");
      return;
    }
    setInvesting(true);
    setError("");
    try {
      const data = await api<{ stellarTxHash: string; amountUsdc: string }>("/investments", {
        method: "POST",
        body: JSON.stringify({ projectId: id, amountUsdc: Number(amount) }),
      });
      setTxHash(data.stellarTxHash);
      const refreshed = await api<Project>(`/projects/${id}`, { auth: false });
      setProject(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Investment failed");
    } finally {
      setInvesting(false);
    }
  }

  if (loading) return <Shell><p className="text-slate-500">Loading…</p></Shell>;
  if (!project) return <Shell><p className="text-rose-400">{error || "Not found"}</p></Shell>;

  const remaining = Math.max(0, Number(project.fundingGoal) - Number(project.raisedAmount));

  return (
    <Shell>
      <Link to="/marketplace" className="text-sm text-slate-500 hover:text-lime mb-6 inline-block">
        ← Marketplace
      </Link>

      <div className="grid lg:grid-cols-2 gap-6">
        <Glass className="p-6 space-y-4">
          {project.landPhotoUrls[0] && (
            <img
              src={resolveAssetUrl(project.landPhotoUrls[0])}
              alt=""
              className="w-full rounded-xl object-cover max-h-64"
            />
          )}
          <h1 className="text-2xl font-black">{project.title}</h1>
          <p className="text-sm text-slate-400">{project.description}</p>
          <div className="text-xs text-slate-500 space-y-1">
            <p>
              <span className="text-slate-600">Farm:</span> {project.farmer?.farmName} · {project.farmer?.location}
            </p>
            <p>
              <span className="text-slate-600">Owner:</span> {project.farmer?.ownerName}
            </p>
            <p>
              <span className="text-slate-600">Plan:</span> {project.farmPlan}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.landPhotoUrls.map((url) => (
              <img
                key={url}
                src={resolveAssetUrl(url)}
                alt=""
                className="w-20 h-20 rounded-lg object-cover"
              />
            ))}
          </div>
        </Glass>

        <Glass className="p-6 space-y-5 h-fit">
          <div>
            <div className="text-[10px] uppercase text-slate-500 font-bold">Funding progress</div>
            <div className="text-2xl font-black mt-1">
              ${project.raisedAmount}{" "}
              <span className="text-slate-500 text-lg font-normal">/ ${project.fundingGoal}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 mt-3 overflow-hidden">
              <div className="h-full bg-lime" style={{ width: `${project.percentFunded}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/[0.06] p-3">
              <div className="text-[10px] text-slate-500 uppercase">Expected ROI</div>
              <div className="font-bold text-lime">{project.expectedRoi}%</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] p-3">
              <div className="text-[10px] text-slate-500 uppercase">Duration</div>
              <div className="font-bold">{project.durationDays} days</div>
            </div>
          </div>

          {remaining > 0 ? (
            <>
              <Field
                label={`Invest USDC (max ${remaining.toFixed(2)} remaining)`}
                type="number"
                min="0.1"
                step="0.1"
                max={remaining}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {error && <p className="text-sm text-rose-400">{error}</p>}
              {txHash && (
                <p className="text-xs text-lime break-all">
                  On-chain tx: {txHash}
                </p>
              )}
              <Btn className="w-full" disabled={investing} onClick={() => void invest()}>
                {investing ? "Sending USDC on Stellar…" : "Invest with USDC"}
              </Btn>
              <p className="text-[10px] text-slate-600">
                Payment is signed from your custodial testnet wallet to platform escrow. Visible on Stellar
                Explorer.
              </p>
            </>
          ) : (
            <p className="text-amber-300 text-sm">This project is fully funded.</p>
          )}
        </Glass>
      </div>
    </Shell>
  );
}
