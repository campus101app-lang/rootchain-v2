import Link from "next/link";
import { APP_URL } from "@/lib/utils";

const cols = [
  {
    title: "Product",
    links: [
      { href: "#features", label: "Features" },
      { href: "#marketplace", label: "Marketplace" },
      { href: `${APP_URL}/marketplace`, label: "Live app" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "#about", label: "About" },
      { href: "#transparency", label: "Transparency" },
      { href: "mailto:hello@rootchain.africa", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "#", label: "Privacy" },
      { href: "#", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-4">
        <div>
          <p className="font-bold text-white">
            ROOT<span className="text-lime">CHAIN</span>
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Transparent on-chain agricultural investment on Stellar.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{c.title}</p>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-lime">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-12 max-w-6xl px-4 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Rootchain · Powered by Stellar · USDC
      </p>
    </footer>
  );
}
