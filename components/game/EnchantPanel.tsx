"use client";

import { useState, useEffect, useRef } from "react";
import { PlayerStats, Enchantment, Rarity } from "@/lib/game/types";
import {
  ENCHANTMENTS,
  RARITY_COLORS,
  ENCHANT_COST,
} from "@/lib/game/constants";
import { audioService } from "@/lib/game/audio";

interface EnchantPanelProps {
  stats: PlayerStats;
  enchantments: Enchantment[];
  bankBalance: number;
  onEnchant: () => void;
  onClose: () => void;
}

// Enchantment Table pixel art
function EnchantTableIcon() {
  return (
    <div className="relative" style={{ width: 64, height: 56, imageRendering: "pixelated" }}>
      {/* Book on top */}
      <div className="absolute" style={{ top: 0, left: 16, width: 32, height: 8, background: "#8B4513" }} />
      <div className="absolute" style={{ top: 2, left: 18, width: 12, height: 5, background: "#F5F5DC" }} />
      <div className="absolute" style={{ top: 2, left: 34, width: 12, height: 5, background: "#F5F5DC" }} />
      {/* Book spine */}
      <div className="absolute" style={{ top: 0, left: 30, width: 4, height: 8, background: "#6B3410" }} />
      {/* Table top - obsidian look */}
      <div className="absolute" style={{ top: 10, left: 4, width: 56, height: 10, background: "#1A0A2E" }} />
      {/* Diamond corners */}
      <div className="absolute" style={{ top: 10, left: 4, width: 6, height: 6, background: "#00E5FF" }} />
      <div className="absolute" style={{ top: 10, left: 54, width: 6, height: 6, background: "#00E5FF" }} />
      {/* Red cloth detail on top */}
      <div className="absolute" style={{ top: 12, left: 14, width: 36, height: 6, background: "#8B0000" }} />
      {/* Table body */}
      <div className="absolute" style={{ top: 20, left: 8, width: 48, height: 28, background: "#2A1040" }} />
      {/* Obsidian texture lines */}
      <div className="absolute" style={{ top: 24, left: 10, width: 44, height: 2, background: "#3A1A55", opacity: 0.6 }} />
      <div className="absolute" style={{ top: 32, left: 12, width: 40, height: 2, background: "#3A1A55", opacity: 0.4 }} />
      <div className="absolute" style={{ top: 38, left: 10, width: 44, height: 2, background: "#3A1A55", opacity: 0.5 }} />
      {/* Diamond ornaments on sides */}
      <div className="absolute" style={{ top: 28, left: 10, width: 4, height: 4, background: "#00BCD4" }} />
      <div className="absolute" style={{ top: 28, left: 50, width: 4, height: 4, background: "#00BCD4" }} />
      {/* Base */}
      <div className="absolute" style={{ top: 48, left: 4, width: 56, height: 8, background: "#1A0A2E" }} />
      <div className="absolute" style={{ top: 48, left: 4, width: 56, height: 2, background: "#2A1555" }} />
    </div>
  );
}

