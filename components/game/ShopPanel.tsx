"use client";

import { PlayerStats, PickaxeTier } from "@/lib/game/types";
import { PICKAXE_TIERS, TIER_ORDER } from "@/lib/game/constants";
import { audioService } from "@/lib/game/audio";

interface ShopPanelProps {
  stats: PlayerStats;
  bankBalance: number;
  onUpgrade: (type: "strength" | "speed") => void;
  onUpgradeTier: () => void;
  onShopUpgrade: (type: "tntRadius" | "tntSpawn" | "beaconSpawn" | "dungeonSpawn" | "chestSpawn") => void;
  onClose: () => void;
}

// Pixel art villager drawn with CSS
function PixelVillager() {
  return (
    <div className="relative flex flex-col items-center" style={{ imageRendering: "pixelated" }}>
      <div className="relative" style={{ width: 48, height: 48 }}>
        <div className="absolute" style={{ top: 4, left: 4, width: 40, height: 40, background: "#C8A882", borderRadius: 2 }} />
        <div className="absolute" style={{ top: 0, left: 0, width: 48, height: 8, background: "#5D7434" }} />
        <div className="absolute" style={{ top: -10, left: 10, width: 28, height: 14, background: "#5D7434", borderRadius: "2px 2px 0 0" }} />
        <div className="absolute" style={{ top: 20, left: 12, width: 6, height: 4, background: "#3E2723" }} />
        <div className="absolute" style={{ top: 20, left: 30, width: 6, height: 4, background: "#3E2723" }} />
        <div className="absolute" style={{ top: 16, left: 10, width: 10, height: 3, background: "#5D4037" }} />
        <div className="absolute" style={{ top: 16, left: 28, width: 10, height: 3, background: "#5D4037" }} />
        <div className="absolute" style={{ top: 24, left: 18, width: 12, height: 10, background: "#A0825C", borderRadius: 1 }} />
        <div className="absolute" style={{ top: 30, left: 18, width: 12, height: 4, background: "#8B6F4E" }} />
      </div>
      <div className="relative" style={{ width: 40, height: 36, marginTop: -2 }}>
        <div className="absolute" style={{ top: 0, left: 0, width: 40, height: 36, background: "#7B5B3A" }} />
        <div className="absolute" style={{ top: 0, left: 17, width: 6, height: 36, background: "#6B4B2A" }} />
        <div className="absolute" style={{ top: 0, left: 4, width: 32, height: 6, background: "#F5F5F5" }} />
        <div className="absolute" style={{ top: 4, left: -8, width: 10, height: 24, background: "#7B5B3A", borderRadius: 1 }} />
        <div className="absolute" style={{ top: 4, left: 38, width: 10, height: 24, background: "#7B5B3A", borderRadius: 1 }} />
        <div className="absolute" style={{ top: 24, left: -6, width: 8, height: 6, background: "#C8A882" }} />
        <div className="absolute" style={{ top: 24, left: 38, width: 8, height: 6, background: "#C8A882" }} />
      </div>
    </div>
  );
}

type ShopUpgradeType = "tntRadius" | "tntSpawn" | "beaconSpawn" | "dungeonSpawn" | "chestSpawn";

const SHOP_UPGRADES: {
  type: ShopUpgradeType;
  name: string;
  desc: string;
  icon: string;
  color: string;
  maxLevel: number;
  cost: (lv: number) => number;
}[] = [
  { type: "tntRadius", name: "TNT Power", desc: "Explosion radius +1", icon: "\uD83D\uDCA5", color: "#FF1744", maxLevel: 5, cost: (lv) => Math.ceil(500 * Math.pow(2.0, lv)) },
  { type: "tntSpawn", name: "TNT Luck", desc: "More TNT spawns", icon: "\uD83E\uDDE8", color: "#FF5722", maxLevel: 10, cost: (lv) => Math.ceil(300 * Math.pow(1.8, lv)) },
  { type: "beaconSpawn", name: "Beacon Luck", desc: "More beacons", icon: "\uD83D\uDD2E", color: "#79F2F2", maxLevel: 8, cost: (lv) => Math.ceil(1000 * Math.pow(2.2, lv)) },
  { type: "dungeonSpawn", name: "Dungeon Luck", desc: "More dungeons", icon: "\uD83C\uDFF0", color: "#9C27B0", maxLevel: 8, cost: (lv) => Math.ceil(800 * Math.pow(2.0, lv)) },
  { type: "chestSpawn", name: "Barrel Luck", desc: "More barrels", icon: "\uD83E\uDEA3", color: "#8D6E63", maxLevel: 10, cost: (lv) => Math.ceil(200 * Math.pow(1.6, lv)) },
];

