import { useEffect, useState } from "react";
import { api, getToken, setToken } from "./lib/api";

type Overview = {
  farmers: number;
  projects: number;
  investments: number;
  totalRaisedUsdc: string;
  autoApproveFarmers: boolean;
  autoApproveProjects: boolean;
};

export default function App() {
  const [email, setEmail] = useState("admin@rootchain.local");
  const [password, setPassword] = useState("ChangeMeAdmin123!");
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [farmers, setFarmers] = useState<
    { id: string; farmName: string; verificationStatus: string; user: { email: string; fullName: string } }[]
  >([]);
  const [projects, setProjects] = useState<
    { id: string; title: string; status: string; fundingGoal: string; raisedAmount: string; farmer: string }[]
  >([]);

  async function load() {
    const [o, f, p] = await Promise.all([
      api<Overview>("/admin/overview"),
      api<typeof farmers>("/admin/farmers"),
      api<typeof projects>("/admin/projects"),
    ]);
    setOverview(o);
    setFarmers(f);
    setProjects(p);
  }

  useEffect(() => {
    if (getToken()) void load().catch(() => setToken(null));
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const data = await api<{ accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.accessToken);
      await load();
    } catch {
      setError("Invalid admin credentials");
    }
  }

  if (!getToken()) {
    return (
      <div className="min-h-screen p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-black">
          ROOT<span className="text-lime-400">CHAIN</span> Admin
        </h1>
        <form onSubmit={login} className="mt-8 space-y-4">
          <input
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <button type="submit" className="w-full rounded-lg bg-lime text-black font-bold py-2 text-sm">
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-black">
          ROOT<span className="text-lime-400">CHAIN</span> Admin
        </h1>
        <button
          type="button"
          className="text-sm text-slate-500"
          onClick={() => {
            setToken(null);
            setOverview(null);
          }}
        >
          Sign out
        </button>
      </header>

      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Stat label="Farmers" value={String(overview.farmers)} />
          <Stat label="Projects" value={String(overview.projects)} />
          <Stat label="Investments" value={String(overview.investments)} />
          <Stat label="Raised USDC" value={overview.totalRaisedUsdc} />
        </div>
      )}

      <p className="text-xs text-amber-300/90 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
        Dev mode: auto-approve farmers={String(overview?.autoApproveFarmers)} · projects=
        {String(overview?.autoApproveProjects)}. Set AUTO_APPROVE_*=false in server/.env for manual review.
      </p>

      <section>
        <h2 className="font-bold mb-3">Farmers</h2>
        <ul className="space-y-2 text-sm">
          {farmers.map((f) => (
            <li key={f.id} className="flex justify-between border border-white/10 rounded-lg px-3 py-2">
              <span>
                {f.farmName} — {f.user.fullName} ({f.user.email})
              </span>
              <span className="text-lime-400 capitalize">{f.verificationStatus}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-bold mb-3">Projects</h2>
        <ul className="space-y-2 text-sm">
          {projects.map((p) => (
            <li key={p.id} className="border border-white/10 rounded-lg px-3 py-2">
              <div className="font-bold">{p.title}</div>
              <div className="text-slate-500 text-xs">
                {p.farmer} · {p.status} · ${p.raisedAmount}/${p.fundingGoal}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 p-3">
      <div className="text-[10px] uppercase text-slate-500">{label}</div>
      <div className="font-bold text-lg">{value}</div>
    </div>
  );
}
