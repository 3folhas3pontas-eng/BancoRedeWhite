"use client";

import { useEffect, useRef, useState } from "react";
import { PlayerStats, Enchantment } from "@/lib/game/types";
import {
  ENCHANTMENTS,
  RARITY_COLORS,
  ENCHANT_COST,
  RECYCLE_COST,
  PICKAXE_TIERS,
  PICKAXE_TEXTURES,
} from "@/lib/game/constants";
import { audioService } from "@/lib/game/audio";

interface EnchantPanelProps {
  stats: PlayerStats;
  enchantments: Enchantment[];
  bankBalance: number;
  onEnchant: () => void;
  onRecycle: () => void;
  onClose: () => void;
}

// Glyphs runicas flutuando — identico ao canvas da mesa original do Minecraft
function RuneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    const W = cvs.width, H = cvs.height;
    const CHARS = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";
    type Glyph = { x: number; y: number; ch: string; alpha: number; speed: number; size: number };
    const glyphs: Glyph[] = Array.from({ length: 14 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      ch: CHARS[Math.floor(Math.random() * CHARS.length)],
      alpha: Math.random() * 0.4 + 0.08,
      speed: 0.2 + Math.random() * 0.45,
      size: 8 + Math.random() * 5,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const g of glyphs) {
        ctx.globalAlpha = g.alpha;
        ctx.fillStyle = "#A78BFA";
        ctx.font = `bold ${g.size}px monospace`;
        ctx.fillText(g.ch, g.x, g.y);
        g.y -= g.speed;
        g.alpha -= 0.001;
        if (g.y < -14 || g.alpha <= 0) {
          g.y = H + 6;
          g.x = Math.random() * W;
          g.alpha = Math.random() * 0.4 + 0.08;
          g.ch = CHARS[Math.floor(Math.random() * CHARS.length)];
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
      width={64}
      height={64}
      className="absolute inset-0 pointer-events-none"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// Slot estilo InventoryPanel — bordas biseladas cinza Minecraft
function MCSlot({
  children,
  size = 48,
  highlighted = false,
}: {
  children?: React.ReactNode;
  size?: number;
  highlighted?: boolean;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: highlighted ? "#9A9A9A" : "#8B8B8B",
        border: "2px solid",
        borderTopColor: "#373737",
        borderLeftColor: "#373737",
        borderBottomColor: "#FFFFFF",
        borderRightColor: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        imageRendering: "pixelated",
        flexShrink: 0,
        boxShadow: highlighted ? "inset 0 0 6px rgba(167,139,250,0.3)" : "none",
      }}
    >
      {children}
    </div>
  );
}

// Linha de encantamento no painel direito — estilo inventario
function EnchantRow({
  enchant,
  index,
}: {
  enchant: Enchantment | null;
  index: number;
}) {
  const GLYPHS = ["ᚠᚢᚦᚨᚱᚲᚷ", "ᚹᚺᚾᛁᛃᛇᛈ", "ᛉᛊᛏᛒᛖᛗᛚ"];
  return (
    <div
      style={{
        height: 30,
        background: "#8B8B8B",
        border: "2px solid",
        borderTopColor: "#373737",
        borderLeftColor: "#373737",
        borderBottomColor: "#FFFFFF",
        borderRightColor: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        paddingLeft: 8,
        paddingRight: 8,
        gap: 6,
      }}
    >
      {enchant ? (
        <>
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: "bold",
              fontSize: 11,
              color: RARITY_COLORS[enchant.rarity],
              textShadow: "1px 1px 0 #000",
              flex: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {enchant.name}
          </span>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "#555", flexShrink: 0 }}>
            {enchant.description}
          </span>
        </>
      ) : (
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#777", letterSpacing: 3, opacity: 0.5 }}>
          {GLYPHS[index]}
        </span>
      )}
    </div>
  );
}

