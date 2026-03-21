"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  Block,
  BlockType,
  Particle,
  FloatingText,
  PlayerStats,
  PickaxeState,
  PickaxeTier,
  Mob,
  MobType,
  Dungeon,
  BeaconEvent,
} from "@/lib/game/types";
import {
  BLOCK_SIZE,
  WORLD_WIDTH,
  GRAVITY,
  MAX_FALL_SPEED,
  MINING_COOLDOWN,
  MANUAL_MINING_MULT,
  PICKAXE_KNOCKBACK,
  BLOCK_CONFIGS,
  PICKAXE_TEXTURES,
  PICKAXE_TIERS,
  BEDROCK_TEXTURE,
  DESTROY_STAGE_TEXTURES,
  MOB_CONFIGS,
  DUNGEON_MOB_TYPES,
  BOOST_MINING_MULT,
} from "@/lib/game/constants";
import { generateRow, generateInitialWorld, tryGenerateDungeon, SpawnUpgrades } from "@/lib/game/world";
import { audioService } from "@/lib/game/audio";

interface GameCanvasProps {
  stats: PlayerStats;
  onStatsUpdate: (partial: Partial<PlayerStats>) => void;
  onBlockBreak: (block: Block) => void;
  onMobKill?: (mobType: MobType, xp: number, money: number) => void;
  isBoostActive?: boolean;
  beaconEvent?: BeaconEvent | null;
  onDungeonChestOpen?: () => void;
}

