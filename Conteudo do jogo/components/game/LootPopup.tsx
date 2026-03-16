"use client";

import { useState, useEffect, useRef } from "react";
import type { LootItem } from "@/lib/game/types";

interface LootPopupProps {
  loot: LootItem[] | null;
  onClose: () => void;
}

const RARITY_BORDER: Record<string, string> = {
  common: "#9E9E9E",
  uncommon: "#4CAF50",
  rare: "#2196F3",
  epic: "#9C27B0",
  legendary: "#FFD700",
};

const RARITY_BG: Record<string, string> = {
  common: "rgba(158,158,158,0.08)",
  uncommon: "rgba(76,175,80,0.10)",
  rare: "rgba(33,150,243,0.12)",
  epic: "rgba(156,39,176,0.15)",
  legendary: "rgba(255,215,0,0.18)",
};

const RARITY_GLOW: Record<string, string> = {
  common: "none",
  uncommon: "0 0 8px rgba(76,175,80,0.3)",
  rare: "0 0 12px rgba(33,150,243,0.4)",
  epic: "0 0 16px rgba(156,39,176,0.5)",
  legendary: "0 0 20px rgba(255,215,0,0.6)",
};

const RARITY_LABEL: Record<string, string> = {
  common: "COMMON",
  uncommon: "UNCOMMON",
  rare: "RARE",
  epic: "EPIC",
  legendary: "LEGENDARY",
};

export default function LootPopup({ loot, onClose }: LootPopupProps) {
  const [visible, setVisible] = useState(false);
  const [revealIndex, setRevealIndex] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (loot && loot.length > 0) {
      setVisible(true);
      setRevealIndex(-1);
      // Reveal items one by one
      let idx = 0;
      const reveal = () => {
        setRevealIndex(idx);
        idx++;
        if (idx < loot.length) {
          timerRef.current = setTimeout(reveal, 400);
        }
      };
      timerRef.current = setTimeout(reveal, 500);
    } else {
      setVisible(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loot]);

  if (!loot || loot.length === 0 || !visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(380px, 90vw)",
          background: "linear-gradient(180deg, #3B2A1A 0%, #2A1D10 100%)",
          border: "4px solid #8D6E63",
          borderRadius: 4,
          boxShadow: "0 0 40px rgba(141,110,99,0.4), inset 0 0 30px rgba(0,0,0,0.5)",
          overflow: "hidden",
          imageRendering: "pixelated" as const,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "14px 16px 10px",
            borderBottom: "3px solid #5D4037",
            background: "linear-gradient(180deg, rgba(255,215,0,0.12) 0%, transparent 100%)",
          }}
        >
          <img
            src="https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/block/chest_front.png"
            alt=""
            width={32}
            height={32}
            style={{ imageRendering: "pixelated" }}
            crossOrigin="anonymous"
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 18,
              fontWeight: "bold",
              color: "#FFD54F",
              textShadow: "2px 2px 0 #3E2723",
              letterSpacing: 2,
            }}
          >
            DUNGEON CHEST
          </span>
          <img
            src="https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/block/chest_front.png"
            alt=""
            width={32}
            height={32}
            style={{ imageRendering: "pixelated" }}
            crossOrigin="anonymous"
          />
        </div>

        {/* Loot items */}
        <div style={{ padding: "12px 14px 6px", display: "flex", flexDirection: "column", gap: 8 }}>
          {loot.map((item, i) => {
            const revealed = i <= revealIndex;
            const rarityColor = RARITY_BORDER[item.rarity] || "#9E9E9E";
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  background: revealed ? RARITY_BG[item.rarity] : "rgba(0,0,0,0.3)",
                  border: `2px solid ${revealed ? rarityColor : "#4E342E"}`,
                  borderRadius: 3,
                  boxShadow: revealed ? RARITY_GLOW[item.rarity] : "none",
                  opacity: revealed ? 1 : 0.3,
                  transform: revealed ? "scale(1)" : "scale(0.9)",
                  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {/* Item icon */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    minWidth: 36,
                    background: "rgba(0,0,0,0.4)",
                    border: "2px solid #5D4037",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: revealed && item.rarity !== "common"
                      ? `inset 0 0 10px ${rarityColor}44`
                      : "none",
                  }}
                >
                  {revealed ? (
                    <img
                      src={item.icon}
                      alt={item.name}
                      width={28}
                      height={28}
                      style={{ imageRendering: "pixelated" }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <span style={{ color: "#5D4037", fontSize: 20, fontFamily: "monospace" }}>?</span>
                  )}
                </div>

                {/* Item info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 13,
                        fontWeight: "bold",
                        color: revealed ? rarityColor : "#5D4037",
                        textShadow: revealed ? `1px 1px 0 #000` : "none",
                      }}
                    >
                      {revealed ? item.name : "???"}
                    </span>
                    {revealed && (
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 8,
                          color: rarityColor,
                          background: `${rarityColor}22`,
                          padding: "1px 4px",
                          borderRadius: 2,
                          letterSpacing: 1,
                        }}
                      >
                        {RARITY_LABEL[item.rarity]}
                      </span>
                    )}
                  </div>
                  {revealed && (
                    <div style={{ fontFamily: "monospace", fontSize: 10, color: "#A1887F", marginTop: 2 }}>
                      {item.description}
                    </div>
                  )}
                </div>

                {/* Rewards */}
                {revealed && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                    {item.money > 0 && (
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: "#FFD54F", fontWeight: "bold", textShadow: "1px 1px 0 #000" }}>
                        +${item.money}
                      </span>
                    )}
                    {item.xp > 0 && (
                      <span style={{ fontFamily: "monospace", fontSize: 10, color: "#69F0AE" }}>
                        +{item.xp} XP
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Total rewards */}
        {revealIndex >= loot.length - 1 && (
          <div
            style={{
              margin: "8px 14px",
              padding: "8px 12px",
              background: "rgba(255,215,0,0.08)",
              border: "2px solid #5D4037",
              borderRadius: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "#A1887F" }}>TOTAL</span>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ fontFamily: "monospace", fontSize: 14, color: "#FFD54F", fontWeight: "bold", textShadow: "1px 1px 0 #000" }}>
                +${loot.reduce((a, b) => a + b.money, 0)}
              </span>
              <span style={{ fontFamily: "monospace", fontSize: 14, color: "#69F0AE", fontWeight: "bold" }}>
                +{loot.reduce((a, b) => a + b.xp, 0)} XP
              </span>
            </div>
          </div>
        )}

        {/* Close button */}
        <div style={{ padding: "8px 14px 14px", display: "flex", justifyContent: "center" }}>
          <button
            onClick={onClose}
            style={{
              fontFamily: "monospace",
              fontSize: 14,
              fontWeight: "bold",
              color: "#fff",
              background: "linear-gradient(180deg, #5D4037 0%, #3E2723 100%)",
              border: "2px solid #8D6E63",
              borderRadius: 3,
              padding: "8px 32px",
              cursor: "pointer",
              letterSpacing: 2,
              textShadow: "1px 1px 0 #000",
              boxShadow: "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            COLLECT
          </button>
        </div>
      </div>
    </div>
  );
}
