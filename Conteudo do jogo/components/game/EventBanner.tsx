"use client";

import { useEffect, useState } from "react";
import { BeaconEvent } from "@/lib/game/types";

interface EventBannerProps {
  event: BeaconEvent | null;
}

export default function EventBanner({ event }: EventBannerProps) {
  const [showFlash, setShowFlash] = useState(false);
  const [showName, setShowName] = useState(false);
  const [lastEventType, setLastEventType] = useState<string | null>(null);

  useEffect(() => {
    if (!event || !event.active) {
      setShowFlash(false);
      setShowName(false);
      return;
    }
    // Only trigger animation on new event
    if (event.type !== lastEventType) {
      setLastEventType(event.type);
      setShowFlash(true);
      setShowName(false);
      // After flash, show name
      const t1 = setTimeout(() => {
        setShowFlash(false);
        setShowName(true);
      }, 600);
      // Hide name after 3s
      const t2 = setTimeout(() => {
        setShowName(false);
      }, 4000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [event, lastEventType]);

  // Reset lastEventType when event ends
  useEffect(() => {
    if (!event || !event.active) {
      setLastEventType(null);
    }
  }, [event]);

  if (!event || !event.active) return null;

  const timePercent = event.timeLeft / event.duration;

  return (
    <>
      {/* Full screen flash on activation */}
      {showFlash && (
        <div
          className="fixed inset-0 pointer-events-none z-[60]"
          style={{
            background: event.color,
            animation: "eventFlash 0.6s ease-out forwards",
          }}
        />
      )}

      {/* Event name banner - dramatic entrance */}
      {showName && (
        <div
          className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[61] pointer-events-none"
          style={{ animation: "eventBannerIn 0.5s ease-out forwards" }}
        >
          {/* Glowing background */}
          <div
            className="relative px-8 py-4"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.85) 80%, transparent)`,
            }}
          >
            {/* Top decorative line */}
            <div
              className="absolute top-0 left-[10%] right-[10%] h-[2px]"
              style={{ background: event.color, boxShadow: `0 0 10px ${event.color}` }}
            />
            {/* Bottom decorative line */}
            <div
              className="absolute bottom-0 left-[10%] right-[10%] h-[2px]"
              style={{ background: event.color, boxShadow: `0 0 10px ${event.color}` }}
            />

            <div className="text-center">
              <div
                className="text-sm tracking-[0.3em] uppercase font-mono"
                style={{
                  color: event.color,
                  textShadow: `0 0 15px ${event.color}`,
                  opacity: 0.8,
                }}
              >
                BEACON EVENT
              </div>
              <div
                className="text-3xl md:text-4xl font-black tracking-wider font-mono mt-1"
                style={{
                  color: "#fff",
                  textShadow: `0 0 20px ${event.color}, 0 0 40px ${event.color}, 2px 2px 0 #000`,
                  letterSpacing: "0.1em",
                }}
              >
                {event.name}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active event timer bar at top */}
      <div className="fixed top-[60px] left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded"
          style={{
            background: "rgba(0,0,0,0.8)",
            border: `1px solid ${event.color}40`,
            boxShadow: `0 0 15px ${event.color}30`,
            minWidth: "200px",
          }}
        >
          {/* Beacon icon pixel art */}
          <div className="relative w-5 h-5 flex-shrink-0">
            <div
              className="w-5 h-5 rounded-sm"
              style={{
                background: `linear-gradient(135deg, ${event.color}, ${event.color}80)`,
                boxShadow: `0 0 8px ${event.color}`,
                animation: "beaconPulse 1s infinite",
              }}
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-0.5">
              <span
                className="text-[10px] font-mono font-bold tracking-wider"
                style={{ color: event.color }}
              >
                {event.name}
              </span>
              <span className="text-[10px] font-mono text-white/70">
                {Math.ceil(event.timeLeft)}s
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${timePercent * 100}%`,
                  background: `linear-gradient(90deg, ${event.color}80, ${event.color})`,
                  boxShadow: `0 0 6px ${event.color}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Screen edge glow while event is active */}
      <div
        className="fixed inset-0 pointer-events-none z-[45]"
        style={{
          boxShadow: `inset 0 0 60px ${event.color}20, inset 0 0 120px ${event.color}10`,
          animation: "eventEdgeGlow 2s ease-in-out infinite",
        }}
      />

      <style jsx>{`
        @keyframes eventFlash {
          0% { opacity: 0.9; }
          100% { opacity: 0; }
        }
        @keyframes eventBannerIn {
          0% { transform: translateX(-50%) scaleX(0); opacity: 0; }
          50% { transform: translateX(-50%) scaleX(1.1); opacity: 1; }
          100% { transform: translateX(-50%) scaleX(1); opacity: 1; }
        }
        @keyframes beaconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes eventEdgeGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
