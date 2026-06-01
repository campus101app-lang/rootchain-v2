import { Link } from "react-router-dom";
import { Shell, Btn, Glass } from "../components/ui";

export function LandingPage() {
  return (
    <Shell>
      <header className="flex items-center justify-between mb-16">
        <div className="font-black text-xl tracking-tight">
          ROOT<span className="text-lime">CHAIN</span>
        </div>
        <Link to="/login">
          <Btn variant="ghost">Sign in</Btn>
        </Link>
      </header>

      <section className="text-center space-y-6 mb-16">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime/80">
          Stellar · USDC · Transparent ag finance
        </p>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
          The infrastructure layer for agricultural investment in Africa
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
          Verified farm projects. On-chain capital. Real-time transparency. Not crowdfunding — institutional
          financing built on Stellar.
        </p>
      </section>

      <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        <Glass className="p-8 space-y-4 hover:border-lime/30 transition-colors">
          <div className="text-[10px] font-bold uppercase text-slate-500">I manage land & crops</div>
          <h2 className="text-2xl font-black">Farm Owner</h2>
          <p className="text-sm text-slate-400">
            List maize, cocoa, livestock, or aquaculture projects. Get verified, raise USDC, publish milestone
            updates.
          </p>
          <Link to="/signup/farmer">
            <Btn className="w-full">Continue as Farm Owner</Btn>
          </Link>
        </Glass>

        <Glass className="p-8 space-y-4 hover:border-lime/30 transition-colors">
          <div className="text-[10px] font-bold uppercase text-slate-500">I deploy capital</div>
          <h2 className="text-2xl font-black">Investor</h2>
          <p className="text-sm text-slate-400">
            Discover verified farms, invest in USDC on Stellar, track ROI and on-chain settlement.
          </p>
          <Link to="/signup/investor">
            <Btn className="w-full">Continue as Investor</Btn>
          </Link>
        </Glass>
      </div>

      <div className="text-center mt-12">
        <Link to="/marketplace" className="text-sm text-lime hover:underline font-bold">
          Browse live projects →
        </Link>
        <p className="text-[11px] text-slate-600 mt-3">
          Testnet by default · Flip to mainnet via environment config
        </p>
      </div>
    </Shell>
  );
}
