import { BlockType, BlockConfig, Rarity, Enchantment, PickaxeTier, MobType } from "./types";

export const BLOCK_SIZE = 40;
export const WORLD_WIDTH = 10;
export const GRAVITY = 0.15;
export const MAX_FALL_SPEED = 4;
export const MINING_COOLDOWN = 12;
export const MANUAL_MINING_MULT = 1.8;
export const PICKAXE_KNOCKBACK = 3.5;
export const BOOST_CHARGE_TIME = 60;
export const BOOST_DURATION = 15;
export const BOOST_MINING_MULT = 20;

export const PICKAXE_TIERS: Record<
  PickaxeTier,
  { strength: number; speed: number; cost: number; color: string; name: string }
> = {
  wood: { strength: 0.9, speed: 1, cost: 0, color: "#8B5E3C", name: "Wood Pickaxe" },
  stone: { strength: 1, speed: 1.2, cost: 5000, color: "#9E9E9E", name: "Stone Pickaxe" },
  iron: { strength: 1.5, speed: 1.2, cost: 500000, color: "#D7CCC8", name: "Iron Pickaxe" },
  gold: { strength: 1.6, speed: 1.5, cost: 150000, color: "#FBC02D", name: "Gold Pickaxe" },
  diamond: { strength: 1.7, speed: 1.8, cost: 200000, color: "#00E5FF", name: "Diamond Pickaxe" },
  netherite: { strength: 1.9, speed: 2, cost: 300000, color: "#4A3B4A", name: "Netherite Pickaxe" },
};

export const TIER_ORDER: PickaxeTier[] = ["wood", "stone", "iron", "gold", "diamond", "netherite"];

const TEX_BASE =
  "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/block/";

