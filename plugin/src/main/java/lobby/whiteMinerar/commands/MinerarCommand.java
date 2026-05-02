package lobby.whiteMinerar.commands;

import lobby.whiteMinerar.MineracaoPlugin;
import lobby.whiteMinerar.gui.MineracaoGUI;
import lobby.whiteMinerar.listeners.GUISessionManager;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class MinerarCommand implements CommandExecutor {
    
    private MineracaoPlugin plugin;
    
    public MinerarCommand(MineracaoPlugin plugin) {
        this.plugin = plugin;
    }
    
    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        
        // Verificar se é um jogador
        if (!(sender instanceof Player)) {
            sender.sendMessage("§cApenas jogadores podem usar este comando!");
            return true;
        }
        
        Player player = (Player) sender;
        
        // Verificar permissão
        if (!player.hasPermission("mineracao.use")) {
            player.sendMessage("§cVocê não tem permissão para usar este comando!");
            return true;
        }
        
        // Se há argumentos e o jogador é admin
        if (args.length > 0 && player.hasPermission("mineracao.admin")) {
            return handleAdminCommand(player, args);
        }
        
        // Comando normal: abrir menu de coleta
        openMineracaoMenu(player);
        return true;
    }
    
    /**
     * Abre o menu de coleta para o jogador
     */
    private void openMineracaoMenu(Player player) {
        player.sendMessage("§7Carregando seu inventário de mineração...");
        
        // Buscar inventário do Supabase de forma assíncrona
        plugin.getSupabaseClient().fetchInventory(player.getName()).thenAccept(inventory -> {
            // Voltar para a thread principal do Bukkit para abrir GUI
            Bukkit.getScheduler().runTask(plugin, () -> {
                if (inventory == null) {
                    player.sendMessage("§c" + plugin.getConfigManager().getMessage("no_account"));
                    return;
                }
                
                // Criar e abrir GUI
                MineracaoGUI gui = new MineracaoGUI(plugin, inventory, player.getName());
                GUISessionManager.addSession(player.getUniqueId(), gui);
                
                player.openInventory(gui.createGUI());
                player.sendMessage("§aMenu de mineração aberto!");
            });
            
        }).exceptionally(ex -> {
            // Voltar para a thread principal para enviar mensagem
            Bukkit.getScheduler().runTask(plugin, () -> {
                player.sendMessage("§c" + plugin.getConfigManager().getMessage("error"));
            });
            plugin.getLogger().severe("Erro ao buscar inventário de " + player.getName() + ": " + ex.getMessage());
            return null;
        });
    }
    
    /**
     * Trata comandos administrativos
     */
    private boolean handleAdminCommand(Player player, String[] args) {
        String subcommand = args[0].toLowerCase();
        
        switch (subcommand) {
            case "reload":
                plugin.reloadConfig();
                player.sendMessage("§aConfigurações recarregadas!");
                return true;
                
            case "check":
                if (args.length < 2) {
                    player.sendMessage("§cUso: /mineracao check <jogador>");
                    return true;
                }
                checkPlayerInventory(player, args[1]);
                return true;
                
            default:
                player.sendMessage("§cSubcomando desconhecido!");
                return true;
        }
    }
    
    /**
     * Verifica o inventário de outro jogador
     */
    private void checkPlayerInventory(Player player, String targetPlayerName) {
        player.sendMessage("§7Buscando inventário de " + targetPlayerName + "...");
        
        plugin.getSupabaseClient().fetchInventory(targetPlayerName).thenAccept(inventory -> {
            // Voltar para a thread principal do Bukkit
            Bukkit.getScheduler().runTask(plugin, () -> {
                if (inventory == null) {
                    player.sendMessage("§cJogador não encontrado no banco de dados!");
                    return;
                }
                
                player.sendMessage("§a========== Inventário de " + targetPlayerName + " ==========");
                player.sendMessage("§eMinérios:");
                player.sendMessage("  §7Carvão: " + inventory.getCoal());
                player.sendMessage("  §7Ferro Bruto: " + inventory.getRaw_iron());
                player.sendMessage("  §7Cobre Bruto: " + inventory.getRaw_copper());
                player.sendMessage("  §7Lápis Lazuli: " + inventory.getLapis_lazuli());
                player.sendMessage("  §7Ouro Bruto: " + inventory.getRaw_gold());
                player.sendMessage("  §7Redstone: " + inventory.getRedstone());
                player.sendMessage("  §7Diamante: " + inventory.getDiamond());
                player.sendMessage("  §7Esmeralda: " + inventory.getEmerald());
            });
            
        }).exceptionally(ex -> {
            Bukkit.getScheduler().runTask(plugin, () -> {
                player.sendMessage("§c" + plugin.getConfigManager().getMessage("error"));
            });
            return null;
        });
    }
}
