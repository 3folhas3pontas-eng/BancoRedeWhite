package lobby.whiteMinerar.gui;

import lobby.whiteMinerar.MineracaoPlugin;
import lobby.whiteMinerar.api.MiningInventory;
import lobby.whiteMinerar.utils.ItemMapper;
import org.bukkit.Bukkit;
import org.bukkit.Material;
import org.bukkit.Sound;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import java.util.ArrayList;
import java.util.List;

public class MineracaoGUI {
    
    private static final String GUI_TITLE = "Coletar Mineração";
    private static final int GUI_SIZE = 54; // 6 linhas de 9 slots
    
    private MineracaoPlugin plugin;
    private MiningInventory inventory;
    private String playerName;
    
    // Nomes dos campos do banco para fácil iteração
    private static final String[] MINERIUOS = {
            "coal", "raw_iron", "raw_copper", "lapis_lazuli",
            "raw_gold", "redstone", "diamond", "emerald"
    };
    
    private static final String[] DUNGEON_ITEMS = {
            "string", "rotten_flesh", "bone", "wheat",
            "gunpowder", "iron_ingot", "gold_ingot", "slimeball",
            "bucket", "name_tag", "saddle", "music_disc",
            "golden_apple", "enchanted_golden_apple", "iron_horse_armor",
            "gold_horse_armor", "diamond_horse_armor", "enchantment_book",
            "experience_bottle"
    };
    
    public MineracaoGUI(MineracaoPlugin plugin, MiningInventory inventory, String playerName) {
        this.plugin = plugin;
        this.inventory = inventory;
        this.playerName = playerName;
    }
    
    /**
     * Cria e retorna o inventário GUI
     */
    public Inventory createGUI() {
        Inventory gui = Bukkit.createInventory(null, GUI_SIZE, GUI_TITLE);
        
        // Preencer minérios (linhas 1-2, slots 0-17)
        int slot = 0;
        for (int i = 0; i < MINERIUOS.length; i++) {
            gui.setItem(slot, createItemStack(MINERIUOS[i]));
            slot++;
        }
        
        // Adicionar espaçadores
        slot = 18; // Linha 3
        
        // Preencher itens de dungeon (linhas 3-5)
        for (String item : DUNGEON_ITEMS) {
            if (slot >= 45) break; // Deixar espaço para botões na linha 6
            gui.setItem(slot, createItemStack(item));
            slot++;
        }
        
        // Linha 6 - Botões de ação
        // Slot 45: Fechar
        gui.setItem(45, createCloseButton());
        
        // Slot 49: Coletar Tudo
        gui.setItem(49, createCollectAllButton());
        
        return gui;
    }
    
    /**
     * Cria um ItemStack para um item específico
     */
    private ItemStack createItemStack(String databaseName) {
        int quantity = getQuantity(databaseName);
        Material material = ItemMapper.getItemMaterial(databaseName);
        
        if (material == null) return null;
        
        // Se quantidade for 0, usar vidro cinza
        if (quantity <= 0) {
            ItemStack item = new ItemStack(Material.GRAY_STAINED_GLASS_PANE, 1);
            ItemMeta meta = item.getItemMeta();
            if (meta != null) {
                meta.setDisplayName("§c" + ItemMapper.getItemDisplayName(databaseName));
                List<String> lore = new ArrayList<>();
                lore.add("§7Quantidade: §c0");
                lore.add("§7Nenhum disponível");
                meta.setLore(lore);
                item.setItemMeta(meta);
            }
            return item;
        }
        
        ItemStack item = new ItemStack(material, Math.min(quantity, 64));
        ItemMeta meta = item.getItemMeta();
        
        if (meta != null) {
            meta.setDisplayName("§a" + ItemMapper.getItemDisplayName(databaseName));
            List<String> lore = new ArrayList<>();
            lore.add("§7Quantidade: §e" + quantity);
            lore.add("§7Clique para coletar");
            meta.setLore(lore);
            item.setItemMeta(meta);
        }
        
        return item;
    }
    
    /**
     * Cria o botão de fechar
     */
    private ItemStack createCloseButton() {
        ItemStack close = new ItemStack(Material.BARRIER);
        ItemMeta meta = close.getItemMeta();
        if (meta != null) {
            meta.setDisplayName("§cFechar");
            close.setItemMeta(meta);
        }
        return close;
    }
    
