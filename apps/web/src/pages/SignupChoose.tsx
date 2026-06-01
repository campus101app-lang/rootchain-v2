import { Link } from "react-router-dom";
import { ArrowRight, Sprout, TrendingUp } from "lucide-react";
import { Shell, Glass } from "../components/ui";

export function SignupChoosePage() {
  return (
    <Shell>
      <Link to="/" className="text-sm text-slate-500 hover:text-lime mb-8 inline-block">
        ← Home
      </Link>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black">Get started</h1>
          <p className="text-sm text-slate-500 mt-2">Choose how you want to use Rootchain.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/signup/farmer">
            <Glass className="p-6 h-full hover:border-lime/30 transition-colors group">
              <Sprout className="text-lime mb-4" size={28} />
              <h2 className="text-lg font-bold">Farm owner</h2>
              <p className="text-sm text-slate-500 mt-2">
                List your farm, set a funding goal, and raise USDC from investors on Stellar.
              </p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm text-lime font-semibold group-hover:gap-2 transition-all">
                Create farm account <ArrowRight size={14} />
              </span>
            </Glass>
          </Link>
          <Link to="/signup/investor">
            <Glass className="p-6 h-full hover:border-lime/30 transition-colors group">
              <TrendingUp className="text-lime mb-4" size={28} />
              <h2 className="text-lg font-bold">Investor</h2>
              <p className="text-sm text-slate-500 mt-2">
                Browse verified projects and invest USDC with on-chain transparency.
              </p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm text-lime font-semibold group-hover:gap-2 transition-all">
                Create investor account <ArrowRight size={14} />
              </span>
            </Glass>
          </Link>
        </div>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-lime hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </Shell>
  );
}
