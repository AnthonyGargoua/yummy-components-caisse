-- Schéma de la base YummyComponents.
-- Tous les montants sont stockés en CENTIMES (850 = 8,50 €).

DROP TABLE IF EXISTS order_lines;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS formulas;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT    NOT NULL,
    category TEXT    NOT NULL CHECK (category IN ('BURGER', 'PANINI', 'BOISSON', 'DESSERT')),
    price    INTEGER NOT NULL CHECK (price > 0),
    stock    INTEGER NOT NULL CHECK (stock >= 0)
);

-- Une formule = un plat principal (burger OU panini) + une boisson + un dessert, à prix fixe
CREATE TABLE formulas (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    main_category TEXT    NOT NULL CHECK (main_category IN ('BURGER', 'PANINI')),
    price         INTEGER NOT NULL CHECK (price > 0)
);

-- Une note payée
CREATE TABLE orders (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    total      INTEGER NOT NULL
);

-- Les lignes d'une note (le libellé est figé au moment du paiement)
CREATE TABLE order_lines (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders (id),
    label      TEXT    NOT NULL,
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL
);
