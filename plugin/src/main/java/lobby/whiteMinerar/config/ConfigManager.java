package lobby.whiteMinerar.config;

import lobby.whiteMinerar.MineracaoPlugin;
import org.bukkit.configuration.file.FileConfiguration;

public class ConfigManager {

    private MineracaoPlugin plugin;
    private FileConfiguration config;
    private String supabaseUrl;
    private String anonKey;
    private String serviceRoleKey;
    private String deliveryMode;
    private String deliveryCommand;

    public ConfigManager(MineracaoPlugin plugin) {
        this.plugin = plugin;
    }

    public void loadConfig() {
        plugin.saveDefaultConfig();
        this.config = plugin.getConfig();

        // Supabase config
        this.supabaseUrl      = config.getString("supabase.url", "");
        this.anonKey          = config.getString("supabase.anon_key", "");
        this.serviceRoleKey   = config.getString("supabase.service_role_key", "");

        // Delivery config
        this.deliveryMode    = config.getString("delivery.mode", "give");
        this.deliveryCommand = config.getString("delivery.command", "give {player} {item} {amount}");

        // Validar credenciais
        if (supabaseUrl.isEmpty() || anonKey.isEmpty()) {
            plugin.getLogger().severe("[ERRO] Credenciais do Supabase nao configuradas em config.yml!");
            plugin.getLogger().severe("[ERRO] Configure 'supabase.url' e 'supabase.anon_key'");
        }
        if (serviceRoleKey.isEmpty()) {
            plugin.getLogger().warning("[AVISO] 'supabase.service_role_key' nao configurado — operacoes de escrita podem falhar por RLS!");
        }
    }

    public String getSupabaseUrl()    { return supabaseUrl; }
    public String getAnonKey()        { return anonKey; }
    public String getServiceRoleKey() { return serviceRoleKey; }
    public String getDeliveryMode()   { return deliveryMode; }
    public String getDeliveryCommand(){ return deliveryCommand; }

    public String getMessage(String key, Object... args) {
        String message = config.getString("messages." + key, "");
        if (args.length > 0) {
            for (int i = 0; i < args.length; i++) {
                message = message.replace("{" + i + "}", args[i].toString());
            }
            message = message.replace("{amount}", args.length > 0 ? args[0].toString() : "");
            message = message.replace("{item}",   args.length > 1 ? args[1].toString() : "");
        }
        return message;
    }

    public String getMenuTitle() {
        return config.getString("messages.menu_title", "Coletar Mineracao");
    }
}
