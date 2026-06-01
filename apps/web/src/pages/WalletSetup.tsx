import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Shell, Btn, Glass } from "../components/ui";

type WalletState = {
  publicKey: string;
  funded: boolean;
  usdcTrustline: boolean;
  warnings?: string[];
};

export function WalletSetupPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const initial = (loc.state as { wallet?: WalletState })?.wallet;
  const [wallet, setWallet] = useState<WalletState | null>(initial ?? null);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState("");

  async function provision() {
    setLoading(true);
    setError("");
    try {
      const data = await api<{ wallet: WalletState & { warnings?: string[] } }>("/wallets/provision", {
        method: "POST",
      });
      setWallet(data.wallet);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet setup failed");
    } finally {
      setLoading(false);
    }
  }

  if (!wallet && loading) {
    void provision();
  }

  return (
    <Shell>
      <Glass className="p-8 max-w-lg mx-auto space-y-6">
        <div>
          <p className="text-[10px] font-bold uppercase text-lime tracking-wider">Step 2 · Stellar wallet</p>
          <h1 className="text-2xl font-black mt-2">Your on-chain account</h1>
          <p className="text-sm text-slate-500 mt-2">
            Testnet: we fund XLM via Friendbot and add the USDC trustline automatically.
          </p>
        </div>

        {loading && <p className="text-sm text-slate-400 animate-pulse">Provisioning wallet on Stellar testnet…</p>}

        {wallet && (
          <div className="space-y-3 text-sm font-mono">
            <Row label="Public key" value={wallet.publicKey} />
            <Row label="XLM funded" value={wallet.funded ? "Yes" : "Pending"} ok={wallet.funded} />
            <Row label="USDC trustline" value={wallet.usdcTrustline ? "Active" : "Pending"} ok={wallet.usdcTrustline} />
            {wallet.warnings?.map((w) => (
              <p key={w} className="text-amber-300/90 text-xs font-sans">
                {w}
              </p>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex gap-3">
          {!wallet?.funded && (
            <Btn variant="outline" onClick={() => void provision()} disabled={loading}>
              Retry setup
            </Btn>
          )}
          <Btn className="flex-1" onClick={() => nav("/dashboard")} disabled={loading || !wallet}>
            Continue to dashboard
          </Btn>
        </div>
      </Glass>
    </Shell>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.06] px-3 py-2 flex justify-between gap-2 items-start">
      <span className="text-slate-500 text-xs font-sans shrink-0">{label}</span>
      <span className={`text-right break-all ${ok === false ? "text-amber-300" : ok ? "text-lime" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}
