# Journal de bord — Épreuve finale KFOKAM48

## Étape 0 — Initialisation du projet
Fait : Création du dépôt public, arborescence initiale et pose du jalon depart.

## Étape 1 — Analyse & Cahier des charges
Fait : Rédaction complète des 10 sections du cahier des charges dans docs/CAHIER_DES_CHARGES.md.

## Étape 2 — Conception & Architecture
Fait : Définition de l'architecture technique conteneurisée avec PostgreSQL, modèle BDD SQL et intégration des 3 diagrammes Mermaid.

## Étape 3 — Organisation Agile & Backlog
Fait : Découpage du projet en Epics et User Stories dans docs/BACKLOG.md.

## Étape 4 — Développements Backend & API REST
Fait : Implémentation des conteneurs Docker, entités JPA, Repositories, DTOs, Services et Controllers REST.

## Étape 5 — Sécurité & JWT (US-08)
Fait : Implémentation de Spring Security, du filtre JWT, du PasswordEncoder BCrypt et du contrôleur d'authentification /api/auth/login sur la branche feature/US-08-jwt-auth.

---

Les entrées ci-dessous suivent le découpage du sujet. Elles corrigent la trajectoire décrite plus haut.

## Étape 1 (reprise) — Analyse remise d'aplomb
Fait : cahier des charges v2 (EF1–EF10, RG1–RG14, Q10/Q15 tranchée pour Q15, trou « aucun relecteur disponible »), diagrammes D1–D4 en Mermaid, contrat d'API complété (14 opérations), 12 issues réécrites ou créées avec critères « quand … alors … » et priorités ; #2 (JWT) fermée car contraire à Q1. PR #9, #10, #11.
Bloqué : ~40 min. J'avais commencé par coder une pile hors sujet (JWT, Order/Product) avant le jalon analyse : le commit `[JALON] analyse` est donc placé après du code déjà poussé. Je ne l'ai pas corrigé par un push --force sur main, et j'assume le malus.
IA : Claude Code a relevé les écarts avec le sujet et rédigé le cahier, les diagrammes et les issues. Vérifié en relisant chaque RG contre CLIENT.md, en faisant analyser les diagrammes par le parseur Mermaid officiel et en validant le contrat avec openapi-spec-validator (il avait une clé /api/sessions dupliquée qui effaçait le POST imposé).

## Étape 2 — Première version (v0.1)
Fait : dépôt nettoyé (.gitignore, target/ retiré, code JWT et Order/Product supprimé, PR #19), backend en commits par issue (PR #20, Closes #3–#7 et #13), frontend React (PR #21, Closes #14), README en 3 commandes (PR #22), `[JALON] v0.1`.
Bloqué : ~30 min. L'écran formateur restait vide : le backend tournait avec des classes compilées avant l'ajout des contrôleurs, et le gestionnaire d'erreurs transformait « route inconnue » en 500 sans log. La migration de démo était aussi cassée (bloc VALUES mal placé, note NOT NULL), ce qu'une base locale remplie à la main masquait. Enfin, Flyway pointait sur localhost en dur, ce qui cassait Docker.
IA : diagnostic fait en interrogeant l'API réelle avec curl et en rejouant les migrations sur une base vide (sauvegarde CSV prise avant). Vérifié : 5 migrations appliquées, 14 tests verts sans base locale, `npm run build` OK.

## Étape 3 — Enveloppe : bug et changement de besoin
Fait (bug) : issue #23 ouverte avant tout code. Reproduction : 20 paires de POST /api/presences simultanés donnent 20 × (201, 201), donc l'API n'est pas en cause ; c'est le tableau formateur qui n'était chargé qu'une fois. Test vitest rouge commité seul, puis correctif (rechargement toutes les 5 s), test vert. PR #24.
Fait (changement) : issue #25 ; analyse mise à jour dans un commit dédié (cahier v3 : RG7, RG14, RG15 ; D2, D4, contrat), PR #26. Migration V6 **ajoutée**, testée sur la base remplie (23 relectures avant et après). Deux relecteurs, note = moyenne, provisoire si une seule relecture rendue ; vérifié de bout en bout (12 → 12.0 provisoire ; 12 + 15 → 13.5, RELU). PR #27, séparée du correctif.
Sacrifié : RG4, le blocage après 5 codes faux (#12, Should), et le remplacement du lien (#17, Could), pour tenir ce Must arrivé tard ; écrit en §3 du cahier des charges. Reste à faire : l'affichage « provisoire » dans l'écran étudiant (l'API le fournit déjà).
IA : l'IA proposait d'abord un bug de concurrence côté serveur ; le test de charge réel l'a infirmé, d'où le diagnostic côté frontend. Vérifié par le test rouge puis vert, et par le scénario joué contre l'API.

## Étape 4 — Version finale (v1.0)
Fait : CHANGELOG, documents périmés supprimés (BACKLOG.md et ARCHITECTURE.md décrivaient JWT et Node), backlog restant trié, `[JALON] v1.0`.
