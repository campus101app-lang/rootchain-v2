import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";
import { Shell, Btn, Field, Glass } from "../components/ui";

export function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{
        accessToken: string;
        wallet: { publicKey: string } | null;
      }>("/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password }),
      });
      setToken(data.accessToken);
      if (!data.wallet) nav("/wallet/setup");
      else nav("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <Link to="/" className="text-sm text-slate-500 hover:text-lime mb-8 inline-block">
        ← Home
      </Link>
      <Glass className="p-8 max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-black">Sign in</h1>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <Btn type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign in"}
          </Btn>
        </form>
      </Glass>
    </Shell>
  );
}
