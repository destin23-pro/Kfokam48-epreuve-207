# kfokam48-epreuve-207

Suivi de présence et relecture croisée entre pairs, réalisé pour l'épreuve finale fullstack KFOKAM48.

- **Backend** : Java 17, Spring Boot 3, Maven (wrapper `mvnw`), PostgreSQL 15, migrations Flyway.
- **Frontend** : React 18 + Vite + TypeScript. React plutôt que Next.js : trois écrans simples, sans besoin de rendu côté serveur.

## Démarrer (3 commandes)

Prérequis : Docker avec Docker Compose, et Node.js 18 ou plus.

```bash
docker compose up -d --build                    # PostgreSQL + backend sur http://localhost:8080
cd frontend && npm install                      # dépendances du frontend
npm run dev                                     # frontend sur http://localhost:3000
```

Au premier démarrage, Flyway crée le schéma et charge les **données de démonstration** (migration `V5`) :
- 3 promotions et 13 étudiants ;
- une session ouverte avec le code `KF8942`, valable 15 minutes après le démarrage ;
- un historique de sessions, de présences, d'exercices et de relectures, dont des relectures en attente.

Pour repartir d'une base vide : `docker compose down -v`, puis relancer.

## Utilisation

Choisir le rôle dans l'en-tête :
- **Formateur** : ouvrir une session et obtenir son code, consulter le tableau de la promotion.
- **Étudiant** : choisir son nom dans la liste (pas de mot de passe, Q1), marquer sa présence avec le code, déposer le lien de son exercice, et faire les relectures qui lui sont attribuées.

## Tests

```bash
cd backend && ./mvnw test                       # sans base locale : tests unitaires et @WebMvcTest
./mvnw test -Dtest=PresenceServiceTest           # une seule classe
```

## Documentation

| Document | Emplacement |
|---|---|
| Cahier des charges (EF, RG, décisions) | [docs/CAHIER_DES_CHARGES.md](docs/CAHIER_DES_CHARGES.md) |
| Diagrammes D1 à D4 (Mermaid) | [docs/diagrammes/](docs/diagrammes/) |
| Contrat d'API OpenAPI | [api/contrat.yaml](api/contrat.yaml) |
| Journal de bord | [JOURNAL.md](JOURNAL.md) |
| Backlog | onglet Issues du dépôt |

Les identifiants PostgreSQL de `docker-compose.yml` sont ceux d'une base de démonstration locale, pas des secrets.
