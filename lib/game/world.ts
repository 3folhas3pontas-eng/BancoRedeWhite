import { Block, BlockType, Dungeon, MobType } from "./types";
import { BLOCK_SIZE, WORLD_WIDTH, BLOCK_CONFIGS, DUNGEON_MOB_TYPES } from "./constants";

export interface SpawnUpgrades {
  tntSpawn: number;
  beaconSpawn: number;
  chestSpawn: number;
}

export function generateBlock(gridX: number, gridY: number, playerLevel: number, upgrades?: SpawnUpgrades): Block {
  const depth = gridY;
  let type: BlockType = "dirt";
  const rand = Math.random() * 100;
  const levelBonus = Math.min(playerLevel * 0.5, 10);

  // Determine if we are in deepslate territory
  // 300-1000: deepslate gradually replaces stone (starts ~20%, reaches 100% at 1000)
  // 1000+: all base blocks are deepslate, ores become deepslate variants
  const deepslateChance =
    depth < 300 ? 0 :
    depth < 1000 ? (depth - 300) / 700 :
    1;
  const useDeepslate = Math.random() < deepslateChance;

  // Pick the base stone type (stone, andesite, or deepslate)
  function baseStone(): BlockType {
    if (useDeepslate) return "deepslate";
    // Andesite: mixes in from depth 10+, up to ~30% chance
    const andesiteChance = depth < 10 ? 0 : Math.min((depth - 10) / 200, 0.3);
    if (Math.random() < andesiteChance) return "andesite";
    return "stone";
  }

  // Convert normal ore to deepslate variant when in deep layers
  function oreType(normal: BlockType): BlockType {
    if (!useDeepslate) return normal;
    const mapping: Partial<Record<BlockType, BlockType>> = {
      coal: "deepslate_coal",
      iron: "deepslate_iron",
      copper: "deepslate_copper",
      lapis: "deepslate_lapis",
      gold: "deepslate_gold",
      redstone: "deepslate_redstone",
      diamond: "deepslate_diamond",
      emerald: "deepslate_emerald",
    };
    return mapping[normal] ?? normal;
  }

  // Layer-based generation
  if (depth < 3) {
    type = depth === 0 ? "grass" : Math.random() > 0.7 ? "stone" : "dirt";
  } else if (depth < 20) {
    // Shallow: dirt, stone, coal, copper
    if (rand < 1 + levelBonus * 0.1) type = oreType("copper");
    else if (rand < 3 + levelBonus * 0.2) type = oreType("coal");
    else if (rand < 30) type = baseStone();
    else type = "dirt";
  } else if (depth < 80) {
    // Mid-shallow: + iron, lapis
    if (rand < 0.3 + levelBonus * 0.05) type = oreType("lapis");
    else if (rand < 1 + levelBonus * 0.1) type = oreType("iron");
    else if (rand < 3 + levelBonus * 0.15) type = oreType("copper");
    else if (rand < 8 + levelBonus * 0.3) type = oreType("coal");
    else if (rand < 55) type = baseStone();
    else type = "dirt";
  } else if (depth < 200) {
    // Mid: + gold
    if (rand < 0.3 + levelBonus * 0.05) type = oreType("gold");
    else if (rand < 1 + levelBonus * 0.08) type = oreType("lapis");
    else if (rand < 3 + levelBonus * 0.15) type = oreType("iron");
    else if (rand < 5 + levelBonus * 0.2) type = oreType("copper");
    else if (rand < 14 + levelBonus * 0.3) type = oreType("coal");
    else if (rand < 70) type = baseStone();
    else type = "dirt";
  } else if (depth < 500) {
    // Deep: + redstone, diamond, emerald (deepslate starts mixing in at 300)
    if (rand < 0.1 + levelBonus * 0.02) type = oreType("diamond");
    else if (rand < 0.5 + levelBonus * 0.05) type = oreType("emerald");
    else if (rand < 2 + levelBonus * 0.1) type = oreType("gold");
    else if (rand < 4 + levelBonus * 0.15) type = oreType("lapis");
    else if (rand < 8 + levelBonus * 0.2) type = oreType("redstone");
    else if (rand < 14) type = oreType("iron");
    else if (rand < 18) type = oreType("copper");
    else type = baseStone();
  } else if (depth < 1000) {
    // Very deep: mostly deepslate with rich ores
    if (rand < 0.15 + levelBonus * 0.03) type = oreType("diamond");
    else if (rand < 0.7 + levelBonus * 0.05) type = oreType("emerald");
    else if (rand < 3 + levelBonus * 0.12) type = oreType("gold");
    else if (rand < 6 + levelBonus * 0.15) type = oreType("lapis");
    else if (rand < 12 + levelBonus * 0.2) type = oreType("redstone");
    else if (rand < 18) type = oreType("iron");
    else if (rand < 22) type = oreType("copper");
    else type = baseStone();
  } else {
    // Abyss (1000+): pure deepslate, all deepslate ore variants, legendary
    if (rand < 0.05 + levelBonus * 0.01) type = "legendary";
    else if (rand < 0.5 + levelBonus * 0.05) type = "deepslate_diamond";
    else if (rand < 1.5 + levelBonus * 0.08) type = "deepslate_emerald";
    else if (rand < 4 + levelBonus * 0.12) type = "deepslate_gold";
    else if (rand < 7 + levelBonus * 0.15) type = "deepslate_lapis";
    else if (rand < 14 + levelBonus * 0.2) type = "deepslate_redstone";
    else if (rand < 20) type = "deepslate_iron";
    else if (rand < 24) type = "deepslate_copper";
    else type = "deepslate";
  }

  // Special blocks - rates start very low and scale with shop upgrades
  const chestLv = upgrades?.chestSpawn ?? 0;   // 0-10
  const tntLv = upgrades?.tntSpawn ?? 0;       // 0-10
  const beaconLv = upgrades?.beaconSpawn ?? 0; // 0-8

  // Barrel: lv0=0.1%, lv10=~0.6% (current was 0.5% before upgrades)
  const chestRate = (0.001 + chestLv * 0.00055) + depth * 0.000002;
  if (Math.random() < chestRate) type = "chest";

  // TNT: lv0=0.2%, lv10=0.8%
  const tntRate = 0.002 + tntLv * 0.0006;
  if (type !== "chest" && type !== "beacon" && Math.random() < tntRate) type = "explosive";

  // Beacon: lv0=0.05% (~0.0005), lv8=0.09% (~0.0009), depth 20+
  const beaconRate = 0.0005 + beaconLv * 0.00005 + depth * 0.0000005;
  if (type !== "chest" && depth >= 20 && Math.random() < beaconRate) type = "beacon";

  const config = BLOCK_CONFIGS[type];
  const depthScale = 1 + Math.floor(depth / 100) * 0.15;
  const hp = Math.ceil(config.hp * depthScale);

  return {
    type,
    x: gridX * BLOCK_SIZE,
    y: gridY * BLOCK_SIZE,
    gridX,
    gridY,
    hp,
    maxHp: hp,
  };
}