export const BLOCK_CONFIGS: Record<BlockType, BlockConfig> = {
  air: { hp: 0, color: "transparent", texture: "", xp: 0, money: 0, particleColors: [], crackColor: "" },
  grass: { hp: 8, color: "#4CAF50", texture: TEX_BASE + "grass_block_side.png", xp: 1, money: 1, particleColors: ["#4CAF50", "#8BC34A", "#795548"], crackColor: "#2E7D32" },
  dirt: { hp: 10, color: "#5D4037", texture: TEX_BASE + "dirt.png", xp: 2, money: 1, particleColors: ["#5D4037", "#795548", "#6D4C41"], crackColor: "#3E2723" },
  stone: { hp: 25, color: "#757575", texture: TEX_BASE + "stone.png", xp: 5, money: 3, particleColors: ["#757575", "#9E9E9E", "#616161"], crackColor: "#424242" },
  andesite: { hp: 30, color: "#8A8A8A", texture: TEX_BASE + "andesite.png", xp: 6, money: 3, particleColors: ["#8A8A8A", "#A0A0A0", "#707070"], crackColor: "#505050" },
  coal: { hp: 40, color: "#212121", texture: TEX_BASE + "coal_ore.png", xp: 12, money: 10, particleColors: ["#212121", "#424242", "#1B1B1B"], crackColor: "#000000" },
  iron: { hp: 65, color: "#D7CCC8", texture: TEX_BASE + "iron_ore.png", xp: 25, money: 25, particleColors: ["#D7CCC8", "#BCAAA4", "#8D6E63"], crackColor: "#6D4C41" },
  copper: { hp: 50, color: "#E07B50", texture: TEX_BASE + "copper_ore.png", xp: 18, money: 15, particleColors: ["#E07B50", "#C76840", "#B85B35"], crackColor: "#8B4513" },
  lapis: { hp: 70, color: "#1A47A5", texture: TEX_BASE + "lapis_ore.png", xp: 30, money: 35, particleColors: ["#1A47A5", "#2857C5", "#0D3080"], crackColor: "#0A2060" },
  gold: { hp: 110, color: "#FBC02D", texture: TEX_BASE + "gold_ore.png", xp: 60, money: 100, particleColors: ["#FBC02D", "#F9A825", "#FFD54F"], crackColor: "#F57F17" },
  redstone: { hp: 140, color: "#D32F2F", texture: TEX_BASE + "redstone_ore.png", xp: 80, money: 150, particleColors: ["#D32F2F", "#F44336", "#B71C1C"], crackColor: "#B71C1C" },
  diamond: { hp: 280, color: "#00E5FF", texture: TEX_BASE + "diamond_ore.png", xp: 250, money: 500, particleColors: ["#00E5FF", "#18FFFF", "#00B8D4"], crackColor: "#006064" },
  emerald: { hp: 380, color: "#00C853", texture: TEX_BASE + "emerald_ore.png", xp: 400, money: 800, particleColors: ["#00C853", "#69F0AE", "#00E676"], crackColor: "#1B5E20" },
  legendary: { hp: 700, color: "#AA00FF", texture: TEX_BASE + "crying_obsidian.png", xp: 1500, money: 5000, particleColors: ["#AA00FF", "#E040FB", "#7C4DFF"], crackColor: "#4A148C" },
  explosive: { hp: 5, color: "#FF1744", texture: TEX_BASE + "tnt_side.png", xp: 50, money: 0, particleColors: ["#FF1744", "#FF5252", "#FF8A80"], crackColor: "#B71C1C" },
  chest: { hp: 50, color: "#8D6E63", texture: TEX_BASE + "barrel_side.png", xp: 100, money: 2000, particleColors: ["#8D6E63", "#A1887F", "#BCAAA4"], crackColor: "#4E342E" },
  mossy_cobblestone: { hp: 60, color: "#5A7A4A", texture: TEX_BASE + "mossy_cobblestone.png", xp: 8, money: 5, particleColors: ["#5A7A4A", "#6B8C5A", "#4A6A3A"], crackColor: "#3E5E2E" },
  spawner: { hp: 200, color: "#1A1A2E", texture: TEX_BASE + "spawner.png", xp: 500, money: 1000, particleColors: ["#1A1A2E", "#2A2A4E", "#0A0A1E"], crackColor: "#000000" },
  deepslate: { hp: 50, color: "#4A4A52", texture: TEX_BASE + "deepslate.png", xp: 8, money: 5, particleColors: ["#4A4A52", "#5A5A62", "#3A3A42"], crackColor: "#2A2A32" },
  deepslate_coal: { hp: 80, color: "#3A3A42", texture: TEX_BASE + "deepslate_coal_ore.png", xp: 20, money: 18, particleColors: ["#3A3A42", "#212121", "#4A4A52"], crackColor: "#1A1A22" },
  deepslate_iron: { hp: 130, color: "#4A4A52", texture: TEX_BASE + "deepslate_iron_ore.png", xp: 45, money: 45, particleColors: ["#4A4A52", "#D7CCC8", "#3A3A42"], crackColor: "#2A2A32" },
  deepslate_copper: { hp: 100, color: "#4A4A52", texture: TEX_BASE + "deepslate_copper_ore.png", xp: 30, money: 28, particleColors: ["#4A4A52", "#E07B50", "#3A3A42"], crackColor: "#2A2A32" },
  deepslate_lapis: { hp: 140, color: "#4A4A52", texture: TEX_BASE + "deepslate_lapis_ore.png", xp: 55, money: 60, particleColors: ["#4A4A52", "#1A47A5", "#3A3A42"], crackColor: "#2A2A32" },
  deepslate_gold: { hp: 220, color: "#4A4A52", texture: TEX_BASE + "deepslate_gold_ore.png", xp: 110, money: 180, particleColors: ["#4A4A52", "#FBC02D", "#3A3A42"], crackColor: "#2A2A32" },
  deepslate_redstone: { hp: 280, color: "#4A4A52", texture: TEX_BASE + "deepslate_redstone_ore.png", xp: 150, money: 280, particleColors: ["#4A4A52", "#D32F2F", "#3A3A42"], crackColor: "#2A2A32" },
  deepslate_diamond: { hp: 560, color: "#4A4A52", texture: TEX_BASE + "deepslate_diamond_ore.png", xp: 480, money: 900, particleColors: ["#4A4A52", "#00E5FF", "#3A3A42"], crackColor: "#2A2A32" },
  deepslate_emerald: { hp: 760, color: "#4A4A52", texture: TEX_BASE + "deepslate_emerald_ore.png", xp: 750, money: 1500, particleColors: ["#4A4A52", "#00C853", "#3A3A42"], crackColor: "#2A2A32" },
  beacon: { hp: 150, color: "#79F2F2", texture: TEX_BASE + "beacon.png", xp: 200, money: 500, particleColors: ["#79F2F2", "#AEFFFF", "#40E0D0", "#FFFFFF", "#00BFFF"], crackColor: "#008B8B" },
  dungeon_chest: { hp: 30, color: "#8D6E63", texture: TEX_BASE + "barrel_side.png", xp: 0, money: 0, particleColors: ["#8D6E63", "#A1887F", "#FFD54F", "#BCAAA4"], crackColor: "#4E342E" },
};

