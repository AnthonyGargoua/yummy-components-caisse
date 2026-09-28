package fr.yummycomponents.caisse.catalog;

/**
 * Un produit vendu par le food truck.
 *
 * @param category BURGER, PANINI, BOISSON ou DESSERT
 * @param price    prix unitaire en centimes
 * @param stock    quantité restante (0 = hors stock)
 */
public record Product(long id, String name, String category, int price, int stock) {}
