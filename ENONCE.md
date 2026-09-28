# TP — La caisse enregistreuse de « YummyComponents » 🍔

## Contexte

**YummyComponents** est un food truck qui vend des burgers, des paninis, des boissons et des desserts.
Aujourd'hui, les commandes sont notées sur un carnet et les stocks comptés à la main. Le gérant veut
une **caisse enregistreuse web**, utilisable sur une tablette posée sur le comptoir.

Le **serveur** (API REST en Java / Spring Boot + base SQLite) est **fourni** et déjà fonctionnel.
Votre mission : développer l'**application Angular** de la caisse.

## Objectifs pédagogiques

- Structurer une application Angular en **composants**, **services** et **routes**
- Communiquer avec une API REST (`HttpClient`, Observables)
- Protéger des pages (**guard**) et authentifier les requêtes (**intercepteur**)
- Gérer un état partagé avec les **signals** (`signal`, `computed`)
- Faire communiquer des composants (`input()` / `output()`)
- Écrire un **formulaire réactif** et un **pipe**

---

## 1. Démarrage

### Prérequis

- **Java 21** ou plus récent
- **Node.js** 22.22+, 24.15+ ou 26+ (avec npm)

### Lancer le serveur (à la racine du projet)

```bash
# Windows
mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

Le serveur écoute sur **http://localhost:8080**. Au premier lancement, Maven et les dépendances sont
téléchargés (c'est un peu long). La base `yummy.db` est créée automatiquement à la racine.

### Lancer le front (dossier `front/`)

```bash
cd front
npm install
npm start
```

L'application est servie sur **http://localhost:4200**.

### Ce qui vous est fourni dans `front/`

| Fichier | Contenu |
|---|---|
| `src/app/models.ts` | Les **types TypeScript** des données de l'API + la constante `CATEGORIES` (libellés et icônes) |
| `src/app/api.ts` | La constante `API_URL` (`http://localhost:8080/api`) |
| `src/styles.css` | Des styles globaux prêts à l'emploi : `.btn`, `.btn-primary`, `.btn-success`, `.btn-ghost`, `.btn-lg`, `.btn-icon`, `.card`, `.badge`, `.badge-warning`, `.badge-danger`, `.alert`, `.alert-success`, `.alert-error`, `.form-field`, `.field-error` et des variables CSS (`--color-primary`, `--color-accent`…) |
| `src/app/app.config.ts` | La locale **française** est déjà configurée (`8,50 €`, `lundi 28 septembre`) |

Les composants générés avec `ng generate component` ont un fichier `.html` et un fichier `.css` séparés.

---

## 2. L'API

> ⚠️ **Tous les montants sont en centimes** : `850` signifie `8,50 €`.

| Méthode | Route | Jeton ? | Description |
|---|---|:---:|---|
| `POST` | `/api/auth/login` | non | Connexion. Corps : `{ "login": "caisse", "password": "caisse" }` → `200 { "token": "…" }` ou `401` |
| `POST` | `/api/auth/logout` | oui | Déconnexion (le jeton est invalidé) → `204` |
| `GET` | `/api/products` | oui | Tous les produits, **y compris ceux hors stock** |
| `GET` | `/api/formulas` | oui | Les formules |
| `POST` | `/api/orders` | oui | **Paie** une note → `201` + la note enregistrée, `400` (note invalide), `409` (stock insuffisant) |
| `GET` | `/api/orders/daily-totals` | oui | Total encaissé **pour chaque jour** (du plus récent au plus ancien) |
| `POST` | `/api/reset` | non | **Remet la base dans son état initial** (produits, stocks, historique) |

**Identifiants de la caisse** : login `caisse`, mot de passe `caisse`.

### Authentification

Les routes marquées « oui » exigent l'en-tête :

```text
Authorization: Bearer <jeton reçu au login>
```

Sans jeton valide, le serveur répond **401**. Les jetons sont gardés en mémoire par le serveur :
**après un redémarrage du serveur, il faut se reconnecter.**

### Exemples

`GET /api/products`

```json
[
  { "id": 1, "name": "Classic Burger", "category": "BURGER", "price": 850, "stock": 15 },
  { "id": 4, "name": "Veggie Burger",  "category": "BURGER", "price": 950, "stock": 0 }
]
```

Catégories possibles : `BURGER`, `PANINI`, `BOISSON`, `DESSERT`.

