package fr.yummycomponents.caisse.order;

import java.util.List;

/**
 * Corps de POST /api/orders : le contenu de la note à payer.
 * Les prix ne sont PAS envoyés par le client : le serveur les recalcule.
 *
 * <pre>
 * {
 *   "products": [ { "productId": 2, "quantity": 1 } ],
 *   "formulas": [ { "formulaId": 1, "mainId": 1, "drinkId": 8, "dessertId": 12 } ]
 * }
 * </pre>
 */
public record OrderRequest(List<ProductItem> products, List<FormulaItem> formulas) {

    public record ProductItem(long productId, int quantity) {}

    public record FormulaItem(long formulaId, long mainId, long drinkId, long dessertId) {}

    public List<ProductItem> products() {
        return products == null ? List.of() : products;
    }

    public List<FormulaItem> formulas() {
        return formulas == null ? List.of() : formulas;
    }
}