export default function ShopPanel({
  stats,
  bankBalance,
  onUpgrade,
  onUpgradeTier,
  onShopUpgrade,
  onClose,
}: ShopPanelProps) {
  const currentTierIndex = TIER_ORDER.indexOf(stats.pickaxeTier);
  const nextTier = currentTierIndex < TIER_ORDER.length - 1 ? TIER_ORDER[currentTierIndex + 1] : null;
  const nextTierData = nextTier ? PICKAXE_TIERS[nextTier] : null;
  const currentTierData = PICKAXE_TIERS[stats.pickaxeTier];

  const strengthCost = Math.ceil(50 * Math.pow(1.4, stats.pickStrength));
  const speedCost = Math.ceil(80 * Math.pow(1.5, stats.pickSpeed));

  const tierColors: Record<PickaxeTier, string> = {
    wood: "#8B5E3C", stone: "#9E9E9E", iron: "#D7CCC8",
    gold: "#FBC02D", diamond: "#00E5FF", netherite: "#4A3B4A",
  };

  function ShopButton({ label, sublabel, iconContent, iconColor, cost, canAfford, onClick, disabled }: {
    label: string; sublabel: string; iconContent: React.ReactNode; iconColor: string;
    cost: number; canAfford: boolean; onClick: () => void; disabled?: boolean;
  }) {
    return (
      <button
        onClick={() => { audioService.playClick(); onClick(); }}
        disabled={!canAfford || disabled}
        className="w-full flex items-center gap-2 p-2 transition-all active:scale-[0.98] disabled:opacity-40"
        style={{
          background: canAfford && !disabled ? "linear-gradient(180deg, #3A3A3A 0%, #2A2A2A 100%)" : "#222",
          border: `2px solid ${canAfford && !disabled ? iconColor + "50" : "#333"}`,
        }}
      >
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0"
          style={{ background: "#1A1A1A", border: "2px solid #444" }}>
          {iconContent}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="font-mono font-bold text-[11px] truncate" style={{ color: iconColor, textShadow: "1px 1px 0 #000" }}>
            {label}
          </div>
          <div className="font-mono text-[9px]" style={{ color: "#777" }}>{sublabel}</div>
        </div>
        <div className="px-2 py-1 font-mono font-bold text-[10px] flex-shrink-0"
          style={{
            background: canAfford && !disabled ? "#2E7D32" : "#333",
            border: "2px solid", borderColor: canAfford && !disabled ? "#4CAF50" : "#444",
            color: canAfford && !disabled ? "#FFEB3B" : "#666", textShadow: "1px 1px 0 #000",
          }}>
          {disabled ? "MAX" : "$" + cost.toLocaleString()}
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === e.currentTarget) { audioService.playClick(); onClose(); } }}>
      <div className="w-full max-w-sm relative overflow-hidden"
        style={{ background: "#1C1C1C", border: "4px solid #3C3C3C", boxShadow: "inset 0 0 0 2px #555, 0 8px 40px rgba(0,0,0,0.7)", imageRendering: "pixelated" }}>

        {/* Header */}
        <div className="relative flex items-center justify-center py-3"
          style={{ background: "linear-gradient(180deg, #484848 0%, #2C2C2C 100%)", borderBottom: "2px solid #555" }}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 scale-[0.55] origin-left"><PixelVillager /></div>
          <span className="font-mono font-bold text-sm tracking-wider" style={{ color: "#E0E0E0", textShadow: "2px 2px 0 #000" }}>
            VILLAGE SHOP
          </span>
          <button onClick={() => { audioService.playClick(); onClose(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center font-mono font-bold text-xs"
            style={{ background: "linear-gradient(180deg, #C0392B 0%, #922B21 100%)", border: "2px solid #E74C3C", color: "#fff", textShadow: "1px 1px 0 #000" }}>
            X
          </button>
        </div>

        {/* Villager speech */}
        <div className="flex items-start gap-3 px-4 pt-3 pb-2">
          <div className="flex-shrink-0 scale-[0.7] origin-top-left"><PixelVillager /></div>
          <div className="flex-1 px-3 py-2 relative" style={{ background: "#2A2A2A", border: "2px solid #555" }}>
            <div className="absolute -left-2 top-3" style={{ width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "8px solid #555" }} />
            <p className="font-mono text-xs" style={{ color: "#A0A0A0" }}>
              {"Current: "}<span style={{ color: tierColors[stats.pickaxeTier] }}>{currentTierData.name}</span>
            </p>
            <p className="font-mono text-[10px] mt-1" style={{ color: "#666" }}>
              {"Saldo: "}<span style={{ color: "#72E8F6" }}>{"R$ " + bankBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>

        {/* Scrollable items */}
        <div className="px-3 pb-3 flex flex-col gap-1.5 max-h-[55vh] overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#555 #1C1C1C" }}>

          {/* Section: Pickaxe */}
          <div className="font-mono text-[10px] font-bold px-1 pt-1 pb-0.5" style={{ color: "#888", borderBottom: "1px solid #333" }}>
            PICKAXE
          </div>

          {nextTier && nextTierData && (
            <ShopButton
              label={nextTierData.name}
              sublabel={"STR " + nextTierData.strength + "x | SPD " + nextTierData.speed + "x"}
              iconContent={<span style={{ color: tierColors[nextTier], fontSize: 14, textShadow: "1px 1px 0 #000" }}>{"\u26CF"}</span>}
              iconColor={tierColors[nextTier]}
              cost={nextTierData.cost}
              canAfford={bankBalance >= nextTierData.cost}
              onClick={onUpgradeTier}
            />
          )}

          <ShopButton
            label={"Strength (Lv." + stats.pickStrength.toFixed(1) + ")"}
            sublabel="Breaks blocks faster"
            iconContent={<span style={{ color: "#EF5350", fontSize: 14, textShadow: "1px 1px 0 #000" }}>{"\u2694"}</span>}
            iconColor="#EF5350"
          cost={strengthCost}
          canAfford={bankBalance >= strengthCost}
            onClick={() => onUpgrade("strength")}
          />

          <ShopButton
            label={"Speed (Lv." + stats.pickSpeed.toFixed(1) + ")"}
            sublabel="Fall and dig faster"
            iconContent={<span style={{ color: "#42A5F5", fontSize: 14, textShadow: "1px 1px 0 #000" }}>{"\u26A1"}</span>}
            iconColor="#42A5F5"
          cost={speedCost}
          canAfford={bankBalance >= speedCost}
            onClick={() => onUpgrade("speed")}
          />

          {/* Section: World Upgrades */}
          <div className="font-mono text-[10px] font-bold px-1 pt-2 pb-0.5" style={{ color: "#888", borderBottom: "1px solid #333" }}>
            WORLD UPGRADES
          </div>

          {SHOP_UPGRADES.map((upg) => {
            const currentLv = stats[upg.type];
            const isMaxed = currentLv >= upg.maxLevel;
            const cost = upg.cost(currentLv);
            return (
              <ShopButton
                key={upg.type}
                label={upg.name + " (Lv." + currentLv + "/" + upg.maxLevel + ")"}
                sublabel={upg.desc}
                iconContent={<span style={{ fontSize: 14 }}>{upg.icon}</span>}
                iconColor={upg.color}
                cost={cost}
                canAfford={bankBalance >= cost}
                onClick={() => onShopUpgrade(upg.type)}
                disabled={isMaxed}
              />
            );
          })}
        </div>

        <div className="h-2" style={{ background: "linear-gradient(180deg, #2C2C2C 0%, #484848 100%)", borderTop: "2px solid #555" }} />
      </div>
    </div>
  );
}