`GET /api/formulas`

```json
[
  { "id": 1, "name": "Formule Burger", "mainCategory": "BURGER", "price": 1350 },
  { "id": 2, "name": "Formule Panini", "mainCategory": "PANINI", "price": 1050 }
]
```

Une formule = **un plat de la catégorie `mainCategory` + une boisson + un dessert**, à prix fixe.

`POST /api/orders` : on envoie **uniquement des identifiants et des quantités**, le serveur calcule les prix.

```json
{
  "products": [
    { "productId": 2, "quantity": 2 }
  ],
  "formulas": [
    { "formulaId": 1, "mainId": 3, "drinkId": 10, "dessertId": 12 }
  ]
}
```

Réponse `201` :

```json
{
  "id": 9,
  "createdAt": "2026-09-28 12:34:56",
  "total": 3250,
  "lines": [
    { "label": "Cheese Burger", "quantity": 2, "unitPrice": 950 },
    { "label": "Formule Burger (Bacon Burger, Limonade artisanale, Brownie)", "quantity": 1, "unitPrice": 1350 }
  ]
}
```

`GET /api/orders/daily-totals`

```json
[
  { "day": "2026-09-28", "total": 3250, "orderCount": 1 },
  { "day": "2026-09-27", "total": 4600, "orderCount": 2 }
]
```

### Erreurs

En cas d'erreur (400, 401, 409), le corps de la réponse contient un champ `message` à afficher :

```json
{ "status": 409, "message": "Stock insuffisant pour Cookie (reste 2)" }
```

Avec `HttpClient`, ce corps se trouve dans `error.error` (`HttpErrorResponse`).

### Remettre la base à zéro

```bash
curl -X POST http://localhost:8080/api/reset                          # macOS / Linux / Git Bash
curl.exe -X POST http://localhost:8080/api/reset                      # Windows (PowerShell)
Invoke-RestMethod -Method Post http://localhost:8080/api/reset        # Windows (PowerShell)
```

Vous pouvez aussi supprimer le fichier `yummy.db` puis relancer le serveur.

---

## 3. Ce qu'on attend

Deux vues :

1. **`/login`** : l'écran de connexion
2. **`/caisse`** : la caisse (catalogue + note en cours + recettes)

| Connexion | Caisse | Choix d'une formule |
|---|---|---|
| ![Connexion](docs/maquette-login.png) | ![Caisse](docs/maquette-caisse.png) | ![Formule](docs/maquette-formule.png) |

Les captures sont des **exemples** : vous êtes libres sur le design tant que les fonctionnalités
sont là.

### Architecture conseillée

```text
src/app/
├── api.ts, models.ts              (fournis)
├── app.ts, app.config.ts, app.routes.ts
├── auth/
│   ├── auth.service.ts            login / logout / jeton
│   ├── auth.guard.ts              protège /caisse
│   └── auth.interceptor.ts        ajoute le jeton, gère les 401
├── services/
│   ├── catalog.service.ts         produits et formules
│   ├── order.service.ts           paiement et totaux par jour
│   └── note.service.ts            état de la note en cours (signals)
├── shared/
│   └── euros.pipe.ts              850 -> "8,50 €"
├── login/
│   └── login-page.ts/.html/.css
└── caisse/
    ├── caisse-page.ts/.html/.css  la page (en-tête, catalogue, colonne de droite)
    ├── product-card/              une carte produit
    ├── note-panel/                le ticket (note en cours + bouton Payer)
    ├── formula-picker/            la fenêtre de choix d'une formule
    └── daily-totals/              le tableau des recettes par jour
```

---

## 4. Étapes

Faites les étapes **dans l'ordre** : chacune s'appuie sur la précédente.

### Étape 1 — Mise en place

- [ ] Fournir `HttpClient` dans `app.config.ts`.
- [ ] Générer deux composants « pages » : `LoginPage` et `CaissePage`.
- [ ] Déclarer les routes : `/login`, `/caisse`. L'URL vide et toute URL inconnue redirigent vers `/caisse`.
- [ ] Supprimer le message d'accueil de `app.ts`.

✅ **Validation** : http://localhost:4200/login et http://localhost:4200/caisse affichent chacune leur page.

> 💡 `provideHttpClient()`, `{ path: '**', redirectTo: 'caisse' }`

### Étape 2 — Authentification

