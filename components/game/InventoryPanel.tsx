'use client';

import { PlayerStats, Enchantment } from '@/lib/game/types';
import { PICKAXE_TIERS, ENCHANTMENTS } from '@/lib/game/constants';

interface InventoryPanelProps {
  stats: PlayerStats;
  enchantments: Enchantment[];
  onClose: () => void;
}

export default function InventoryPanel({ stats, enchantments, onClose }: InventoryPanelProps) {
  const tierData = PICKAXE_TIERS[stats.pickaxeTier];
  const tierColors: Record<string, string> = {
    wood: '#8B5E3C',
    stone: '#9E9E9E',
    iron: '#D7CCC8',
    gold: '#FBC02D',
    diamond: '#00E5FF',
    netherite: '#4A3B4A',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(480px, 95vw)',
          maxHeight: '90vh',
          background: 'linear-gradient(180deg, #3B2A1A 0%, #2A1D10 100%)',
          border: '4px solid #8D6E63',
          borderRadius: 3,
          boxShadow: '0 0 40px rgba(141,110,99,0.5), inset 0 0 30px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          imageRendering: 'pixelated' as const,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '3px solid #5D4037',
            background: 'linear-gradient(180deg, rgba(255,215,0,0.1) 0%, transparent 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 18,
              fontWeight: 'bold',
              color: '#FFD54F',
              textShadow: '2px 2px 0 #3E2723',
              letterSpacing: 2,
            }}
          >
            INVENTÁRIO
          </span>
          <button
            onClick={onClose}
            style={{
              fontFamily: 'monospace',
              fontSize: 10,
              color: '#A1887F',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              opacity: 0.6,
            }}
          >
            [ESC]
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            padding: '16px',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Pickaxe Info */}
          <div
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: `2px solid ${tierColors[stats.pickaxeTier]}`,
              borderRadius: 3,
              padding: 12,
            }}
          >
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#FFD54F',
                fontWeight: 'bold',
                marginBottom: 8,
                textShadow: '1px 1px 0 #000',
              }}
            >
              PICARETA
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'monospace',
                  fontSize: 10,
                  color: '#A1887F',
                }}
              >
                <span>Tipo:</span>
                <span style={{ color: tierColors[stats.pickaxeTier], fontWeight: 'bold' }}>
                  {tierData.name}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'monospace',
                  fontSize: 10,
                  color: '#A1887F',
                }}
              >
                <span>Força:</span>
                <span style={{ color: '#FFB74D' }}>+{stats.pickStrength.toFixed(1)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'monospace',
                  fontSize: 10,
                  color: '#A1887F',
                }}
              >
                <span>Velocidade:</span>
                <span style={{ color: '#FFB74D' }}>+{stats.pickSpeed.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Upgrades */}
          <div
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '2px solid #5D4037',
              borderRadius: 3,
              padding: 12,
            }}
          >
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#FFD54F',
                fontWeight: 'bold',
                marginBottom: 8,
                textShadow: '1px 1px 0 #000',
              }}
            >
              UPGRADES DO MUNDO
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'monospace',
                  fontSize: 9,
                  color: '#A1887F',
                }}
              >
                <span>Raio TNT: Nível {stats.tntRadius}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'monospace',
                  fontSize: 9,
                  color: '#A1887F',
                }}
              >
                <span>Spawn TNT: {(stats.tntSpawn * 100).toFixed(0)}%</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'monospace',
                  fontSize: 9,
                  color: '#A1887F',
                }}
              >
                <span>Spawn Beacon: {(stats.beaconSpawn * 100).toFixed(0)}%</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'monospace',
                  fontSize: 9,
                  color: '#A1887F',
                }}
              >
                <span>Spawn Dungeon: {(stats.dungeonSpawn * 100).toFixed(0)}%</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'monospace',
                  fontSize: 9,
                  color: '#A1887F',
                }}
              >
                <span>Spawn Baú: {(stats.chestSpawn * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Enchantments */}
          {enchantments.length > 0 && (
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '2px solid #5D4037',
                borderRadius: 3,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: '#FFD54F',
                  fontWeight: 'bold',
                  marginBottom: 8,
                  textShadow: '1px 1px 0 #000',
                }}
              >
                ENCANTAMENTOS ({enchantments.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {enchantments.map((ench, i) => {
                  const enchData = ENCHANTMENTS[ench.type];
                  return (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(156,39,176,0.15)',
                        border: '1px solid rgba(156,39,176,0.3)',
                        borderRadius: 2,
                        padding: 6,
                        fontFamily: 'monospace',
                        fontSize: 9,
                        color: '#CE93D8',
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{enchData?.name || 'Unknown'}</div>
                      <div style={{ fontSize: 8, color: 'rgba(206,147,216,0.7)', marginTop: 2 }}>
                        Nível {ench.level}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats */}
          <div
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '2px solid #5D4037',
              borderRadius: 3,
              padding: 12,
            }}
          >
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#FFD54F',
                fontWeight: 'bold',
                marginBottom: 8,
                textShadow: '1px 1px 0 #000',
              }}
            >
              ESTATÍSTICAS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'monospace',
                  fontSize: 9,
                  color: '#A1887F',
                }}
              >
                <span>Blocos Minerados:</span>
                <span style={{ color: '#69F0AE' }}>{stats.blocksMinedTotal}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'monospace',
                  fontSize: 9,
                  color: '#A1887F',
                }}
              >
                <span>Maior Combo:</span>
                <span style={{ color: '#FF9800' }}>{stats.maxCombo}x</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'monospace',
                  fontSize: 9,
                  color: '#A1887F',
                }}
              >
                <span>Profundidade Max:</span>
                <span style={{ color: '#E0E0E0' }}>-{stats.depth}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
