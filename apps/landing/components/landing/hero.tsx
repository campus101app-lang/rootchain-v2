"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { APP_URL } from "@/lib/utils";

const float = (delay: number) => ({
  y: [0, -10, 0],
  transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const, delay },
});

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-28 pb-20 md:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(132,204,22,0.15),transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-lime/5 blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16">
        <div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge className="mb-6">Stellar · USDC · On-chain ag finance</Badge>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-6xl">
              Transparent Agricultural Investing{" "}
              <span className="bg-gradient-to-r from-lime to-emerald-300 bg-clip-text text-transparent">
                Powered On-Chain
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 md:text-lg">
              Rootchain connects verified African farmers with global investors using Stellar blockchain,
              AI-powered risk analysis, and real-time agricultural transparency.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={`${APP_URL}/signup/investor`}>
                <Button className="px-6 py-3">
                  Start Investing <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href={`${APP_URL}/marketplace`}>
                <Button variant="outline" className="px-6 py-3">
                  Explore Farms
                </Button>
              </Link>
            </div>
            <p className="mt-8 text-xs text-slate-600">
              Not crowdfunding — institutional-grade infrastructure for African agriculture.
            </p>
          </motion.div>
        </div>

        <div className="relative mx-auto h-[420px] w-full max-w-lg lg:max-w-none">
          <motion.div animate={float(0)} className="absolute left-0 top-0 z-10 w-[58%]">
            <Card className="p-4 shadow-2xl">
              <div className="mb-2 flex items-center justify-between text-[10px] text-slate-500">
                <span>Portfolio ROI</span>
                <span className="text-lime">+24.8%</span>
              </div>
              <div className="flex h-16 items-end gap-1">
                {[40, 55, 45, 70, 62, 85, 78].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-lime/30" style={{ height: `${h}%` }} />
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div animate={float(0.5)} className="absolute right-0 top-8 z-20 w-[52%]">
            <Card className="border-lime/20 p-4 shadow-2xl">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Sparkles size={14} className="text-lime" />
                AI Risk Score
              </div>
              <p className="mt-2 text-3xl font-bold text-white">92</p>
              <p className="text-[10px] text-slate-500">Low risk · Verified farm</p>
            </Card>
          </motion.div>

          <motion.div animate={float(1)} className="absolute bottom-4 left-[12%] z-30 w-[76%]">
            <Card className="p-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[10px]">
                <span className="text-slate-500">Live on Stellar</span>
                <span className="font-mono text-lime">USDC → escrow</span>
              </div>
              <div className="mt-2 space-y-1.5 font-mono text-[10px] text-slate-400">
                <p className="truncate">tx 8f2a…c91 · $2,500 invested</p>
                <p className="truncate">tx 4b1e…7d2 · milestone verified</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            animate={float(1.5)}
            className="absolute -right-2 bottom-24 rounded-xl border border-white/10 bg-black/60 px-3 py-2 backdrop-blur"
          >
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp size={14} className="text-lime" />
              <span className="text-slate-300">$4.2M volume</span>
            </div>
          </motion.div>

          <motion.div
            animate={float(0.8)}
            className="absolute left-4 top-36 rounded-xl border border-white/10 bg-black/60 px-3 py-2 backdrop-blur"
          >
            <div className="flex items-center gap-2 text-xs">
              <Shield size={14} className="text-lime" />
              <span className="text-slate-300">Verified</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