- [ ] **`AuthService`**
  - `login(login, password)` appelle `POST /api/auth/login` et mémorise le jeton reçu dans un
    `signal` **et** dans le `sessionStorage` (pour rester connecté si on recharge la page).
  - `isLoggedIn` : un `computed` qui indique si un jeton est présent.
  - `logout()` appelle `POST /api/auth/logout` puis oublie le jeton.
- [ ] **Page de connexion** : formulaire réactif (identifiant + mot de passe, obligatoires).
  - En cas de succès → redirection vers `/caisse`.
  - En cas d'échec (401) → message « Identifiant ou mot de passe incorrect ».
  - Si le serveur ne répond pas → un message qui l'indique.
- [ ] **Guard** : `/caisse` n'est accessible qu'aux utilisateurs connectés, sinon redirection vers `/login`.
- [ ] **Intercepteur** : ajoute l'en-tête `Authorization: Bearer <jeton>` à chaque requête. Si une réponse
  est un **401** (hors login), il efface le jeton et renvoie vers `/login`.

✅ **Validation** : impossible d'afficher `/caisse` sans se connecter ; avec `caisse` / `caisse` on arrive sur la caisse ;
après un redémarrage du serveur, la première requête renvoie sur `/login`.

> 💡 `NonNullableFormBuilder`, `Validators.required`, `CanActivateFn`, `router.createUrlTree(['/login'])`,
> `HttpInterceptorFn`, `request.clone({ setHeaders: { … } })`, `withInterceptors([...])`

### Étape 3 — Le catalogue

- [ ] **`CatalogService`** : `getProducts()` et `getFormulas()`.
- [ ] Un **pipe `euros`** qui transforme des centimes en texte : `{{ 850 | euros }}` → `8,50 €`.
- [ ] La page caisse charge les produits dans un `signal` et les affiche **par catégorie**
  (Burgers, Paninis, Boissons, Desserts), à l'aide de `CATEGORIES`.
- [ ] Un composant **`ProductCard`** :
  - entrées (`input()`) : le produit et le **stock disponible** ;
  - sortie (`output()`) : émet le produit quand on clique dessus ;
  - affiche l'icône, le nom, le prix et le stock.
- [ ] Un produit **hors stock** reste **visible** mais est **grisé**, porte la mention « Hors stock » et
  **n'est pas cliquable**.

✅ **Validation** : les 15 produits s'affichent ; Veggie Burger, Panini Poulet-Pesto et Tiramisu sont
visibles mais désactivés.

> 💡 `formatCurrency(cents / 100, 'fr', '€')` ou `CurrencyPipe`, `@for (… ; track product.id)`,
> `[disabled]="…"`, `[class.sold-out]="…"`

### Étape 4 — La note en cours

La note est construite **dans le navigateur** : rien n'est envoyé au serveur avant le paiement.

- [ ] **`NoteService`** (état partagé, avec des signals) :
  - la liste des lignes de la note ;
  - `total` : un `computed` ;
  - ajouter un produit (cliquer deux fois sur le même produit donne **une** ligne de quantité 2) ;
  - diminuer la quantité, supprimer une ligne, vider la note.
- [ ] Un composant **`NotePanel`** (le ticket) : chaque ligne avec son libellé, son prix, sa quantité
  (boutons − et +), son sous-total et un bouton de suppression ; le total en bas.
- [ ] Le **stock affiché tient compte de la note** : si Cookie a un stock de 2 et que 2 cookies sont
  déjà dans la note, la carte Cookie affiche « Hors stock » et n'est plus cliquable. Le bouton « + »
  du ticket est désactivé dans ce cas.

✅ **Validation** : on voit la note se construire au fil des clics, le total est juste, on ne peut
pas mettre dans la note plus que le stock.

> 💡 Un `computed` qui calcule, pour chaque produit, la quantité déjà dans la note
> (`Map<number, number>`), puis `disponible = stock − quantité dans la note`.
> Pour mettre à jour un signal contenant un tableau : `lines.update(l => [...l, nouvelleLigne])`
> (on crée un **nouveau** tableau, on ne fait pas de `push`).

### Étape 5 — Les formules

- [ ] Afficher les 2 formules (nom, composition, prix) au-dessus du catalogue.
- [ ] Un clic sur une formule ouvre un composant **`FormulaPicker`** (une fenêtre par-dessus la page) :
  - choisir **un** produit de la catégorie principale (burger **ou** panini selon la formule),
    **une** boisson et **un** dessert ;
  - les produits indisponibles sont visibles mais non sélectionnables ;
  - « Ajouter à la note » n'est actif que lorsque les 3 choix sont faits ; « Annuler » ferme la fenêtre.