export const BEDROCK_TEXTURE = TEX_BASE + "bedrock.png";

export const DESTROY_STAGE_TEXTURES = Array.from({ length: 10 }, (_, i) =>
  TEX_BASE + `destroy_stage_${i}.png`
);

const ENTITY_BASE =
  "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/entity/";

export interface MobConfig {
  hp: number;
  speed: number;
  damage: number;
  xp: number;
  money: number;
  color: string;
  texture: string;
  width: number;
  height: number;
  hitParticles: string[];
}

export const MOB_CONFIGS: Record<MobType, MobConfig> = {
  zombie: { hp: 30, speed: 0.4, damage: 5, xp: 50, money: 30, color: "#2E7D32", texture: ENTITY_BASE + "zombie/zombie.png", width: 24, height: 52, hitParticles: ["#2E7D32", "#4CAF50", "#388E3C"] },
  skeleton: { hp: 20, speed: 0.5, damage: 8, xp: 60, money: 40, color: "#E0E0E0", texture: ENTITY_BASE + "skeleton/skeleton.png", width: 24, height: 52, hitParticles: ["#E0E0E0", "#BDBDBD", "#9E9E9E"] },
  spider: { hp: 18, speed: 0.7, damage: 4, xp: 40, money: 20, color: "#3E2723", texture: ENTITY_BASE + "spider/spider.png", width: 44, height: 22, hitParticles: ["#3E2723", "#4E342E", "#5D4037"] },
  creeper: { hp: 25, speed: 0.35, damage: 20, xp: 80, money: 60, color: "#4CAF50", texture: ENTITY_BASE + "creeper/creeper.png", width: 24, height: 50, hitParticles: ["#4CAF50", "#66BB6A", "#43A047"] },
};

export const DUNGEON_MOB_TYPES: MobType[] = ["zombie", "skeleton", "spider", "creeper"];

export const PICKAXE_TEXTURES: Record<PickaxeTier, string> = {
  wood: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/item/wooden_pickaxe.png",
  stone: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/item/stone_pickaxe.png",
  iron: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/item/iron_pickaxe.png",
  gold: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/item/golden_pickaxe.png",
  diamond: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/item/diamond_pickaxe.png",
  netherite: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/item/netherite_pickaxe.png",
};

const SND_BASE =
  "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/sounds/";

