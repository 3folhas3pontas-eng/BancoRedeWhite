"use client";

import { useState, useEffect, useRef } from "react";
import { PlayerStats, Enchantment, Rarity } from "@/lib/game/types";
import {
  ENCHANTMENTS,
  RARITY_COLORS,
  ENCHANT_COST,
  RECYCLE_COST,
  PICKAXE_TIERS,
  PICKAXE_TEXTURES,
} from "@/lib/game/constants";
import { audioService } from "@/lib/game/audio";
import { PickaxeTier } from "@/lib/game/types";

interface EnchantPanelProps {
  stats: PlayerStats;
  enchantments: Enchantment[];
  bankBalance: number;
  onEnchant: () => void;
  onRecycle: () => void;
  onClose: () => void;
}

// Glyphs flutuantes do canvas — efeito da mesa de encantamento
function FloatingGlyphs({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    const CHARS = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";
    interface G { x: number; y: number; ch: string; a: number; speed: number; size: number }
    const pts: G[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      ch: CHARS[Math.floor(Math.random() * CHARS.length)],
      a: Math.random() * 0.35 + 0.05,
      speed: 0.15 + Math.random() * 0.4,
      size: 9 + Math.random() * 5,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of pts) {
        ctx.globalAlpha = p.a;
        ctx.fillStyle = "#7C4DFF";
        ctx.font = `bold ${p.size}px monospace`;
        ctx.fillText(p.ch, p.x, p.y);
        p.y -= p.speed;
        p.a -= 0.0015;
        if (p.y < -12 || p.a <= 0) {
          p.y = height + 5;
          p.x = Math.random() * width;
          p.a = Math.random() * 0.35 + 0.05;
          p.ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [width, height]);
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
    />
  );
}

// Slot estilo Minecraft
function MCSlot({
  children,
  size = 48,
  active = false,
}: {
  children?: React.ReactNode;
  size?: number;
  active?: boolean;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: active ? "#3A3A3A" : "#282828",
        border: "none",
        boxShadow: active
          ? "inset -2px -2px 0 #555, inset 2px 2px 0 #111"
          : "inset -2px -2px 0 #444, inset 2px 2px 0 #000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        imageRendering: "pixelated",
      }}
    >
      {children}
    </div>
  );
}

