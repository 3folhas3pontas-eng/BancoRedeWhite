package lobby.whiteMinerar.listeners;

import lobby.whiteMinerar.MineracaoPlugin;
import lobby.whiteMinerar.api.MiningInventory;
import lobby.whiteMinerar.gui.MineracaoGUI;
import lobby.whiteMinerar.utils.ItemMapper;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.Material;
import org.bukkit.Sound;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.inventory.ItemStack;

import java.util.HashMap;
import java.util.Map;

public class GUIListener implements Listener {
    
    private final MineracaoPlugin plugin;
    
    public GUIListener(MineracaoPlugin plugin) {
        this.plugin = plugin;
    }
    
    @EventHandler
    public void onInventoryClick(InventoryClickEvent event) {
        if (event.getView().getTitle().equals("Coletar Mineração")) {
            event.setCancelled(true);
            
            Player player = (Player) event.getWhoClicked();
            ItemStack clicked = event.getCurrentItem();
            
            if (clicked == null || clicked.getType() == Material.AIR) return;
            
            // Slot 45: Fechar
            if (event.getSlot() == 45) {
                player.closeInventory();
                return;
            }
            
            // Slot 49: Coletar Tudo
            if (event.getSlot() == 49) {
                handleCollectAll(player);
                return;
            }
            
            // Outros slots: coletar item
            handleCollectItem(player, event.getSlot());
        }
    }
    
    private void handleCollectItem(Player player, int slot) {
        MineracaoGUI gui = GUISessionManager.getGUI(player.getUniqueId());
        if (gui == null) return;
        
        String itemName = getItemNameFromSlot(slot);
        if (itemName == null) return;
        
        int quantity = gui.getQuantity(itemName);
        if (quantity <= 0) {
            player.sendMessage(ChatColor.RED + plugin.getConfigManager().getMessage("no_items"));
            return;
        }
        
        Material material = ItemMapper.getItemMaterial(itemName);
        if (material == null) return;
        
        // Calcular espaço disponível no inventário
        int availableSpace = calculateAvailableSpace(player, material);
        
        if (availableSpace <= 0) {
            player.sendMessage(ChatColor.RED + "Seu inventario esta cheio!");
            player.playSound(player.getLocation(), Sound.ENTITY_VILLAGER_NO, 1.0f, 1.0f);
            return;
        }
        
        // Calcular quantos itens podem ser entregues (o minimo entre disponivel e espaço)
        int toGive = Math.min(quantity, availableSpace);
        
        // Dar itens ao jogador em stacks de 64
        giveItems(player, material, toGive);
        
        // Calcular quanto sobrou
        int remaining = quantity - toGive;
        
        // Atualizar GUI local
        gui.setQuantity(itemName, remaining);
        
        // Som de coleta
        player.playSound(player.getLocation(), Sound.ENTITY_PLAYER_LEVELUP, 1.0f, 1.0f);
        
        // Mensagem de sucesso
        String displayName = ItemMapper.getItemDisplayName(itemName);
        player.sendMessage(ChatColor.GREEN + "Voce coletou " + ChatColor.YELLOW + toGive + "x " + displayName + ChatColor.GREEN + "!");
        
        if (remaining > 0) {
            player.sendMessage(ChatColor.YELLOW + "Restam " + remaining + "x " + displayName + " para coletar.");
        }
        
        // Atualizar Supabase
        updateSupabaseAsync(player, gui);
        
        // Reabrir GUI na proxima tick
        Bukkit.getScheduler().runTask(plugin, () -> {
            player.openInventory(gui.createGUI());
        });
    }
    