export const SOUNDS = {
  dig: [SND_BASE + "dig/stone1.ogg", SND_BASE + "dig/stone2.ogg", SND_BASE + "dig/stone3.ogg", SND_BASE + "dig/stone4.ogg"],
  digDirt: [SND_BASE + "dig/gravel1.ogg", SND_BASE + "dig/gravel2.ogg", SND_BASE + "dig/gravel3.ogg", SND_BASE + "dig/gravel4.ogg"],
  digDeepslate: [SND_BASE + "dig/stone1.ogg", SND_BASE + "dig/stone2.ogg", SND_BASE + "dig/stone3.ogg"],
  breakStone: [SND_BASE + "dig/stone1.ogg", SND_BASE + "dig/stone2.ogg", SND_BASE + "dig/stone3.ogg", SND_BASE + "dig/stone4.ogg"],
  breakDirt: [SND_BASE + "dig/gravel1.ogg", SND_BASE + "dig/gravel2.ogg", SND_BASE + "dig/gravel3.ogg", SND_BASE + "dig/gravel4.ogg"],
  breakGrass: [SND_BASE + "dig/grass1.ogg", SND_BASE + "dig/grass2.ogg", SND_BASE + "dig/grass3.ogg", SND_BASE + "dig/grass4.ogg"],
  breakWood: [SND_BASE + "dig/wood1.ogg", SND_BASE + "dig/wood2.ogg", SND_BASE + "dig/wood3.ogg", SND_BASE + "dig/wood4.ogg"],
  breakGlass: [SND_BASE + "random/glass1.ogg", SND_BASE + "random/glass2.ogg", SND_BASE + "random/glass3.ogg"],
  break: [SND_BASE + "random/break.ogg"],
  levelUp: [SND_BASE + "random/levelup.ogg"],
  orb: [SND_BASE + "random/orb.ogg"],
  explode: [SND_BASE + "random/explode1.ogg", SND_BASE + "random/explode2.ogg", SND_BASE + "random/explode3.ogg"],
  click: [SND_BASE + "random/click.ogg"],
  chest: [SND_BASE + "random/chestopen.ogg"],
  mobHit: [SND_BASE + "damage/hit1.ogg", SND_BASE + "damage/hit2.ogg", SND_BASE + "damage/hit3.ogg"],
  zombieHurt: [SND_BASE + "mob/zombie/hurt1.ogg", SND_BASE + "mob/zombie/hurt2.ogg"],
  zombieDeath: [SND_BASE + "mob/zombie/death.ogg"],
  skeletonHurt: [SND_BASE + "mob/skeleton/hurt1.ogg", SND_BASE + "mob/skeleton/hurt2.ogg", SND_BASE + "mob/skeleton/hurt3.ogg"],
  skeletonDeath: [SND_BASE + "mob/skeleton/death.ogg"],
  spiderHurt: [SND_BASE + "mob/spider/say1.ogg", SND_BASE + "mob/spider/say2.ogg", SND_BASE + "mob/spider/say3.ogg"],
  spiderDeath: [SND_BASE + "mob/spider/death.ogg"],
  creeperHurt: [SND_BASE + "mob/creeper/say1.ogg", SND_BASE + "mob/creeper/say2.ogg"],
  creeperDeath: [SND_BASE + "random/explode1.ogg"],
  music: [
    SND_BASE + "music/game/calm1.ogg", SND_BASE + "music/game/calm2.ogg", SND_BASE + "music/game/calm3.ogg",
    SND_BASE + "music/game/hal1.ogg", SND_BASE + "music/game/hal2.ogg", SND_BASE + "music/game/hal3.ogg", SND_BASE + "music/game/hal4.ogg",
    SND_BASE + "music/game/piano1.ogg", SND_BASE + "music/game/piano2.ogg", SND_BASE + "music/game/piano3.ogg",
    SND_BASE + "music/game/a_familiar_room.ogg", SND_BASE + "music/game/floating_dream.ogg", SND_BASE + "music/game/comforting_memories.ogg",
    SND_BASE + "music/game/an_ordinary_day.ogg", SND_BASE + "music/game/bromeliad.ogg", SND_BASE + "music/game/one_more_day.ogg",
    SND_BASE + "music/game/stand_tall.ogg", SND_BASE + "music/game/wending.ogg", SND_BASE + "music/game/infinite_amethyst.ogg",
    SND_BASE + "music/game/echo_in_the_wind.ogg", SND_BASE + "music/game/crescent_dunes.ogg", SND_BASE + "music/game/left_to_bloom.ogg",
    SND_BASE + "music/game/ancestry.ogg",
    SND_BASE + "music/game/creative/creative1.ogg", SND_BASE + "music/game/creative/creative2.ogg", SND_BASE + "music/game/creative/creative3.ogg",
    SND_BASE + "music/game/creative/creative4.ogg", SND_BASE + "music/game/creative/creative5.ogg", SND_BASE + "music/game/creative/creative6.ogg",
    SND_BASE + "music/game/nether/nether1.ogg", SND_BASE + "music/game/nether/nether2.ogg", SND_BASE + "music/game/nether/nether3.ogg", SND_BASE + "music/game/nether/nether4.ogg",
    SND_BASE + "music/game/water/axolotl.ogg", SND_BASE + "music/game/water/dragon_fish.ogg", SND_BASE + "music/game/water/shuniji.ogg",
    SND_BASE + "music/game/nuance1.ogg", SND_BASE + "music/game/nuance2.ogg",
  ],
  pigstep: SND_BASE + "records/pigstep.ogg",
};