// Linha de encantamento — estilo slots escuros da mesa
function EnchantSlot({
  enchant,
  isEmpty,
  index,
}: {
  enchant?: Enchantment;
  isEmpty: boolean;
  index: number;
}) {
  // Textos "glifo" embaralhados quando vazio
  const glyphText = ["?eϯλφ?", "?ΩΨΔΛδ?", "?ξζηθι?"][index] ?? "?????";
  return (
    <div
      style={{
        height: 28,
        background: "#1A1A1A",
        borderTop: index === 0 ? "none" : "1px solid #111",
        borderBottom: "1px solid #2A2A2A",
        display: "flex",
        alignItems: "center",
        paddingLeft: 10,
        paddingRight: 10,
        gap: 8,
        cursor: isEmpty ? "default" : "default",
      }}
    >
      {isEmpty ? (
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#3A3A3A", letterSpacing: 2 }}>
          {glyphText}
        </span>
      ) : enchant ? (
        <>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              fontWeight: "bold",
              color: RARITY_COLORS[enchant.rarity],
              textShadow: "1px 1px 0 #000",
              flex: 1,
            }}
          >
            {enchant.name}
          </span>
          <span style={{ fontFamily: "monospace", fontSize: 10, color: "#888" }}>
            {enchant.description}
          </span>
        </>
      ) : null}
    </div>
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
  const [recycling, setRecycling] = useState(false);
  const [lastResult, setLastResult] = useState<{ enchant: Enchantment; upgraded: boolean } | null>(null);

  const canAffordEnchant = stats.xp >= ENCHANT_COST.xp && bankBalance >= ENCHANT_COST.coins;
  const canAffordRecycle = stats.xp >= RECYCLE_COST.xp && bankBalance >= RECYCLE_COST.coins && enchantments.length > 0;

  const handleEnchant = () => {
    if (!canAffordEnchant || spinning) return;
    setSpinning(true);
    audioService.playClick();
    setTimeout(() => {
      onEnchant();
      setSpinning(false);
    }, 700);
  };

  const handleRecycle = () => {
    if (!canAffordRecycle || recycling) return;
    setRecycling(true);
    audioService.playClick();
    setTimeout(() => {
      onRecycle();
      setRecycling(false);
      setLastResult(null);
    }, 500);
  };

  // Rastreia o ultimo encantamento adicionado/upado
  useEffect(() => {
    if (enchantments.length > 0) {
      setLastResult({ enchant: enchantments[enchantments.length - 1], upgraded: false });
    }
  }, [enchantments]);

  const pickaxeName = PICKAXE_TIERS[stats.pickaxeTier].name;
  const pickaxeImg = PICKAXE_TEXTURES[stats.pickaxeTier];

  // Monta sempre 3 slots para eficiencia, 1 para fortuna, 1 para remendo
  const effEnchant = enchantments.find(e => e.type === "efficiency");
  const fortEnchant = enchantments.find(e => e.type === "fortune");
  const mendEnchant = enchantments.find(e => e.type === "mending");
  const displaySlots: (Enchantment | null)[] = [
    effEnchant ?? null,
    fortEnchant ?? null,
    mendEnchant ?? null,
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.80)" }}
      onClick={(e) => { if (e.target === e.currentTarget) { audioService.playClick(); onClose(); } }}
    >
      {/* Janela principal — fundo cinza escuro estilo Minecraft GUI */}
      <div
        style={{
          width: 380,
          background: "#C6C6C6",
          boxShadow: "inset -2px -4px 0 #555, inset 2px 2px 0 #FFF, 0 0 0 2px #000, 4px 4px 0 #000",
          imageRendering: "pixelated",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Titulo */}
        <div style={{ padding: "8px 10px 4px", background: "#C6C6C6" }}>
          <span style={{ fontSize: 14, fontWeight: "bold", color: "#3F3F3F", textShadow: "1px 1px 0 rgba(255,255,255,0.5)" }}>
            Encantar
          </span>
          {/* Botao fechar */}
          <button
            onClick={() => { audioService.playClick(); onClose(); }}
            style={{
              position: "absolute", top: 6, right: 8,
              width: 20, height: 20,
              background: "#C6C6C6",
              boxShadow: "inset -1px -2px 0 #555, inset 1px 1px 0 #FFF",
              border: "none", cursor: "pointer",
              fontSize: 10, fontWeight: "bold", color: "#3F3F3F",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            X
          </button>
        </div>

        {/* Area principal da mesa */}
        <div style={{ padding: "6px 10px", display: "flex", gap: 8, alignItems: "flex-start" }}>
          {/* Coluna esquerda: livro + slot picareta + slot lapis */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
            {/* Livro animado */}
            <div
              style={{
                width: 56,
                height: 56,
                position: "relative",
                overflow: "hidden",
                background: "#1A1A2E",
                boxShadow: "inset -2px -2px 0 #0A0A15, inset 2px 2px 0 #2A2A4E",
              }}
            >
              <FloatingGlyphs width={56} height={56} />
              {/* Livro pixel art */}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ position: "relative", width: 36, height: 28 }}>
                  {/* capa esquerda */}
                  <div style={{ position: "absolute", left: 0, top: 2, width: 16, height: 24, background: "#8B4513", boxShadow: "inset -1px 0 0 #6B3010" }} />
                  {/* paginas */}
                  <div style={{ position: "absolute", left: 8, top: 4, width: 10, height: 20, background: "#F5F5DC" }} />
                  <div style={{ position: "absolute", left: 18, top: 4, width: 10, height: 20, background: "#EEEECC" }} />
                  {/* capa direita */}
                  <div style={{ position: "absolute", right: 0, top: 2, width: 16, height: 24, background: "#8B4513", boxShadow: "inset 1px 0 0 #6B3010" }} />
                  {/* lombada */}
                  <div style={{ position: "absolute", left: 16, top: 2, width: 4, height: 24, background: "#5C2A08" }} />
                  {/* brilho */}
                  <div style={{ position: "absolute", left: 0, top: 2, width: 6, height: 3, background: "rgba(255,255,255,0.25)" }} />
                </div>
              </div>
            </div>

            {/* Slot picareta */}
            <MCSlot size={48} active>
              <img src={pickaxeImg} alt={pickaxeName} width={32} height={32} style={{ imageRendering: "pixelated" }} />
            </MCSlot>

            {/* Slot lapis (decorativo) */}
            <MCSlot size={48}>
              <div style={{ width: 22, height: 22, background: "#1A47A5", boxShadow: "inset -2px -2px 0 #0D2A6E, inset 1px 1px 0 #3060C0" }} />
            </MCSlot>
          </div>

          {/* Coluna direita: slots de encantamento estilo Minecraft */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Nome da picareta */}
            <div style={{
              padding: "3px 8px",
              background: "#1A1A1A",
              boxShadow: "inset -1px -1px 0 #333, inset 1px 1px 0 #000",
              marginBottom: 4,
            }}>
              <span style={{ fontSize: 10, color: "#AAAAAA" }}>{pickaxeName}</span>
            </div>

            {/* 3 slots de encantamento */}
            <div style={{ background: "#1A1A1A", boxShadow: "inset -1px -1px 0 #333, inset 1px 1px 0 #000" }}>
              {displaySlots.map((enc, i) => (
                <EnchantSlot key={i} enchant={enc ?? undefined} isEmpty={enc === null} index={i} />
              ))}
            </div>

            {/* Resultado do ultimo encantamento */}
            {lastResult && (
              <div style={{
                marginTop: 4,
                padding: "3px 8px",
                background: "#111",
                boxShadow: "inset -1px -1px 0 #333, inset 1px 1px 0 #000",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 9, color: "#666" }}>Obtido:</span>
                <span style={{ fontSize: 10, fontWeight: "bold", color: RARITY_COLORS[lastResult.enchant.rarity] }}>
                  {lastResult.enchant.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Separador */}
        <div style={{ height: 2, background: "#555", margin: "0 4px", boxShadow: "0 1px 0 #FFF" }} />

        {/* Inventario label */}
        <div style={{ padding: "6px 10px 2px" }}>
          <span style={{ fontSize: 13, fontWeight: "bold", color: "#3F3F3F", textShadow: "1px 1px 0 rgba(255,255,255,0.5)" }}>
            Acoes
          </span>
        </div>

        {/* Botoes */}
        <div style={{ padding: "4px 10px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Botao Encantar */}
          <button
            onClick={handleEnchant}
            disabled={!canAffordEnchant || spinning}
            style={{
              width: "100%",
              padding: "6px 10px",
              background: canAffordEnchant && !spinning ? "#5A3A8A" : "#3A3A3A",
              boxShadow: canAffordEnchant && !spinning
                ? "inset -2px -3px 0 #2A1A50, inset 2px 2px 0 #8A6AB0"
                : "inset -2px -3px 0 #222, inset 2px 2px 0 #555",
              border: "none",
              cursor: canAffordEnchant && !spinning ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              opacity: canAffordEnchant ? 1 : 0.6,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: "bold", color: canAffordEnchant && !spinning ? "#CE93D8" : "#888", textShadow: "1px 1px 0 #000" }}>
              {spinning ? "Encantando..." : "Encantar Picareta"}
            </span>
            <span style={{ fontSize: 10, color: "#AAA", textAlign: "right", lineHeight: 1.4 }}>
              {ENCHANT_COST.coins.toLocaleString()} coins{"\n"}+ {ENCHANT_COST.xp} XP
            </span>
          </button>

          {/* Botao Reciclar */}
          <button
            onClick={handleRecycle}
            disabled={!canAffordRecycle || recycling}
            style={{
              width: "100%",
              padding: "6px 10px",
              background: canAffordRecycle && !recycling ? "#7A2A2A" : "#3A3A3A",
              boxShadow: canAffordRecycle && !recycling
                ? "inset -2px -3px 0 #4A1010, inset 2px 2px 0 #B04A4A"
                : "inset -2px -3px 0 #222, inset 2px 2px 0 #555",
              border: "none",
              cursor: canAffordRecycle && !recycling ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              opacity: canAffordRecycle ? 1 : 0.6,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: "bold", color: canAffordRecycle && !recycling ? "#EF9A9A" : "#888", textShadow: "1px 1px 0 #000" }}>
              {recycling ? "Reciclando..." : "Reciclar (resetar) Encantamentos"}
            </span>
            <span style={{ fontSize: 10, color: "#AAA", textAlign: "right", lineHeight: 1.4 }}>
              {RECYCLE_COST.coins.toLocaleString()} coins{"\n"}+ {RECYCLE_COST.xp} XP
            </span>
          </button>

          {/* Info custos */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 2 }}>
            <span style={{ fontSize: 10, color: stats.xp >= ENCHANT_COST.xp ? "#8BC34A" : "#EF5350" }}>
              XP: {stats.xp.toLocaleString()}
            </span>
            <span style={{ fontSize: 10, color: bankBalance >= ENCHANT_COST.coins ? "#FBC02D" : "#EF5350" }}>
              Coins: {bankBalance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