- [ ] Dans la note, une formule est **une ligne** : son nom, le détail des 3 produits choisis et son prix fixe.
- [ ] Les 3 produits d'une formule **comptent dans les stocks** réservés par la note.
- [ ] Une formule est désactivée si l'une de ses 3 catégories n'a plus aucun produit disponible.

✅ **Validation** : Formule Burger (Bacon Burger, Limonade, Brownie) apparaît dans la note à 13,50 € et
les stocks affichés de ces 3 produits diminuent de 1.

> 💡 Le type d'une ligne de note peut être une **union** :
> `type NoteLine = ProductLine | FormulaLine`, distinguées par un champ `kind: 'product' | 'formula'`.

### Étape 6 — Le paiement

- [ ] **`OrderService.pay(request)`** : `POST /api/orders`.
- [ ] Convertir la note en `OrderRequest` (produits + formules, avec seulement les identifiants).
- [ ] Bouton **« Payer 40,00 € »**, désactivé si la note est vide ou si un paiement est en cours.
- [ ] Après un paiement réussi :
  - afficher « Note n°X payée : Y € » ;
  - **vider** la note ;
  - **recharger** les produits (les stocks ont changé) et les totaux par jour.
- [ ] En cas d'erreur (ex. **409** stock insuffisant) : afficher le `message` renvoyé par le serveur et
  recharger les produits.

✅ **Validation** : après paiement, les stocks affichés ont diminué. Pour provoquer un 409 : mettez 3
limonades dans la note, payez 1 limonade depuis un second onglet, puis payez dans le premier.

### Étape 7 — Les recettes

- [ ] Charger `GET /api/orders/daily-totals`.
- [ ] Un composant **`DailyTotals`** : un tableau jour / nombre de notes / total, pour **chaque jour**
  (la base de départ contient déjà l'historique des 3 jours précédents). La ligne du jour est mise en
  évidence.
- [ ] Le **total du jour** est affiché en permanence dans l'en-tête de la caisse.
- [ ] Les deux se mettent à jour après chaque paiement.

> 💡 `{{ day | date: 'EEEE d MMMM' }}` → « dimanche 27 septembre ».
> Le total du jour est un `computed` sur la liste des totaux.

### Étape 8 — Déconnexion

- [ ] Un bouton **« Se déconnecter »** dans l'en-tête : appelle `POST /api/auth/logout`, oublie le
  jeton, vide la note et revient sur `/login`.

✅ **Validation** : après déconnexion, `/caisse` renvoie vers `/login`, et l'ancien jeton est refusé par
le serveur (401).

---

## 5. Bonus

- La page `/login` redirige vers `/caisse` si on est déjà connecté (un second guard).
- La touche **Échap** ferme la fenêtre de choix de formule.
- Le message de confirmation de paiement disparaît tout seul après quelques secondes.
- Afficher le **ticket** de la dernière note payée (les `lines` renvoyées par `POST /api/orders`).
- Un bouton d'administration qui appelle `POST /api/reset` puis recharge la page.
- Une mise en page qui reste utilisable sur mobile.
- Des tests unitaires du `NoteService`.

---

## 6. Auto-évaluation

| Fonctionnalité | OK ? |
|---|:---:|
| Connexion `caisse` / `caisse`, message d'erreur sinon | ☐ |
| `/caisse` inaccessible sans être connecté | ☐ |
| Jeton envoyé automatiquement (intercepteur), 401 → retour au login | ☐ |
| Produits affichés par catégorie avec prix et stock | ☐ |
| Produit hors stock visible mais non sélectionnable | ☐ |
| La note se construit en direct (quantités, suppression, total) | ☐ |
| Le stock affiché tient compte de la note | ☐ |
| Les 2 formules (plat + boisson + dessert) fonctionnent | ☐ |
| Paiement en un clic, note vidée, stocks rechargés | ☐ |
| Erreur 409 affichée proprement | ☐ |
| Total de chaque jour + total du jour visibles et à jour | ☐ |
| Déconnexion | ☐ |
| Code découpé en composants / services ; montants manipulés en centimes (entiers) | ☐ |
