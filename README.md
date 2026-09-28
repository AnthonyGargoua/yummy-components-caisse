# YummyComponents — TP caisse enregistreuse (CDA)

TP Angular 22 : la caisse enregistreuse d'un food truck. Le serveur Java est fourni, les étudiants
réalisent le front. Le sujet complet est dans **[ENONCE.md](ENONCE.md)**.

## Structure

```text
tp-caisse/
├── pom.xml, mvnw, mvnw.cmd, src/   Serveur Java (Spring Boot 4 + SQLite) — fourni aux étudiants
├── ENONCE.md                       Sujet du TP
├── docs/                           Maquettes (captures du corrigé) utilisées dans l'énoncé
├── front/                          Projet Angular 22 de départ pour les étudiants
└── corrige/                        Corrigé : projet Angular 22 complet et indépendant
```

> **Avant de distribuer le TP, supprimez le dossier `corrige/`.**
> Le corrigé existe aussi chiffré dans `corrige.7z` (7z AES-256, noms de fichiers chiffrés, sans
> `node_modules` : faire `npm install` après extraction). Le mot de passe n'est pas dans le dépôt.

## Prérequis

- Java 21+ (Maven n'est pas nécessaire : le wrapper `mvnw` le télécharge)
- Node.js 22.22+, 24.15+ ou 26+

## Lancer le serveur (à la racine)

```bash
mvnw.cmd spring-boot:run      # Windows
./mvnw spring-boot:run        # macOS / Linux
```

API sur http://localhost:8080/api. La base `yummy.db` est créée à la racine au premier démarrage.
CORS autorisé pour http://localhost:4200.

Variante sans Maven au quotidien : `mvnw.cmd package` puis `java -jar target/caisse-server-1.0.0.jar`.

## Lancer le front

```bash
cd front      # ou: cd corrige
npm install
npm start     # http://localhost:4200
```

Identifiants : **caisse / caisse**.

## Remettre la base comme au début

```bash
curl -X POST http://localhost:8080/api/reset        # PowerShell : curl.exe -X POST ...
```

La route n'exige pas d'être connecté. Elle recrée les tables à partir de `src/main/resources/db/schema.sql`
et `data.sql` : 15 produits (dont 3 hors stock et 2 à stock faible), 2 formules et un historique de ventes
sur les 3 jours précédents (dates calculées au moment du reset).

## Le serveur en bref

| Route | Rôle |
|---|---|
| `POST /api/auth/login` · `POST /api/auth/logout` | Connexion (compte unique `caisse`/`caisse`, jeton UUID gardé en mémoire) |
| `GET /api/products` · `GET /api/formulas` | Catalogue |
| `POST /api/orders` | Paiement : vérifie les catégories et les stocks, décrémente, enregistre (transaction) |
| `GET /api/orders/daily-totals` | Total et nombre de notes par jour |
| `POST /api/reset` | Réinitialisation de la base |

Code dans `src/main/java/fr/yummycomponents/caisse/` :

- `auth/` : `AuthService` (jetons), `AuthController`, `AuthInterceptor` (401 si pas de jeton valide)
- `catalog/` : `Product`, `Formula`, `CatalogController`
- `order/` : `OrderService` (logique de paiement), `OrderController`, records `Order`, `OrderRequest`, `DailyTotal`
- `Database` : création de la base au démarrage et reset ; `WebConfig` : CORS + intercepteur

Les montants sont des entiers en **centimes** côté base comme côté API. Le serveur recalcule les prix :
le client n'envoie que des identifiants et des quantités.
