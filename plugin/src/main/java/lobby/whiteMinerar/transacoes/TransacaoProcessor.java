package lobby.whiteMinerar.transacoes;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import lobby.whiteMinerar.MineracaoPlugin;
import org.bukkit.Bukkit;
import org.bukkit.scheduler.BukkitRunnable;
import org.bukkit.scheduler.BukkitTask;

public class TransacaoProcessor {

    private final MineracaoPlugin plugin;
    private BukkitTask task;

    public TransacaoProcessor(MineracaoPlugin plugin) {
        this.plugin = plugin;
    }

    /**
     * Inicia o scheduler que verifica transacoes pendentes a cada 5 segundos.
     */
    public void start() {
        task = new BukkitRunnable() {
            @Override
            public void run() {
                processarPendentes();
            }
        }.runTaskTimerAsynchronously(plugin, 100L, 100L); // 100 ticks = 5 segundos

        plugin.getLogger().info("[TransacoesMineracao] Processador iniciado (intervalo: 5s).");
    }

    /**
     * Para o scheduler. Deve ser chamado no onDisable.
     */
    public void stop() {
        if (task != null && !task.isCancelled()) {
            task.cancel();
            plugin.getLogger().info("[TransacoesMineracao] Processador parado.");
        }
    }

    /**
     * Busca todas as transacoes com status "pendente" e processa cada uma.
     * Roda na thread assincrona do scheduler.
     */
    private void processarPendentes() {
        JsonArray pendentes = plugin.getSupabaseClient().fetchTransacoesPendentes();

        if (pendentes == null || pendentes.size() == 0) {
            return;
        }

        for (int i = 0; i < pendentes.size(); i++) {
            JsonObject transacao = pendentes.get(i).getAsJsonObject();

            String id       = transacao.get("id").getAsString();
            String username = transacao.get("username").getAsString();
            String tipo     = transacao.get("tipo").getAsString();
            int    valor    = transacao.get("valor").getAsInt();

            plugin.getLogger().info("[TransacoesMineracao] Processando: " + username
                    + " | tipo: " + tipo + " | valor: " + valor);

            // 1) Marca como "processando" imediatamente para evitar duplo processamento
            boolean marcado = plugin.getSupabaseClient().atualizarStatusTransacao(id, "processando", null);

            if (!marcado) {
                plugin.getLogger().warning("[TransacoesMineracao] Nao foi possivel marcar como processando: id=" + id);
                continue;
            }

            // 2) Executa o comando na thread principal do servidor
            final String finalId       = id;
            final String finalUsername = username;
            final int    finalValor    = valor;

            Bukkit.getScheduler().runTask(plugin, () -> {
                try {
                    String comando = "money remover " + finalUsername + " " + finalValor;
                    Bukkit.dispatchCommand(Bukkit.getConsoleSender(), comando);

                    // 3) Sucesso — marca como "concluido" de forma assincrona
                    Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
                        String agora = java.time.Instant.now().toString();
                        plugin.getSupabaseClient().concluirTransacao(finalId, agora);
                        plugin.getLogger().info("[TransacoesMineracao] Concluido: "
                                + finalUsername + " | id: " + finalId);
                    });

                } catch (Exception e) {
                    String mensagemErro = e.getMessage() != null ? e.getMessage() : "Erro desconhecido ao executar comando";

                    // 4) Erro — registra no Supabase de forma assincrona
                    Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
                        String agora = java.time.Instant.now().toString();
                        plugin.getSupabaseClient().errarTransacao(finalId, mensagemErro, agora);
                        plugin.getLogger().severe("[TransacoesMineracao] Erro: "
                                + finalUsername + " | " + mensagemErro);
                    });
                }
            });
        }
    }
}
