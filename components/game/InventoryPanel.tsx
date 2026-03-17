"use client";

import { useEffect, useRef } from "react";
import { MiningInventory, ORE_CONFIG, OreType } from "@/lib/game/inventory";
import { audioService } from "@/lib/game/audio";

interface InventoryPanelProps {
  inventory: MiningInventory;
  onClose: () => void;
}

const SLOT_ORDER: OreType[] = [
  'coal', 'raw_iron', 'raw_copper', 'lapis_lazuli',
  'raw_gold', 'redstone', 'diamond', 'emerald'
];

// Minecraft slot component
function Slot({
  texture,
  count,
  name,
  empty,
}: {
  texture?: string;
  count?: number;
  name?: string;
  empty?: boolean;
}) {
  const hasItems = count !== undefined && count > 0;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: 48,
        height: 48,
        background: "#8B8B8B",
        border: "2px solid",
        borderTopColor: "#373737",
        borderLeftColor: "#373737",
        borderBottomColor: "#FFFFFF",
        borderRightColor: "#FFFFFF",
        imageRendering: "pixelated",
      }}
      title={name ? `${name}: ${count || 0}` : undefined}
    >
      {!empty && texture && (
        <div
          style={{
            width: 32,
            height: 32,
            backgroundImage: `url(${texture})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            imageRendering: "pixelated",
            opacity: hasItems ? 1 : 0.2,
            filter: hasItems ? "none" : "grayscale(80%)",
          }}
        />
      )}
      {hasItems && (
        <span
          style={{
            position: "absolute",
            bottom: 2,
            right: 4,
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: "bold",
            fontFamily: "monospace",
            textShadow: "2px 2px 0 #3F3F3F, -1px -1px 0 #3F3F3F, 1px -1px 0 #3F3F3F, -1px 1px 0 #3F3F3F",
          }}
        >
          {count > 999 ? "999+" : count}
        </span>
      )}
    </div>
  );
}

export default function InventoryPanel({ inventory, onClose }: InventoryPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    audioService.playChestOpen();
  }, []);

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

  const totalItems = Object.values(inventory).reduce((a, b) => a + b, 0);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.7)" }}
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
          boxShadow: "8px 8px 32px rgba(0,0,0,0.6)",
          padding: 8,
          imageRendering: "pixelated",
        }}
      >
        {/* Title */}
        <div
          className="text-center font-mono font-bold"
          style={{
            color: "#404040",
            fontSize: 14,
            textShadow: "1px 1px 0 #FFFFFF",
            marginBottom: 8,
            letterSpacing: 1,
          }}
        >
          Minerios Coletados
        </div>

        {/* Main ore grid - 4x2 */}
        <div
          style={{
            background: "#8B8B8B",
            border: "2px solid",
            borderTopColor: "#373737",
            borderLeftColor: "#373737",
            borderBottomColor: "#FFFFFF",
            borderRightColor: "#FFFFFF",
            padding: 6,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 48px)",
              gap: 4,
            }}
          >
            {SLOT_ORDER.map((oreType) => {
              const config = ORE_CONFIG[oreType];
              const count = inventory[oreType];
              return (
                <Slot
                  key={oreType}
                  texture={config.texture}
                  count={count}
                  name={config.name}
                />
              );
            })}
          </div>
        </div>

        {/* Hotbar section - 9 empty slots */}
        <div
          style={{
            marginTop: 12,
            background: "#8B8B8B",
            border: "2px solid",
            borderTopColor: "#373737",
            borderLeftColor: "#373737",
            borderBottomColor: "#FFFFFF",
            borderRightColor: "#FFFFFF",
            padding: 6,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(9, 36px)",
              gap: 2,
            }}
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={`hotbar-${i}`}
                style={{
                  width: 36,
                  height: 36,
                  background: "#8B8B8B",
                  border: "2px solid",
                  borderTopColor: "#373737",
                  borderLeftColor: "#373737",
                  borderBottomColor: "#FFFFFF",
                  borderRightColor: "#FFFFFF",
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-between items-center font-mono"
          style={{ marginTop: 8, padding: "0 4px" }}
        >
          <span style={{ color: "#404040", fontSize: 11 }}>
            Total: <strong style={{ color: "#2E7D32" }}>{totalItems}</strong> itens
          </span>
          <span style={{ color: "#6D6D6D", fontSize: 10 }}>
            [E] ou [ESC] para fechar
          </span>
        </div>
      </div>
    </div>
  );
}
