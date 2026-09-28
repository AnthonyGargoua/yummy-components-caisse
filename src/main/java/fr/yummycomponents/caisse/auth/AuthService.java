package fr.yummycomponents.caisse.auth;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

/**
 * Authentification volontairement simpliste : un seul compte (caisse / caisse)
 * et des jetons gardés en mémoire (ils sont perdus au redémarrage du serveur).
 */
@Service
public class AuthService {

    private static final String LOGIN = "caisse";
    private static final String PASSWORD = "caisse";

    private final Set<String> tokens = ConcurrentHashMap.newKeySet();

    /** Renvoie un nouveau jeton si les identifiants sont bons. */
    public Optional<String> login(String login, String password) {
        if (!LOGIN.equals(login) || !PASSWORD.equals(password)) {
            return Optional.empty();
        }
        String token = UUID.randomUUID().toString();
        tokens.add(token);
        return Optional.of(token);
    }

    public void logout(String token) {
        if (token != null) {
            tokens.remove(token);
        }
    }

    public boolean isValid(String token) {
        return token != null && tokens.contains(token);
    }

    /** Extrait le jeton d'un en-tête "Authorization: Bearer <jeton>". */
    public static String extractToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        return authorizationHeader.substring("Bearer ".length()).trim();
    }
}
