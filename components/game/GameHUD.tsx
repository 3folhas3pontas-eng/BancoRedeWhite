"use client";

import { useState } from 'react';
import { PlayerStats, PickaxeTier, Enchantment } from "@/lib/game/types";
import { PICKAXE_TIERS, TIER_ORDER } from "@/lib/game/constants";
import InventoryPanel from "./InventoryPanel";

interface GameHUDProps {
  stats: PlayerStats;
  bankBalance: number;
  enchantments: Enchantment[];
}

function getTierLabel(tier: PickaxeTier): string {
  return PICKAXE_TIERS[tier].name;
}

function getTierColor(tier: PickaxeTier): string {
  const colors: Record<PickaxeTier, string> = {
    wood: "#8B5E3C",
    stone: "#9E9E9E",
    iron: "#D7CCC8",
    gold: "#FBC02D",
    diamond: "#00E5FF",
    netherite: "#4A3B4A",
  };
  return colors[tier];
}

export default function GameHUD({ stats, bankBalance, enchantments }: GameHUDProps) {
  const [showInventory, setShowInventory] = useState(false);
  const xpToNext = stats.level * 500;
  const progress = Math.min((stats.xp / xpToNext) * 100, 100);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="flex flex-col items-center gap-2 p-3 w-full max-w-lg mx-auto">
          {/* Main HUD bar */}
          <div
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-2xl border pointer-events-auto"
            style={{
              background: "rgba(10, 10, 15, 0.85)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
          {/* Level + XP */}
          <div className="flex flex-col items-start min-w-0">
            <span
              className="text-[10px] font-bold tracking-widest"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {"LVL " + stats.level}
            </span>
            <div
              className="w-24 h-1.5 rounded-full mt-0.5 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #4CAF50, #8BC34A)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Saldo do banco */}
          <div className="flex flex-col items-center">
            <span
              className="text-[9px] font-bold tracking-widest"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              SALDO
            </span>
            <span
              className="text-base font-bold tabular-nums"
              style={{ color: "#72E8F6" }}
            >
              {"R$ " + bankBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Depth */}
          <div className="flex flex-col items-end">
            <span
              className="text-[10px] font-bold tracking-widest"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              DEPTH
            </span>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: "#E0E0E0" }}
            >
              {"-" + stats.depth + "m"}
            </span>
          </div>
        </div>

        {/* Pickaxe tier + Combo + Inventory */}
        <div className="flex items-center justify-between w-full px-1">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(10,10,15,0.7)",
              color: getTierColor(stats.pickaxeTier),
              border: `1px solid ${getTierColor(stats.pickaxeTier)}33`,
            }}
          >
            {getTierLabel(stats.pickaxeTier)}
          </span>

          {stats.combo > 2 && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full animate-pulse"
              style={{
                background: "rgba(255, 152, 0, 0.2)",
                color: "#FF9800",
                border: "1px solid rgba(255, 152, 0, 0.3)",
              }}
            >
              {stats.combo + "x COMBO"}
            </span>
          )}

          {/* Botão Inventário */}
          <button
            onClick={() => setShowInventory(true)}
            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all active:scale-95 pointer-events-auto"
            style={{
              background: "rgba(114, 232, 246, 0.15)",
              color: "#72E8F6",
              border: "1px solid rgba(114, 232, 246, 0.3)",
              cursor: "pointer",
            }}
          >
            INV
          </button>
        </div>
      </div>
    </div>

    {/* Inventory Panel */}
    {showInventory && (
      <InventoryPanel
        stats={stats}
        enchantments={enchantments}
        onClose={() => setShowInventory(false)}
      />
    )}
    </>
  );
}
