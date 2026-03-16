"use client";

import { audioService } from "@/lib/game/audio";

interface ActionButtonsProps {
  onShop: () => void;
  onEnchant: () => void;
}

export default function ActionButtons({ onShop, onEnchant }: ActionButtonsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex items-center justify-center gap-3 p-4 pb-6 max-w-lg mx-auto pointer-events-auto">
        {/* Shop button - Minecraft stone button style */}
        <button
          onClick={() => {
            audioService.playClick();
            onShop();
          }}
          className="flex items-center gap-2 px-5 py-2.5 font-bold text-xs font-mono transition-all active:translate-y-[1px]"
          style={{
            background: "linear-gradient(180deg, #707070 0%, #555555 50%, #484848 100%)",
            color: "#E0E0E0",
            border: "3px solid #3C3C3C",
            boxShadow: "inset 0 2px 0 #8A8A8A, inset 0 -2px 0 #333, 0 4px 8px rgba(0,0,0,0.5)",
            textShadow: "2px 2px 0 #222",
            imageRendering: "pixelated",
          }}
        >
          <span style={{ fontSize: 14 }}>{"\u26CF"}</span>
          SHOP
        </button>

        {/* Enchant button - Minecraft purple/enchanting style */}
        <button
          onClick={() => {
            audioService.playClick();
            onEnchant();
          }}
          className="flex items-center gap-2 px-5 py-2.5 font-bold text-xs font-mono transition-all active:translate-y-[1px]"
          style={{
            background: "linear-gradient(180deg, #4A2070 0%, #351555 50%, #2A1040 100%)",
            color: "#CE93D8",
            border: "3px solid #1A0A2E",
            boxShadow: "inset 0 2px 0 #6A3090, inset 0 -2px 0 #1A0A2E, 0 4px 8px rgba(0,0,0,0.5), 0 0 12px rgba(124,77,255,0.15)",
            textShadow: "2px 2px 0 #000",
            imageRendering: "pixelated",
          }}
        >
          <span style={{ fontSize: 14 }}>{"\u2728"}</span>
          ENCHANT
        </button>
      </div>
    </div>
  );
}