// Botao estilo Minecraft — borda biselada com luz/sombra
function MCButton({
  label,
  sublabel,
  onClick,
  disabled,
  color,
}: {
  label: string;
  sublabel: string;
  onClick: () => void;
  disabled: boolean;
  color: "purple" | "red";
}) {
  const bg     = disabled ? "#8B8B8B" : color === "purple" ? "#7E57C2" : "#B71C1C";
  const top    = disabled ? "#FFFFFF" : color === "purple" ? "#B39DDB" : "#E57373";
  const bottom = disabled ? "#555555" : color === "purple" ? "#4527A0" : "#7F0000";
  const text   = disabled ? "#555555" : "#FFFFFF";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "6px 10px",
        background: bg,
        border: "2px solid",
        borderTopColor: top,
        borderLeftColor: top,
        borderBottomColor: bottom,
        borderRightColor: bottom,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        imageRendering: "pixelated",
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontWeight: "bold",
          fontSize: 11,
          color: text,
          textShadow: disabled ? "none" : "1px 1px 0 #000",
        }}
      >
        {label}
      </span>
      <span style={{ fontFamily: "monospace", fontSize: 10, color: disabled ? "#666" : "#DDD", textAlign: "right", textShadow: "1px 1px 0 #000" }}>
        {sublabel}
      </span>
    </button>
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
  const panelRef = useRef<HTMLDivElement>(null);

  const canAffordEnchant = !spinning && stats.xp >= ENCHANT_COST.xp && bankBalance >= ENCHANT_COST.coins;
  const canAffordRecycle = !recycling && enchantments.length > 0 && stats.xp >= RECYCLE_COST.xp && bankBalance >= RECYCLE_COST.coins;

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

  const handleEnchant = () => {
    if (!canAffordEnchant) return;
    setSpinning(true);
    audioService.playClick();
    setTimeout(() => { onEnchant(); setSpinning(false); }, 600);
  };

  const handleRecycle = () => {
    if (!canAffordRecycle) return;
    setRecycling(true);
    audioService.playClick();
    setTimeout(() => { onRecycle(); setRecycling(false); }, 400);
  };

  const effEnchant  = enchantments.find(e => e.type === "efficiency") ?? null;
  const fortEnchant = enchantments.find(e => e.type === "fortune") ?? null;
  const mendEnchant = enchantments.find(e => e.type === "mending") ?? null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.78)" }}
    >
      {/* Janela — exatamente o mesmo padrao do InventoryPanel */}
      <div
        ref={panelRef}
        style={{
          background: "#C6C6C6",
          border: "4px solid",
          borderTopColor: "#FFFFFF",
          borderLeftColor: "#FFFFFF",
          borderBottomColor: "#555555",
          borderRightColor: "#555555",
          boxShadow: "8px 8px 32px rgba(0,0,0,0.6)",
          padding: 10,
          imageRendering: "pixelated",
          width: 360,
          maxWidth: "95vw",
        }}
      >
        {/* Titulo */}
        <div
          style={{
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: 13,
            color: "#404040",
            textShadow: "1px 1px 0 rgba(255,255,255,0.5)",
            marginBottom: 8,
            letterSpacing: 1,
          }}
        >
          Encantar
        </div>

        {/* Area superior — livro + slots de encantamento (igual print do Minecraft) */}
        <div
          style={{
            background: "#8B8B8B",
            border: "2px solid",
            borderTopColor: "#373737",
            borderLeftColor: "#373737",
            borderBottomColor: "#FFFFFF",
            borderRightColor: "#FFFFFF",
            padding: 8,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            marginBottom: 10,
          }}
        >
          {/* Coluna esquerda: livro + picareta + lapis */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
            {/* Livro com runas */}
            <div
              style={{
                width: 64,
                height: 64,
                background: "#111122",
                border: "2px solid",
                borderTopColor: "#373737",
                borderLeftColor: "#373737",
                borderBottomColor: "#FFFFFF",
                borderRightColor: "#FFFFFF",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <RuneCanvas />
              {/* Livro pixel art por cima */}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ position: "relative", width: 38, height: 30 }}>
                  <div style={{ position: "absolute", left: 0, top: 2, width: 16, height: 26, background: "#8B4513" }} />
                  <div style={{ position: "absolute", left: 8, top: 4, width: 10, height: 22, background: "#F5F5DC" }} />
                  <div style={{ position: "absolute", left: 18, top: 4, width: 10, height: 22, background: "#EEEECC" }} />
                  <div style={{ position: "absolute", right: 0, top: 2, width: 16, height: 26, background: "#8B4513" }} />
                  <div style={{ position: "absolute", left: 16, top: 2, width: 4, height: 26, background: "#5C2A08" }} />
                  <div style={{ position: "absolute", left: 0, top: 2, width: 8, height: 3, background: "rgba(255,255,255,0.2)" }} />
                </div>
              </div>
            </div>

            {/* Slot picareta equipada */}
            <MCSlot size={48} highlighted>
              <img
                src={PICKAXE_TEXTURES[stats.pickaxeTier]}
                alt={PICKAXE_TIERS[stats.pickaxeTier].name}
                width={36}
                height={36}
                style={{ imageRendering: "pixelated" }}
              />
            </MCSlot>

            {/* Slot lapis (decorativo, identico ao Minecraft) */}
            <MCSlot size={48}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  background: "#1A47A5",
                  border: "2px solid",
                  borderTopColor: "#3060C0",
                  borderLeftColor: "#3060C0",
                  borderBottomColor: "#0D2A6E",
                  borderRightColor: "#0D2A6E",
                }}
              />
            </MCSlot>
          </div>

          {/* Coluna direita: nome + 3 linhas de encantamento */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Nome da picareta */}
            <div style={{ marginBottom: 2 }}>
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  fontSize: 12,
                  color: PICKAXE_TIERS[stats.pickaxeTier].color,
                  textShadow: "1px 1px 0 rgba(0,0,0,0.6)",
                }}
              >
                {PICKAXE_TIERS[stats.pickaxeTier].name}
              </span>
            </div>

            {/* 3 linhas — Eficiencia, Fortuna, Remendo */}
            <EnchantRow enchant={effEnchant}  index={0} />
            <EnchantRow enchant={fortEnchant} index={1} />
            <EnchantRow enchant={mendEnchant} index={2} />
          </div>
        </div>

        {/* Separador — igual ao InventoryPanel */}
        <div
          style={{
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: 10,
            color: "#555",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 6,
          }}
        >
          Acoes
        </div>

        {/* Botoes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <MCButton
            label={spinning ? "Encantando..." : "Encantar Picareta"}
            sublabel={`${ENCHANT_COST.coins.toLocaleString()} coins + ${ENCHANT_COST.xp} XP`}
            onClick={handleEnchant}
            disabled={!canAffordEnchant}
            color="purple"
          />
          <MCButton
            label={recycling ? "Reciclando..." : "Reciclar Encantamentos"}
            sublabel={`${RECYCLE_COST.coins.toLocaleString()} coins + ${RECYCLE_COST.xp} XP`}
            onClick={handleRecycle}
            disabled={!canAffordRecycle}
            color="red"
          />
        </div>

        {/* Rodape com XP e coins */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            padding: "0 2px",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: stats.xp >= ENCHANT_COST.xp ? "#2E7D32" : "#C62828",
              fontWeight: "bold",
            }}
          >
            XP: {stats.xp.toLocaleString()}
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: bankBalance >= ENCHANT_COST.coins ? "#1565C0" : "#C62828",
              fontWeight: "bold",
            }}
          >
            Coins: R$ {bankBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Fechar */}
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "#6D6D6D" }}>
            [E] ou [ESC] para fechar
          </span>
        </div>
      </div>
    </div>
  );
}
