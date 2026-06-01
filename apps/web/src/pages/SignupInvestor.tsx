import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";
import { Shell, Btn, Field, Glass } from "../components/ui";

export function SignupInvestorPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    country: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{
        accessToken: string;
        user: { fullName: string };
        wallet: { publicKey: string; funded: boolean; usdcTrustline: boolean } | null;
      }>("/auth/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify({
          role: "investor",
          ...form,
          provisionWallet: true,
        }),
      });
      setToken(data.accessToken);
      nav("/wallet/setup", { state: { wallet: data.wallet, name: data.user.fullName } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <Link to="/" className="text-sm text-slate-500 hover:text-lime mb-8 inline-block">
        ← Back
      </Link>
      <Glass className="p-8 max-w-md mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black">Investor account</h1>
          <p className="text-sm text-slate-500 mt-1">We create your Stellar testnet wallet after signup.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Full name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Field label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Field label="Password" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Field label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Field label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <Btn type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account…" : "Create account & wallet"}
          </Btn>
        </form>
      </Glass>
    </Shell>
  );
}