    /**
     * Cria o botão de coletar tudo
     */
    private ItemStack createCollectAllButton() {
        ItemStack collectAll = new ItemStack(Material.EMERALD_BLOCK);
        ItemMeta meta = collectAll.getItemMeta();
        if (meta != null) {
            meta.setDisplayName("§aColetar Tudo");
            List<String> lore = new ArrayList<>();
            lore.add("§7Coleta todos os itens disponíveis");
            meta.setLore(lore);
            collectAll.setItemMeta(meta);
        }
        return collectAll;
    }
    
    /**
     * Obtém a quantidade de um item no inventário
     */
    public int getQuantity(String databaseName) {
        return switch (databaseName) {
            case "coal" -> inventory.getCoal();
            case "raw_iron" -> inventory.getRaw_iron();
            case "raw_copper" -> inventory.getRaw_copper();
            case "lapis_lazuli" -> inventory.getLapis_lazuli();
            case "raw_gold" -> inventory.getRaw_gold();
            case "redstone" -> inventory.getRedstone();
            case "diamond" -> inventory.getDiamond();
            case "emerald" -> inventory.getEmerald();
            case "string" -> inventory.getString();
            case "rotten_flesh" -> inventory.getRotten_flesh();
            case "bone" -> inventory.getBone();
            case "wheat" -> inventory.getWheat();
            case "gunpowder" -> inventory.getGunpowder();
            case "iron_ingot" -> inventory.getIron_ingot();
            case "gold_ingot" -> inventory.getGold_ingot();
            case "slimeball" -> inventory.getSlimeball();
            case "bucket" -> inventory.getBucket();
            case "name_tag" -> inventory.getName_tag();
            case "saddle" -> inventory.getSaddle();
            case "music_disc" -> inventory.getMusic_disc();
            case "golden_apple" -> inventory.getGolden_apple();
            case "enchanted_golden_apple" -> inventory.getEnchanted_golden_apple();
            case "iron_horse_armor" -> inventory.getIron_horse_armor();
            case "gold_horse_armor" -> inventory.getGold_horse_armor();
            case "diamond_horse_armor" -> inventory.getDiamond_horse_armor();
            case "enchantment_book" -> inventory.getEnchantment_book();
            case "experience_bottle" -> inventory.getExperience_bottle();
            default -> 0;
        };
    }
    
    /**
     * Atualiza quantidade no inventário
     */
    public void setQuantity(String databaseName, int quantity) {
        switch (databaseName) {
            case "coal" -> inventory.setCoal(quantity);
            case "raw_iron" -> inventory.setRaw_iron(quantity);
            case "raw_copper" -> inventory.setRaw_copper(quantity);
            case "lapis_lazuli" -> inventory.setLapis_lazuli(quantity);
            case "raw_gold" -> inventory.setRaw_gold(quantity);
            case "redstone" -> inventory.setRedstone(quantity);
            case "diamond" -> inventory.setDiamond(quantity);
            case "emerald" -> inventory.setEmerald(quantity);
            case "string" -> inventory.setString(quantity);
            case "rotten_flesh" -> inventory.setRotten_flesh(quantity);
            case "bone" -> inventory.setBone(quantity);
            case "wheat" -> inventory.setWheat(quantity);
            case "gunpowder" -> inventory.setGunpowder(quantity);
            case "iron_ingot" -> inventory.setIron_ingot(quantity);
            case "gold_ingot" -> inventory.setGold_ingot(quantity);
            case "slimeball" -> inventory.setSlimeball(quantity);
            case "bucket" -> inventory.setBucket(quantity);
            case "name_tag" -> inventory.setName_tag(quantity);
            case "saddle" -> inventory.setSaddle(quantity);
            case "music_disc" -> inventory.setMusic_disc(quantity);
            case "golden_apple" -> inventory.setGolden_apple(quantity);
            case "enchanted_golden_apple" -> inventory.setEnchanted_golden_apple(quantity);
            case "iron_horse_armor" -> inventory.setIron_horse_armor(quantity);
            case "gold_horse_armor" -> inventory.setGold_horse_armor(quantity);
            case "diamond_horse_armor" -> inventory.setDiamond_horse_armor(quantity);
            case "enchantment_book" -> inventory.setEnchantment_book(quantity);
            case "experience_bottle" -> inventory.setExperience_bottle(quantity);
        }
    }
    
    public MiningInventory getInventory() {
        return inventory;
    }
    
    public String getPlayerName() {
        return playerName;
    }
}
