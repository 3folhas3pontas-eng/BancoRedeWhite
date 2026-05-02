package lobby.whiteMinerar.utils;

import org.bukkit.Material;
import org.bukkit.inventory.ItemStack;
import org.bukkit.enchantments.Enchantment;

public class ItemMapper {
    
    /**
     * Mapeia nome do item do banco para Material do Minecraft
     */
    public static Material getItemMaterial(String databaseName) {
        return switch (databaseName) {
            case "coal" -> Material.COAL;
            case "raw_iron" -> Material.RAW_IRON;
            case "raw_copper" -> Material.RAW_COPPER;
            case "lapis_lazuli" -> Material.LAPIS_LAZULI;
            case "raw_gold" -> Material.RAW_GOLD;
            case "redstone" -> Material.REDSTONE;
            case "diamond" -> Material.DIAMOND;
            case "emerald" -> Material.EMERALD;
            case "string" -> Material.STRING;
            case "rotten_flesh" -> Material.ROTTEN_FLESH;
            case "bone" -> Material.BONE;
            case "wheat" -> Material.WHEAT;
            case "gunpowder" -> Material.GUNPOWDER;
            case "iron_ingot" -> Material.IRON_INGOT;
            case "gold_ingot" -> Material.GOLD_INGOT;
            case "slimeball" -> Material.SLIME_BALL;
            case "bucket" -> Material.BUCKET;
            case "name_tag" -> Material.NAME_TAG;
            case "saddle" -> Material.SADDLE;
            case "music_disc" -> Material.MUSIC_DISC_CAT;
            case "golden_apple" -> Material.GOLDEN_APPLE;
            case "enchanted_golden_apple" -> Material.ENCHANTED_GOLDEN_APPLE;
            case "iron_horse_armor" -> Material.IRON_HORSE_ARMOR;
            case "gold_horse_armor" -> Material.GOLDEN_HORSE_ARMOR;
            case "diamond_horse_armor" -> Material.DIAMOND_HORSE_ARMOR;
            case "enchantment_book" -> Material.ENCHANTED_BOOK;
            case "experience_bottle" -> Material.EXPERIENCE_BOTTLE;
            default -> null;
        };
    }
    
    /**
     * Obtém o nome formatado do item em português
     */
    public static String getItemDisplayName(String databaseName) {
        return switch (databaseName) {
            case "coal" -> "Carvão";
            case "raw_iron" -> "Ferro Bruto";
            case "raw_copper" -> "Cobre Bruto";
            case "lapis_lazuli" -> "Lápis Lazuli";
            case "raw_gold" -> "Ouro Bruto";
            case "redstone" -> "Redstone";
            case "diamond" -> "Diamante";
            case "emerald" -> "Esmeralda";
            case "string" -> "Linha";
            case "rotten_flesh" -> "Carne Podre";
            case "bone" -> "Osso";
            case "wheat" -> "Trigo";
            case "gunpowder" -> "Pólvora";
            case "iron_ingot" -> "Barra de Ferro";
            case "gold_ingot" -> "Barra de Ouro";
            case "slimeball" -> "Bola de Slime";
            case "bucket" -> "Balde";
            case "name_tag" -> "Etiqueta";
            case "saddle" -> "Sela";
            case "music_disc" -> "Disco de Música";
            case "golden_apple" -> "Maçã Dourada";
            case "enchanted_golden_apple" -> "Maçã Dourada Encantada";
            case "iron_horse_armor" -> "Armadura de Cavalo de Ferro";
            case "gold_horse_armor" -> "Armadura de Cavalo de Ouro";
            case "diamond_horse_armor" -> "Armadura de Cavalo de Diamante";
            case "enchantment_book" -> "Livro Encantado";
            case "experience_bottle" -> "Frasco de Experiência";
            default -> databaseName;
        };
    }
    
    /**
     * Cria um ItemStack para exibição no menu
     */
    public static ItemStack createDisplayItem(String databaseName, int quantity, boolean available) {
        Material material = getItemMaterial(databaseName);
        if (material == null) return null;
        
        ItemStack item = new ItemStack(material, 1);
        
        // Se não disponível, usar vidro cinza
        if (!available) {
            item = new ItemStack(Material.GRAY_STAINED_GLASS_PANE, 1);
        }
        
        return item;
    }
}