    private void handleCollectAll(Player player) {
        MineracaoGUI gui = GUISessionManager.getGUI(player.getUniqueId());
        if (gui == null) return;
        
        int totalCollected = 0;
        int totalRemaining = 0;
        
        // Arrays de itens
        String[] minerals = {"coal", "raw_iron", "raw_copper", "lapis_lazuli", "raw_gold", "redstone", "diamond", "emerald"};
        String[] dungeonItems = {"string", "rotten_flesh", "bone", "wheat", "gunpowder", "iron_ingot", "gold_ingot", "slimeball", "bucket", "name_tag", "saddle", "music_disc", "golden_apple", "enchanted_golden_apple", "iron_horse_armor", "gold_horse_armor", "diamond_horse_armor", "enchantment_book", "experience_bottle"};
        
        // Coletar minerios
        for (String mineral : minerals) {
            int qty = gui.getQuantity(mineral);
            if (qty > 0) {
                Material mat = ItemMapper.getItemMaterial(mineral);
                if (mat != null) {
                    int space = calculateAvailableSpace(player, mat);
                    int toGive = Math.min(qty, space);
                    if (toGive > 0) {
                        giveItems(player, mat, toGive);
                        totalCollected += toGive;
                        int remaining = qty - toGive;
                        gui.setQuantity(mineral, remaining);
                        totalRemaining += remaining;
                    }
                }
            }
        }
        
        // Coletar itens de dungeon
        for (String item : dungeonItems) {
            int qty = gui.getQuantity(item);
            if (qty > 0) {
                Material mat = ItemMapper.getItemMaterial(item);
                if (mat != null) {
                    int space = calculateAvailableSpace(player, mat);
                    int toGive = Math.min(qty, space);
                    if (toGive > 0) {
                        giveItems(player, mat, toGive);
                        totalCollected += toGive;
                        int remaining = qty - toGive;
                        gui.setQuantity(item, remaining);
                        totalRemaining += remaining;
                    }
                }
            }
        }
        
        if (totalCollected == 0) {
            player.sendMessage(ChatColor.RED + plugin.getConfigManager().getMessage("no_items"));
            return;
        }
        
        player.playSound(player.getLocation(), Sound.ENTITY_PLAYER_LEVELUP, 1.0f, 1.0f);
        player.sendMessage(ChatColor.GREEN + "Voce coletou " + ChatColor.YELLOW + totalCollected + ChatColor.GREEN + " itens!");
        
        if (totalRemaining > 0) {
            player.sendMessage(ChatColor.YELLOW + "Restam " + totalRemaining + " itens para coletar (inventario cheio).");
        }
        
        // Atualizar Supabase
        updateSupabaseAsync(player, gui);
        
        // Fechar inventario
        player.closeInventory();
    }
    
    /**
     * Calcula espaço disponível para um material específico
     */
    private int calculateAvailableSpace(Player player, Material material) {
        int maxStack = material.getMaxStackSize();
        int space = 0;
        
        for (ItemStack item : player.getInventory().getStorageContents()) {
            if (item == null || item.getType() == Material.AIR) {
                space += maxStack;
            } else if (item.getType() == material && item.getAmount() < maxStack) {
                space += (maxStack - item.getAmount());
            }
        }
        
        return space;
    }
    
    /**
     * Dá itens ao jogador em stacks apropriados
     */
    private void giveItems(Player player, Material material, int amount) {
        int maxStack = material.getMaxStackSize();
        
        while (amount > 0) {
            int stackSize = Math.min(amount, maxStack);
            ItemStack item = new ItemStack(material, stackSize);
            
            HashMap<Integer, ItemStack> leftover = player.getInventory().addItem(item);
            
            // Se houver sobra, para de dar itens
            if (!leftover.isEmpty()) {
                break;
            }
            
            amount -= stackSize;
        }
    }
    
    private String getItemNameFromSlot(int slot) {
        // Minerios (slots 0-7)
        if (slot >= 0 && slot < 8) {
            String[] minerals = {"coal", "raw_iron", "raw_copper", "lapis_lazuli", "raw_gold", "redstone", "diamond", "emerald"};
            return minerals[slot];
        }
        
        // Itens de dungeon (slots 18-36)
        if (slot >= 18 && slot < 45) {
            String[] dungeonItems = {"string", "rotten_flesh", "bone", "wheat", "gunpowder", "iron_ingot", "gold_ingot", "slimeball", "bucket", "name_tag", "saddle", "music_disc", "golden_apple", "enchanted_golden_apple", "iron_horse_armor", "gold_horse_armor", "diamond_horse_armor", "enchantment_book", "experience_bottle"};
            int index = slot - 18;
            if (index < dungeonItems.length) {
                return dungeonItems[index];
            }
        }
        
        return null;
    }
    
    /**
     * Atualiza Supabase de forma assíncrona
     */
    private void updateSupabaseAsync(Player player, MineracaoGUI gui) {
        MiningInventory inventory = gui.getInventory();
        String username = gui.getPlayerName();
        
        plugin.getSupabaseClient().updateInventory(username, inventory).thenAccept(success -> {
            if (success) {
                plugin.getLogger().info("Inventario de " + username + " atualizado no Supabase.");
            } else {
                plugin.getLogger().warning("Falha ao atualizar inventario de " + username + " no Supabase!");
                // Notificar jogador na main thread
                Bukkit.getScheduler().runTask(plugin, () -> {
                    if (player.isOnline()) {
                        player.sendMessage(ChatColor.RED + "Erro ao sincronizar com o servidor. Tente novamente.");
                    }
                });
            }
        }).exceptionally(ex -> {
            plugin.getLogger().severe("Erro ao atualizar Supabase: " + ex.getMessage());
            return null;
        });
    }
}
