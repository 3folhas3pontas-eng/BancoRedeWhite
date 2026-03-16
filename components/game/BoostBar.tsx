"use client";

import { useCallback } from "react";

interface BoostBarProps {
  chargeProgress: number; // 0..1
  isBoostActive: boolean;
  boostTimeLeft: number; // seconds remaining
  onActivateBoost: () => void;
}

export default function BoostBar({
  chargeProgress,
  isBoostActive,
  boostTimeLeft,
  onActivateBoost,
}: BoostBarProps) {
  const isReady = chargeProgress >= 1 && !isBoostActive;

  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2">
      {/* Vertical charge bar container */}
      <div
        className="relative flex flex-col items-center"
        style={{
          width: 38,
          height: 180,
        }}
      >
        {/* Bar background */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: "rgba(10,10,15,0.85)",
            border: isBoostActive
              ? "2px solid #FF9800"
              : isReady
                ? "2px solid #4CAF50"
                : "1px solid rgba(255,255,255,0.1)",
            boxShadow: isBoostActive
              ? "0 0 20px rgba(255,152,0,0.5), inset 0 0 15px rgba(255,152,0,0.15)"
              : isReady
                ? "0 0 15px rgba(76,175,80,0.4), inset 0 0 10px rgba(76,175,80,0.1)"
                : "inset 0 0 8px rgba(0,0,0,0.4)",
            backdropFilter: "blur(8px)",
            transition: "border-color 0.3s, box-shadow 0.3s",
          }}
        >
          {/* Fill from bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 rounded-b-full"
            style={{
              height: `${(isBoostActive ? boostTimeLeft / 15 : chargeProgress) * 100}%`,
              background: isBoostActive
                ? "linear-gradient(0deg, #FF6D00, #FFAB00, #FF9800)"
                : chargeProgress >= 1
                  ? "linear-gradient(0deg, #2E7D32, #4CAF50, #8BC34A)"
                  : "linear-gradient(0deg, #1565C0, #42A5F5, #90CAF9)",
              transition: isBoostActive ? "height 0.5s linear" : "height 0.2s ease",
              boxShadow: isBoostActive
                ? "0 0 12px rgba(255,152,0,0.5)"
                : "0 0 6px rgba(66,165,245,0.3)",
            }}
          />

          {/* Animated pulse lines when active */}
          {isBoostActive && (
            <>
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background: "linear-gradient(0deg, transparent 40%, rgba(255,200,0,0.15) 60%, transparent 80%)",
                }}
              />
            </>
          )}

          {/* Icon at center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-sm font-bold"
              style={{
                color: isBoostActive
                  ? "#FFEB3B"
                  : isReady
                    ? "#4CAF50"
                    : "rgba(255,255,255,0.35)",
                textShadow: isBoostActive ? "0 0 8px rgba(255,235,59,0.6)" : "none",
                fontSize: isBoostActive ? 16 : 11,
              }}
            >
              {isBoostActive
                ? Math.ceil(boostTimeLeft) + "s"
                : Math.floor(chargeProgress * 100) + "%"}
            </span>
          </div>
        </div>

        {/* Label */}
        <span
          className="mt-1 text-[8px] font-bold tracking-widest text-center"
          style={{
            color: isBoostActive
              ? "#FF9800"
              : isReady
                ? "#4CAF50"
                : "rgba(255,255,255,0.3)",
          }}
        >
          BOOST
        </span>
      </div>

      {/* Activate button when fully charged */}
      {isReady && (
        <button
          onClick={onActivateBoost}
          className="pointer-events-auto animate-bounce"
          style={{
            background: "linear-gradient(135deg, #FF6D00, #FF9800)",
            color: "#fff",
            border: "2px solid #FFAB00",
            borderRadius: 12,
            padding: "8px 12px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(255,152,0,0.5), 0 4px 12px rgba(0,0,0,0.3)",
            textShadow: "0 1px 3px rgba(0,0,0,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          ACTIVATE
        </button>
      )}

      {/* Active indicator */}
      {isBoostActive && (
        <div
          className="text-center animate-pulse"
          style={{
            color: "#FFEB3B",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1.5,
            textShadow: "0 0 10px rgba(255,235,59,0.6)",
          }}
        >
          {"20x POWER!"}
        </div>
      )}
    </div>
  );
}
