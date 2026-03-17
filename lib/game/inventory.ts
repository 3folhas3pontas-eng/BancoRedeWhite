import { supabase } from '@/lib/supabase';
import { BlockType } from './types';

// Tipos de minerio que podem ser coletados
export type OreType = 'coal' | 'raw_iron' | 'raw_copper' | 'lapis_lazuli' | 'raw_gold' | 'redstone' | 'diamond' | 'emerald';

// Tipos de itens de dungeon
export type DungeonItemType = 
  | 'string' | 'rotten_flesh' | 'bone' | 'wheat' | 'gunpowder' 
  | 'iron_ingot' | 'gold_ingot' | 'slimeball' | 'bucket' 
  | 'name_tag' | 'saddle' | 'music_disc' | 'golden_apple' 
  | 'enchanted_golden_apple' | 'iron_horse_armor' | 'gold_horse_armor' 
  | 'diamond_horse_armor' | 'enchantment_book' | 'experience_bottle';

export interface MiningInventory {
  // Minerios
  coal: number;
  raw_iron: number;
  raw_copper: number;
  lapis_lazuli: number;
  raw_gold: number;
  redstone: number;
  diamond: number;
  emerald: number;
  // Itens de dungeon
  string: number;
  rotten_flesh: number;
  bone: number;
  wheat: number;
  gunpowder: number;
  iron_ingot: number;
  gold_ingot: number;
  slimeball: number;
  bucket: number;
  name_tag: number;
  saddle: number;
  music_disc: number;
  golden_apple: number;
  enchanted_golden_apple: number;
  iron_horse_armor: number;
  gold_horse_armor: number;
  diamond_horse_armor: number;
  enchantment_book: number;
  experience_bottle: number;
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

export const DUNGEON_ITEM_CONFIG: Record<DungeonItemType, { name: string; texture: string; color: string; rarity: string }> = {
  string:                  { name: 'Linha',                 texture: RAW_TEX + 'string.png',              color: '#E0E0E0', rarity: 'common' },
  rotten_flesh:            { name: 'Carne Podre',           texture: RAW_TEX + 'rotten_flesh.png',        color: '#8B7355', rarity: 'common' },
  bone:                    { name: 'Osso',                  texture: RAW_TEX + 'bone.png',                color: '#F5F5DC', rarity: 'common' },
  wheat:                   { name: 'Trigo',                 texture: RAW_TEX + 'wheat.png',               color: '#DAA520', rarity: 'common' },
  gunpowder:               { name: 'Polvora',               texture: RAW_TEX + 'gunpowder.png',           color: '#696969', rarity: 'common' },
  iron_ingot:              { name: 'Barra de Ferro',        texture: RAW_TEX + 'iron_ingot.png',          color: '#D7CCC8', rarity: 'uncommon' },
  gold_ingot:              { name: 'Barra de Ouro',         texture: RAW_TEX + 'gold_ingot.png',          color: '#FBC02D', rarity: 'uncommon' },
  slimeball:               { name: 'Bola de Slime',         texture: RAW_TEX + 'slime_ball.png',          color: '#7CB342', rarity: 'uncommon' },
  bucket:                  { name: 'Balde',                 texture: RAW_TEX + 'bucket.png',              color: '#9E9E9E', rarity: 'uncommon' },
  name_tag:                { name: 'Etiqueta',              texture: RAW_TEX + 'name_tag.png',            color: '#F5F5DC', rarity: 'rare' },
  saddle:                  { name: 'Sela',                  texture: RAW_TEX + 'saddle.png',              color: '#8B4513', rarity: 'rare' },
  music_disc:              { name: 'Disco de Musica',       texture: RAW_TEX + 'music_disc_cat.png',      color: '#4CAF50', rarity: 'rare' },
  golden_apple:            { name: 'Maca Dourada',          texture: RAW_TEX + 'golden_apple.png',        color: '#FFD700', rarity: 'epic' },
  enchantment_book:        { name: 'Livro Encantado',       texture: RAW_TEX + 'book.png',                color: '#9C27B0', rarity: 'epic' },
  iron_horse_armor:        { name: 'Armadura Cavalo Ferro', texture: RAW_TEX + 'iron_horse_armor.png',    color: '#D7CCC8', rarity: 'epic' },
  enchanted_golden_apple:  { name: 'Maca Encantada',        texture: RAW_TEX + 'golden_apple.png',        color: '#FF00FF', rarity: 'legendary' },
  gold_horse_armor:        { name: 'Armadura Cavalo Ouro',  texture: RAW_TEX + 'golden_horse_armor.png',  color: '#FBC02D', rarity: 'legendary' },
  diamond_horse_armor:     { name: 'Armadura Cavalo Diam.', texture: RAW_TEX + 'diamond_horse_armor.png', color: '#00E5FF', rarity: 'legendary' },
  experience_bottle:       { name: 'Frasco de XP',          texture: RAW_TEX + 'experience_bottle.png',   color: '#4A148C', rarity: 'legendary' },
};

// Mapeia nome do loot para tipo de item no inventario
export function lootNameToItemType(lootName: string): DungeonItemType | OreType | null {
  const mapping: Record<string, DungeonItemType | OreType> = {
    'String': 'string',
    'Rotten Flesh': 'rotten_flesh',
    'Bone': 'bone',
    'Wheat': 'wheat',
    'Gunpowder': 'gunpowder',
    'Iron Ingot': 'iron_ingot',
    'Gold Ingot': 'gold_ingot',
    'Redstone Dust': 'redstone',
    'Slimeball': 'slimeball',
    'Bucket': 'bucket',
    'Name Tag': 'name_tag',
    'Saddle': 'saddle',
    'Lapis Lazuli x8': 'lapis_lazuli',
    'Diamond': 'diamond',
    'Emerald': 'emerald',
    'Music Disc': 'music_disc',
    'Golden Apple': 'golden_apple',
    'Iron Horse Armor': 'iron_horse_armor',
    'Enchantment Book': 'enchantment_book',
    'Enchanted Golden Apple': 'enchanted_golden_apple',
    'Diamond Horse Armor': 'diamond_horse_armor',
    'Golden Horse Armor': 'gold_horse_armor',
    'Bottle o\' Enchanting': 'experience_bottle',
  };
  return mapping[lootName] ?? null;
}

// Quantidade especial para certos loots
export function getLootAmount(lootName: string): number {
  if (lootName === 'Lapis Lazuli x8') return 8;
  return 1;
}

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
  // Minerios
  coal: 0,
  raw_iron: 0,
  raw_copper: 0,
  lapis_lazuli: 0,
  raw_gold: 0,
  redstone: 0,
  diamond: 0,
  emerald: 0,
  // Itens de dungeon
  string: 0,
  rotten_flesh: 0,
  bone: 0,
  wheat: 0,
  gunpowder: 0,
  iron_ingot: 0,
  gold_ingot: 0,
  slimeball: 0,
  bucket: 0,
  name_tag: 0,
  saddle: 0,
  music_disc: 0,
  golden_apple: 0,
  enchanted_golden_apple: 0,
  iron_horse_armor: 0,
  gold_horse_armor: 0,
  diamond_horse_armor: 0,
  enchantment_book: 0,
  experience_bottle: 0,
};

