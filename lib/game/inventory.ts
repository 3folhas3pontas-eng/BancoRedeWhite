import { supabase } from '@/lib/supabase';
import { BlockType } from './types';
// supabase usado apenas para leitura (fetchInventoryFromDB) - writes vao via API

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

// Todas as chaves do inventario
const ALL_INVENTORY_KEYS: (keyof MiningInventory)[] = [
  'coal', 'raw_iron', 'raw_copper', 'lapis_lazuli', 'raw_gold', 'redstone', 'diamond', 'emerald',
  'string', 'rotten_flesh', 'bone', 'wheat', 'gunpowder', 'iron_ingot', 'gold_ingot', 'slimeball',
  'bucket', 'name_tag', 'saddle', 'music_disc', 'golden_apple', 'enchanted_golden_apple',
  'iron_horse_armor', 'gold_horse_armor', 'diamond_horse_armor', 'enchantment_book', 'experience_bottle',
];

// Converte data do banco para MiningInventory
function dataToInventory(data: Record<string, unknown>): MiningInventory {
  const inv = { ...DEFAULT_INVENTORY };
  for (const key of ALL_INVENTORY_KEYS) {
    inv[key] = typeof data[key] === 'number' ? data[key] : 0;
  }
  return inv;
}

export async function loadInventory(username: string): Promise<MiningInventory> {
  const { data, error } = await supabase
    .from('mining_inventory')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) {
    return { ...DEFAULT_INVENTORY };
  }

  return dataToInventory(data as Record<string, unknown>);
}

// Busca inventario atual do banco (para sync)
export async function fetchInventoryFromDB(username: string): Promise<MiningInventory | null> {
  const { data, error } = await supabase
    .from('mining_inventory')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) return null;
  return dataToInventory(data as Record<string, unknown>);
}

// Calcula o delta (itens novos minerados na sessao)
export function calculateDelta(
  lastSaved: MiningInventory,
  current: MiningInventory
): MiningInventory {
  const delta = { ...DEFAULT_INVENTORY };
  for (const key of ALL_INVENTORY_KEYS) {
    // Delta = quanto o jogador minerou desde o ultimo save
    delta[key] = Math.max(0, current[key] - lastSaved[key]);
  }
  return delta;
}

// Faz merge do inventario do banco com os novos itens minerados
export function mergeInventory(
  dbInventory: MiningInventory,
  delta: MiningInventory
): MiningInventory {
  const merged = { ...DEFAULT_INVENTORY };
  for (const key of ALL_INVENTORY_KEYS) {
    merged[key] = dbInventory[key] + delta[key];
  }
  return merged;
}

// Colunas base que sempre existem na tabela mining_inventory
const BASE_ORE_KEYS: (keyof MiningInventory)[] = [
  'coal', 'raw_iron', 'raw_copper', 'lapis_lazuli',
  'raw_gold', 'redstone', 'diamond', 'emerald',
];

// Colunas adicionais de dungeon (adicionadas via ALTER TABLE)
const DUNGEON_KEYS: (keyof MiningInventory)[] = [
  'string', 'rotten_flesh', 'bone', 'wheat', 'gunpowder',
  'iron_ingot', 'gold_ingot', 'slimeball', 'bucket',
  'name_tag', 'saddle', 'music_disc', 'golden_apple',
  'enchanted_golden_apple', 'iron_horse_armor', 'gold_horse_armor',
  'diamond_horse_armor', 'enchantment_book', 'experience_bottle',
];

// Salva o inventario via API do backend (usa service_role_key no servidor)
async function saveInventoryDirect(username: string, inventory: MiningInventory): Promise<boolean> {
  try {
    const res = await fetch('/api/save-inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, action: 'upsert', inventory }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Salva inventario COM sincronizacao inteligente
// Busca o estado atual do banco, calcula o delta, e faz merge
export async function saveInventoryWithSync(
  username: string,
  currentInventory: MiningInventory,
  lastSavedInventory: MiningInventory
): Promise<MiningInventory> {
  // 1. Busca o inventario atual do banco
  const dbInventory = await fetchInventoryFromDB(username);
  
  if (!dbInventory) {
    // Primeira vez - salva direto
    await saveInventoryDirect(username, currentInventory);
    return currentInventory;
  }

  // 2. Calcula o delta (novos itens minerados desde o ultimo save)
  const delta = calculateDelta(lastSavedInventory, currentInventory);
  
  // 3. Verifica se tem algo novo para salvar
  const hasNewItems = ALL_INVENTORY_KEYS.some(key => delta[key] > 0);
  
  if (!hasNewItems) {
    // Nada novo minerado - retorna o que tem no banco
    return dbInventory;
  }

  // 4. Faz merge: banco + novos itens minerados
  const mergedInventory = mergeInventory(dbInventory, delta);
  
  // 5. Salva o resultado
  await saveInventoryDirect(username, mergedInventory);
  
  return mergedInventory;
}

// Funcao legada para compatibilidade (salva direto sem sync)
export async function saveInventory(username: string, inventory: MiningInventory): Promise<void> {
  await saveInventoryDirect(username, inventory);
}

// Salva APENAS o delta da sessao de forma INCREMENTAL via API do backend
// NUNCA sobrescreve valores - apenas adiciona ao banco
export async function saveSessionDelta(username: string, delta: MiningInventory): Promise<boolean> {
  const hasItems = ALL_INVENTORY_KEYS.some(key => delta[key] > 0);
  if (!hasItems) return true;

  try {
    const res = await fetch('/api/save-inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, action: 'delta', delta }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
