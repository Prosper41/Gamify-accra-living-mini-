"use client";

import { useEffect, useState } from "react";
import { getShopItems, purchaseShopItem, type ShopItem } from "@/lib/api/shop";
import { getPlayer } from "@/lib/api/player";
import type { Player } from "@/types/player";

type Props = {
  token: string;
  balance: number;
  onClose: () => void;
  onPlayerUpdated: (player: Player) => void;
};

export default function ShopPanel({ token, balance, onClose, onPlayerUpdated }: Props) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    getShopItems(token).then((result) => {
      if (active) setItems(result);
    }).catch((error: unknown) => {
      if (active) setMessage(error instanceof Error ? error.message : "Unable to load shop items");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  async function buy(item: ShopItem) {
    if (busyId !== null) return;
    setBusyId(item.id);
    setMessage("");
    try {
      await purchaseShopItem(token, item.id);
      const refreshed = await getPlayer(token);
      onPlayerUpdated(refreshed);
      setMessage(`Purchased ${item.name}! Energy and balance updated.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Purchase failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/75 p-4">
      <section role="dialog" aria-modal="true" aria-label="Adwoa's Provision Shop" className="w-full max-w-lg rounded-2xl border border-emerald-400/30 bg-slate-900 p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Accra Life Mini</p><h2 className="mt-1 text-2xl font-bold">Adwoa's Provision Shop</h2><p className="mt-1 text-sm text-slate-300">Balance: GH₵{Number(balance).toLocaleString("en-GH")}</p></div>
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-700 px-3 py-2 hover:bg-slate-600">Close ×</button>
        </div>
        {loading ? <p className="mt-6">Loading items...</p> : <div className="mt-6 space-y-3">{items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-800 p-4">
            <div><p className="font-semibold">{item.name}</p><p className="text-sm text-slate-300">GH₵{Number(item.price)} · +{item.energy_restore} energy</p></div>
            <button type="button" onClick={() => void buy(item)} disabled={busyId !== null || Number(balance) < Number(item.price)} className="rounded-lg bg-emerald-400 px-4 py-2 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">{busyId === item.id ? "Buying..." : "Buy"}</button>
          </div>
        ))}{items.length === 0 && <p className="text-slate-300">No items available.</p>}</div>}
        {message && <p role="status" className="mt-4 text-sm text-emerald-200">{message}</p>}
      </section>
    </div>
  );
}
