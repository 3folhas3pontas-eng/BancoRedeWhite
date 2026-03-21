"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  PlayerStats,
  Block,
  Enchantment,
  PickaxeTier,
  MobType,
  BeaconEvent,
  BeaconEventType,
  LootItem,
} from "@/lib/game/types";
import {
  BLOCK_CONFIGS,
  ENCHANTMENTS,
  ENCHANT_COST,
  RECYCLE_COST,
  FORTUNE_TRIGGER_CHANCE,
  TIER_ORDER,
  PICKAXE_TIERS,
  BOOST_CHARGE_TIME,
  BOOST_DURATION,
  BEACON_EVENTS,
  DUNGEON_LOOT_TABLE,
} from "@/lib/game/constants";
import { audioService } from "@/lib/game/audio";
import { saveMiningSave, MiningSave } from "@/lib/game/save";
import { registrarTransacao, TipoTransacao } from "@/lib/game/transacoes";
import { MiningInventory, DEFAULT_INVENTORY, saveSessionDelta, fetchInventoryFromDB, blockToOre, getDropAmount, OreType, lootNameToItemType, getLootAmount, DungeonItemType } from "@/lib/game/inventory";
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

  const [enchantments, setEnchantments] = useState<Enchantment[]>(() => {
    const loaded = initialSave?.enchantments ?? [];
    console.log('[v0] 1. Enchantments do initialSave:', JSON.stringify(loaded));
    if (loaded.length > 0) {
      console.log('[v0] 1.1 Primeiro enchantment:', loaded[0]);
      console.log('[v0] 1.2 type:', loaded[0].type, '| value:', loaded[0].value, '| level:', loaded[0].level);
    }
    return loaded;
  });

  // === NOVO SISTEMA DE INVENTARIO ===
  // dbInventory = valor atual do Supabase (fonte da verdade)
  // sessionDelta = itens minerados NESTA SESSAO (comeca em 0, reseta ao salvar)
  // inventory exibido = dbInventory + sessionDelta
  
  const [dbInventory, setDbInventory] = useState<MiningInventory>(() => initialInventory ?? DEFAULT_INVENTORY);
  const [sessionDelta, setSessionDelta] = useState<MiningInventory>({ ...DEFAULT_INVENTORY });
  const dbInventoryRef = useRef(dbInventory);
  const sessionDeltaRef = useRef(sessionDelta);

  // Inventario calculado = banco + delta da sessao
  const inventory = useMemo(() => {
    const result: MiningInventory = { ...DEFAULT_INVENTORY };
    const keys = Object.keys(DEFAULT_INVENTORY) as (keyof MiningInventory)[];
    for (const key of keys) {
      result[key] = (dbInventory[key] ?? 0) + (sessionDelta[key] ?? 0);
    }
    return result;
  }, [dbInventory, sessionDelta]);
  
  const inventoryRef = useRef(inventory);
  useEffect(() => { inventoryRef.current = inventory; }, [inventory]);

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
    
    // Salva APENAS o delta da sessao de forma incremental
    // NUNCA sobrescreve valores - apenas adiciona ao banco
    const deltaToSave = { ...sessionDeltaRef.current };
    const success = await saveSessionDelta(username, deltaToSave);
    
    if (success) {
      // Zera o sessionDelta apos salvar
      setSessionDelta({ ...DEFAULT_INVENTORY });
      sessionDeltaRef.current = { ...DEFAULT_INVENTORY };
      
      // Atualiza dbInventory com valor fresco do banco
      const freshDb = await fetchInventoryFromDB(username);
      if (freshDb) {
        setDbInventory(freshDb);
        dbInventoryRef.current = freshDb;
      }
    }
  }, [username]);

  // Adiciona minerio ao inventario (incrementa sessionDelta)
  const addOre = useCallback((oreType: OreType, amount: number) => {
    setSessionDelta((prev) => {
      const next = { ...prev, [oreType]: prev[oreType] + amount };
      sessionDeltaRef.current = next;
      return next;
    });
  }, []);

  // Adiciona item (minerio ou dungeon) ao inventario (incrementa sessionDelta)
  const addItem = useCallback((itemType: OreType | DungeonItemType, amount: number) => {
    setSessionDelta((prev) => {
      const currentAmount = prev[itemType as keyof MiningInventory] ?? 0;
      const next = { ...prev, [itemType]: currentAmount + amount };
      sessionDeltaRef.current = next;
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

  // Refresh do dbInventory a cada 5 segundos (detecta coletas do plugin Minecraft)
  // NAO mexe no sessionDelta - apenas atualiza o que esta no banco
  useEffect(() => {
    const interval = setInterval(async () => {
      const freshDb = await fetchInventoryFromDB(username);
      if (freshDb) {
        setDbInventory(freshDb);
        dbInventoryRef.current = freshDb;
      }
    }, 5_000);
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

  // Multipliers from enchantments (usando useState para causar re-render)
  const [fortuneLevel, setFortuneLevel] = useState(0);  // Nivel da fortuna (0, 1, 2 ou 3)
  const [efficiencyMultState, setEfficiencyMultState] = useState(1);  // Multiplicador de velocidade
  const [mendingMultState, setMendingMultState] = useState(1);  // Multiplicador de XP
  
  // Inicializa multiplicadores baseado nos encantamentos carregados
  useEffect(() => {
    console.log('[v0] 2. useEffect disparado - enchantments.length:', enchantments.length);
    console.log('[v0] 2.1 Enchantments array:', JSON.stringify(enchantments));
    
    const efficiency = enchantments.find(e => e.type === 'efficiency');
    const fortune = enchantments.find(e => e.type === 'fortune');
    const mending = enchantments.find(e => e.type === 'mending');
    
    console.log('[v0] 2.2 efficiency encontrado:', efficiency);
    console.log('[v0] 2.3 fortune encontrado:', fortune);
    console.log('[v0] 2.4 mending encontrado:', mending);
    
    const effValue = efficiency?.value || 1;
    const fortLevel = fortune?.level || 0;
    const mendValue = mending?.value || 1;
    
    console.log('[v0] 2.5 Valores a serem aplicados - eff:', effValue, '| fort:', fortLevel, '| mend:', mendValue);
    
    setFortuneLevel(fortLevel);
    setEfficiencyMultState(effValue);
    setMendingMultState(mendValue);
    
    console.log('[v0] 2.6 setState chamados com:', { effValue, fortLevel, mendValue });
  }, [enchantments]);

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
        let dropAmount = getDropAmount(block.type) * eventMult;
        
        // Fortuna: 40% de chance de dar +nivel minerios extras
        // fortuneLevel = nivel do encantamento (1, 2 ou 3)
        if (fortuneLevel > 0 && Math.random() < FORTUNE_TRIGGER_CHANCE) {
          dropAmount += fortuneLevel; // +1, +2 ou +3 minerios extras
        }
        
        addOre(oreType, Math.ceil(dropAmount));
      }

      setStatsAndRef((prev) => {
        const eventMult =
          beaconEventRef.current?.active && beaconEventRef.current.type === "double_ores" ? 2 : 1;
        // Aplica mendingMultState para mais XP
        const xpGain = Math.ceil(config.xp * eventMult * mendingMultState);

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
    const tipoMap: Record<string, TipoTransacao> = {
      tntRadius: 'upgrade_tnt_radius',
      tntSpawn: 'upgrade_tnt_spawn',
      beaconSpawn: 'upgrade_beacon_spawn',
      dungeonSpawn: 'upgrade_dungeon_spawn',
      chestSpawn: 'upgrade_chest_spawn',
    };
    const currentLv = statsRef.current[type];
    const cost = costs[type](currentLv);
    if (localBalance < cost) return;
    audioService.playLevelUp();
    setLocalBalance((prev) => prev - cost);
    onSpend(cost);
    setStatsAndRef((prev) => ({ ...prev, [type]: currentLv + 1 }));
    // Registra transacao para o plugin Minecraft processar
    registrarTransacao(username, tipoMap[type], cost, {
      upgrade_type: type,
      from_level: currentLv,
      to_level: currentLv + 1,
    });
  }, [username, localBalance, onSpend, setStatsAndRef]);

  const handleUpgrade = useCallback((type: "speed") => {
    const currentSpeed = statsRef.current.pickSpeed;
    const cost = Math.ceil(80 * Math.pow(1.5, currentSpeed));
    if (localBalance < cost) return;
    audioService.playLevelUp();
    setLocalBalance((prev) => prev - cost);
    onSpend(cost);
    const newSpeed = +(currentSpeed + 0.2).toFixed(1);
    setStatsAndRef((prev) => ({ ...prev, pickSpeed: newSpeed }));
    // Registra transacao para o plugin Minecraft processar
    registrarTransacao(username, 'upgrade_speed', cost, {
      from_speed: currentSpeed,
      to_speed: newSpeed,
    });
  }, [username, localBalance, onSpend, setStatsAndRef]);

  const handleUpgradeTier = useCallback(() => {
    const currentTier = statsRef.current.pickaxeTier;
    const currentIdx = TIER_ORDER.indexOf(currentTier);
    if (currentIdx >= TIER_ORDER.length - 1) return;
    const nextTier = TIER_ORDER[currentIdx + 1];
    const nextData = PICKAXE_TIERS[nextTier];
    if (localBalance < nextData.cost) return;
    audioService.playLevelUp();
    setLocalBalance((prev) => prev - nextData.cost);
    onSpend(nextData.cost);
    setStatsAndRef((prev) => ({ ...prev, pickaxeTier: nextTier }));
    // Registra transacao para o plugin Minecraft processar
    registrarTransacao(username, 'upgrade_pickaxe', nextData.cost, {
      from_tier: currentTier,
      to_tier: nextTier,
      pickaxe_name: nextData.name,
    });
  }, [username, localBalance, onSpend, setStatsAndRef]);

  const handleEnchant = useCallback(() => {
    // Verifica se tem XP e coins suficientes
    if (stats.xp < ENCHANT_COST.xp || localBalance < ENCHANT_COST.coins) return;

    // Tipos de encantamento ja obtidos
    const typesObtidos = enchantments.map(e => e.type);
    
    // Filtra encantamentos disponiveis (exclui tipos ja obtidos)
    const availableEnchants = ENCHANTMENTS.filter(e => !typesObtidos.includes(e.type));
    
    // Se nao tem mais encantamentos disponiveis, nao faz nada
    if (availableEnchants.length === 0) {
      console.log('[v0] Nenhum encantamento disponivel - jogador ja tem todos os tipos');
      return;
    }

    // Selecao de encantamento baseado no peso individual de cada um
    const totalWeight = availableEnchants.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;
    let selectedEnchant = availableEnchants[0];
    
    for (const enchant of availableEnchants) {
      roll -= enchant.weight;
      if (roll <= 0) {
        selectedEnchant = enchant;
        break;
      }
    }

    // Adiciona o novo encantamento (nunca substitui pois tipos repetidos nao existem)
    const newEnchants = [...enchantments, selectedEnchant];
    
    setEnchantments(newEnchants);
    console.log('[v0] Encantamento adicionado:', selectedEnchant.name, '| Total:', newEnchants.length);

    // Atualiza multiplicadores
    const fortuneEnchant = newEnchants.find(e => e.type === 'fortune');
    const efficiencyEnchant = newEnchants.find(e => e.type === 'efficiency');
    const mendingEnchant = newEnchants.find(e => e.type === 'mending');
    // Fortuna usa o nivel (1, 2, 3) para +minerios extras
    setFortuneLevel(fortuneEnchant ? fortuneEnchant.level : 0);
    setEfficiencyMultState(efficiencyEnchant ? efficiencyEnchant.value : 1);
    setMendingMultState(mendingEnchant ? mendingEnchant.value : 1);

    audioService.playOrb();

    // Cobra XP
    setStatsAndRef(prev => ({
      ...prev,
      xp: prev.xp - ENCHANT_COST.xp,
    }));

    // Cobra coins
    setLocalBalance(prev => prev - ENCHANT_COST.coins);
    onSpend(ENCHANT_COST.coins);
    
    // Registra transacao para o plugin Minecraft processar
    registrarTransacao(username, 'enchant', ENCHANT_COST.coins, {
      enchantment_id: selectedEnchant.id,
      enchantment_name: selectedEnchant.name,
      enchantment_type: selectedEnchant.type,
      enchantment_level: selectedEnchant.level,
      xp_cost: ENCHANT_COST.xp,
    });
  }, [username, stats.xp, localBalance, enchantments, setStatsAndRef, onSpend]);

  // Recicla todos os encantamentos (remove todos)
  const handleRecycle = useCallback(() => {
    if (stats.xp < RECYCLE_COST.xp || localBalance < RECYCLE_COST.coins) return;
    if (enchantments.length === 0) return;

    // Remove todos os encantamentos
    setEnchantments([]);
    
    // Reseta multiplicadores
    setFortuneLevel(0);
    setEfficiencyMultState(1);
    setMendingMultState(1);

    audioService.playClick();

    // Cobra XP
    setStatsAndRef(prev => ({
      ...prev,
      xp: prev.xp - RECYCLE_COST.xp,
    }));

    // Cobra coins
    setLocalBalance(prev => prev - RECYCLE_COST.coins);
    onSpend(RECYCLE_COST.coins);
    
    // Registra transacao
    registrarTransacao(username, 'enchant', RECYCLE_COST.coins, {
      action: 'recycle',
      removed_enchantments: enchantments.map(e => e.name),
      xp_cost: RECYCLE_COST.xp,
    });
  }, [username, stats.xp, localBalance, enchantments, setStatsAndRef, onSpend]);

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
        efficiencyMult={efficiencyMultState}
        mendingMult={mendingMultState}
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
          bankBalance={localBalance}
          onEnchant={handleEnchant}
          onRecycle={handleRecycle}
          onClose={() => setShowEnchant(false)}
        />
      )}
      {showInventory && (
        <InventoryPanel
          inventory={inventory}
          pickaxeTier={stats.pickaxeTier}
          enchantments={enchantments}
          onClose={() => setShowInventory(false)}
        />
      )}
    </div>
  );
}
