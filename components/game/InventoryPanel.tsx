"use client";

import { useEffect, useRef } from "react";
import { MiningInventory, ORE_CONFIG, DUNGEON_ITEM_CONFIG, OreType, DungeonItemType } from "@/lib/game/inventory";
import { audioService } from "@/lib/game/audio";
import { Enchantment, PickaxeTier } from "@/lib/game/types";
import { PICKAXE_TIERS, PICKAXE_TEXTURES, RARITY_COLORS } from "@/lib/game/constants";

interface InventoryPanelProps {
  inventory: MiningInventory;
  pickaxeTier: PickaxeTier;
  enchantments: Enchantment[];
  onClose: () => void;
}

const ORE_ORDER: OreType[] = [
  'coal', 'raw_iron', 'raw_copper', 'lapis_lazuli',
  'raw_gold', 'redstone', 'diamond', 'emerald'
];

const DUNGEON_ITEM_ORDER: DungeonItemType[] = [
  'string', 'rotten_flesh', 'bone', 'wheat', 'gunpowder',
  'iron_ingot', 'gold_ingot', 'slimeball', 'bucket',
  'name_tag', 'saddle', 'music_disc', 'golden_apple',
  'enchantment_book', 'iron_horse_armor', 'enchanted_golden_apple',
  'gold_horse_armor', 'diamond_horse_armor', 'experience_bottle'
];

const RARITY_BORDER: Record<string, string> = {
  common: "#373737",
  uncommon: "#4CAF50",
  rare: "#2196F3",
  epic: "#9C27B0",
  legendary: "#FFD700",
};

// Minecraft slot component
function Slot({
  texture,
  count,
  name,
  empty,
  rarity,
}: {
  texture?: string;
  count?: number;
  name?: string;
  empty?: boolean;
  rarity?: string;
}) {
  const hasItems = count !== undefined && count > 0;
  const borderColor = rarity && hasItems ? RARITY_BORDER[rarity] : "#373737";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: 40,
        height: 40,
        background: "#8B8B8B",
        border: "2px solid",
        borderTopColor: borderColor,
        borderLeftColor: borderColor,
        borderBottomColor: "#FFFFFF",
        borderRightColor: "#FFFFFF",
        imageRendering: "pixelated",
        boxShadow: hasItems && rarity && rarity !== 'common' ? `inset 0 0 8px ${RARITY_BORDER[rarity]}44` : "none",
      }}
      title={name ? `${name}: ${count || 0}` : undefined}
    >
      {!empty && texture && (
        <div
          style={{
            width: 28,
            height: 28,
            backgroundImage: `url(${texture})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            imageRendering: "pixelated",
            opacity: hasItems ? 1 : 0.15,
            filter: hasItems ? "none" : "grayscale(100%)",
          }}
        />
      )}
      {hasItems && (
        <span
          style={{
            position: "absolute",
            bottom: 1,
            right: 2,
            color: "#FFFFFF",
            fontSize: 11,
            fontWeight: "bold",
            fontFamily: "monospace",
            textShadow: "1px 1px 0 #3F3F3F, -1px -1px 0 #3F3F3F, 1px -1px 0 #3F3F3F, -1px 1px 0 #3F3F3F",
          }}
        >
          {count > 999 ? "999+" : count}
        </span>
      )}
    </div>
  );
}


export default function InventoryPanel({ inventory, pickaxeTier, enchantments, onClose }: InventoryPanelProps) {
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

  // Conta total de minerios e itens
  const totalOres = ORE_ORDER.reduce((sum, ore) => {
    const val = inventory[ore as keyof MiningInventory];
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);
  const totalDungeonItems = DUNGEON_ITEM_ORDER.reduce((sum, item) => {
    const val = inventory[item as keyof MiningInventory];
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.75)" }}
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
          padding: 10,
          imageRendering: "pixelated",
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Title */}
        <div
          className="text-center font-mono font-bold"
          style={{
            color: "#404040",
            fontSize: 13,
            textShadow: "1px 1px 0 #FFFFFF",
            marginBottom: 8,
            letterSpacing: 1,
          }}
        >
          INVENTARIO
        </div>

        {/* Picareta section */}
        <div style={{ marginBottom: 10 }}>
          <div
            className="font-mono font-bold"
            style={{
              color: "#555",
              fontSize: 10,
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Picareta Equipada
          </div>
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
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            {/* Picareta icon */}
            <div
              style={{
                width: 48,
                height: 48,
                background: "#6B6B6B",
                border: "2px solid",
                borderTopColor: "#373737",
                borderLeftColor: "#373737",
                borderBottomColor: "#FFFFFF",
                borderRightColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img
                src={PICKAXE_TEXTURES[pickaxeTier]}
                alt={PICKAXE_TIERS[pickaxeTier].name}
                width={36}
                height={36}
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            
            {/* Picareta info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="font-mono font-bold"
                style={{
                  color: PICKAXE_TIERS[pickaxeTier].color,
                  fontSize: 12,
                  textShadow: "1px 1px 0 #000",
                  marginBottom: 4,
                }}
              >
                {PICKAXE_TIERS[pickaxeTier].name}
              </div>
              
              {/* Encantamentos */}
              {enchantments.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {enchantments.map((enc, i) => (
                    <div
                      key={enc.id + "-" + i}
                      className="font-mono"
                      style={{
                        fontSize: 10,
                        color: RARITY_COLORS[enc.rarity],
                        textShadow: "1px 1px 0 #000",
                      }}
                    >
                      {enc.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    color: "#666",
                    fontStyle: "italic",
                  }}
                >
                  Sem encantamentos
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Minerios section */}
        <div style={{ marginBottom: 10 }}>
          <div
            className="font-mono font-bold"
            style={{
              color: "#555",
              fontSize: 10,
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Minerios ({totalOres})
          </div>
          <div
            style={{
              background: "#8B8B8B",
              border: "2px solid",
              borderTopColor: "#373737",
              borderLeftColor: "#373737",
              borderBottomColor: "#FFFFFF",
              borderRightColor: "#FFFFFF",
              padding: 4,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 40px)",
                gap: 2,
              }}
            >
              {ORE_ORDER.map((oreType) => {
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
        </div>

        {/* Dungeon items section */}
        <div>
          <div
            className="font-mono font-bold"
            style={{
              color: "#555",
              fontSize: 10,
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Itens de Dungeon ({totalDungeonItems})
          </div>
          <div
            style={{
              background: "#8B8B8B",
              border: "2px solid",
              borderTopColor: "#373737",
              borderLeftColor: "#373737",
              borderBottomColor: "#FFFFFF",
              borderRightColor: "#FFFFFF",
              padding: 4,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 40px)",
                gap: 2,
              }}
            >
              {DUNGEON_ITEM_ORDER.map((itemType) => {
                const config = DUNGEON_ITEM_CONFIG[itemType];
                const count = inventory[itemType];
                return (
                  <Slot
                    key={itemType}
                    texture={config.texture}
                    count={count}
                    name={config.name}
                    rarity={config.rarity}
                  />
                );
              })}
              {/* Empty slots to fill row */}
              <Slot empty />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-between items-center font-mono"
          style={{ marginTop: 8, padding: "0 4px" }}
        >
          <span style={{ color: "#404040", fontSize: 10 }}>
            Total: <strong style={{ color: "#2E7D32" }}>{totalOres + totalDungeonItems}</strong> itens
          </span>
          <span style={{ color: "#6D6D6D", fontSize: 9 }}>
            [E] ou [ESC] para fechar
          </span>
        </div>
      </div>
    </div>
  );
}
