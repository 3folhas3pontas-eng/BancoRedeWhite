"use client";

import { useEffect, useRef } from "react";
import { PlayerStats, Enchantment, PickaxeTier } from "@/lib/game/types";
import { PICKAXE_TIERS, ENCHANTMENTS } from "@/lib/game/constants";

interface InventoryPanelProps {
  stats: PlayerStats;
  enchantments: Enchantment[];
  onClose: () => void;
}

// Minecraft inventory slot component
function Slot({
  children,
  label,
  highlight,
  size = 32,
}: {
  children?: React.ReactNode;
  label?: string;
  highlight?: boolean;
  size?: number;
}) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: highlight
          ? "linear-gradient(180deg, #8B8B8B 0%, #6D6D6D 100%)"
          : "linear-gradient(180deg, #8B8B8B 0%, #555555 100%)",
        border: "2px solid",
        borderTopColor: "#373737",
        borderLeftColor: "#373737",
        borderBottomColor: "#FFF",
        borderRightColor: "#FFF",
        boxShadow: "inset 1px 1px 0 #555",
        imageRendering: "pixelated",
      }}
    >
      {children}
      {label && (
        <span
          className="absolute -bottom-0.5 -right-0.5 text-[7px] font-bold font-mono"
          style={{ color: "#FFF", textShadow: "1px 1px 0 #3F3F3F" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// Pickaxe pixel art based on tier
function PickaxeIcon({ tier, size = 32 }: { tier: PickaxeTier; size?: number }) {
  const colors: Record<PickaxeTier, { head: string; handle: string; shine: string }> = {
    wood: { head: "#B4905A", handle: "#825432", shine: "#D4B07A" },
    stone: { head: "#9A9A9A", handle: "#825432", shine: "#BEBEBE" },
    iron: { head: "#D8D8D8", handle: "#825432", shine: "#FFFFFF" },
    gold: { head: "#FEFD2A", handle: "#825432", shine: "#FFFF9D" },
    diamond: { head: "#5DECF5", handle: "#825432", shine: "#A5FFF8" },
    netherite: { head: "#4D4143", handle: "#825432", shine: "#6D5C5E" },
  };
  const c = colors[tier];

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated" }}>
      {/* Handle */}
      <rect x="1" y="12" width="2" height="2" fill={c.handle} />
      <rect x="3" y="10" width="2" height="2" fill={c.handle} />
      <rect x="5" y="8" width="2" height="2" fill={c.handle} />
      <rect x="7" y="6" width="2" height="2" fill={c.handle} />
      {/* Head */}
      <rect x="9" y="2" width="2" height="2" fill={c.head} />
      <rect x="11" y="2" width="2" height="2" fill={c.head} />
      <rect x="13" y="2" width="2" height="2" fill={c.head} />
      <rect x="9" y="4" width="2" height="2" fill={c.head} />
      <rect x="11" y="4" width="2" height="2" fill={c.head} />
      <rect x="9" y="6" width="2" height="2" fill={c.head} />
      {/* Shine */}
      <rect x="11" y="2" width="1" height="1" fill={c.shine} />
      <rect x="13" y="2" width="1" height="1" fill={c.shine} />
    </svg>
  );
}

export default function InventoryPanel({ stats, enchantments, onClose }: InventoryPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key.toLowerCase() === "e") onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const tierData = PICKAXE_TIERS[stats.pickaxeTier];

  const rarityColors: Record<string, string> = {
    common: "#AAAAAA",
    uncommon: "#55FF55",
    rare: "#5555FF",
    epic: "#AA00AA",
    legendary: "#FFAA00",
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.65)" }}
    >
      <div
        ref={panelRef}
        style={{
          background: "#C6C6C6",
          border: "4px solid",
          borderTopColor: "#FFFFFF",
          borderLeftColor: "#FFFFFF",
          borderBottomColor: "#555555",
          borderRightColor: "#555555",
          boxShadow: "8px 8px 24px rgba(0,0,0,0.5)",
          padding: 7,
          imageRendering: "pixelated",
        }}
      >
        {/* Title */}
        <div
          className="text-center font-mono font-bold mb-1"
          style={{ color: "#404040", fontSize: 14, textShadow: "1px 1px 0 #FFF" }}
        >
          Inventario
        </div>

        {/* Main content area */}
        <div className="flex gap-3">
          {/* Left: Pickaxe preview (like player model area) */}
          <div className="flex flex-col items-center gap-1">
            {/* Dark preview area */}
            <div
              style={{
                width: 56,
                height: 72,
                background: "#8B8B8B",
                border: "2px solid",
                borderTopColor: "#373737",
                borderLeftColor: "#373737",
                borderBottomColor: "#FFF",
                borderRightColor: "#FFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <PickaxeIcon tier={stats.pickaxeTier} size={36} />
              <span
                className="text-[8px] font-mono font-bold"
                style={{ color: tierData.color || "#404040", textShadow: "1px 1px 0 #FFF" }}
              >
                {tierData.name}
              </span>
            </div>

            {/* Stats slots below */}
            <div className="flex gap-1">
              <Slot size={28} highlight>
                <span className="text-[9px] font-mono font-bold" style={{ color: "#FFAA00", textShadow: "1px 1px 0 #3F3F3F" }}>
                  {stats.pickStrength.toFixed(1)}
                </span>
              </Slot>
              <Slot size={28}>
                <span className="text-[9px] font-mono font-bold" style={{ color: "#55FFFF", textShadow: "1px 1px 0 #3F3F3F" }}>
                  {stats.pickSpeed.toFixed(1)}
                </span>
              </Slot>
            </div>
            <div className="flex gap-1 text-[7px] font-mono" style={{ color: "#404040" }}>
              <span>STR</span>
              <span>SPD</span>
            </div>
          </div>

          {/* Right: Stats grid */}
          <div className="flex flex-col gap-2">
            {/* Player stats */}
            <div
              style={{
                background: "#8B8B8B",
                border: "2px solid",
                borderTopColor: "#373737",
                borderLeftColor: "#373737",
                borderBottomColor: "#FFF",
                borderRightColor: "#FFF",
                padding: 6,
              }}
            >
              <div className="text-[9px] font-mono font-bold mb-1" style={{ color: "#404040" }}>
                STATS
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-[8px] font-mono" style={{ color: "#404040" }}>
                <span>Nivel</span>
                <span style={{ color: "#55FF55", fontWeight: "bold" }}>{stats.level}</span>
                <span>XP</span>
                <span style={{ color: "#AAFF00" }}>{stats.xp}</span>
                <span>Depth</span>
                <span style={{ color: "#55FFFF" }}>{stats.depth}m</span>
                <span>Blocos</span>
                <span>{stats.blocksMinedTotal}</span>
                <span>Combo</span>
                <span style={{ color: "#FFAA00" }}>{stats.maxCombo}x</span>
              </div>
            </div>

            {/* Enchantments mini grid */}
            <div
              style={{
                background: "#8B8B8B",
                border: "2px solid",
                borderTopColor: "#373737",
                borderLeftColor: "#373737",
                borderBottomColor: "#FFF",
                borderRightColor: "#FFF",
                padding: 6,
              }}
            >
              <div className="text-[9px] font-mono font-bold mb-1" style={{ color: "#404040" }}>
                ENCANTAMENTOS
              </div>
              <div className="flex flex-wrap gap-1" style={{ maxWidth: 140 }}>
                {enchantments.length === 0 ? (
                  <span className="text-[8px] font-mono" style={{ color: "#6D6D6D" }}>
                    Nenhum
                  </span>
                ) : (
                  enchantments.slice(0, 8).map((enc, i) => {
                    const encData = ENCHANTMENTS.find((e) => e.id === enc.id);
                    return (
                      <Slot key={i} size={24}>
                        <span
                          className="text-[8px] font-bold"
                          style={{ color: rarityColors[enc.rarity] || "#FFF", textShadow: "1px 1px 0 #3F3F3F" }}
                          title={`${encData?.name || enc.id} Lv.${enc.level}`}
                        >
                          {enc.level}
                        </span>
                      </Slot>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom hotbar - World upgrades */}
        <div style={{ borderTop: "1px solid #8B8B8B", marginTop: 6, paddingTop: 6 }}>
          <div className="text-[8px] font-mono text-center mb-1" style={{ color: "#6D6D6D" }}>
            UPGRADES
          </div>
          <div className="flex justify-center gap-1">
            <Slot size={28} label={`${stats.tntRadius}`}>
              <span style={{ fontSize: 12 }}>{"💥"}</span>
            </Slot>
            <Slot size={28} label={`${Math.round(stats.tntSpawn * 100)}%`}>
              <span style={{ fontSize: 10, color: "#FF5555" }}>T</span>
            </Slot>
            <Slot size={28} label={`${Math.round(stats.beaconSpawn * 100)}%`}>
              <span style={{ fontSize: 10, color: "#55FFFF" }}>B</span>
            </Slot>
            <Slot size={28} label={`${Math.round(stats.dungeonSpawn * 100)}%`}>
              <span style={{ fontSize: 10, color: "#AA00AA" }}>D</span>
            </Slot>
            <Slot size={28} label={`${Math.round(stats.chestSpawn * 100)}%`}>
              <span style={{ fontSize: 10, color: "#FFAA00" }}>C</span>
            </Slot>
          </div>
        </div>

        {/* Close hint */}
        <div className="text-center mt-1 text-[8px] font-mono" style={{ color: "#6D6D6D" }}>
          [E] ou [ESC] para fechar
        </div>
      </div>
    </div>
  );
}
