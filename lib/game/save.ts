import { supabase } from '@/lib/supabase';
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
  const { data, error } = await supabase
    .from('mining_save')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error('[v0] loadMiningSave error:', error.message, '| code:', error.code);
    return null;
  }
  if (!data) {
    console.warn('[v0] loadMiningSave: nenhum dado encontrado para', username);
    return null;
  }

  console.log('[v0] loadMiningSave OK:', { username, pickaxe_tier: data.pickaxe_tier, pick_strength: data.pick_strength, level: data.level });

  return {
    xp:           data.xp,
    level:        data.level,
    depth:        data.depth,
    blocks_mined: data.blocks_mined,
    pickaxe_tier: data.pickaxe_tier,
    pick_strength: parseFloat(data.pick_strength),
    pick_speed:   parseFloat(data.pick_speed),
    tnt_radius:   data.tnt_radius,
    tnt_spawn:    parseFloat(data.tnt_spawn),
    beacon_spawn: parseFloat(data.beacon_spawn),
    dungeon_spawn:parseFloat(data.dungeon_spawn),
    chest_spawn:  parseFloat(data.chest_spawn),
    max_combo:    data.max_combo,
    enchantments: data.enchantments ?? [],
  };
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
    enchantments: enchantments,
  };

  await supabase
    .from('mining_save')
    .upsert(payload, { onConflict: 'username' });
}
