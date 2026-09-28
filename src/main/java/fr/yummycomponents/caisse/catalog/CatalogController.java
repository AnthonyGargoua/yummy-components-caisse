package fr.yummycomponents.caisse.catalog;

import java.util.List;

import org.springframework.jdbc.core.DataClassRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CatalogController {

    private final JdbcTemplate jdbc;

    public CatalogController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** GET /api/products : tous les produits, y compris ceux hors stock. */
    @GetMapping("/products")
    public List<Product> products() {
        return jdbc.query("SELECT id, name, category, price, stock FROM products ORDER BY id",
                new DataClassRowMapper<>(Product.class));
    }

    /** GET /api/formulas : les formules disponibles. */
    @GetMapping("/formulas")
    public List<Formula> formulas() {
        return jdbc.query("SELECT id, name, main_category, price FROM formulas ORDER BY id",
                new DataClassRowMapper<>(Formula.class));
    }
}
