
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth/session";

const CityWorld = dynamic(
  () => import("@/components/game/CityWorld"),
  { ssr: false }
);

export default function GamePage() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(Boolean(getAccessToken()));
  }, []);

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08131a] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome to Accra Life</h1>
          <p className="mt-3 text-slate-400">
            Please sign in to enter the city.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-block rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#08131a]">
      <CityWorld />

      <div className="pointer-events-none absolute left-5 top-5 rounded-2xl border border-white/10 bg-slate-950/85 p-5 text-white">
        <h1 className="text-xl font-black">
          ACCRA <span className="text-emerald-400">LIFE</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">MINI EDITION</p>
        <p className="mt-4 text-sm">Explore the city</p>
        <p className="mt-1 text-xs text-slate-300">
          Move: W A S D or arrow keys
        </p>
      </div>
    </main>
  );
}
