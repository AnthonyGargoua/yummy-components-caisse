-- Données de départ (rechargées par POST /api/reset). Montants en CENTIMES.

INSERT INTO products (id, name, category, price, stock) VALUES
    (1,  'Classic Burger',        'BURGER',  850,  15),
    (2,  'Cheese Burger',         'BURGER',  950,  12),
    (3,  'Bacon Burger',          'BURGER',  1050, 8),
    (4,  'Veggie Burger',         'BURGER',  950,  0),
    (5,  'Panini Jambon-Fromage', 'PANINI',  650,  10),
    (6,  'Panini 3 Fromages',     'PANINI',  700,  6),
    (7,  'Panini Poulet-Pesto',   'PANINI',  750,  0),
    (8,  'Coca-Cola',             'BOISSON', 250,  24),
    (9,  'Eau minérale',          'BOISSON', 150,  30),
    (10, 'Limonade artisanale',   'BOISSON', 300,  3),
    (11, 'Thé glacé pêche',       'BOISSON', 280,  12),
    (12, 'Brownie',               'DESSERT', 350,  10),
    (13, 'Cookie',                'DESSERT', 250,  2),
    (14, 'Tiramisu',              'DESSERT', 400,  0),
    (15, 'Salade de fruits',      'DESSERT', 350,  6);

INSERT INTO formulas (id, name, main_category, price) VALUES
    (1, 'Formule Burger', 'BURGER', 1350),
    (2, 'Formule Panini', 'PANINI', 1050);

-- Historique des 3 jours précédents (dates calculées au moment du reset)
INSERT INTO orders (id, created_at, total) VALUES
    (1, datetime('now', 'localtime', 'start of day', '-3 days', '+12 hours', '+5 minutes'),  1350),
    (2, datetime('now', 'localtime', 'start of day', '-3 days', '+12 hours', '+20 minutes'), 1800),
    (3, datetime('now', 'localtime', 'start of day', '-3 days', '+13 hours'),                1050),
    (4, datetime('now', 'localtime', 'start of day', '-2 days', '+11 hours', '+50 minutes'), 1350),
    (5, datetime('now', 'localtime', 'start of day', '-2 days', '+12 hours', '+30 minutes'), 2700),
    (6, datetime('now', 'localtime', 'start of day', '-2 days', '+15 hours'),                630),
    (7, datetime('now', 'localtime', 'start of day', '-1 days', '+12 hours', '+10 minutes'), 1600),
    (8, datetime('now', 'localtime', 'start of day', '-1 days', '+19 hours', '+45 minutes'), 3000);

INSERT INTO order_lines (order_id, label, quantity, unit_price) VALUES
    (1, 'Formule Burger (Cheese Burger, Coca-Cola, Brownie)',           1, 1350),
    (2, 'Panini Jambon-Fromage',                                        2, 650),
    (2, 'Coca-Cola',                                                    2, 250),
    (3, 'Formule Panini (Panini 3 Fromages, Eau minérale, Cookie)',     1, 1050),
    (4, 'Bacon Burger',                                                 1, 1050),
    (4, 'Limonade artisanale',                                          1, 300),
    (5, 'Formule Burger (Classic Burger, Coca-Cola, Brownie)',          1, 1350),
    (5, 'Formule Burger (Bacon Burger, Thé glacé pêche, Cookie)',       1, 1350),
    (6, 'Brownie',                                                      1, 350),
    (6, 'Thé glacé pêche',                                              1, 280),
    (7, 'Formule Burger (Classic Burger, Thé glacé pêche, Salade de fruits)', 1, 1350),
    (7, 'Cookie',                                                       1, 250),
    (8, 'Classic Burger',                                               3, 850),
    (8, 'Eau minérale',                                                 3, 150);