export default function GameCanvas({
  stats,
  onStatsUpdate,
  onBlockBreak,
  onMobKill,
  isBoostActive = false,
  beaconEvent = null,
  onDungeonChestOpen,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const worldRef = useRef<Map<number, Block[]>>(new Map());
  const minRowRef = useRef(0);
  const maxRowRef = useRef(0);

  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const nextTextId = useRef(0);

  // Mobs & dungeons
  const mobsRef = useRef<Mob[]>([]);
  const dungeonsRef = useRef<Dungeon[]>([]);
  const nextMobId = useRef(0);
  const dungeonCheckY = useRef(0); // tracks deepest row checked for dungeon spawning

  const pickaxeRef = useRef<PickaxeState>({
    x: (WORLD_WIDTH * BLOCK_SIZE) / 2,
    y: -BLOCK_SIZE * 2,
    velX: 0,
    velY: 0,
    angle: 0,
    swingAngle: 0,
    isSwinging: false,
    isMining: false,
    miningCooldown: 0,
  });

  const cameraYRef = useRef(-100);
  const maxCameraYRef = useRef(-100);
  const targetRef = useRef<{ x: number; y: number } | null>(null);
  const isPointerDown = useRef(false);

  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  const imagesLoadedRef = useRef(false);
  const animFrameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const statsRef = useRef(stats);
  const screenShakeRef = useRef(0);
  const comboTimerRef = useRef(0);
  const boostActiveRef = useRef(false);
  const beaconEventRef = useRef<BeaconEvent | null>(null);
  const keysRef = useRef<Set<string>>(new Set());

  // Preload all textures
  useEffect(() => {
    const urls = new Set<string>();
    Object.values(BLOCK_CONFIGS).forEach((c) => {
      if (c.texture) urls.add(c.texture);
    });
    Object.values(PICKAXE_TEXTURES).forEach((u) => urls.add(u));
    urls.add(BEDROCK_TEXTURE);
    DESTROY_STAGE_TEXTURES.forEach((u) => urls.add(u));
    Object.values(MOB_CONFIGS).forEach((c) => {
      if (c.texture) urls.add(c.texture);
    });

    let loaded = 0;
    const total = urls.size;

    urls.forEach((url) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => {
        imagesRef.current[url] = img;
        loaded++;
        if (loaded >= total) imagesLoadedRef.current = true;
      };
      img.onerror = () => {
        loaded++;
        if (loaded >= total) imagesLoadedRef.current = true;
      };
    });
  }, []);

  // Initialize world
  useEffect(() => {
    const su: SpawnUpgrades = { tntSpawn: statsRef.current.tntSpawn, beaconSpawn: statsRef.current.beaconSpawn, chestSpawn: statsRef.current.chestSpawn };
    const initialRows = generateInitialWorld(30, statsRef.current.level, su);
    const map = new Map<number, Block[]>();
    initialRows.forEach((row, y) => {
      map.set(y, row);
    });
    worldRef.current = map;
    minRowRef.current = 0;
    maxRowRef.current = 29;
    dungeonCheckY.current = 29;
  }, []);

  const getBlock = useCallback(
    (gridX: number, gridY: number): Block | null => {
      const row = worldRef.current.get(gridY);
      if (!row) return null;
      if (gridX < 0 || gridX >= WORLD_WIDTH) return null;
      return row[gridX] || null;
    },
    []
  );

  const spawnParticles = useCallback(
    (x: number, y: number, colors: string[], count = 8) => {
      // Performance: limit total particles to 300
      if (particlesRef.current.length > 300) return;
      // Reduce count if approaching limit
      const actualCount = Math.min(count, 300 - particlesRef.current.length);
      for (let i = 0; i < actualCount; i++) {
        const angle = (Math.PI * 2 * i) / actualCount + Math.random() * 0.5;
        const speed = 2 + Math.random() * 4;
        particlesRef.current.push({
          x: x + Math.random() * 8 - 4,
          y: y + Math.random() * 8 - 4,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 1.0,
          maxLife: 1.0,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 4,
        });
      }
    },
    []
  );

  const spawnFloatingText = useCallback(
    (x: number, y: number, text: string, color: string) => {
      // Performance: limit floating texts to 50
      if (floatingTextsRef.current.length > 50) {
        floatingTextsRef.current.shift(); // remove oldest
      }
      floatingTextsRef.current.push({
        id: nextTextId.current++,
        x,
        y,
        text,
        color,
        life: 1.0,
      });
    },
    []
  );

  // Spawn a mob at a dungeon spawner (y = feet position, on dungeon floor)
  const spawnMob = useCallback((dungeon: Dungeon) => {
    const config = MOB_CONFIGS[dungeon.spawnerType];
    // Spawn near center horizontally, at the bottom of the dungeon circle (floor)
    const spreadX = (Math.random() - 0.5) * (dungeon.radius - 1) * BLOCK_SIZE * 1.5;
    // Find the floor: bottom of the dungeon area
    const floorY = (dungeon.centerY + dungeon.radius) * BLOCK_SIZE;
    const mob: Mob = {
      id: nextMobId.current++,
      type: dungeon.spawnerType,
      x: dungeon.centerX * BLOCK_SIZE + BLOCK_SIZE / 2 + spreadX,
      y: floorY, // spawn at floor level (feet position)
      velX: (Math.random() - 0.5) * config.speed * 2,
      velY: 0, // will fall via gravity if not on ground
      hp: config.hp,
      maxHp: config.hp,
      width: config.width,
      height: config.height,
      hitFlash: 0,
      animFrame: Math.floor(Math.random() * 60), // stagger animations
      facingLeft: Math.random() > 0.5,
      dead: false,
    };
    mobsRef.current.push(mob);
  }, []);

  // Explosion effect for TNT
  const handleExplosion = useCallback(
    (centerGridX: number, centerGridY: number) => {
      // TNT radius: lv0=1(2x2), lv1=1(2x2), lv2=2(3x3), lv3=2(3x3), lv4=3(4x4), lv5=4(5x5)
      const tntLvl = statsRef.current.tntRadius;
      const radiusMap = [1, 1, 2, 2, 3, 4];
      const radius = radiusMap[Math.min(tntLvl, 5)];
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > radius * radius) continue;
          const bx = centerGridX + dx;
          const by = centerGridY + dy;
          const b = getBlock(bx, by);
          if (b && b.type !== "air") {
            spawnParticles(
              b.x + BLOCK_SIZE / 2,
              b.y + BLOCK_SIZE / 2,
              BLOCK_CONFIGS[b.type].particleColors,
              4
            );
            const config = BLOCK_CONFIGS[b.type];
            onBlockBreak(b);
            b.type = "air";
            b.hp = 0;
          }
        }
      }
      spawnParticles(
        centerGridX * BLOCK_SIZE + BLOCK_SIZE / 2,
        centerGridY * BLOCK_SIZE + BLOCK_SIZE / 2,
        ["#FF1744", "#FF5252", "#FF8A80", "#FFD54F", "#FFAB40"],
        25
      );
      screenShakeRef.current = 15;
      audioService.playExplosion();
    },
    [getBlock, spawnParticles, spawnFloatingText, onBlockBreak]
  );

  // GAME LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        e.preventDefault();
        keysRef.current.add(key);
        audioService.init();
        audioService.startMusic();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", handleResize);
    handleResize();

  const loop = (time: number) => {
  if (lastTimeRef.current === 0) lastTimeRef.current = time;
  const rawDt = time - lastTimeRef.current;
  
  // Performance: Cap framerate ~60FPS to reduce CPU usage
  if (rawDt < 16) {
    animFrameRef.current = requestAnimationFrame(loop);
    return;
  }
  
  lastTimeRef.current = time;
  const dt = Math.min(rawDt, 33.3);
  
  update(dt);
  draw(ctx);
  animFrameRef.current = requestAnimationFrame(loop);
  };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(dt: number) {
    const p = pickaxeRef.current;
    const s = statsRef.current;
    const tierData = PICKAXE_TIERS[s.pickaxeTier];

    if (p.miningCooldown > 0) p.miningCooldown--;

    // Combo timer
    if (comboTimerRef.current > 0) {
      comboTimerRef.current--;
      if (comboTimerRef.current <= 0) {
        onStatsUpdate({ combo: 0 });
      }
    }

    // WASD / Arrow key input
    const keys = keysRef.current;
    let kbX = 0;
    let kbY = 0;
    if (keys.has("a") || keys.has("arrowleft")) kbX -= 1;
    if (keys.has("d") || keys.has("arrowright")) kbX += 1;
    if (keys.has("w") || keys.has("arrowup")) kbY -= 1;
    if (keys.has("s") || keys.has("arrowdown")) kbY += 1;
    const hasKBInput = kbX !== 0 || kbY !== 0;

    // Physics: pointer > keyboard > gravity
    if (targetRef.current && isPointerDown.current) {
      const dx = targetRef.current.x - p.x;
      const dy = targetRef.current.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 3) {
        const speed = 5 * tierData.speed;
        p.velX += (dx / dist) * speed * 0.15;
        p.velY += (dy / dist) * speed * 0.15;
      }
      p.velX *= 0.85;
      p.velY *= 0.85;
    } else if (hasKBInput) {
      // Normalize diagonal movement
      const kbLen = Math.sqrt(kbX * kbX + kbY * kbY);
      const kbSpeed = 5 * tierData.speed;
      p.velX += (kbX / kbLen) * kbSpeed * 0.18;
      p.velY += (kbY / kbLen) * kbSpeed * 0.18;
      p.velX *= 0.87;
      p.velY *= 0.87;
    } else {
      p.velY = Math.min(p.velY + GRAVITY * tierData.speed, MAX_FALL_SPEED * tierData.speed);
      p.velX *= 0.92;
    }

    const nextX = p.x + p.velX;
    const nextY = p.y + p.velY;

    // Check collision with blocks
    const gridX = Math.floor(nextX / BLOCK_SIZE);
    const gridY = Math.floor(nextY / BLOCK_SIZE);

    let hitBlock: Block | null = null;
    let hitDirX = 0;
    let hitDirY = 0;

    for (let checkY = gridY; checkY <= gridY + 1 && !hitBlock; checkY++) {
      for (let checkX = gridX; checkX <= gridX + 1 && !hitBlock; checkX++) {
        const b = getBlock(checkX, checkY);
        if (!b || b.type === "air") continue;

        const bx = b.x;
        const by = b.y;
        if (
          nextX + 12 > bx &&
          nextX - 12 < bx + BLOCK_SIZE &&
          nextY + 12 > by &&
          nextY - 12 < by + BLOCK_SIZE
        ) {
          hitBlock = b;
          hitDirX = p.x - (bx + BLOCK_SIZE / 2);
          hitDirY = p.y - (by + BLOCK_SIZE / 2);
        }
      }
    }

    // Check collision with mobs (mob.y = feet, so body goes from mob.y - mob.height to mob.y)
    let hitMob: Mob | null = null;
    if (!hitBlock) {
      for (const mob of mobsRef.current) {
        if (mob.dead) continue;
        const mx = mob.x - mob.width / 2;
        const my = mob.y - mob.height; // top of mob
        if (
          nextX + 12 > mx &&
          nextX - 12 < mx + mob.width &&
          nextY + 12 > my &&
          nextY - 12 < my + mob.height
        ) {
          hitMob = mob;
          hitDirX = p.x - mob.x;
          hitDirY = p.y - (mob.y - mob.height / 2); // center of mob
          break;
        }
      }
    }

    if (hitBlock && hitBlock.type !== "air") {
      if (p.miningCooldown <= 0) {
        p.isMining = true;
        p.isSwinging = true;
        p.swingAngle = 0.5;

  const isManual = isPointerDown.current && targetRef.current;
        const baseDmg = tierData.strength * s.pickStrength;
  const boostMult = boostActiveRef.current ? BOOST_MINING_MULT : 1;
  const damage = (isManual ? baseDmg * MANUAL_MINING_MULT : baseDmg) * boostMult;

        hitBlock.hp -= damage;
        p.miningCooldown = boostActiveRef.current
          ? 1
          : Math.max(4, MINING_COOLDOWN - Math.floor(tierData.speed * 2));

          // Play mining sound (rate-limited in audioService to avoid spam)
          audioService.playMining(hitBlock.type);

        spawnParticles(
          hitBlock.x + BLOCK_SIZE / 2,
          hitBlock.y + BLOCK_SIZE / 2,
          BLOCK_CONFIGS[hitBlock.type].particleColors,
          3
        );

        if (hitBlock.hp <= 0) {
          // During transform events, override what the block gives
          const bEvt = beaconEventRef.current;
          const isTransformActive = bEvt?.active && (
            bEvt.type === "transform_iron" ||
            bEvt.type === "transform_diamond" ||
            bEvt.type === "transform_emerald"
          );
          const isMineable = hitBlock.type !== "spawner" && hitBlock.type !== "beacon" &&
            hitBlock.type !== "chest" && hitBlock.type !== "dungeon_chest" && hitBlock.type !== "explosive";
          let rewardType = hitBlock.type;
          if (isTransformActive && isMineable) {
            rewardType = bEvt!.type === "transform_iron" ? "iron"
              : bEvt!.type === "transform_diamond" ? "diamond"
              : "emerald";
          }
          const config = BLOCK_CONFIGS[rewardType];

          comboTimerRef.current = 60;
          const newCombo = s.combo + 1;
          const comboMult = 1 + Math.min(newCombo * 0.1, 3);
          onStatsUpdate({
            combo: newCombo,
            maxCombo: Math.max(s.maxCombo, newCombo),
          });

          if (hitBlock.type === "explosive") {
            handleExplosion(hitBlock.gridX, hitBlock.gridY);
          } else if (hitBlock.type === "chest") {
            audioService.playChestOpen();
            spawnFloatingText(
              hitBlock.x + BLOCK_SIZE / 2,
              hitBlock.y - 10,
              "CHEST!",
              "#FFD54F"
            );
          } else if (hitBlock.type === "dungeon_chest") {
            // Dungeon chest: triggers loot popup
            if (onDungeonChestOpen) onDungeonChestOpen();
            spawnFloatingText(
              hitBlock.x + BLOCK_SIZE / 2,
              hitBlock.y - 10,
              "DUNGEON CHEST!",
              "#FFD700"
            );
            spawnParticles(
              hitBlock.x + BLOCK_SIZE / 2,
              hitBlock.y + BLOCK_SIZE / 2,
              ["#FFD700", "#FFA000", "#FFEB3B", "#8D6E63", "#FFFFFF"],
              25
            );
            screenShakeRef.current = Math.min(screenShakeRef.current + 6, 12);
          } else if (hitBlock.type === "beacon") {
            audioService.playLevelUp();
            spawnFloatingText(
              hitBlock.x + BLOCK_SIZE / 2,
              hitBlock.y - 10,
              "BEACON EVENT!",
              "#79F2F2"
            );
            // Extra burst of particles
            spawnParticles(
              hitBlock.x + BLOCK_SIZE / 2,
              hitBlock.y + BLOCK_SIZE / 2,
              ["#79F2F2", "#AEFFFF", "#40E0D0", "#FFFFFF", "#00BFFF"],
              30
            );
          } else if (hitBlock.type === "spawner") {
            // Deactivate the dungeon's spawner
            const dung = dungeonsRef.current.find(
              (d) => d.centerX === hitBlock!.gridX && d.centerY === hitBlock!.gridY
            );
            if (dung) dung.spawnerActive = false;
            spawnFloatingText(
              hitBlock.x + BLOCK_SIZE / 2,
              hitBlock.y - 10,
              "SPAWNER DESTROYED!",
              "#FF5252"
            );
          } else {
            audioService.playBlockBreak(hitBlock.type);
          }

          spawnParticles(
            hitBlock.x + BLOCK_SIZE / 2,
            hitBlock.y + BLOCK_SIZE / 2,
            config.particleColors,
            12
          );

          if (config.xp > 0) {
            spawnFloatingText(
              hitBlock.x + BLOCK_SIZE / 2,
              hitBlock.y - 18,
              `+${config.xp} XP`,
              "#4CAF50"
            );
          }
          if (newCombo > 2) {
            spawnFloatingText(
              hitBlock.x + BLOCK_SIZE / 2,
              hitBlock.y - 36,
              `${newCombo}x COMBO!`,
              "#FF9800"
            );
          }

          // Pass a modified block with the reward type for correct XP/money
          if (rewardType !== hitBlock.type) {
            onBlockBreak({ ...hitBlock, type: rewardType as BlockType });
          } else {
            onBlockBreak(hitBlock);
          }
          hitBlock.type = "air";
          hitBlock.hp = 0;

          screenShakeRef.current = Math.min(screenShakeRef.current + 3, 8);
          audioService.playOrb();
        }
      }

      const knockLen = Math.sqrt(hitDirX * hitDirX + hitDirY * hitDirY);
      if (knockLen > 0) {
        const nx = hitDirX / knockLen;
        const ny = hitDirY / knockLen;
        p.velX = nx * PICKAXE_KNOCKBACK;
        p.velY = ny * PICKAXE_KNOCKBACK;
      } else {
        p.velY = -PICKAXE_KNOCKBACK;
      }
    } else if (hitMob) {
      // HIT A MOB
      if (p.miningCooldown <= 0) {
        p.isMining = true;
        p.isSwinging = true;
        p.swingAngle = 0.6;

        const baseDmg = tierData.strength * s.pickStrength;
  const damage = (isPointerDown.current && targetRef.current)
  ? baseDmg * MANUAL_MINING_MULT
  : baseDmg;

        hitMob.hp -= damage;
        hitMob.hitFlash = 6;
        p.miningCooldown = Math.max(4, MINING_COOLDOWN - Math.floor(tierData.speed * 2));

        const mobConfig = MOB_CONFIGS[hitMob.type];
        audioService.playMobHit(hitMob.type);
        spawnParticles(hitMob.x, hitMob.y - hitMob.height / 2, mobConfig.hitParticles, 5);

        // Knock mob away with upward pop
        const mkLen = Math.sqrt(hitDirX * hitDirX + hitDirY * hitDirY);
        if (mkLen > 0) {
          hitMob.velX = -(hitDirX / mkLen) * 5;
          hitMob.velY = Math.min(-(hitDirY / mkLen) * 4, -3); // always pop upward
        } else {
          hitMob.velY = -4;
        }

        if (hitMob.hp <= 0) {
          hitMob.dead = true;
          audioService.playMobDeath(hitMob.type);
          spawnParticles(hitMob.x, hitMob.y - hitMob.height / 2, mobConfig.hitParticles, 15);
          spawnFloatingText(hitMob.x, hitMob.y - hitMob.height - 10, `+${mobConfig.xp} XP`, "#4CAF50");
          screenShakeRef.current = Math.min(screenShakeRef.current + 5, 12);
          if (onMobKill) onMobKill(hitMob.type, mobConfig.xp, mobConfig.money);
        }
      }

      // Knockback pickaxe from mob
      const knockLen = Math.sqrt(hitDirX * hitDirX + hitDirY * hitDirY);
      if (knockLen > 0) {
        p.velX = (hitDirX / knockLen) * PICKAXE_KNOCKBACK;
        p.velY = (hitDirY / knockLen) * PICKAXE_KNOCKBACK;
      } else {
        p.velY = -PICKAXE_KNOCKBACK;
      }
    } else {
      p.x = nextX;
      p.y = nextY;
      p.isMining = false;
    }

    // Swing decay
    if (p.isSwinging) {
      p.swingAngle *= 0.85;
      if (Math.abs(p.swingAngle) < 0.02) {
        p.isSwinging = false;
        p.swingAngle = 0;
      }
    }

    // Rotation
    if (!p.isMining) {
      const targetAngle = Math.atan2(p.velY, p.velX) + Math.PI / 4;
      p.angle += (targetAngle - p.angle) * 0.1;
    }

    // Boundaries
    p.x = Math.max(8, Math.min(WORLD_WIDTH * BLOCK_SIZE - 8, p.x));

    // Camera follow
    const targetCamY = p.y - canvas_height() * 0.35;
    cameraYRef.current += (targetCamY - cameraYRef.current) * 0.08;

    if (cameraYRef.current > maxCameraYRef.current) {
      maxCameraYRef.current = cameraYRef.current;
    }
    cameraYRef.current = Math.max(cameraYRef.current, maxCameraYRef.current);

    const ceilingY = maxCameraYRef.current;
    if (p.y < ceilingY) {
      p.y = ceilingY;
      p.velY = Math.max(p.velY, 0);
    }

    // Screen shake decay
    if (screenShakeRef.current > 0) screenShakeRef.current *= 0.85;
    if (screenShakeRef.current < 0.5) screenShakeRef.current = 0;

    // Generate rows and check for dungeons
    const maxVisible = Math.floor(
      (cameraYRef.current + canvas_height() + 200) / BLOCK_SIZE
    );
    while (maxRowRef.current < maxVisible + 15) {
      maxRowRef.current++;
      const spUpg: SpawnUpgrades = { tntSpawn: statsRef.current.tntSpawn, beaconSpawn: statsRef.current.beaconSpawn, chestSpawn: statsRef.current.chestSpawn };
      const newRow = generateRow(maxRowRef.current, statsRef.current.level, spUpg);
      worldRef.current.set(maxRowRef.current, newRow);
    }
    
    // Performance: cleanup old rows far above camera to prevent memory leak
    const cleanupThreshold = Math.floor(cameraYRef.current / BLOCK_SIZE) - 80;
    if (minRowRef.current < cleanupThreshold) {
      for (let y = minRowRef.current; y < cleanupThreshold; y++) {
        worldRef.current.delete(y);
      }
      minRowRef.current = cleanupThreshold;
    }

    // Check new rows for dungeon generation
    while (dungeonCheckY.current < maxRowRef.current - 8) {
      dungeonCheckY.current++;
      // Dungeon chance: lv0=1.5%, lv8=8%. Min gap: lv0=40 rows, lv8=15 rows
      const dungLv = statsRef.current.dungeonSpawn;
      const dungChance = 0.015 + dungLv * 0.008125; // 0.015 -> 0.08
      const dungGap = Math.max(15, 40 - dungLv * 3.125); // 40 -> 15
      const lastDungeonY = dungeonsRef.current.length > 0
        ? dungeonsRef.current[dungeonsRef.current.length - 1].centerY
        : -100;
      if (
        dungeonCheckY.current - lastDungeonY > dungGap &&
        Math.random() < dungChance
      ) {
        const dung = tryGenerateDungeon(
          worldRef.current,
          dungeonCheckY.current,
          statsRef.current.level
        );
        if (dung) {
          dungeonsRef.current.push(dung);
        }
      }
    }

    // Cleanup old rows
    const minVisible = Math.floor((cameraYRef.current - 400) / BLOCK_SIZE);
    while (minRowRef.current < minVisible - 10) {
      worldRef.current.delete(minRowRef.current);
      minRowRef.current++;
    }

    // Update dungeon spawners -- only when visible on screen
    const screenTop = cameraYRef.current;
    const screenBottom = cameraYRef.current + canvas_height();
    for (const dung of dungeonsRef.current) {
      if (!dung.spawnerActive) continue;
      // Only spawn if spawner is within visible range
      const spawnerWorldY = dung.centerY * BLOCK_SIZE;
      if (spawnerWorldY < screenTop - 100 || spawnerWorldY > screenBottom + 100) {
        continue; // off-screen, do not spawn
      }
      const dungMobs = mobsRef.current.filter(
        (m) =>
          !m.dead &&
          Math.abs(m.x - dung.centerX * BLOCK_SIZE) < (dung.radius + 2) * BLOCK_SIZE &&
          Math.abs(m.y - dung.centerY * BLOCK_SIZE) < (dung.radius + 2) * BLOCK_SIZE
      );
      if (dungMobs.length < dung.maxMobs) {
        dung.spawnTimer++;
        if (dung.spawnTimer >= 180) {
          dung.spawnTimer = 0;
          spawnMob(dung);
        }
      }
    }

    // Update mobs with gravity, ground collision, and AI
    const pickX = pickaxeRef.current.x;
    const pickY = pickaxeRef.current.y;
    for (const mob of mobsRef.current) {
      if (mob.dead) continue;

      mob.animFrame++;
      if (mob.hitFlash > 0) mob.hitFlash--;

      const mConfig = MOB_CONFIGS[mob.type];
      const halfW = mob.width / 2;

      // Detect if mob is on the ground
      const feetGridY = Math.floor(mob.y / BLOCK_SIZE);
      let mobOnGround = false;
      for (let xOff = -1; xOff <= 1; xOff++) {
        const checkFX = Math.floor((mob.x + xOff * (mob.width / 4)) / BLOCK_SIZE);
        const gb = getBlock(checkFX, feetGridY);
        if (gb && gb.type !== "air") {
          mobOnGround = true;
          break;
        }
      }

      // Horizontal friction (less friction = more sliding)
      const isKnockback = mob.hitFlash > 0 || Math.abs(mob.velX) > mConfig.speed * 4;
      mob.velX *= isKnockback ? 0.88 : 0.95;

      // Gravity
      mob.velY += GRAVITY * 1.0;
      if (mob.velY > MAX_FALL_SPEED) mob.velY = MAX_FALL_SPEED;

      // AI: move actively, flee when recently hit
      if (mob.hitFlash > 0 && mobOnGround) {
        // FLEE: run away from pickaxe
        const fleeDirX = mob.x - pickX;
        const fleeDir = fleeDirX >= 0 ? 1 : -1;
        mob.velX = fleeDir * mConfig.speed * 5;
        mob.facingLeft = fleeDir < 0;
        // Small jump to escape
        if (mob.velY >= 0) mob.velY = -3.5;
      } else if (!isKnockback) {
        // Normal AI: wander with varied behavior
        if (mob.animFrame % 60 === 0) {
          const roll = Math.random();
          if (roll < 0.45) {
            // Walk in current direction
            mob.velX = (mob.facingLeft ? -1 : 1) * mConfig.speed * (2 + Math.random() * 2);
          } else if (roll < 0.75) {
            // Reverse and walk
            mob.facingLeft = !mob.facingLeft;
            mob.velX = (mob.facingLeft ? -1 : 1) * mConfig.speed * (2 + Math.random() * 2);
          } else {
            // Brief idle (reduce to small drift)
            mob.velX *= 0.3;
          }
        }
        // Keep a minimum movement when walking
        if (mob.animFrame % 60 > 10 && mob.animFrame % 60 < 50 && Math.abs(mob.velX) < mConfig.speed * 0.5) {
          mob.velX = (mob.facingLeft ? -1 : 1) * mConfig.speed * 1.5;
        }
      }

      // Update facing from velocity
      if (!isKnockback && Math.abs(mob.velX) > 0.3) {
        mob.facingLeft = mob.velX < 0;
      }

      // Horizontal movement + wall collision
      const nextMobX = mob.x + mob.velX;
      const edgeX = nextMobX + (mob.velX > 0 ? halfW : -halfW);
      const checkGX = Math.floor(edgeX / BLOCK_SIZE);

      // Performance: reduce collision checks from 4-6 to 2
      let hitWall = false;
      const midY = Math.floor((mob.y - mob.height / 2) / BLOCK_SIZE);
      const wb = getBlock(checkGX, midY);
      if (wb && wb.type !== "air") {
        hitWall = true;
      }

      if (hitWall) {
        mob.velX = 0;
        mob.facingLeft = !mob.facingLeft;
      } else {
        mob.x = nextMobX;
      }

      // Vertical movement with ground collision
      const nextMobY = mob.y + mob.velY;

      if (mob.velY >= 0) {
        const nextFootGridY = Math.floor(nextMobY / BLOCK_SIZE);
        const currentFootGridY = Math.floor(mob.y / BLOCK_SIZE);

        // Performance: reduce ground checks from 3-6+ to 1-2
        let groundY = -1;
        const centerGX = Math.floor(mob.x / BLOCK_SIZE);
        const gb = getBlock(centerGX, nextFootGridY);
        if (gb && gb.type !== "air") {
          groundY = nextFootGridY;
        }

        if (groundY >= 0) {
          mob.y = groundY * BLOCK_SIZE;
          mob.velY = 0;
        } else {
          mob.y = nextMobY;
        }
      } else {
        // Moving upward (knockback/jump)
        const headGridY = Math.floor((nextMobY - mob.height) / BLOCK_SIZE);
        const centerGX = Math.floor(mob.x / BLOCK_SIZE);
        const ceilingBlock = getBlock(centerGX, headGridY);
        if (ceilingBlock && ceilingBlock.type !== "air") {
          mob.velY = 0;
        } else {
          mob.y = nextMobY;
        }
      }

      // Keep mob inside dungeon horizontal boundaries
      const parentDung = dungeonsRef.current.find((d) => {
        const dx = Math.abs(mob.x / BLOCK_SIZE - d.centerX - 0.5);
        const dy = Math.abs(mob.y / BLOCK_SIZE - d.centerY - 0.5);
        return dx < d.radius + 3 && dy < d.radius + 3;
      });
      if (parentDung) {
        const leftBound = (parentDung.centerX - parentDung.radius + 1.5) * BLOCK_SIZE;
        const rightBound = (parentDung.centerX + parentDung.radius - 0.5) * BLOCK_SIZE;
        if (mob.x - halfW < leftBound) {
          mob.x = leftBound + halfW;
          mob.velX = Math.abs(mob.velX) * 0.3;
          mob.facingLeft = false;
        }
        if (mob.x + halfW > rightBound) {
          mob.x = rightBound - halfW;
          mob.velX = -Math.abs(mob.velX) * 0.3;
          mob.facingLeft = true;
        }
      }

      // Despawn if too far below dungeon
      if (parentDung && mob.y > (parentDung.centerY + parentDung.radius + 5) * BLOCK_SIZE) {
        mob.dead = true;
      }
    }

    // Cleanup dead mobs
    mobsRef.current = mobsRef.current.filter((m) => !m.dead);

    // Performance: cleanup far-away dungeons (keep last 5 max)
    if (dungeonsRef.current.length > 5) {
      dungeonsRef.current = dungeonsRef.current
        .filter((d) => d.centerY * BLOCK_SIZE > cameraYRef.current - 600)
        .slice(-5);
    }
    
    // Performance: limit total active mobs to 20
    if (mobsRef.current.length > 20) {
      mobsRef.current = mobsRef.current.slice(-20);
    }

    // Update particles
    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.vx *= 0.97;
      p.life -= 0.02;
    });
    particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

    // Update floating texts
    floatingTextsRef.current.forEach((t) => {
      t.y -= 1.0;
      t.life -= 0.015;
    });
    floatingTextsRef.current = floatingTextsRef.current.filter(
      (t) => t.life > 0
    );

    // Report depth
    const depth = Math.max(0, Math.floor(p.y / BLOCK_SIZE));
    if (depth !== statsRef.current.depth) {
      onStatsUpdate({ depth });
    }
  }

  function canvas_height(): number {
    return canvasRef.current?.height || 600;
  }

  function draw(ctx: CanvasRenderingContext2D) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.imageSmoothingEnabled = false;

    // Background
    const depth = Math.max(0, cameraYRef.current / BLOCK_SIZE);
    const bgDarkness = Math.min(depth / 300, 0.8);
    const r = Math.floor(20 - bgDarkness * 15);
    const g = Math.floor(22 - bgDarkness * 18);
    const b_col = Math.floor(30 - bgDarkness * 20);
    ctx.fillStyle = `rgb(${r},${g},${b_col})`;
    ctx.fillRect(0, 0, w, h);

    ctx.save();

    // Screen shake
    if (screenShakeRef.current > 0) {
      const shakeX = (Math.random() - 0.5) * screenShakeRef.current * 2;
      const shakeY = (Math.random() - 0.5) * screenShakeRef.current * 2;
      ctx.translate(shakeX, shakeY);
    }

    // Center world and apply camera
    const worldPixelWidth = WORLD_WIDTH * BLOCK_SIZE;
    const offsetX = Math.max(0, (w - worldPixelWidth) / 2);
    ctx.translate(offsetX, -cameraYRef.current);

    // Visible range
    const visMinY = Math.floor(cameraYRef.current / BLOCK_SIZE) - 1;
    const visMaxY = Math.ceil((cameraYRef.current + h) / BLOCK_SIZE) + 1;

    // Determine if transform event is active
    const bev = beaconEventRef.current;
    const isTransform = bev?.active && (
      bev.type === "transform_iron" ||
      bev.type === "transform_diamond" ||
      bev.type === "transform_emerald"
    );
    const transformType: BlockType | null = isTransform
      ? bev!.type === "transform_iron" ? "iron"
        : bev!.type === "transform_diamond" ? "diamond"
        : "emerald"
      : null;

    // Draw blocks
    for (let gy = visMinY; gy <= visMaxY; gy++) {
      const row = worldRef.current.get(gy);
      if (!row) continue;
      for (let gx = 0; gx < WORLD_WIDTH; gx++) {
        const block = row[gx];
        if (!block || block.type === "air") continue;

        // During transform event: render mineable blocks as the transformed ore
        const isMineable = block.type !== "spawner" &&
          block.type !== "beacon" && block.type !== "chest" && block.type !== "dungeon_chest" && block.type !== "explosive";
        const renderType = (isTransform && transformType && isMineable) ? transformType : block.type;
        const config = BLOCK_CONFIGS[renderType];
        const img = imagesRef.current[config.texture];

        // Dungeon chest: pixel art chest with golden latch
        if (block.type === "dungeon_chest") {
          const bx = block.x;
          const by = block.y;
          const s = BLOCK_SIZE;

          // Body
          ctx.fillStyle = "#7A5C38";
          ctx.fillRect(bx + 2, by + 4, s - 4, s - 6);

          // Lid (top part, slightly darker)
          ctx.fillStyle = "#6B4E2A";
          ctx.fillRect(bx + 1, by + 2, s - 2, s * 0.35);

          // Dark outline
          ctx.strokeStyle = "#3E2723";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx + 1.5, by + 2, s - 3, s - 4);

          // Lid line (horizontal separator)
          ctx.strokeStyle = "#2E1B0F";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(bx + 2, by + s * 0.38);
          ctx.lineTo(bx + s - 2, by + s * 0.38);
          ctx.stroke();

          // Golden latch
          ctx.fillStyle = "#FFD700";
          ctx.fillRect(bx + s * 0.38, by + s * 0.28, s * 0.24, s * 0.2);
          ctx.strokeStyle = "#B8860B";
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + s * 0.38, by + s * 0.28, s * 0.24, s * 0.2);
          // Keyhole
          ctx.fillStyle = "#1A1A1A";
          ctx.fillRect(bx + s * 0.46, by + s * 0.34, s * 0.08, s * 0.08);

          // Metal bands
          ctx.fillStyle = "#B8860B";
          ctx.fillRect(bx + 2, by + s * 0.55, s - 4, 2);
          ctx.fillRect(bx + 2, by + s * 0.75, s - 4, 2);

          // Corner studs
          ctx.fillStyle = "#FFD700";
          ctx.fillRect(bx + 4, by + s * 0.42, 3, 3);
          ctx.fillRect(bx + s - 7, by + s * 0.42, 3, 3);
          ctx.fillRect(bx + 4, by + s - 8, 3, 3);
          ctx.fillRect(bx + s - 7, by + s - 8, 3, 3);
        } else if (img) {
          ctx.drawImage(img, block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
        } else {
          ctx.fillStyle = config.color;
          ctx.fillRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
        }

        // Minecraft-style destroy stage overlay
        if (block.hp < block.maxHp && block.hp > 0) {
          const dmgRatio = 1 - block.hp / block.maxHp;
          const stageIdx = Math.min(Math.floor(dmgRatio * 10), 9);
          const destroyImg = imagesRef.current[DESTROY_STAGE_TEXTURES[stageIdx]];
          if (destroyImg) {
            ctx.globalAlpha = 0.6 + dmgRatio * 0.3;
            ctx.drawImage(destroyImg, block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
            ctx.globalAlpha = 1;
          } else {
            // Fallback: draw simple cracks
            drawFallbackCracks(ctx, block.x, block.y, BLOCK_SIZE, dmgRatio);
          }
        }

        // Spawner glow effect
        if (block.type === "spawner") {
          const glowAlpha = 0.2 + Math.sin(Date.now() * 0.005) * 0.15;
          ctx.fillStyle = `rgba(255, 50, 50, ${glowAlpha})`;
          ctx.fillRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);

          // Tiny fire particles
          ctx.fillStyle = `rgba(255, 100, 0, ${0.4 + Math.sin(Date.now() * 0.01) * 0.3})`;
          for (let fi = 0; fi < 3; fi++) {
            const fx = block.x + 8 + Math.sin(Date.now() * 0.003 + fi * 2) * 10;
            const fy = block.y + 8 + Math.cos(Date.now() * 0.004 + fi) * 10;
            ctx.fillRect(fx, fy, 3, 3);
          }
        }

        // Beacon glow effect - bright pulsing beam
        if (block.type === "beacon") {
          const t = Date.now();
          const pulse = 0.25 + Math.sin(t * 0.004) * 0.2;

          // Outer glow halo
          ctx.save();
          const grad = ctx.createRadialGradient(
            block.x + BLOCK_SIZE / 2, block.y + BLOCK_SIZE / 2, BLOCK_SIZE * 0.3,
            block.x + BLOCK_SIZE / 2, block.y + BLOCK_SIZE / 2, BLOCK_SIZE * 1.5
          );
          grad.addColorStop(0, `rgba(121, 242, 242, ${pulse * 0.6})`);
          grad.addColorStop(0.5, `rgba(0, 191, 255, ${pulse * 0.25})`);
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.fillRect(
            block.x - BLOCK_SIZE, block.y - BLOCK_SIZE,
            BLOCK_SIZE * 3, BLOCK_SIZE * 3
          );
          ctx.restore();

          // Inner shimmer overlay
          ctx.save();
          ctx.globalAlpha = 0.3 + Math.sin(t * 0.006) * 0.15;
          ctx.fillStyle = "#AEFFFF";
          ctx.fillRect(block.x + 2, block.y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
          ctx.restore();

          // Light beam going upward
          ctx.save();
          const beamAlpha = 0.08 + Math.sin(t * 0.003) * 0.05;
          const beamGrad = ctx.createLinearGradient(
            block.x + BLOCK_SIZE / 2, block.y,
            block.x + BLOCK_SIZE / 2, block.y - BLOCK_SIZE * 6
          );
          beamGrad.addColorStop(0, `rgba(121, 242, 242, ${beamAlpha * 2})`);
          beamGrad.addColorStop(1, "transparent");
          ctx.fillStyle = beamGrad;
          ctx.fillRect(block.x + 6, block.y - BLOCK_SIZE * 6, BLOCK_SIZE - 12, BLOCK_SIZE * 6);
          ctx.restore();

          // Floating sparkle particles around the beacon
          ctx.save();
          for (let pi = 0; pi < 6; pi++) {
            const px = block.x + BLOCK_SIZE / 2 + Math.sin(t * 0.002 + pi * 1.05) * BLOCK_SIZE * 0.8;
            const py = block.y + BLOCK_SIZE / 2 + Math.cos(t * 0.003 + pi * 1.3) * BLOCK_SIZE * 0.8;
            const ps = 1.5 + Math.sin(t * 0.005 + pi) * 1;
            ctx.globalAlpha = 0.4 + Math.sin(t * 0.004 + pi * 2) * 0.3;
            ctx.fillStyle = pi % 2 === 0 ? "#79F2F2" : "#FFFFFF";
            ctx.fillRect(px - ps / 2, py - ps / 2, ps, ps);
          }
          ctx.restore();
        }

        // Dungeon chest glow effect - warm golden shimmer
        if (block.type === "dungeon_chest") {
          const t = Date.now();
          const pulse = 0.2 + Math.sin(t * 0.004) * 0.15;

          // Warm golden radial glow
          ctx.save();
          const cGrad = ctx.createRadialGradient(
            block.x + BLOCK_SIZE / 2, block.y + BLOCK_SIZE / 2, BLOCK_SIZE * 0.2,
            block.x + BLOCK_SIZE / 2, block.y + BLOCK_SIZE / 2, BLOCK_SIZE * 1.2
          );
          cGrad.addColorStop(0, `rgba(255, 215, 0, ${pulse * 0.5})`);
          cGrad.addColorStop(0.6, `rgba(255, 165, 0, ${pulse * 0.2})`);
          cGrad.addColorStop(1, "transparent");
          ctx.fillStyle = cGrad;
          ctx.fillRect(
            block.x - BLOCK_SIZE * 0.5, block.y - BLOCK_SIZE * 0.5,
            BLOCK_SIZE * 2, BLOCK_SIZE * 2
          );
          ctx.restore();

          // Shimmer overlay
          ctx.save();
          ctx.globalAlpha = 0.15 + Math.sin(t * 0.006) * 0.1;
          ctx.fillStyle = "#FFD700";
          ctx.fillRect(block.x + 2, block.y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
          ctx.restore();

          // Floating gold sparkles
          ctx.save();
          for (let si = 0; si < 4; si++) {
            const sx = block.x + BLOCK_SIZE / 2 + Math.sin(t * 0.003 + si * 1.57) * BLOCK_SIZE * 0.6;
            const sy = block.y + BLOCK_SIZE / 2 + Math.cos(t * 0.004 + si * 1.2) * BLOCK_SIZE * 0.6;
            const ss = 1.5 + Math.sin(t * 0.005 + si) * 1;
            ctx.globalAlpha = 0.5 + Math.sin(t * 0.004 + si * 1.8) * 0.3;
            ctx.fillStyle = si % 2 === 0 ? "#FFD700" : "#FFA000";
            ctx.fillRect(sx - ss / 2, sy - ss / 2, ss, ss);
          }
          ctx.restore();
        }

        // Subtle grid lines
        ctx.strokeStyle = "rgba(0,0,0,0.12)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
      }
    }

    // Draw bedrock walls
    const bedrockImg = imagesRef.current[BEDROCK_TEXTURE];
    for (let gy = visMinY; gy <= visMaxY; gy++) {
      for (let col = 0; col < 2; col++) {
        const leftX = -(col + 1) * BLOCK_SIZE;
        const bY = gy * BLOCK_SIZE;
        if (bedrockImg) {
          ctx.drawImage(bedrockImg, leftX, bY, BLOCK_SIZE, BLOCK_SIZE);
        } else {
          ctx.fillStyle = "#3a3a3a";
          ctx.fillRect(leftX, bY, BLOCK_SIZE, BLOCK_SIZE);
        }
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(leftX, bY, BLOCK_SIZE, BLOCK_SIZE);

        const rightX = (WORLD_WIDTH + col) * BLOCK_SIZE;
        if (bedrockImg) {
          ctx.drawImage(bedrockImg, rightX, bY, BLOCK_SIZE, BLOCK_SIZE);
        } else {
          ctx.fillStyle = "#3a3a3a";
          ctx.fillRect(rightX, bY, BLOCK_SIZE, BLOCK_SIZE);
        }
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(rightX, bY, BLOCK_SIZE, BLOCK_SIZE);
      }
    }

    // Draw mobs with Minecraft UV mapping + 3D shading
    for (const mob of mobsRef.current) {
      if (mob.dead) continue;
      const mConfig = MOB_CONFIGS[mob.type];
      const mobImg = imagesRef.current[mConfig.texture];
      const isMoving = Math.abs(mob.velX) > 0.15;
      const walkCycle = Math.sin(mob.animFrame * 0.1) * 0.45;

      // Shadow under mob
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      const shadowW = mob.width * 0.8;
      ctx.beginPath();
      ctx.ellipse(mob.x, mob.y + 1, shadowW / 2, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(mob.x, mob.y);
      if (mob.facingLeft) ctx.scale(-1, 1);

      // Hit flash tint
      if (mob.hitFlash > 0) {
        ctx.globalAlpha = 0.85;
      }

      if (mob.type === "spider") {
        // ====== SPIDER RENDERING (larger) ======
        const S = 3.2;
        const legAnim = isMoving ? Math.sin(mob.animFrame * 0.18) * 5 : 0;
        const bodyW = 10 * S;
        const bodyH = 5 * S;
        const headW = 6 * S;
        const headH = 5 * S;

        // Draw legs first (behind body)
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        for (let side = -1; side <= 1; side += 2) {
          for (let i = 0; i < 4; i++) {
            const baseX = (i - 1.5) * (bodyW / 4);
            const legPhase = Math.sin(mob.animFrame * 0.18 + i * 1.3 + side * 0.5) * legAnim * 0.6;
            const midX = baseX + side * bodyW * 0.35;
            const midY = -bodyH * 0.3 + legPhase - 4;
            const tipX = baseX + side * bodyW * 0.65;
            const tipY = 2 + legPhase * 0.3;

            // Leg shadow
            ctx.strokeStyle = "rgba(30,15,10,0.6)";
            ctx.beginPath();
            ctx.moveTo(baseX, -bodyH * 0.5);
            ctx.quadraticCurveTo(midX, midY, tipX, tipY);
            ctx.stroke();

            // Leg main
            ctx.strokeStyle = "#4E342E";
            ctx.beginPath();
            ctx.moveTo(baseX, -bodyH * 0.5 - 1);
            ctx.quadraticCurveTo(midX, midY - 1, tipX, tipY - 1);
            ctx.stroke();
          }
        }

        // Body
        if (mobImg) {
          ctx.drawImage(mobImg, 0, 12, 12, 8, -bodyW / 2, -bodyH - 2, bodyW, bodyH);
        } else {
          ctx.fillStyle = "#5D4037";
          ctx.fillRect(-bodyW / 2, -bodyH - 2, bodyW, bodyH);
        }
        // 3D shading on body
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fillRect(-bodyW / 2, -4, bodyW, bodyH / 3);
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillRect(-bodyW / 2, -bodyH - 2, bodyW, bodyH / 3);

        // Head
        if (mobImg) {
          ctx.drawImage(mobImg, 32, 4, 8, 8, bodyW / 2 - 2, -headH - bodyH * 0.3, headW, headH);
        } else {
          ctx.fillStyle = "#3E2723";
          ctx.fillRect(bodyW / 2 - 2, -headH - bodyH * 0.3, headW, headH);
        }

        // Multiple red eyes (4 pairs)
        const eyeBaseX = bodyW / 2 + headW * 0.15;
        const eyeBaseY = -headH * 0.5 - bodyH * 0.3;
        ctx.fillStyle = "#FF1744";
        const eyeGlow = 0.6 + Math.sin(mob.animFrame * 0.08) * 0.4;
        ctx.globalAlpha = (mob.hitFlash > 0 ? 0.85 : 1) * eyeGlow;
        ctx.fillRect(eyeBaseX, eyeBaseY - 3, 3, 3);
        ctx.fillRect(eyeBaseX + 5, eyeBaseY - 3, 3, 3);
        ctx.fillRect(eyeBaseX + 1, eyeBaseY + 1, 2, 2);
        ctx.fillRect(eyeBaseX + 4, eyeBaseY + 1, 2, 2);
        ctx.globalAlpha = mob.hitFlash > 0 ? 0.85 : 1;

        // Hit flash
        if (mob.hitFlash > 0) {
          ctx.fillStyle = `rgba(255,100,100,${mob.hitFlash * 0.1})`;
          ctx.fillRect(-bodyW / 2 - 2, -bodyH - headH, bodyW + headW, bodyH + headH + 4);
        }
      } else {
        // ====== HUMANOID MOB RENDERING (zombie, skeleton, creeper) ======
        const S = 2.4;
        const legSwing = isMoving ? walkCycle : 0;
        const headBob = isMoving ? Math.sin(mob.animFrame * 0.14) * 1 : 0;

        // Helper to add 3D shading to a part
        const shade3D = (x: number, y: number, w: number, h: number) => {
          // Right edge shadow
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.fillRect(x + w - w * 0.15, y, w * 0.15, h);
          // Left edge highlight
          ctx.fillStyle = "rgba(255,255,255,0.06)";
          ctx.fillRect(x, y, w * 0.12, h);
          // Top highlight
          ctx.fillStyle = "rgba(255,255,255,0.05)";
          ctx.fillRect(x, y, w, h * 0.1);
          // Bottom shadow
          ctx.fillStyle = "rgba(0,0,0,0.12)";
          ctx.fillRect(x, y + h - h * 0.1, w, h * 0.1);
        };

        const legW = 4 * S;
        const legH = 12 * S;
        const bodyW = 8 * S;
        const bodyH = 12 * S;
        const armW = 4 * S;
        const armH = 12 * S;
        const headSize = 8 * S;

        const legTopY = 0; // feet at y=0, legs go upward
        const bodyTopY = -legH;
        const headTopY = -legH - bodyH;

        // --- RIGHT LEG (behind, slightly darker) ---
        ctx.save();
        ctx.translate(legW * 0.25, legTopY - legH / 2);
        ctx.rotate(-legSwing);
        ctx.translate(0, legH / 2);
        if (mobImg) {
          ctx.drawImage(mobImg, 4, 20, 4, 12, -legW / 2, -legH, legW, legH);
        } else {
          ctx.fillStyle = mConfig.color;
          ctx.fillRect(-legW / 2, -legH, legW, legH);
        }
        // Slightly darken the back leg
        ctx.fillStyle = "rgba(0,0,0,0.08)";
        ctx.fillRect(-legW / 2, -legH, legW, legH);
        shade3D(-legW / 2, -legH, legW, legH);
        ctx.restore();

        // --- LEFT LEG (front) -- mirror the right leg UV ---
        ctx.save();
        ctx.translate(-legW * 0.25, legTopY - legH / 2);
        ctx.rotate(legSwing);
        ctx.translate(0, legH / 2);
        if (mobImg) {
          // Mirror: flip horizontally by scaling -1, draw same UV as right leg
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(mobImg, 4, 20, 4, 12, -legW / 2, -legH, legW, legH);
          ctx.restore();
        } else {
          ctx.fillStyle = mConfig.color;
          ctx.fillRect(-legW / 2, -legH, legW, legH);
        }
        shade3D(-legW / 2, -legH, legW, legH);
        ctx.restore();

        // --- BODY ---
        if (mobImg) {
          ctx.drawImage(mobImg, 20, 20, 8, 12, -bodyW / 2, bodyTopY - bodyH, bodyW, bodyH);
        } else {
          ctx.fillStyle = mConfig.color;
          ctx.fillRect(-bodyW / 2, bodyTopY - bodyH, bodyW, bodyH);
        }
        shade3D(-bodyW / 2, bodyTopY - bodyH, bodyW, bodyH);

        // --- RIGHT ARM (behind body, slightly darker) ---
        ctx.save();
        ctx.translate(-bodyW / 2 - armW / 2, bodyTopY - bodyH);
        ctx.rotate(-legSwing * 0.7);
        if (mobImg) {
          ctx.drawImage(mobImg, 44, 20, 4, 12, -armW / 2, 0, armW, armH);
        } else {
          ctx.fillStyle = mConfig.color;
          ctx.fillRect(-armW / 2, 0, armW, armH);
        }
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        ctx.fillRect(-armW / 2, 0, armW, armH);
        shade3D(-armW / 2, 0, armW, armH);
        ctx.restore();

        // --- LEFT ARM (front) -- mirror the right arm UV ---
        ctx.save();
        ctx.translate(bodyW / 2 + armW / 2, bodyTopY - bodyH);
        ctx.rotate(legSwing * 0.7);
        if (mobImg) {
          // Mirror: flip horizontally
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(mobImg, 44, 20, 4, 12, -armW / 2, 0, armW, armH);
          ctx.restore();
        } else {
          ctx.fillStyle = mConfig.color;
          ctx.fillRect(-armW / 2, 0, armW, armH);
        }
        shade3D(-armW / 2, 0, armW, armH);
        ctx.restore();

        // --- HEAD ---
        const headX = -headSize / 2;
        const headY = headTopY - headSize + headBob;
        if (mobImg) {
          ctx.drawImage(mobImg, 8, 8, 8, 8, headX, headY, headSize, headSize);
        } else {
          ctx.fillStyle = mConfig.color;
          ctx.fillRect(headX, headY, headSize, headSize);
        }
        shade3D(headX, headY, headSize, headSize);

        // Outline for head (pixel border)
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(headX, headY, headSize, headSize);

        // Creeper face (drawn on top of texture)
        if (mob.type === "creeper" && !mobImg) {
          ctx.fillStyle = "#000";
          const es = headSize * 0.18;
          ctx.fillRect(headX + headSize * 0.2, headY + headSize * 0.3, es, es);
          ctx.fillRect(headX + headSize * 0.6, headY + headSize * 0.3, es, es);
          ctx.fillRect(headX + headSize * 0.35, headY + headSize * 0.55, headSize * 0.3, headSize * 0.15);
          ctx.fillRect(headX + headSize * 0.4, headY + headSize * 0.7, headSize * 0.2, headSize * 0.15);
        }

        // Hit flash overlay (red tint)
        if (mob.hitFlash > 0) {
          const flashAlpha = mob.hitFlash * 0.08;
          ctx.fillStyle = `rgba(255,80,80,${flashAlpha})`;
          // Cover the full mob
          ctx.fillRect(-bodyW / 2 - armW, headY, bodyW + armW * 2, -headY + 4);
        }
      }

      ctx.globalAlpha = 1;
      ctx.restore();

      // HP bar above mob
      if (mob.hp < mob.maxHp) {
        const barW = mob.width + 10;
        const barH = 4;
        const barX = mob.x - barW / 2;
        const barY = mob.y - mob.height - 14;
        // Background
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        // Red base
        ctx.fillStyle = "rgba(80,0,0,0.5)";
        ctx.fillRect(barX, barY, barW, barH);
        // HP fill
        const hpRatio = mob.hp / mob.maxHp;
        const hpColor = hpRatio > 0.5 ? "#4CAF50" : hpRatio > 0.25 ? "#FF9800" : "#D32F2F";
        ctx.fillStyle = hpColor;
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
        // Highlight on HP bar
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(barX, barY, barW * hpRatio, 1);
      }
    }

    // Draw particles
    particlesRef.current.forEach((part) => {
      ctx.globalAlpha = Math.max(0, part.life);
      ctx.fillStyle = part.color;
      const size = part.size * part.life;
      ctx.fillRect(part.x - size / 2, part.y - size / 2, size, size);
    });
    ctx.globalAlpha = 1;

    // Draw floating texts
    floatingTextsRef.current.forEach((t) => {
      ctx.globalAlpha = Math.max(0, t.life);
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.strokeStyle = "rgba(0,0,0,0.8)";
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    });
    ctx.globalAlpha = 1;

    // Draw pickaxe
    const p = pickaxeRef.current;
    const tier = statsRef.current.pickaxeTier;
    const pickImg = imagesRef.current[PICKAXE_TEXTURES[tier]];

    ctx.save();
    ctx.translate(p.x, p.y);

    const swingOffset = p.isSwinging
      ? Math.sin(Date.now() * 0.03) * p.swingAngle
      : 0;
    ctx.rotate(p.angle + swingOffset);

    if (pickImg) {
      ctx.drawImage(pickImg, -16, -16, 32, 32);
    } else {
      const tierColor = PICKAXE_TIERS[tier].color;
      ctx.fillStyle = tierColor;
      ctx.fillRect(-14, -10, 28, 5);
      ctx.fillStyle = "#8D6E63";
      ctx.fillRect(-2, -8, 4, 22);
    }
    ctx.restore();

    ctx.restore();

    // Depth indicator lines
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    const lineSpacing = BLOCK_SIZE * 5;
    const firstLine =
      Math.floor(cameraYRef.current / lineSpacing) * lineSpacing;
    for (
      let ly = firstLine;
      ly < cameraYRef.current + h + lineSpacing;
      ly += lineSpacing
    ) {
      const screenY = ly - cameraYRef.current;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(w, screenY);
      ctx.stroke();
    }
    ctx.restore();

    // BOOST active visual effect -- glowing orange screen border + particle rain
    if (boostActiveRef.current) {
      const pulse = 0.3 + Math.sin(Date.now() * 0.005) * 0.15;
      // Glowing border
      const edgeW = 6;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = "#FF9800";
      ctx.fillRect(0, 0, w, edgeW); // top
      ctx.fillRect(0, h - edgeW, w, edgeW); // bottom
      ctx.fillRect(0, 0, edgeW, h); // left
      ctx.fillRect(w - edgeW, 0, edgeW, h); // right
      ctx.restore();

      // Vignette glow
      ctx.save();
      const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.8);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(1, `rgba(255,152,0,${pulse * 0.2})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // Falling golden sparkles
      ctx.save();
      for (let i = 0; i < 12; i++) {
        const sx = ((Date.now() * 0.02 + i * 137.5) % w);
        const sy = ((Date.now() * 0.08 + i * 89.3) % h);
        const sparkSize = 2 + Math.sin(Date.now() * 0.01 + i) * 1.5;
        ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.006 + i * 2) * 0.3;
        ctx.fillStyle = i % 2 === 0 ? "#FFD54F" : "#FF9800";
        ctx.fillRect(sx, sy, sparkSize, sparkSize);
      }
      ctx.restore();
    }
  }

  // Fallback crack overlay (used when destroy_stage textures fail to load)
  function drawFallbackCracks(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    damageRatio: number
  ) {
    const stages = Math.min(Math.floor(damageRatio * 5), 4);
    if (stages <= 0) return;

    ctx.save();
    ctx.strokeStyle = `rgba(0,0,0,${0.3 + damageRatio * 0.5})`;
    ctx.lineWidth = 1.5;
    ctx.translate(x, y);

    if (stages >= 1) {
      ctx.beginPath();
      ctx.moveTo(size * 0.5, size * 0.3);
      ctx.lineTo(size * 0.45, size * 0.5);
      ctx.lineTo(size * 0.55, size * 0.65);
      ctx.stroke();
    }
    if (stages >= 2) {
      ctx.beginPath();
      ctx.moveTo(size * 0.2, size * 0.2);
      ctx.lineTo(size * 0.35, size * 0.4);
      ctx.lineTo(size * 0.25, size * 0.6);
      ctx.stroke();
    }
    if (stages >= 3) {
      ctx.beginPath();
      ctx.moveTo(size * 0.7, size * 0.15);
      ctx.lineTo(size * 0.6, size * 0.35);
      ctx.lineTo(size * 0.75, size * 0.55);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(size * 0.3, size * 0.7);
      ctx.lineTo(size * 0.5, size * 0.85);
      ctx.stroke();
    }
    if (stages >= 4) {
      ctx.strokeStyle = `rgba(0,0,0,${0.6 + damageRatio * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(size * 0.1, size * 0.45);
      ctx.lineTo(size * 0.4, size * 0.5);
      ctx.lineTo(size * 0.5, size * 0.3);
      ctx.lineTo(size * 0.8, size * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(size * 0.4, size * 0.7);
      ctx.lineTo(size * 0.65, size * 0.75);
      ctx.lineTo(size * 0.9, size * 0.6);
      ctx.stroke();
    }

    ctx.restore();
  }

  // (Mob rendering is handled inline in the draw function above)

  // Pointer handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      audioService.init();
      audioService.startMusic();
      isPointerDown.current = true;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect && canvasRef.current) {
        const worldPixelWidth = WORLD_WIDTH * BLOCK_SIZE;
        const offX = Math.max(
          0,
          (canvasRef.current.width - worldPixelWidth) / 2
        );
        const worldY = e.clientY - rect.top + cameraYRef.current;
        targetRef.current = {
          x: e.clientX - rect.left - offX,
          y: Math.max(worldY, maxCameraYRef.current),
        };
      }
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPointerDown.current) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect && canvasRef.current) {
        const worldPixelWidth = WORLD_WIDTH * BLOCK_SIZE;
        const offX = Math.max(
          0,
          (canvasRef.current.width - worldPixelWidth) / 2
        );
        const worldY = e.clientY - rect.top + cameraYRef.current;
        targetRef.current = {
          x: e.clientX - rect.left - offX,
          y: Math.max(worldY, maxCameraYRef.current),
        };
      }
    },
    []
  );

  const handlePointerUp = useCallback(() => {
    isPointerDown.current = false;
    targetRef.current = null;
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      style={{ background: "#0e0e14" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        style={{ cursor: "crosshair", imageRendering: "pixelated" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}
