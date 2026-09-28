package fr.yummycomponents.caisse.order;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.DataClassRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import fr.yummycomponents.caisse.catalog.Formula;
import fr.yummycomponents.caisse.catalog.Product;

@Service
public class OrderService {

    private final JdbcTemplate jdbc;

    public OrderService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Encaisse une note : vérifie les stocks, les décrémente et enregistre la note.
     * Tout est fait dans une transaction : en cas d'erreur, rien n'est modifié.
     */
    @Transactional
    public Order pay(OrderRequest request) {
        if (request.products().isEmpty() && request.formulas().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La note est vide");
        }

        Map<Long, Product> products = jdbc
                .query("SELECT id, name, category, price, stock FROM products", new DataClassRowMapper<>(Product.class))
                .stream().collect(Collectors.toMap(Product::id, Function.identity()));
        Map<Long, Formula> formulas = jdbc
                .query("SELECT id, name, main_category, price FROM formulas", new DataClassRowMapper<>(Formula.class))
                .stream().collect(Collectors.toMap(Formula::id, Function.identity()));

        List<Order.Line> lines = new ArrayList<>();
        Map<Long, Integer> quantities = new LinkedHashMap<>(); // productId -> quantité à sortir du stock

        for (OrderRequest.ProductItem item : request.products()) {
            Product product = find(products, item.productId(), null);
            if (item.quantity() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantité invalide pour " + product.name());
            }
            quantities.merge(product.id(), item.quantity(), Integer::sum);
            lines.add(new Order.Line(product.name(), item.quantity(), product.price()));
        }

        for (OrderRequest.FormulaItem item : request.formulas()) {
            Formula formula = formulas.get(item.formulaId());
            if (formula == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formule inconnue : " + item.formulaId());
            }
            Product main = find(products, item.mainId(), formula.mainCategory());
            Product drink = find(products, item.drinkId(), "BOISSON");
            Product dessert = find(products, item.dessertId(), "DESSERT");
            for (Product product : List.of(main, drink, dessert)) {
                quantities.merge(product.id(), 1, Integer::sum);
            }
            String label = formula.name() + " (" + main.name() + ", " + drink.name() + ", " + dessert.name() + ")";
            lines.add(new Order.Line(label, 1, formula.price()));
        }

        // Vérification des stocks AVANT toute modification
        quantities.forEach((productId, quantity) -> {
            Product product = products.get(productId);
            if (product.stock() < quantity) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Stock insuffisant pour " + product.name() + " (reste " + product.stock() + ")");
            }
        });

        quantities.forEach((productId, quantity) ->
                jdbc.update("UPDATE products SET stock = stock - ? WHERE id = ?", quantity, productId));

        int total = lines.stream().mapToInt(line -> line.quantity() * line.unitPrice()).sum();
        jdbc.update("INSERT INTO orders (total) VALUES (?)", total);
        Long orderId = jdbc.queryForObject("SELECT last_insert_rowid()", Long.class);
        for (Order.Line line : lines) {
            jdbc.update("INSERT INTO order_lines (order_id, label, quantity, unit_price) VALUES (?, ?, ?, ?)",
                    orderId, line.label(), line.quantity(), line.unitPrice());
        }

        String createdAt = jdbc.queryForObject("SELECT created_at FROM orders WHERE id = ?", String.class, orderId);
        return new Order(orderId, createdAt, total, lines);
    }

    /** Totaux encaissés par jour, du plus récent au plus ancien. */
    public List<DailyTotal> dailyTotals() {
        return jdbc.query("""
                SELECT date(created_at) AS day, SUM(total) AS total, COUNT(*) AS order_count
                FROM orders
                GROUP BY date(created_at)
                ORDER BY day DESC
                """, new DataClassRowMapper<>(DailyTotal.class));
    }

    /** Cherche un produit et vérifie éventuellement sa catégorie. */
    private Product find(Map<Long, Product> products, long id, String expectedCategory) {
        Product product = products.get(id);
        if (product == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Produit inconnu : " + id);
        }
        if (expectedCategory != null && !expectedCategory.equals(product.category())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    product.name() + " n'est pas de la catégorie " + expectedCategory);
        }
        return product;
    }
}