const ITEM_TEX =
  "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/item/";

export interface DungeonLootEntry {
  name: string;
  icon: string;
  color: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  money: number;
  xp: number;
  description: string;
  weight: number;
}

export const DUNGEON_LOOT_TABLE: DungeonLootEntry[] = [
  { name: "String", icon: ITEM_TEX + "string.png", color: "#E0E0E0", rarity: "common", money: 5, xp: 3, description: "A piece of string", weight: 12 },
  { name: "Rotten Flesh", icon: ITEM_TEX + "rotten_flesh.png", color: "#8B7355", rarity: "common", money: 3, xp: 2, description: "Gross, but useful", weight: 14 },
  { name: "Bone", icon: ITEM_TEX + "bone.png", color: "#F5F5DC", rarity: "common", money: 5, xp: 3, description: "Skeleton remains", weight: 10 },
  { name: "Wheat", icon: ITEM_TEX + "wheat.png", color: "#DAA520", rarity: "common", money: 4, xp: 2, description: "A bundle of wheat", weight: 8 },
  { name: "Gunpowder", icon: ITEM_TEX + "gunpowder.png", color: "#696969", rarity: "common", money: 8, xp: 5, description: "Explosive powder", weight: 8 },
  { name: "Iron Ingot", icon: ITEM_TEX + "iron_ingot.png", color: "#D7CCC8", rarity: "uncommon", money: 30, xp: 15, description: "Refined iron", weight: 8 },
  { name: "Gold Ingot", icon: ITEM_TEX + "gold_ingot.png", color: "#FBC02D", rarity: "uncommon", money: 60, xp: 25, description: "Shiny gold bar", weight: 5 },
  { name: "Redstone Dust", icon: ITEM_TEX + "redstone.png", color: "#D32F2F", rarity: "uncommon", money: 20, xp: 12, description: "Magical red dust", weight: 6 },
  { name: "Slimeball", icon: ITEM_TEX + "slime_ball.png", color: "#7CB342", rarity: "uncommon", money: 25, xp: 10, description: "Bouncy and sticky", weight: 4 },
  { name: "Bucket", icon: ITEM_TEX + "bucket.png", color: "#9E9E9E", rarity: "uncommon", money: 35, xp: 10, description: "Iron bucket", weight: 3 },
  { name: "Name Tag", icon: ITEM_TEX + "name_tag.png", color: "#F5F5DC", rarity: "rare", money: 150, xp: 50, description: "Name your mobs!", weight: 3 },
  { name: "Saddle", icon: ITEM_TEX + "saddle.png", color: "#8B4513", rarity: "rare", money: 200, xp: 60, description: "Ride in style", weight: 3 },
  { name: "Lapis Lazuli x8", icon: ITEM_TEX + "lapis_lazuli.png", color: "#1A47A5", rarity: "rare", money: 120, xp: 40, description: "Deep blue gems", weight: 4 },
  { name: "Diamond", icon: ITEM_TEX + "diamond.png", color: "#00E5FF", rarity: "rare", money: 300, xp: 80, description: "A sparkling diamond!", weight: 2 },
  { name: "Emerald", icon: ITEM_TEX + "emerald.png", color: "#00C853", rarity: "rare", money: 250, xp: 70, description: "Villager currency", weight: 2 },
  { name: "Music Disc", icon: ITEM_TEX + "music_disc_cat.png", color: "#4CAF50", rarity: "rare", money: 180, xp: 55, description: "Cat by C418", weight: 2 },
  { name: "Golden Apple", icon: ITEM_TEX + "golden_apple.png", color: "#FFD700", rarity: "epic", money: 500, xp: 150, description: "Restores health!", weight: 3 },
  { name: "Iron Horse Armor", icon: ITEM_TEX + "iron_horse_armor.png", color: "#D7CCC8", rarity: "epic", money: 400, xp: 120, description: "Protect your steed", weight: 2 },
  { name: "Enchantment Book", icon: ITEM_TEX + "book.png", color: "#9C27B0", rarity: "epic", money: 600, xp: 200, description: "Contains magic!", weight: 2 },
  { name: "Enchanted Golden Apple", icon: ITEM_TEX + "golden_apple.png", color: "#FF00FF", rarity: "legendary", money: 2000, xp: 500, description: "The Notch Apple!", weight: 1 },
  { name: "Diamond Horse Armor", icon: ITEM_TEX + "diamond_horse_armor.png", color: "#00E5FF", rarity: "legendary", money: 1500, xp: 400, description: "Ultimate horse armor", weight: 1 },
  { name: "Golden Horse Armor", icon: ITEM_TEX + "golden_horse_armor.png", color: "#FBC02D", rarity: "legendary", money: 1200, xp: 350, description: "Luxurious protection", weight: 0.5 },
  { name: "Bottle o' Enchanting", icon: ITEM_TEX + "experience_bottle.png", color: "#4A148C", rarity: "legendary", money: 3000, xp: 800, description: "A mysterious power...", weight: 0.5 },
];

