import { supabase } from '@/lib/supabase';
import { BlockType } from './types';

// Tipos de minerio que podem ser coletados
export type OreType = 'coal' | 'raw_iron' | 'raw_copper' | 'lapis_lazuli' | 'raw_gold' | 'redstone' | 'diamond' | 'emerald';

export interface MiningInventory {
  coal: number;
  raw_iron: number;
  raw_copper: number;
  lapis_lazuli: number;
  raw_gold: number;
  redstone: number;
  diamond: number;
  emerald: number;
}

// URLs das texturas raw do Minecraft
const RAW_TEX = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/item/';

export const ORE_CONFIG: Record<OreType, { name: string; texture: string; color: string }> = {
  coal:         { name: 'Carvao',        texture: RAW_TEX + 'coal.png',         color: '#2C2C2C' },
  raw_iron:     { name: 'Ferro Bruto',   texture: RAW_TEX + 'raw_iron.png',     color: '#D4A574' },
  raw_copper:   { name: 'Cobre Bruto',   texture: RAW_TEX + 'raw_copper.png',   color: '#E07B50' },
  lapis_lazuli: { name: 'Lapis Lazuli',  texture: RAW_TEX + 'lapis_lazuli.png', color: '#1A47A5' },
  raw_gold:     { name: 'Ouro Bruto',    texture: RAW_TEX + 'raw_gold.png',     color: '#FBC02D' },
  redstone:     { name: 'Redstone',      texture: RAW_TEX + 'redstone.png',     color: '#D32F2F' },
  diamond:      { name: 'Diamante',      texture: RAW_TEX + 'diamond.png',      color: '#00E5FF' },
  emerald:      { name: 'Esmeralda',     texture: RAW_TEX + 'emerald.png',      color: '#00C853' },
};

// Mapeia BlockType para OreType (apenas os que dropam minerio)
export function blockToOre(blockType: BlockType): OreType | null {
  const mapping: Partial<Record<BlockType, OreType>> = {
    coal: 'coal',
    deepslate_coal: 'coal',
    iron: 'raw_iron',
    deepslate_iron: 'raw_iron',
    copper: 'raw_copper',
    deepslate_copper: 'raw_copper',
    lapis: 'lapis_lazuli',
    deepslate_lapis: 'lapis_lazuli',
    gold: 'raw_gold',
    deepslate_gold: 'raw_gold',
    redstone: 'redstone',
    deepslate_redstone: 'redstone',
    diamond: 'diamond',
    deepslate_diamond: 'diamond',
    emerald: 'emerald',
    deepslate_emerald: 'emerald',
  };
  return mapping[blockType] ?? null;
}

// Quantidade de drop por tipo de minerio
export function getDropAmount(blockType: BlockType): number {
  // Lapis e redstone dropam mais
  if (blockType === 'lapis' || blockType === 'deepslate_lapis') return Math.floor(Math.random() * 5) + 4; // 4-8
  if (blockType === 'redstone' || blockType === 'deepslate_redstone') return Math.floor(Math.random() * 3) + 4; // 4-6
  // Outros dropam 1
  return 1;
}

export const DEFAULT_INVENTORY: MiningInventory = {
  coal: 0,
  raw_iron: 0,
  raw_copper: 0,
  lapis_lazuli: 0,
  raw_gold: 0,
  redstone: 0,
  diamond: 0,
  emerald: 0,
};

export async function loadInventory(username: string): Promise<MiningInventory> {
  const { data, error } = await supabase
    .from('mining_inventory')
    .select('coal, raw_iron, raw_copper, lapis_lazuli, raw_gold, redstone, diamond, emerald')
    .eq('username', username)
    .single();

  if (error || !data) {
    return { ...DEFAULT_INVENTORY };
  }

  return {
    coal: data.coal ?? 0,
    raw_iron: data.raw_iron ?? 0,
    raw_copper: data.raw_copper ?? 0,
    lapis_lazuli: data.lapis_lazuli ?? 0,
    raw_gold: data.raw_gold ?? 0,
    redstone: data.redstone ?? 0,
    diamond: data.diamond ?? 0,
    emerald: data.emerald ?? 0,
  };
}

export async function saveInventory(username: string, inventory: MiningInventory): Promise<void> {
  const { error } = await supabase
    .from('mining_inventory')
    .upsert({
      username,
      ...inventory,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'username' });

  if (error) {
    console.error('[v0] Erro ao salvar inventario:', error);
  }
}
