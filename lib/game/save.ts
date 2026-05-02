import { PlayerStats, Enchantment } from '@/lib/game/types';

export interface MiningSave {
  xp: number;
  level: number;
  depth: number;
  blocks_mined: number;
  pickaxe_tier: PlayerStats['pickaxeTier'];
  pick_strength: number;
  pick_speed: number;
  tnt_radius: number;
  tnt_spawn: number;
  beacon_spawn: number;
  dungeon_spawn: number;
  chest_spawn: number;
  max_combo: number;
  enchantments: Enchantment[];
}

export async function loadMiningSave(username: string): Promise<MiningSave | null> {
  try {
    const res = await fetch('/api/get-mining-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok || !data.save) return null;
    const s = data.save;
    return {
      xp:           s.xp,
      level:        s.level,
      depth:        s.depth,
      blocks_mined: s.blocks_mined,
      pickaxe_tier: s.pickaxe_tier,
      pick_strength: parseFloat(s.pick_strength),
      pick_speed:   parseFloat(s.pick_speed),
      tnt_radius:   s.tnt_radius,
      tnt_spawn:    parseFloat(s.tnt_spawn),
      beacon_spawn: parseFloat(s.beacon_spawn),
      dungeon_spawn:parseFloat(s.dungeon_spawn),
      chest_spawn:  parseFloat(s.chest_spawn),
      max_combo:    s.max_combo,
      enchantments: s.enchantments ?? [],
    };
  } catch {
    return null;
  }
}

export async function saveMiningSave(
  username: string,
  stats: PlayerStats,
  enchantments: Enchantment[]
): Promise<void> {
  const payload = {
    username,
    xp:           stats.xp,
    level:        stats.level,
    depth:        stats.depth,
    blocks_mined: stats.blocksMinedTotal,
    pickaxe_tier: stats.pickaxeTier,
    pick_strength:stats.pickStrength,
    pick_speed:   stats.pickSpeed,
    tnt_radius:   stats.tntRadius,
    tnt_spawn:    stats.tntSpawn,
    beacon_spawn: stats.beaconSpawn,
    dungeon_spawn:stats.dungeonSpawn,
    chest_spawn:  stats.chestSpawn,
    max_combo:    stats.maxCombo,
    enchantments,
  };

  await fetch('/api/save-mining', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
