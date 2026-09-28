package fr.yummycomponents.caisse.catalog;

/**
 * Une formule : un plat principal de la catégorie mainCategory + une boisson + un dessert.
 *
 * @param mainCategory BURGER ou PANINI
 * @param price        prix fixe de la formule en centimes
 */
public record Formula(long id, String name, String mainCategory, int price) {}
