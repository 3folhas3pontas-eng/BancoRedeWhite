"use client";

import { useState, useEffect, useRef } from "react";
import { PlayerStats, Enchantment, Rarity, PickaxeTier } from "@/lib/game/types";
import {
  ENCHANTMENTS,
  RARITY_COLORS,
  ENCHANT_COST,
  RECYCLE_COST,
  PICKAXE_TIERS,
} from "@/lib/game/constants";
import { audioService } from "@/lib/game/audio";

// Texturas das picaretas
const PICKAXE_TEXTURES: Record<PickaxeTier, string> = {
  wood: "https://minecraft.wiki/images/Wooden_Pickaxe_JE2_BE2.png",
  stone: "https://minecraft.wiki/images/Stone_Pickaxe_JE2_BE2.png",
  iron: "https://minecraft.wiki/images/Iron_Pickaxe_JE2_BE2.png",
  gold: "https://minecraft.wiki/images/Golden_Pickaxe_JE2_BE2.png",
  diamond: "https://minecraft.wiki/images/Diamond_Pickaxe_JE2_BE2.png",
  netherite: "https://minecraft.wiki/images/Netherite_Pickaxe_JE2_BE1.png",
};

interface EnchantPanelProps {
  stats: PlayerStats;
  enchantments: Enchantment[];
  bankBalance: number;
  onEnchant: () => void;
  onRecycle: () => void;
  onClose: () => void;
}

