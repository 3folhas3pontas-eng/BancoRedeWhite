"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  PlayerStats,
  Block,
  Enchantment,
  Rarity,
  PickaxeTier,
  MobType,
  BeaconEvent,
  BeaconEventType,
  LootItem,
} from "@/lib/game/types";
import {
  BLOCK_CONFIGS,
  ENCHANTMENTS,
  RARITY_WEIGHTS,
  TIER_ORDER,
  PICKAXE_TIERS,
  BOOST_CHARGE_TIME,
  BOOST_DURATION,
  BEACON_EVENTS,
  DUNGEON_LOOT_TABLE,
} from "@/lib/game/constants";
import { audioService } from "@/lib/game/audio";
import { saveMiningSave, MiningSave } from "@/lib/game/save";
import { MiningInventory, DEFAULT_INVENTORY, saveInventoryWithSync, fetchInventoryFromDB, blockToOre, getDropAmount, OreType, lootNameToItemType, getLootAmount, DungeonItemType } from "@/lib/game/inventory";
import GameCanvas from "./GameCanvas";
import GameHUD from "./GameHUD";
import ActionButtons from "./ActionButtons";
import ShopPanel from "./ShopPanel";
import EnchantPanel from "./EnchantPanel";
import BoostBar from "./BoostBar";
import EventBanner from "./EventBanner";
import LootPopup from "./LootPopup";
import InventoryPanel from "./InventoryPanel";

interface GameProps {
  username: string;
  initialSave: MiningSave | null;
  initialInventory: MiningInventory;
  bankBalance: number;
  onSpend: (amount: number) => Promise<void>;
}

