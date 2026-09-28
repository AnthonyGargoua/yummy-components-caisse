package fr.yummycomponents.caisse.order;

import java.util.List;

/**
 * Une note payée, renvoyée par POST /api/orders.
 *
 * @param createdAt date et heure locales, au format "2026-09-28 12:34:56"
 * @param total     total en centimes
 */
public record Order(long id, String createdAt, int total, List<Line> lines) {

    /** @param unitPrice prix unitaire en centimes */
    public record Line(String label, int quantity, int unitPrice) {}
}
