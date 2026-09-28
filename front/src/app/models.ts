/*
 * Types des données échangées avec l'API (fournis).
 * ⚠️ Tous les montants sont en CENTIMES : 850 = 8,50 €.
 */

export type Category = 'BURGER' | 'PANINI' | 'BOISSON' | 'DESSERT';

/** GET /api/products */
export interface Product {
  id: number;
  name: string;
  category: Category;
  /** Prix unitaire en centimes */
  price: number;
  /** Quantité restante en stock (0 = hors stock) */
  stock: number;
}

/** GET /api/formulas — un plat principal + une boisson + un dessert, à prix fixe */
export interface Formula {
  id: number;
  name: string;
  /** Catégorie du plat principal de la formule */
  mainCategory: 'BURGER' | 'PANINI';
  /** Prix fixe en centimes */
  price: number;
}

/** Réponse de POST /api/auth/login */
export interface LoginResponse {
  token: string;
}

/** Corps de POST /api/orders (les prix sont recalculés par le serveur) */
export interface OrderRequest {
  products: { productId: number; quantity: number }[];
  formulas: { formulaId: number; mainId: number; drinkId: number; dessertId: number }[];
}

/** Réponse de POST /api/orders */
export interface Order {
  id: number;
  /** Format "2026-09-28 12:34:56" */
  createdAt: string;
  /** Total en centimes */
  total: number;
  lines: { label: string; quantity: number; unitPrice: number }[];
}

/** GET /api/orders/daily-totals */
export interface DailyTotal {
  /** Format "2026-09-28" */
  day: string;
  /** Total encaissé en centimes */
  total: number;
  orderCount: number;
}

/** Corps des réponses d'erreur de l'API (400, 401, 409...) */
export interface ApiError {
  status: number;
  message: string;
}

/** Aide à l'affichage : les catégories dans l'ordre de la carte */
export const CATEGORIES: { code: Category; label: string; icon: string }[] = [
  { code: 'BURGER', label: 'Burgers', icon: '🍔' },
  { code: 'PANINI', label: 'Paninis', icon: '🥪' },
  { code: 'BOISSON', label: 'Boissons', icon: '🥤' },
  { code: 'DESSERT', label: 'Desserts', icon: '🍰' },
];
