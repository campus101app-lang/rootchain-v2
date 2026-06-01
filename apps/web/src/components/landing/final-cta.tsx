
import { Link } from "react-router-dom";
import { Button } from "../marketing-ui/button";

export function FinalCta() {
  return (
    <section className="relative mx-4 mb-24 overflow-hidden rounded-3xl border border-white/[0.08] md:mx-auto md:max-w-6xl">
      <div className="absolute inset-0 bg-gradient-to-br from-lime/10 via-transparent to-emerald-900/20" />
      <div className="relative px-8 py-20 text-center md:py-28">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
          Building the financial infrastructure
          <br />
          for African agriculture
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Join farmers and investors building a transparent, on-chain future for ag finance.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/signup/farmer">
            <Button className="px-8 py-3">List Your Farm</Button>
          </Link>
          <Link to="/signup/investor">
            <Button variant="secondary" className="px-8 py-3">
              Become an Investor
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
