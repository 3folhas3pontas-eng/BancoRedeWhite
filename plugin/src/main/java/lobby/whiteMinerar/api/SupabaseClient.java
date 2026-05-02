package lobby.whiteMinerar.api;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.CompletableFuture;

/**
 * Cliente HTTP para comunicacao com o Supabase.
 *
 * IMPORTANTE: todas as operacoes de leitura/escrita que precisam bypassar o RLS
 * usam a service_role_key. A anon_key so e usada para endpoints publicos.
 */
public class SupabaseClient {

    private static final HttpClient client = HttpClient.newHttpClient();
    private static final Gson gson         = new Gson();

    private final String supabaseUrl;
    private final String anonKey;
    private final String serviceRoleKey;

    public SupabaseClient(String supabaseUrl, String anonKey, String serviceRoleKey) {
        this.supabaseUrl     = supabaseUrl;
        this.anonKey         = anonKey;
        this.serviceRoleKey  = serviceRoleKey;
    }

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    /** Cria um builder com os headers de autenticacao usando service_role_key. */
    private HttpRequest.Builder serviceBuilder(String url) {
        return HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("apikey",        serviceRoleKey)
                .header("Authorization", "Bearer " + serviceRoleKey)
                .header("Content-Type",  "application/json");
    }

    // ----------------------------------------------------------------
    // INVENTARIO DE MINERACAO
    // ----------------------------------------------------------------

    /**
     * Busca o inventario de mineracao do jogador usando service_role_key
     * para ignorar RLS. Usa ilike para case-insensitive.
     */
    public CompletableFuture<MiningInventory> fetchInventory(String username) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String url = supabaseUrl + "/rest/v1/mining_inventory?username=ilike." + username + "&select=*";

                HttpRequest request = serviceBuilder(url).GET().build();
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 200) {
                    JsonArray arr = gson.fromJson(response.body(), JsonArray.class);
                    if (arr != null && arr.size() > 0) {
                        return MiningInventory.fromJson(arr.get(0).getAsJsonObject());
                    }
                } else {
                    System.err.println("[SupabaseClient] fetchInventory status=" + response.statusCode() + " body=" + response.body());
                }
                return null;
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        });
    }

    /**
     * Zera todos os campos de itens do inventario apos a coleta.
     * Usa service_role_key para bypassar RLS.
     */
    public CompletableFuture<Boolean> updateInventory(String username, MiningInventory inventory) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String url = supabaseUrl + "/rest/v1/mining_inventory?username=ilike." + username;

                HttpRequest request = serviceBuilder(url)
                        .method("PATCH", HttpRequest.BodyPublishers.ofString(inventory.toJson()))
                        .header("Prefer", "return=minimal")
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                boolean ok = response.statusCode() >= 200 && response.statusCode() < 300;
                if (!ok) {
                    System.err.println("[SupabaseClient] updateInventory status=" + response.statusCode() + " body=" + response.body());
                }
                return ok;
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        });
    }

    // ----------------------------------------------------------------
    // TRANSACOES DE MINERACAO (upgrades de picareta)
    // ----------------------------------------------------------------

    /**
     * Busca todas as transacoes com status "pendente".
     * Usa service_role_key para bypassar RLS.
     */
    public JsonArray fetchTransacoesPendentes() {
        try {
            String url = supabaseUrl + "/rest/v1/transacoes_mineracao?status=eq.pendente&select=*";

            HttpRequest request = serviceBuilder(url).GET().build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return gson.fromJson(response.body(), JsonArray.class);
            } else {
                System.err.println("[SupabaseClient] fetchTransacoesPendentes status=" + response.statusCode() + " body=" + response.body());
            }
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Atualiza o status de uma transacao (ex: "processando", "concluido", "erro").
     */
    public boolean atualizarStatusTransacao(String id, String status, String erroMsg) {
        try {
            String url = supabaseUrl + "/rest/v1/transacoes_mineracao?id=eq." + id;

            JsonObject body = new JsonObject();
            body.addProperty("status", status);
            if (erroMsg != null) {
                body.addProperty("erro_msg", erroMsg);
            }

            HttpRequest request = serviceBuilder(url)
                    .method("PATCH", HttpRequest.BodyPublishers.ofString(body.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            boolean ok = response.statusCode() >= 200 && response.statusCode() < 300;
            if (!ok) {
                System.err.println("[SupabaseClient] atualizarStatus id=" + id + " status=" + response.statusCode() + " body=" + response.body());
            }
            return ok;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /** Marca a transacao como "concluido" com timestamp. */
    public void concluirTransacao(String id, String processedAt) {
        try {
            String url = supabaseUrl + "/rest/v1/transacoes_mineracao?id=eq." + id;

            JsonObject body = new JsonObject();
            body.addProperty("status",       "concluido");
            body.addProperty("processed_at", processedAt);

            HttpRequest request = serviceBuilder(url)
                    .method("PATCH", HttpRequest.BodyPublishers.ofString(body.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                System.err.println("[SupabaseClient] concluirTransacao status=" + response.statusCode() + " body=" + response.body());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /** Marca a transacao como "erro" com mensagem e timestamp. */
    public void errarTransacao(String id, String erroMsg, String processedAt) {
        try {
            String url = supabaseUrl + "/rest/v1/transacoes_mineracao?id=eq." + id;

            JsonObject body = new JsonObject();
            body.addProperty("status",       "erro");
            body.addProperty("erro_msg",     erroMsg);
            body.addProperty("processed_at", processedAt);

            HttpRequest request = serviceBuilder(url)
                    .method("PATCH", HttpRequest.BodyPublishers.ofString(body.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                System.err.println("[SupabaseClient] errarTransacao status=" + response.statusCode() + " body=" + response.body());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