// Animated floating glyphs (Enchanting Particle effect)
function FloatingGlyphs() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    // Standard Galactic Alphabet characters (enchanting glyphs)
    const glyphs = "\u1780\u1781\u1782\u1783\u1784\u1785\u1786\u1787\u1788\u1789\u178A\u178B\u178C\u178D\u178E\u178F";

    interface Glyph {
      x: number;
      y: number;
      char: string;
      alpha: number;
      speed: number;
      size: number;
      dx: number;
    }

    const particles: Glyph[] = [];
    for (let i = 0; i < 12; i++) {
      particles.push({
        x: Math.random() * 300,
        y: Math.random() * 80,
        char: glyphs[Math.floor(Math.random() * glyphs.length)],
        alpha: Math.random() * 0.4 + 0.1,
        speed: 0.2 + Math.random() * 0.5,
        size: 8 + Math.random() * 6,
        dx: (Math.random() - 0.5) * 0.3,
      });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, 300, 80);
      for (const p of particles) {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = "#9C27B0";
        ctx.font = `${p.size}px monospace`;
        ctx.fillText(p.char, p.x, p.y);
        p.y -= p.speed;
        p.x += p.dx;
        p.alpha -= 0.002;
        if (p.y < -10 || p.alpha <= 0) {
          p.y = 85;
          p.x = Math.random() * 300;
          p.alpha = Math.random() * 0.4 + 0.1;
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
      width={300}
      height={80}
      className="absolute top-0 left-0 w-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}

export default function EnchantPanel({
  stats,
  enchantments,
  bankBalance,
  onEnchant,
  onClose,
}: EnchantPanelProps) {
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<Enchantment | null>(null);
  const [showResult, setShowResult] = useState(false);
  const canAffordXP = stats.xp >= ENCHANT_COST.xp;
  const canAffordCoins = bankBalance >= ENCHANT_COST.coins;
  const canAfford = canAffordXP && canAffordCoins;

  const handleSpin = () => {
    if (!canAfford || spinning) return;
    setSpinning(true);
    setShowResult(false);
    audioService.playClick();

    setTimeout(() => {
      onEnchant();
      setSpinning(false);
      // Show the newest enchantment
      setShowResult(true);
    }, 800);
  };

  // Track last added enchantment for result display
  useEffect(() => {
    if (enchantments.length > 0) {
      setLastResult(enchantments[enchantments.length - 1]);
    }
  }, [enchantments]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          audioService.playClick();
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-sm relative overflow-hidden"
        style={{
          background: "#1C1C1C",
          border: "4px solid #3C3C3C",
          boxShadow: "inset 0 0 0 2px #555, 0 8px 40px rgba(0,0,0,0.7)",
          imageRendering: "auto",
        }}
      >
        {/* Header bar */}
        <div
          className="relative flex items-center justify-center py-3"
          style={{
            background: "linear-gradient(180deg, #2A1040 0%, #1A0A2E 100%)",
            borderBottom: "2px solid #4A2070",
          }}
        >
          <span
            className="font-mono font-bold text-sm tracking-wider"
            style={{ color: "#CE93D8", textShadow: "2px 2px 0 #000" }}
          >
            ENCHANT
          </span>
          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center font-mono font-bold text-xs"
            style={{
              background: "linear-gradient(180deg, #C0392B 0%, #922B21 100%)",
              border: "2px solid #E74C3C",
              color: "#fff",
              textShadow: "1px 1px 0 #000",
            }}
          >
            X
          </button>
        </div>

        {/* Enchantment table scene */}
        <div
          className="relative flex flex-col items-center py-4 overflow-hidden"
          style={{
            background: "radial-gradient(ellipse at center, #2A1555 0%, #1A0A2E 60%, #0A0015 100%)",
            minHeight: 100,
          }}
        >
          <FloatingGlyphs />
          <div className="relative z-10">
            <EnchantTableIcon />
          </div>
          {/* Glow under the table */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{
              width: 100,
              height: 20,
              background: "radial-gradient(ellipse, rgba(156, 39, 176, 0.3) 0%, transparent 70%)",
            }}
          />
          {/* XP e Coins counter */}
          <div className="relative z-10 mt-2 flex flex-col items-center gap-1">
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-xs font-bold"
                style={{ color: canAffordXP ? "#8BC34A" : "#EF5350", textShadow: "1px 1px 0 #000" }}
              >
                {stats.xp + " XP"}
              </span>
              <span
                className="font-mono text-xs font-bold"
                style={{ color: canAffordCoins ? "#FFD700" : "#EF5350", textShadow: "1px 1px 0 #000" }}
              >
                {bankBalance.toLocaleString()} Coins
              </span>
            </div>
            <span className="font-mono text-[10px]" style={{ color: "#666" }}>
              Custo: {ENCHANT_COST.xp} XP + {ENCHANT_COST.coins.toLocaleString()} Coins
            </span>
          </div>
        </div>

        {/* Enchant options - 3 slots like the real GUI */}
        <div className="px-3 py-3 flex flex-col gap-2">
          {/* Main enchant button */}
          <button
            onClick={handleSpin}
            disabled={!canAfford || spinning}
            className="w-full flex items-center gap-3 p-2 transition-all active:scale-[0.98] disabled:opacity-35 disabled:cursor-not-allowed"
            style={{
              background: canAfford && !spinning
                ? "linear-gradient(180deg, #2A1555 0%, #1A0A2E 100%)"
                : "#222",
              border: `2px solid ${canAfford && !spinning ? "#7C4DFF" : "#333"}`,
              boxShadow: canAfford && !spinning ? "inset 0 1px 0 rgba(124,77,255,0.2), 0 0 12px rgba(124,77,255,0.15)" : "none",
            }}
          >
            {/* Lapis slot icon */}
            <div
              className="w-10 h-10 flex items-center justify-center flex-shrink-0"
              style={{
                background: "#1A1A1A",
                border: "2px solid #444",
              }}
            >
              <div
                className="w-5 h-5"
                style={{
                  background: canAfford ? "#1A47A5" : "#333",
                  boxShadow: canAfford ? "0 0 6px rgba(26,71,165,0.5)" : "none",
                }}
              />
            </div>
            <div className="flex-1 text-left">
              {spinning ? (
                <div
                  className="font-mono text-xs font-bold"
                  style={{ color: "#CE93D8", textShadow: "1px 1px 0 #000" }}
                >
                  Enchanting...
                </div>
              ) : (
                <>
                  <div
                    className="font-mono font-bold text-xs"
                    style={{
                      color: canAfford ? "#CE93D8" : "#666",
                      textShadow: "1px 1px 0 #000",
                      fontStyle: canAfford ? "normal" : "italic",
                    }}
                  >
                    {canAfford ? "Encantar Picareta" : (!canAffordXP ? "XP insuficiente" : "Coins insuficientes")}
                  </div>
                  <div className="font-mono text-[9px]" style={{ color: "#888" }}>
                    Random enchantment for your pickaxe
                  </div>
                </>
              )}
            </div>
            <div
              className="px-2 py-1 font-mono font-bold text-[10px] flex-shrink-0 text-center"
              style={{
                background: canAfford && !spinning ? "#2E7D32" : "#333",
                border: "2px solid",
                borderColor: canAfford && !spinning ? "#4CAF50" : "#444",
                color: canAfford && !spinning ? "#8BC34A" : "#666",
                textShadow: "1px 1px 0 #000",
              }}
            >
              {ENCHANT_COST.xp} XP<br/>+ {ENCHANT_COST.coins.toLocaleString()}
            </div>
          </button>

          {/* Result notification */}
          {showResult && lastResult && (
            <div
              className="p-2 flex items-center gap-2 animate-pulse"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: `2px solid ${RARITY_COLORS[lastResult.rarity]}60`,
                boxShadow: `0 0 12px ${RARITY_COLORS[lastResult.rarity]}30`,
              }}
            >
              <span className="font-mono text-[10px]" style={{ color: "#888" }}>
                Got:
              </span>
              <span
                className="font-mono text-xs font-bold"
                style={{ color: RARITY_COLORS[lastResult.rarity], textShadow: "1px 1px 0 #000" }}
              >
                {lastResult.name}
              </span>
              <span className="font-mono text-[9px] ml-auto" style={{ color: "#888" }}>
                {lastResult.description}
              </span>
            </div>
          )}

          {/* Current enchantments scroll */}
          <div
            className="max-h-28 overflow-y-auto"
            style={{
              background: "#1A1A1A",
              border: "2px solid #333",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {enchantments.length === 0 ? (
              <p
                className="text-center py-4 font-mono text-[10px]"
                style={{ color: "#444" }}
              >
                No enchantments yet...
              </p>
            ) : (
              <div className="flex flex-col">
                {enchantments.map((enc, i) => (
                  <div
                    key={enc.id + "-" + i}
                    className="flex items-center justify-between px-2 py-1"
                    style={{
                      borderBottom: "1px solid #222",
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <span
                      className="font-mono text-[10px] font-bold"
                      style={{ color: RARITY_COLORS[enc.rarity], textShadow: "1px 1px 0 #000" }}
                    >
                      {enc.name}
                    </span>
                    <span
                      className="font-mono text-[9px]"
                      style={{ color: "#666" }}
                    >
                      {enc.description}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rarity legend */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-1">
            {Object.entries(RARITY_COLORS).map(([rarity, color]) => (
              <span
                key={rarity}
                className="font-mono text-[8px] font-bold"
                style={{ color, textShadow: "1px 1px 0 #000" }}
              >
                {rarity.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom decorative bar */}
        <div
          className="h-2"
          style={{
            background: "linear-gradient(180deg, #1A0A2E 0%, #2A1040 100%)",
            borderTop: "2px solid #4A2070",
          }}
        />
      </div>
    </div>
  );
}
