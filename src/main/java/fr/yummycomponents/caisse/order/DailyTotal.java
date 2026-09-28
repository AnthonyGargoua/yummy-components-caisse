package fr.yummycomponents.caisse.order;

/**
 * Chiffre d'affaires d'une journée.
 *
 * @param day        jour au format "2026-09-28"
 * @param total      total encaissé ce jour-là, en centimes
 * @param orderCount nombre de notes payées ce jour-là
 */
public record DailyTotal(String day, int total, int orderCount) {}
