"use client";

import { Heart, Zap, Wallet, Users, Package, MapPin, ShoppingBag, LogOut } from "lucide-react";
import type { Player } from "@/types/player";

type InteractionAction = "pickup" | "complete" | "shop";

type GameHudProps = {
  onLogout: () => void;
  player: Player;
  onlinePlayers: number;
  availableAction?: InteractionAction | null;
  deliveryBusy?: boolean;
  deliveryMessage?: string;
  activeDelivery?: { reward: number; destination_x: number; destination_z: number } | null;
};

export default function GameHud({ onLogout, player, onlinePlayers, availableAction = null, deliveryBusy = false, deliveryMessage = "", activeDelivery = null }: GameHudProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/90 p-4 text-white shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold tracking-widest text-emerald-400">ACCRA LIFE MINI</p>
          <h2 className="mt-2 text-xl font-bold">Welcome, {player.character_name}</h2>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="min-w-0 rounded-xl bg-slate-800 p-3"><Wallet className="mb-2 h-5 w-5 text-emerald-400" /><p className="text-xs text-slate-400">Balance</p><p className="break-words text-sm font-bold text-emerald-400">GH₵{Number(player.balance).toLocaleString("en-GH")}</p></div>
            <div className="min-w-0 rounded-xl bg-slate-800 p-3"><Heart className="mb-2 h-5 w-5 text-red-400" /><p className="text-xs text-slate-400">Health</p><p className="text-sm font-bold">{player.health}%</p></div>
            <div className="min-w-0 rounded-xl bg-slate-800 p-3"><Zap className="mb-2 h-5 w-5 text-yellow-400" /><p className="text-xs text-slate-400">Energy</p><p className="text-sm font-bold">{player.energy}%</p></div>
          </div>
        </div>
        <div className="flex items-center gap-2"><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white shadow-lg backdrop-blur-md"><Users className="h-4 w-4 text-emerald-400" /><span>{onlinePlayers} Online</span></div><button type="button" onClick={onLogout} className="pointer-events-auto flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white shadow-lg hover:bg-slate-800" aria-label="Log out"><LogOut className="h-4 w-4" /><span>Logout</span></button></div>
      </div>
      {activeDelivery && <div className="absolute right-4 top-24 w-60 rounded-xl border border-emerald-400/20 bg-slate-950/90 p-4 text-white shadow-lg backdrop-blur-md"><div className="flex items-center gap-2"><Package className="h-5 w-5 text-emerald-400" /><p className="font-bold text-emerald-400">Active Delivery</p></div><p className="mt-3 text-sm text-slate-300">Reward: <span className="font-bold text-white">GH₵{activeDelivery.reward.toLocaleString("en-GH")}</span></p><div className="mt-2 flex items-center gap-2 text-xs text-slate-300"><MapPin className="h-4 w-4 text-emerald-400" /><span>Destination: ({activeDelivery.destination_x}, {activeDelivery.destination_z})</span></div></div>}
      {deliveryMessage && <div className="absolute right-4 top-52 max-w-xs rounded-xl border border-white/10 bg-slate-950/95 p-4 text-sm text-white shadow-xl">{deliveryMessage}</div>}
      {availableAction && <div className="absolute bottom-24 left-1/2 w-max max-w-[90vw] -translate-x-1/2 rounded-xl border border-emerald-400/30 bg-slate-950/95 px-6 py-4 text-center text-white shadow-xl"><div className="flex items-center justify-center gap-2">{availableAction === "shop" ? <ShoppingBag className="h-5 w-5 text-emerald-400" /> : <Package className="h-5 w-5 text-emerald-400" />}<p className="text-sm font-bold">{availableAction === "shop" ? "Press E to Open Shop" : deliveryBusy ? "Processing delivery..." : availableAction === "pickup" ? "Press E to accept delivery" : "Press E to complete delivery"}</p></div></div>}
      <div className="absolute bottom-5 left-1/2 w-max max-w-[90vw] -translate-x-1/2 rounded-xl bg-slate-950/80 px-5 py-3 text-center text-xs font-medium text-white backdrop-blur-md">Move with W A S D or Arrow Keys</div>
    </div>
  );
}
