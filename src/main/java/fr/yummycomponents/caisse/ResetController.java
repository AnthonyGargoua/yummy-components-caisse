package fr.yummycomponents.caisse;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * POST /api/reset : remet la base dans son état initial (produits, stocks, historique).
 * Route volontairement accessible sans authentification.
 */
@RestController
public class ResetController {

    private final Database database;

    public ResetController(Database database) {
        this.database = database;
    }

    @PostMapping("/api/reset")
    public Map<String, String> reset() {
        database.reset();
        return Map.of("message", "Base de données réinitialisée");
    }
}
