package lobby.whiteMinerar;

import lobby.whiteMinerar.api.SupabaseClient;
import lobby.whiteMinerar.commands.MinerarCommand;
import lobby.whiteMinerar.config.ConfigManager;
import lobby.whiteMinerar.listeners.GUIListener;
import lobby.whiteMinerar.transacoes.TransacaoProcessor;
import org.bukkit.plugin.java.JavaPlugin;

public final class MineracaoPlugin extends JavaPlugin {

    private static MineracaoPlugin instance;
    private ConfigManager configManager;
    private SupabaseClient supabaseClient;
    private TransacaoProcessor transacaoProcessor;

    @Override
    public void onEnable() {
        instance = this;

        // Carregar configuracoes
        this.configManager = new ConfigManager(this);
        configManager.loadConfig();

        // Inicializar cliente Supabase com service_role_key para bypassar RLS
        this.supabaseClient = new SupabaseClient(
            configManager.getSupabaseUrl(),
            configManager.getAnonKey(),
            configManager.getServiceRoleKey()
        );

        // Registrar comando /minerar
        getCommand("minerar").setExecutor(new MinerarCommand(this));

        // Registrar listeners de GUI
        getServer().getPluginManager().registerEvents(new GUIListener(this), this);

        // Iniciar processador de transacoes de mineracao (upgrades de picareta)
        this.transacaoProcessor = new TransacaoProcessor(this);
        transacaoProcessor.start();

        getLogger().info("WhiteMinerar ativado com sucesso!");
        getLogger().info("Conectando ao Supabase: " + configManager.getSupabaseUrl());
    }

    @Override
    public void onDisable() {
        if (transacaoProcessor != null) {
            transacaoProcessor.stop();
        }
        getLogger().info("WhiteMinerar desativado!");
    }

    public static MineracaoPlugin getInstance() { return instance; }
    public ConfigManager getConfigManager()     { return configManager; }
    public SupabaseClient getSupabaseClient()   { return supabaseClient; }
}