export const BLOCK_BREAK_SOUND: Record<string, "breakStone" | "breakDirt" | "breakGrass" | "breakWood" | "breakGlass"> = {
  dirt: "breakDirt", grass: "breakGrass", stone: "breakStone", andesite: "breakStone",
  coal: "breakStone", iron: "breakStone", copper: "breakStone", lapis: "breakStone",
  gold: "breakStone", redstone: "breakStone", diamond: "breakStone", emerald: "breakStone",
  legendary: "breakStone", deepslate: "breakStone", deepslate_coal: "breakStone",
  deepslate_iron: "breakStone", deepslate_copper: "breakStone", deepslate_lapis: "breakStone",
  deepslate_gold: "breakStone", deepslate_redstone: "breakStone", deepslate_diamond: "breakStone",
  deepslate_emerald: "breakStone", mossy_cobblestone: "breakStone", spawner: "breakStone",
  beacon: "breakGlass", chest: "breakWood", dungeon_chest: "breakWood", explosive: "breakStone",
};

export const BEACON_EVENTS: {
  type: import("./types").BeaconEventType;
  name: string;
  color: string;
  duration: number;
  weight: number;
}[] = [
    { type: "double_ores", name: "DOUBLE ORES", color: "#FFD700", duration: 30, weight: 40 },
    { type: "boost_30s", name: "SUPER BOOST", color: "#FF9800", duration: 30, weight: 30 },
    { type: "transform_iron", name: "IRON FRENZY", color: "#D7CCC8", duration: 10, weight: 15 },
    { type: "transform_diamond", name: "DIAMOND RUSH", color: "#00E5FF", duration: 10, weight: 5 },
    { type: "transform_emerald", name: "EMERALD MADNESS", color: "#00C853", duration: 10, weight: 10 },
  ];