export async function loadInventory(username: string): Promise<MiningInventory> {
  const { data, error } = await supabase
    .from('mining_inventory')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) {
    return { ...DEFAULT_INVENTORY };
  }

  return {
    // Minerios
    coal: data.coal ?? 0,
    raw_iron: data.raw_iron ?? 0,
    raw_copper: data.raw_copper ?? 0,
    lapis_lazuli: data.lapis_lazuli ?? 0,
    raw_gold: data.raw_gold ?? 0,
    redstone: data.redstone ?? 0,
    diamond: data.diamond ?? 0,
    emerald: data.emerald ?? 0,
    // Itens de dungeon
    string: data.string ?? 0,
    rotten_flesh: data.rotten_flesh ?? 0,
    bone: data.bone ?? 0,
    wheat: data.wheat ?? 0,
    gunpowder: data.gunpowder ?? 0,
    iron_ingot: data.iron_ingot ?? 0,
    gold_ingot: data.gold_ingot ?? 0,
    slimeball: data.slimeball ?? 0,
    bucket: data.bucket ?? 0,
    name_tag: data.name_tag ?? 0,
    saddle: data.saddle ?? 0,
    music_disc: data.music_disc ?? 0,
    golden_apple: data.golden_apple ?? 0,
    enchanted_golden_apple: data.enchanted_golden_apple ?? 0,
    iron_horse_armor: data.iron_horse_armor ?? 0,
    gold_horse_armor: data.gold_horse_armor ?? 0,
    diamond_horse_armor: data.diamond_horse_armor ?? 0,
    enchantment_book: data.enchantment_book ?? 0,
    experience_bottle: data.experience_bottle ?? 0,
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
