export type BlockType =
  | "dirt"
  | "grass"
  | "stone"
  | "andesite"
  | "coal"
  | "iron"
  | "copper"
  | "lapis"
  | "gold"
  | "redstone"
  | "diamond"
  | "emerald"
  | "legendary"
  | "explosive"
  | "chest"
  | "mossy_cobblestone"
  | "spawner"
  | "deepslate"
  | "deepslate_coal"
  | "deepslate_iron"
  | "deepslate_copper"
  | "deepslate_lapis"
  | "deepslate_gold"
  | "deepslate_redstone"
  | "deepslate_diamond"
  | "deepslate_emerald"
  | "beacon"
  | "dungeon_chest"
  | "air";

export type PickaxeTier = "wood" | "stone" | "iron" | "gold" | "diamond" | "netherite";

export interface LootItem {
  name: string;
  icon: string;
  color: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  money: number;
  xp: number;
  description: string;
}

export interface Block {
  type: BlockType;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  hp: number;
  maxHp: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export enum Rarity {
  COMMON = "common",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary",
  MYTHIC = "mythic",
}

export interface Enchantment {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  value: number;
}

export interface PlayerStats {
  money: number;
  xp: number;
  level: number;
  depth: number;
  pickaxeTier: PickaxeTier;
  pickStrength: number;
  pickSpeed: number;
  combo: number;
  maxCombo: number;
  blocksMinedTotal: number;
  tntRadius: number;
  tntSpawn: number;
  beaconSpawn: number;
  dungeonSpawn: number;
  chestSpawn: number;
}

export interface BlockConfig {
  hp: number;
  color: string;
  texture: string;
  xp: number;
  money: number;
  particleColors: string[];
  crackColor: string;
}

export interface PickaxeState {
  x: number;
  y: number;
  velX: number;
  velY: number;
  angle: number;
  swingAngle: number;
  isSwinging: boolean;
  isMining: boolean;
  miningCooldown: number;
}

export type MobType = "zombie" | "skeleton" | "spider" | "creeper";

export interface Mob {
  id: number;
  type: MobType;
  x: number;
  y: number;
  velX: number;
  velY: number;
  hp: number;
  maxHp: number;
  width: number;
  height: number;
  hitFlash: number;
  animFrame: number;
  facingLeft: boolean;
  dead: boolean;
}

export type BeaconEventType =
  | "double_ores"
  | "boost_30s"
  | "transform_iron"
  | "transform_diamond"
  | "transform_emerald";

export interface BeaconEvent {
  type: BeaconEventType;
  name: string;
  color: string;
  duration: number;
  timeLeft: number;
  active: boolean;
}

export interface Dungeon {
  centerX: number;
  centerY: number;
  radius: number;
  spawnerType: MobType;
  spawnerActive: boolean;
  spawnTimer: number;
  maxMobs: number;
}