// Tipos de encantamento
export type EnchantmentType = "efficiency" | "fortune" | "mending";

// Encantamentos disponiveis com suas chances individuais (peso)
// Eficiencia: 1-3 raro, 4-5 muito dificil
// Fortuna: muito raro, nivel 3 quase impossivel
// Remendo: meio termo, nivel 3 mais dificil
export const ENCHANTMENTS: (Enchantment & { type: EnchantmentType; level: number; weight: number })[] = [
  // Eficiencia (melhora velocidade de mineracao)
  { id: "eff_1", type: "efficiency", level: 1, name: "Eficiencia I", rarity: Rarity.RARE, description: "+1000% Velocidade [TESTE]", value: 10, weight: 99 },
  { id: "eff_2", type: "efficiency", level: 2, name: "Eficiencia II", rarity: Rarity.RARE, description: "+2000% Velocidade [TESTE]", value: 20, weight: 99 },
  { id: "eff_3", type: "efficiency", level: 3, name: "Eficiencia III", rarity: Rarity.EPIC, description: "+3000% Velocidade [TESTE]", value: 30, weight: 99 },
  { id: "eff_4", type: "efficiency", level: 4, name: "Eficiencia IV", rarity: Rarity.LEGENDARY, description: "+5000% Velocidade [TESTE]", value: 50, weight: 99 },
  { id: "eff_5", type: "efficiency", level: 5, name: "Eficiencia V", rarity: Rarity.MYTHIC, description: "+9900% Velocidade [TESTE]", value: 100, weight: 99 },

  // Fortuna (da mais minerios) - MUITO RARO
  { id: "fort_1", type: "fortune", level: 1, name: "Fortuna I", rarity: Rarity.EPIC, description: "+25% Minerios", value: 1.25, weight: 5 },
  { id: "fort_2", type: "fortune", level: 2, name: "Fortuna II", rarity: Rarity.LEGENDARY, description: "+50% Minerios", value: 1.50, weight: 1.5 },
  { id: "fort_3", type: "fortune", level: 3, name: "Fortuna III", rarity: Rarity.MYTHIC, description: "+100% Minerios", value: 2.00, weight: 0.2 },

  // Remendo (da mais XP) - Meio termo
  { id: "mend_1", type: "mending", level: 1, name: "Remendo I", rarity: Rarity.RARE, description: "+20% XP", value: 1.20, weight: 20 },
  { id: "mend_2", type: "mending", level: 2, name: "Remendo II", rarity: Rarity.EPIC, description: "+40% XP", value: 1.40, weight: 8 },
  { id: "mend_3", type: "mending", level: 3, name: "Remendo III", rarity: Rarity.LEGENDARY, description: "+70% XP", value: 1.70, weight: 2 },
];

// Custo do encantamento
export const ENCHANT_COST = {
  xp: 1000,
  coins: 5000,
};

// Nivel maximo de cada encantamento
export const MAX_ENCHANT_LEVELS: Record<EnchantmentType, number> = {
  efficiency: 5,
  fortune: 3,
  mending: 3,
};

export const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]: "#9E9E9E",
  [Rarity.RARE]: "#2196F3",
  [Rarity.EPIC]: "#9C27B0",
  [Rarity.LEGENDARY]: "#FF9800",
  [Rarity.MYTHIC]: "#F44336",
};

// Pesos nao usados mais - cada encantamento tem seu proprio peso
export const RARITY_WEIGHTS: Record<Rarity, number> = {
  [Rarity.COMMON]: 50,
  [Rarity.RARE]: 30,
  [Rarity.EPIC]: 14,
  [Rarity.LEGENDARY]: 5,
  [Rarity.MYTHIC]: 1,
};