export default function Game({ username, initialSave, initialInventory, bankBalance, onSpend }: GameProps) {
  // bankBalance prop é a fonte da verdade para exibição e gastos
  const [localBalance, setLocalBalance] = useState(bankBalance);

  // Sincroniza se o bankBalance mudar por fora (ex: ao abrir o jogo)
  useEffect(() => {
    setLocalBalance(bankBalance);
  }, [bankBalance]);

  const [stats, setStats] = useState<PlayerStats>(() => ({
    money:           0, // não usado para saldo — usamos localBalance
    xp:              initialSave?.xp           ?? 0,
    level:           initialSave?.level        ?? 1,
    depth:           initialSave?.depth        ?? 0,
    pickaxeTier:     (initialSave?.pickaxe_tier as PickaxeTier) ?? "wood",
    pickStrength:    initialSave?.pick_strength ?? 1,
    pickSpeed:       initialSave?.pick_speed    ?? 1,
    combo:           0,
    maxCombo:        initialSave?.max_combo     ?? 0,
    blocksMinedTotal:initialSave?.blocks_mined  ?? 0,
    tntRadius:       initialSave?.tnt_radius    ?? 0,
    tntSpawn:        initialSave?.tnt_spawn     ?? 0,
    beaconSpawn:     initialSave?.beacon_spawn  ?? 0,
    dungeonSpawn:    initialSave?.dungeon_spawn ?? 0,
    chestSpawn:      initialSave?.chest_spawn   ?? 0,
  }));

  const [enchantments, setEnchantments] = useState<Enchantment[]>(
    () => initialSave?.enchantments ?? []
  );

  // Inventario de minerios
  const [inventory, setInventory] = useState<MiningInventory>(() => initialInventory ?? DEFAULT_INVENTORY);
  const inventoryRef = useRef(inventory);
  // Referencia para o ultimo inventario salvo (usado para calcular delta)
  const lastSavedInventoryRef = useRef<MiningInventory>({ ...initialInventory } ?? { ...DEFAULT_INVENTORY });

  // Refs para ter sempre os valores mais recentes nas callbacks de save
  const statsRef = useRef(stats);
  const enchantmentsRef = useRef(enchantments);
  useEffect(() => { enchantmentsRef.current = enchantments; }, [enchantments]);

  // Wrapper que atualiza ref e state ao mesmo tempo
  const setStatsAndRef = useCallback((updater: PlayerStats | ((prev: PlayerStats) => PlayerStats)) => {
    setStats((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      statsRef.current = next;
      return next;
    });
  }, []);

  const doSave = useCallback(async () => {
    saveMiningSave(username, statsRef.current, enchantmentsRef.current);
    // Usa sync inteligente: busca banco, calcula delta, faz merge
    const syncedInventory = await saveInventoryWithSync(
      username,
      inventoryRef.current,
      lastSavedInventoryRef.current
    );
    // Atualiza o state local com o inventario sincronizado
    setInventory(syncedInventory);
    inventoryRef.current = syncedInventory;
    lastSavedInventoryRef.current = { ...syncedInventory };
  }, [username]);

  // Adiciona minerio ao inventario
  const addOre = useCallback((oreType: OreType, amount: number) => {
    setInventory((prev) => {
      const next = { ...prev, [oreType]: prev[oreType] + amount };
      inventoryRef.current = next;
      return next;
    });
  }, []);

  // Adiciona item (minerio ou dungeon) ao inventario
  const addItem = useCallback((itemType: OreType | DungeonItemType, amount: number) => {
    setInventory((prev) => {
      const currentAmount = prev[itemType as keyof MiningInventory] ?? 0;
      const next = { ...prev, [itemType]: currentAmount + amount };
      inventoryRef.current = next;
      return next;
    });
  }, []);

  // Auto-save a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(doSave, 30_000);
    return () => {
      clearInterval(interval);
      doSave(); // salva ao desmontar (sair do jogo)
    };
  }, [doSave]);

  // Refresh do inventario do banco a cada 10 segundos (detecta coletas do plugin Minecraft)
  useEffect(() => {
    const interval = setInterval(async () => {
      const dbInventory = await fetchInventoryFromDB(username);
      if (dbInventory) {
        // Calcula os novos itens minerados desde o ultimo save
        const currentLocal = inventoryRef.current;
        const lastSaved = lastSavedInventoryRef.current;
        
        // Para cada item: valor final = banco + (local - ultimo_salvo)
        const merged: MiningInventory = { ...DEFAULT_INVENTORY };
        const keys = Object.keys(DEFAULT_INVENTORY) as (keyof MiningInventory)[];
        for (const key of keys) {
          const delta = Math.max(0, currentLocal[key] - lastSaved[key]);
          merged[key] = dbInventory[key] + delta;
        }
        
        setInventory(merged);
        inventoryRef.current = merged;
        // Atualiza a referencia do ultimo salvo para o banco atual
        lastSavedInventoryRef.current = { ...dbInventory };
      }
    }, 10_000);
    return () => clearInterval(interval);
  }, [username]);
  const [showShop, setShowShop] = useState(false);
  const [showEnchant, setShowEnchant] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  // Boost system
  const [boostCharge, setBoostCharge] = useState(0); // 0..1
  const [isBoostActive, setIsBoostActive] = useState(false);
  const [boostTimeLeft, setBoostTimeLeft] = useState(0);
  const boostActiveRef = useRef(false);

  // Charge the boost bar over time
  useEffect(() => {
    const interval = setInterval(() => {
      if (!boostActiveRef.current) {
        setBoostCharge((prev) => Math.min(prev + 1 / BOOST_CHARGE_TIME, 1));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Boost countdown when active
  useEffect(() => {
    if (!isBoostActive) return;
    const interval = setInterval(() => {
      setBoostTimeLeft((prev) => {
        if (prev <= 0.5) {
          // Boost ended
          setIsBoostActive(false);
          boostActiveRef.current = false;
          setBoostCharge(0); // reset charge
          audioService.stopBoostMusic();
          return 0;
        }
        return prev - 0.5;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isBoostActive]);

  const activateBoost = useCallback(() => {
    if (boostCharge < 1 || isBoostActive) return;
    setIsBoostActive(true);
    boostActiveRef.current = true;
    setBoostTimeLeft(BOOST_DURATION);
    audioService.startBoostMusic();
  }, [boostCharge, isBoostActive]);

  // Beacon event system
  const [beaconEvent, setBeaconEvent] = useState<BeaconEvent | null>(null);
  const beaconEventRef = useRef<BeaconEvent | null>(null);

  // Beacon event countdown
  useEffect(() => {
    if (!beaconEvent || !beaconEvent.active) return;
    const interval = setInterval(() => {
      setBeaconEvent((prev) => {
        if (!prev || !prev.active) return null;
        const newTime = prev.timeLeft - 0.5;
        if (newTime <= 0) {
          beaconEventRef.current = null;
          // If it was a boost event, deactivate boost
          if (prev.type === "boost_30s") {
            setIsBoostActive(false);
            boostActiveRef.current = false;
            setBoostCharge(0);
            audioService.stopBoostMusic();
          }
          return null;
        }
        const updated = { ...prev, timeLeft: newTime };
        beaconEventRef.current = updated;
        return updated;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [beaconEvent]);

  const triggerBeaconEvent = useCallback(() => {
    // Weighted random selection
    const totalWeight = BEACON_EVENTS.reduce((a, b) => a + b.weight, 0);
    let roll = Math.random() * totalWeight;
    let selected = BEACON_EVENTS[0];
    for (const ev of BEACON_EVENTS) {
      roll -= ev.weight;
      if (roll <= 0) {
        selected = ev;
        break;
      }
    }

    const event: BeaconEvent = {
      type: selected.type,
      name: selected.name,
      color: selected.color,
      duration: selected.duration,
      timeLeft: selected.duration,
      active: true,
    };

    setBeaconEvent(event);
    beaconEventRef.current = event;

    // Handle specific event triggers
    if (selected.type === "boost_30s") {
      setIsBoostActive(true);
      boostActiveRef.current = true;
      setBoostTimeLeft(30);
      setBoostCharge(0);
      audioService.startBoostMusic();
    }
  }, []);

  // Dungeon chest loot system
  const [currentLoot, setCurrentLoot] = useState<LootItem[] | null>(null);

  const rollDungeonLoot = useCallback((): LootItem[] => {
    // Roll 3-5 items from the loot table (weighted)
    const numItems = 3 + Math.floor(Math.random() * 3);
    const totalWeight = DUNGEON_LOOT_TABLE.reduce((a, b) => a + b.weight, 0);
    const items: LootItem[] = [];

    for (let i = 0; i < numItems; i++) {
      let roll = Math.random() * totalWeight;
      let picked = DUNGEON_LOOT_TABLE[0];
      for (const entry of DUNGEON_LOOT_TABLE) {
        roll -= entry.weight;
        if (roll <= 0) {
          picked = entry;
          break;
        }
      }
      // Depth bonus: deeper dungeons get better multipliers
      const depthMult = 1 + Math.floor(stats.depth / 200) * 0.2;
      items.push({
        name: picked.name,
        icon: picked.icon,
        color: picked.color,
        rarity: picked.rarity,
        money: Math.ceil(picked.money * depthMult),
        xp: Math.ceil(picked.xp * depthMult),
        description: picked.description,
      });
    }

    // Sort by rarity: legendary last (most exciting)
    const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
    items.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    return items;
  }, [stats.depth]);

  const handleDungeonChestOpen = useCallback(() => {
    const loot = rollDungeonLoot();
    setCurrentLoot(loot);
    audioService.playChestOpen();

    // Adiciona itens ao inventario
    for (const item of loot) {
      const itemType = lootNameToItemType(item.name);
      if (itemType) {
        const amount = getLootAmount(item.name);
        addItem(itemType, amount);
      }
    }

    // Dungeon chest: apenas XP, sem money
    const totalXp = loot.reduce((a, b) => a + b.xp, 0);
    setStatsAndRef((prev) => {
      let newXp = prev.xp + totalXp;
      let newLevel = prev.level;
      const xpToNext = prev.level * 500;
      if (newXp >= xpToNext) {
        newXp -= xpToNext;
        newLevel++;
        audioService.playLevelUp();
      }
      return { ...prev, xp: newXp, level: newLevel };
    });
  }, [rollDungeonLoot, setStatsAndRef, addItem]);

  const closeLoot = useCallback(() => setCurrentLoot(null), []);

  // Fortune multiplier from enchantments
  const fortuneMult = useRef(1);

  const handleStatsUpdate = useCallback((partial: Partial<PlayerStats>) => {
    setStatsAndRef((prev) => ({ ...prev, ...partial }));
  }, [setStatsAndRef]);

  const handleBlockBreak = useCallback(
    (block: Block) => {
      const config = BLOCK_CONFIGS[block.type];
      if (!config) return;

      // If it's a beacon, trigger a random event
      if (block.type === "beacon") {
        triggerBeaconEvent();
      }

      // Verifica se o bloco dropa minerio
      const oreType = blockToOre(block.type);
      if (oreType) {
        const eventMult = beaconEventRef.current?.active && beaconEventRef.current.type === "double_ores" ? 2 : 1;
        const dropAmount = getDropAmount(block.type) * eventMult;
        addOre(oreType, dropAmount);
      }

      setStatsAndRef((prev) => {
        const eventMult =
          beaconEventRef.current?.active && beaconEventRef.current.type === "double_ores" ? 2 : 1;
        const xpGain = Math.ceil(config.xp * eventMult);

        let newXp = prev.xp + xpGain;
        let newLevel = prev.level;
        const xpToNext = prev.level * 500;

        if (newXp >= xpToNext) {
          newXp -= xpToNext;
          newLevel++;
          audioService.playLevelUp();
        }

        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          blocksMinedTotal: prev.blocksMinedTotal + 1,
        };
      });
    },
    [triggerBeaconEvent, addOre, setStatsAndRef]
  );

  const handleMobKill = useCallback(
    (mobType: MobType, xp: number, money: number) => {
      // Não ganha money ao matar mobs — só XP
      setStatsAndRef((prev) => {
        let newXp = prev.xp + xp;
        let newLevel = prev.level;
        const xpToNext = prev.level * 500;
        if (newXp >= xpToNext) {
          newXp -= xpToNext;
          newLevel++;
          audioService.playLevelUp();
        }
        return { ...prev, xp: newXp, level: newLevel };
      });
    },
    [setStatsAndRef]
  );

  const handleShopUpgrade = useCallback((type: "tntRadius" | "tntSpawn" | "beaconSpawn" | "dungeonSpawn" | "chestSpawn") => {
    const costs: Record<string, (lv: number) => number> = {
      tntRadius:    (lv) => Math.ceil(500 * Math.pow(2.0, lv)),
      tntSpawn:     (lv) => Math.ceil(300 * Math.pow(1.8, lv)),
      beaconSpawn:  (lv) => Math.ceil(1000 * Math.pow(2.2, lv)),
      dungeonSpawn: (lv) => Math.ceil(800 * Math.pow(2.0, lv)),
      chestSpawn:   (lv) => Math.ceil(200 * Math.pow(1.6, lv)),
    };
    const maxLevels: Record<string, number> = {
      tntRadius: 5, tntSpawn: 10, beaconSpawn: 8, dungeonSpawn: 8, chestSpawn: 10,
    };
    const currentLv = statsRef.current[type];
    if (currentLv >= maxLevels[type]) return;
    const cost = costs[type](currentLv);
    if (localBalance < cost) return;
    audioService.playClick();
    setLocalBalance((prev) => prev - cost);
    onSpend(cost);
    setStatsAndRef((prev) => ({ ...prev, [type]: currentLv + 1 }));
  }, [localBalance, onSpend, setStatsAndRef]);

  const handleUpgrade = useCallback((type: "speed") => {
    const cost = Math.ceil(80 * Math.pow(1.5, statsRef.current.pickSpeed));
    if (localBalance < cost) return;
    setLocalBalance((prev) => prev - cost);
    onSpend(cost);
    setStatsAndRef((prev) => ({ ...prev, pickSpeed: +(prev.pickSpeed + 0.2).toFixed(1) }));
  }, [localBalance, onSpend, setStatsAndRef]);

  const handleUpgradeTier = useCallback(() => {
    const currentIdx = TIER_ORDER.indexOf(statsRef.current.pickaxeTier);
    if (currentIdx >= TIER_ORDER.length - 1) return;
    const nextTier = TIER_ORDER[currentIdx + 1];
    const nextData = PICKAXE_TIERS[nextTier];
    if (localBalance < nextData.cost) return;
    audioService.playLevelUp();
    setLocalBalance((prev) => prev - nextData.cost);
    onSpend(nextData.cost);
    setStatsAndRef((prev) => ({ ...prev, pickaxeTier: nextTier }));
  }, [localBalance, onSpend, setStatsAndRef]);

  const handleEnchant = useCallback(() => {
    setStatsAndRef((prev) => {
      if (prev.xp < 1000) return prev;

      // Weighted random rarity selection
      const totalWeight = Object.values(RARITY_WEIGHTS).reduce(
        (a, b) => a + b,
        0
      );
      let roll = Math.random() * totalWeight;
      let selectedRarity: Rarity = Rarity.COMMON;
      for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
        roll -= weight;
        if (roll <= 0) {
          selectedRarity = rarity as Rarity;
          break;
        }
      }

      // Pick an enchantment of that rarity
      const pool = ENCHANTMENTS.filter(
        (e) => e.rarity === selectedRarity
      );
      if (pool.length === 0) return prev;
      const enchant = pool[Math.floor(Math.random() * pool.length)];

      // Apply enchantment
      setEnchantments((prevEnc) => [...prevEnc, enchant]);

      // Update fortune multiplier
      if (enchant.id.startsWith("fort")) {
        fortuneMult.current *= enchant.value;
      }

      audioService.playOrb();

      return {
        ...prev,
        xp: prev.xp - 1000,
      };
    });
  }, [setStatsAndRef]);

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: "#0a0a0f" }}>
      <GameCanvas
        stats={stats}
        onStatsUpdate={handleStatsUpdate}
        onBlockBreak={handleBlockBreak}
        onMobKill={handleMobKill}
        isBoostActive={isBoostActive}
        beaconEvent={beaconEvent}
        onDungeonChestOpen={handleDungeonChestOpen}
      />
      <GameHUD stats={stats} bankBalance={localBalance} />
      <EventBanner event={beaconEvent} />
      <LootPopup loot={currentLoot} onClose={closeLoot} />
      <BoostBar
        chargeProgress={boostCharge}
        isBoostActive={isBoostActive}
        boostTimeLeft={boostTimeLeft}
        onActivateBoost={activateBoost}
      />
      <ActionButtons
        onShop={() => setShowShop(true)}
        onEnchant={() => setShowEnchant(true)}
        onInventory={() => setShowInventory(true)}
      />
      {showShop && (
        <ShopPanel
          stats={stats}
          bankBalance={localBalance}
          onUpgrade={handleUpgrade}
          onUpgradeTier={handleUpgradeTier}
          onShopUpgrade={handleShopUpgrade}
          onClose={() => setShowShop(false)}
        />
      )}
      {showEnchant && (
        <EnchantPanel
          stats={stats}
          enchantments={enchantments}
          onEnchant={handleEnchant}
          onClose={() => setShowEnchant(false)}
        />
      )}
      {showInventory && (
        <InventoryPanel
          inventory={inventory}
          onClose={() => setShowInventory(false)}
        />
      )}
    </div>
  );
}
