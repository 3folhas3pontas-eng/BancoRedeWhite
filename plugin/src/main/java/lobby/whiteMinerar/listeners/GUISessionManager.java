package lobby.whiteMinerar.listeners;

import lobby.whiteMinerar.gui.MineracaoGUI;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Gerencia as sessões de GUI dos jogadores
 * Armazena referências aos GUIs abertos para processamento de cliques
 */
public class GUISessionManager {
    
    private static final Map<UUID, MineracaoGUI> activeSessions = new HashMap<>();
    
    public static void addSession(UUID playerUUID, MineracaoGUI gui) {
        activeSessions.put(playerUUID, gui);
    }
    
    public static MineracaoGUI getGUI(UUID playerUUID) {
        return activeSessions.get(playerUUID);
    }
    
    public static void removeSession(UUID playerUUID) {
        activeSessions.remove(playerUUID);
    }
    
    public static void clearAll() {
        activeSessions.clear();
    }
}