export function generateRow(gridY: number, playerLevel: number, upgrades?: SpawnUpgrades): Block[] {
  const row: Block[] = [];
  for (let x = 0; x < WORLD_WIDTH; x++) {
    row.push(generateBlock(x, gridY, playerLevel, upgrades));
  }
  return row;
}

export function generateInitialWorld(rows: number, playerLevel: number, upgrades?: SpawnUpgrades): Block[][] {
  const world: Block[][] = [];
  for (let y = 0; y < rows; y++) {
    world.push(generateRow(y, playerLevel, upgrades));
  }
  return world;
}

// Try to create a dungeon centered near gridY
// Returns dungeon info if valid, or null
export function tryGenerateDungeon(
  world: Map<number, Block[]>,
  gridY: number,
  playerLevel: number
): Dungeon | null {
  // Dungeons only appear below depth 15
  if (gridY < 15) return null;

  const radius = 3;
  // Pick a center x that fits within the world
  const minCX = radius + 1;
  const maxCX = WORLD_WIDTH - radius - 2;
  if (minCX > maxCX) return null;
  const centerX = minCX + Math.floor(Math.random() * (maxCX - minCX + 1));
  const centerY = gridY;

  // Pick mob type - deeper = harder mobs more likely
  const mobPool: MobType[] = [];
  mobPool.push("zombie", "zombie"); // always possible
  if (gridY > 30) mobPool.push("skeleton", "skeleton");
  if (gridY > 50) mobPool.push("spider", "spider");
  if (gridY > 100) mobPool.push("creeper");
  const spawnerType = mobPool[Math.floor(Math.random() * mobPool.length)];

  // Carve the dungeon: circular room with mossy cobblestone walls
  for (let dy = -radius - 1; dy <= radius + 1; dy++) {
    const rowY = centerY + dy;
    let row = world.get(rowY);
    if (!row) {
      // Generate a fresh row
      row = generateRow(rowY, playerLevel);
      world.set(rowY, row);
    }

    for (let dx = -radius - 1; dx <= radius + 1; dx++) {
      const bx = centerX + dx;
      if (bx < 0 || bx >= WORLD_WIDTH) continue;

      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Inside the dungeon - hollow (air), except center = spawner
        if (dx === 0 && dy === 0) {
          // Spawner block
          const config = BLOCK_CONFIGS["spawner"];
          row[bx] = {
            type: "spawner",
            x: bx * BLOCK_SIZE,
            y: rowY * BLOCK_SIZE,
            gridX: bx,
            gridY: rowY,
            hp: config.hp,
            maxHp: config.hp,
          };
        } else {
          // Air inside
          row[bx] = {
            type: "air",
            x: bx * BLOCK_SIZE,
            y: rowY * BLOCK_SIZE,
            gridX: bx,
            gridY: rowY,
            hp: 0,
            maxHp: 0,
          };
        }
      } else if (dist <= radius + 1.5) {
        // Wall ring: mossy cobblestone
        const config = BLOCK_CONFIGS["mossy_cobblestone"];
        const depthScale = 1 + Math.floor(rowY / 100) * 0.15;
        const hp = Math.ceil(config.hp * depthScale);
        row[bx] = {
          type: "mossy_cobblestone",
          x: bx * BLOCK_SIZE,
          y: rowY * BLOCK_SIZE,
          gridX: bx,
          gridY: rowY,
          hp,
          maxHp: hp,
        };
      }
    }
  }

  // Place 1-2 dungeon chests on the floor of the dungeon
  // The last row of air inside the dungeon is at centerY + (radius - 1)
  // We scan from the bottom of the dungeon interior to find air blocks
  const numChests = Math.random() < 0.5 ? 1 : 2;
  const possiblePositions: { x: number; y: number }[] = [];

  // Search the bottom rows inside the dungeon for air blocks
  for (let dy = radius - 1; dy >= 0; dy--) {
    const rowY = centerY + dy;
    const row = world.get(rowY);
    if (!row) continue;
    for (let dx = -radius + 1; dx <= radius - 1; dx++) {
      const bx = centerX + dx;
      if (bx < 0 || bx >= WORLD_WIDTH) continue;
      if (bx === centerX && dy === 0) continue; // skip spawner position
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue; // outside the room
      if (row[bx] && row[bx].type === "air") {
        // Check there's a solid block below (so chest sits on the floor)
        const belowRow = world.get(rowY + 1);
        if (belowRow && belowRow[bx] && belowRow[bx].type !== "air") {
          possiblePositions.push({ x: bx, y: rowY });
        }
      }
    }
    if (possiblePositions.length >= 4) break; // enough candidates
  }

  // Shuffle and pick positions
  for (let i = possiblePositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [possiblePositions[i], possiblePositions[j]] = [possiblePositions[j], possiblePositions[i]];
  }
  const chestPositions = possiblePositions.slice(0, numChests);
  for (const pos of chestPositions) {
    const row = world.get(pos.y);
    if (!row) continue;
    const config = BLOCK_CONFIGS["dungeon_chest"];
    row[pos.x] = {
      type: "dungeon_chest",
      x: pos.x * BLOCK_SIZE,
      y: pos.y * BLOCK_SIZE,
      gridX: pos.x,
      gridY: pos.y,
      hp: config.hp,
      maxHp: config.hp,
    };
  }

  return {
    centerX,
    centerY,
    radius,
    spawnerType,
    spawnerActive: true,
    spawnTimer: 0,
    maxMobs: 3,
  };
}