// Animated floating glyphs
function FloatingGlyphs() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    interface Glyph {
      x: number;
      y: number;
      char: string;
      alpha: number;
      speed: number;
      size: number;
    }

    const particles: Glyph[] = [];
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * 320,
        y: Math.random() * 60 + 60,
        char: glyphs[Math.floor(Math.random() * glyphs.length)],
        alpha: Math.random() * 0.3 + 0.1,
        speed: 0.3 + Math.random() * 0.4,
        size: 10 + Math.random() * 8,
      });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, 320, 120);
      for (const p of particles) {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = "#9C27B0";
        ctx.font = `bold ${p.size}px serif`;
        ctx.fillText(p.char, p.x, p.y);
        p.y -= p.speed;
        p.alpha -= 0.003;
        if (p.y < 0 || p.alpha <= 0) {
          p.y = 120;
          p.x = Math.random() * 320;
          p.alpha = Math.random() * 0.3 + 0.1;
          p.char = glyphs[Math.floor(Math.random() * glyphs.length)];
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={120}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

export default function EnchantPanel({
  stats,
  enchantments,
  bankBalance,
  onEnchant,
  onRecycle,
  onClose,
}: EnchantPanelProps) {
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<Enchantment | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const canAffordEnchantXP = stats.xp >= ENCHANT_COST.xp;
  const canAffordEnchantCoins = bankBalance >= ENCHANT_COST.coins;
  
  // Verifica se ainda tem encantamentos disponiveis (tipos nao obtidos)
  const typesObtidos = enchantments.map(e => e.type);
  const hasAvailableEnchants = ENCHANTMENTS.some(e => !typesObtidos.includes(e.type));
  const canAffordEnchant = canAffordEnchantXP && canAffordEnchantCoins && hasAvailableEnchants;
  
  const canAffordRecycleXP = stats.xp >= RECYCLE_COST.xp;
  const canAffordRecycleCoins = bankBalance >= RECYCLE_COST.coins;
  const canAffordRecycle = canAffordRecycleXP && canAffordRecycleCoins && enchantments.length > 0;

  const pickaxeData = PICKAXE_TIERS[stats.pickaxeTier];

  const handleEnchant = () => {
    if (!canAffordEnchant || spinning) return;
    setSpinning(true);
    setShowResult(false);
    audioService.playClick();

    setTimeout(() => {
      onEnchant();
      setSpinning(false);
      setShowResult(true);
    }, 1200);
  };

  const handleRecycle = () => {
    if (!canAffordRecycle || spinning) return;
    audioService.playClick();
    onRecycle();
  };

  useEffect(() => {
    if (enchantments.length > 0) {
      setLastResult(enchantments[enchantments.length - 1]);
    }
  }, [enchantments]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          audioService.playClick();
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-md relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
          border: "3px solid #4a1942",
          borderRadius: 8,
          boxShadow: "0 0 40px rgba(156, 39, 176, 0.3), inset 0 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="relative flex items-center justify-between px-4 py-3"
          style={{
            background: "linear-gradient(90deg, #4a1942 0%, #1a1a2e 50%, #4a1942 100%)",
            borderBottom: "2px solid #6a1b9a",
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 20 }}>{"✨"}</span>
            <span
              className="font-bold text-base tracking-wide"
              style={{ color: "#e1bee7", textShadow: "0 0 10px rgba(156, 39, 176, 0.5)" }}
            >
              MESA DE ENCANTAMENTOS
            </span>
          </div>
          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center font-bold text-sm rounded"
            style={{
              background: "linear-gradient(180deg, #c62828 0%, #8e0000 100%)",
              border: "2px solid #ef5350",
              color: "#fff",
            }}
          >
            X
          </button>
        </div>

        {/* Pickaxe Display */}
        <div className="relative p-4" style={{ minHeight: 120 }}>
          <FloatingGlyphs />
          
          <div className="relative z-10 flex items-center gap-4">
            {/* Pickaxe Icon */}
            <div
              className="w-20 h-20 flex items-center justify-center rounded-lg"
              style={{
                background: "linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%)",
                border: `3px solid ${pickaxeData.color}`,
                boxShadow: `0 0 15px ${pickaxeData.color}40`,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  backgroundImage: `url(${PICKAXE_TEXTURES[stats.pickaxeTier]})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  imageRendering: "pixelated",
                }}
              />
            </div>
            
            {/* Pickaxe Info */}
            <div className="flex-1">
              <div
                className="font-bold text-sm mb-1"
                style={{ color: pickaxeData.color, textShadow: "1px 1px 0 #000" }}
              >
                {pickaxeData.name}
              </div>
              
              {/* Current Enchantments */}
              {enchantments.length > 0 ? (
                <div className="flex flex-col gap-0.5">
                  {enchantments.map((enc) => (
                    <div
                      key={enc.id}
                      className="text-xs font-semibold"
                      style={{ color: RARITY_COLORS[enc.rarity], textShadow: "1px 1px 0 #000" }}
                    >
                      {enc.name} - {enc.description}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs italic" style={{ color: "#666" }}>
                  Sem encantamentos
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resources Display */}
        <div
          className="flex items-center justify-center gap-6 py-2 px-4"
          style={{ background: "rgba(0,0,0,0.3)", borderTop: "1px solid #4a1942", borderBottom: "1px solid #4a1942" }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 14 }}>{"🟢"}</span>
            <span className="font-bold text-sm" style={{ color: "#8bc34a" }}>
              {stats.xp.toLocaleString()} XP
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 14 }}>{"🪙"}</span>
            <span className="font-bold text-sm" style={{ color: "#ffd700" }}>
              {bankBalance.toLocaleString()} Coins
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 flex flex-col gap-3">
          {/* Enchant Button */}
          <button
            onClick={handleEnchant}
            disabled={!canAffordEnchant || spinning}
            className="w-full p-3 rounded-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canAffordEnchant && !spinning
                ? "linear-gradient(180deg, #6a1b9a 0%, #4a148c 100%)"
                : "linear-gradient(180deg, #333 0%, #222 100%)",
              border: `2px solid ${canAffordEnchant && !spinning ? "#9c27b0" : "#444"}`,
              boxShadow: canAffordEnchant && !spinning ? "0 0 20px rgba(156, 39, 176, 0.4)" : "none",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 24 }}>{"📖"}</span>
                <div className="text-left">
                  <div
                    className="font-bold text-sm"
                    style={{ color: canAffordEnchant ? "#e1bee7" : "#666" }}
                  >
                    {spinning ? "Encantando..." : !hasAvailableEnchants ? "COMPLETO" : "ENCANTAR"}
                  </div>
                  <div className="text-xs" style={{ color: "#888" }}>
                    {!hasAvailableEnchants 
                      ? "Voce ja tem todos os tipos de encantamento" 
                      : "Recebe um encantamento aleatorio"}
                  </div>
                </div>
              </div>
              <div
                className="px-3 py-1 rounded text-xs font-bold text-center"
                style={{
                  background: canAffordEnchant ? "rgba(139, 195, 74, 0.2)" : "rgba(0,0,0,0.3)",
                  border: `1px solid ${canAffordEnchant ? "#8bc34a" : "#444"}`,
                  color: canAffordEnchant ? "#8bc34a" : "#666",
                }}
              >
                {ENCHANT_COST.xp} XP<br/>{ENCHANT_COST.coins.toLocaleString()} Coins
              </div>
            </div>
          </button>

          {/* Recycle Button */}
          <button
            onClick={handleRecycle}
            disabled={!canAffordRecycle || spinning}
            className="w-full p-3 rounded-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canAffordRecycle && !spinning
                ? "linear-gradient(180deg, #c62828 0%, #8e0000 100%)"
                : "linear-gradient(180deg, #333 0%, #222 100%)",
              border: `2px solid ${canAffordRecycle && !spinning ? "#ef5350" : "#444"}`,
              boxShadow: canAffordRecycle && !spinning ? "0 0 15px rgba(239, 83, 80, 0.3)" : "none",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 24 }}>{"🔄"}</span>
                <div className="text-left">
                  <div
                    className="font-bold text-sm"
                    style={{ color: canAffordRecycle ? "#ffcdd2" : "#666" }}
                  >
                    RECICLAR
                  </div>
                  <div className="text-xs" style={{ color: "#888" }}>
                    Remove TODOS os encantamentos
                  </div>
                </div>
              </div>
              <div
                className="px-3 py-1 rounded text-xs font-bold text-center"
                style={{
                  background: canAffordRecycle ? "rgba(239, 83, 80, 0.2)" : "rgba(0,0,0,0.3)",
                  border: `1px solid ${canAffordRecycle ? "#ef5350" : "#444"}`,
                  color: canAffordRecycle ? "#ef5350" : "#666",
                }}
              >
                {RECYCLE_COST.xp} XP<br/>{RECYCLE_COST.coins.toLocaleString()} Coins
              </div>
            </div>
          </button>

          {/* Result Notification */}
          {showResult && lastResult && (
            <div
              className="p-3 rounded-lg flex items-center gap-3 animate-pulse"
              style={{
                background: `linear-gradient(90deg, ${RARITY_COLORS[lastResult.rarity]}20 0%, transparent 100%)`,
                border: `2px solid ${RARITY_COLORS[lastResult.rarity]}`,
              }}
            >
              <span style={{ fontSize: 20 }}>{"🎉"}</span>
              <div>
                <div className="text-xs" style={{ color: "#888" }}>Voce recebeu:</div>
                <div
                  className="font-bold text-sm"
                  style={{ color: RARITY_COLORS[lastResult.rarity], textShadow: "1px 1px 0 #000" }}
                >
                  {lastResult.name}
                </div>
              </div>
              <div className="ml-auto text-xs" style={{ color: "#888" }}>
                {lastResult.description}
              </div>
            </div>
          )}
        </div>

        {/* Rarity Legend */}
        <div
          className="flex flex-wrap items-center justify-center gap-3 py-2 px-4"
          style={{ background: "rgba(0,0,0,0.4)", borderTop: "1px solid #4a1942" }}
        >
          <span className="text-xs" style={{ color: "#666" }}>Raridades:</span>
          {Object.entries(RARITY_COLORS).map(([rarity, color]) => (
            <span
              key={rarity}
              className="text-xs font-bold"
              style={{ color }}
            >
              {rarity === "COMMON" ? "Comum" : 
               rarity === "RARE" ? "Raro" : 
               rarity === "EPIC" ? "Epico" : 
               rarity === "LEGENDARY" ? "Lendario" : "Mitico"}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
