
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "../marketing-ui/button";
import { cn } from "../../lib/cn";

const links = [
  { href: "#features", label: "Features" },
  { href: "#marketplace", label: "Marketplace" },
  { href: "#transparency", label: "Transparency" },
  { href: "#investors", label: "Investors" },
  { href: "#farmers", label: "Farmers" },
  { href: "#about", label: "About" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-white/[0.06] bg-[#06080c]/80 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-[4.5rem]">
        <Link to="/" className="font-bold tracking-tight text-white">
          ROOT<span className="text-lime">CHAIN</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/signup/investor">
            <Button>Launch App</Button>
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white/[0.06] bg-[#06080c]/95 px-4 py-4 backdrop-blur-xl md:hidden"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block py-2 text-sm text-slate-300"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Login
              </Button>
            </Link>
            <Link to="/signup/investor">
              <Button className="w-full">Launch App</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}
