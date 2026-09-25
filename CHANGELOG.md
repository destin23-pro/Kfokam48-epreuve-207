# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Les numéros renvoient aux issues et aux PR du dépôt.

## [1.0.0] — 2026-09-25

### Modifié (changement de besoin, étape 3 — #25, PR #26 et #27)
- Chaque exercice est relu par **deux** pairs différents, tirés au hasard parmi les présents (RG7, qui remplace Q6).
- La note d'un exercice est la moyenne des relectures rendues (RG14). Si une seule est rendue, elle est affichée et marquée `noteProvisoire` (RG15).
- La moyenne du tableau est la moyenne des notes d'exercice, provisoires comprises.
- Migration `V6__deux_relecteurs_par_exercice.sql` ajoutée, sans perte de données.
- Cahier des charges v3, diagrammes D2 et D4, contrat d'API mis à jour.

### Corrigé
- #23 : le tableau du formateur n'affichait pas les présences marquées après son chargement. Il se recharge maintenant toutes les 5 s (PR #24, test `rafraichissement.test.ts`).
- `GET /api/exercices?etudiantId=` aligné sur le contrat.
- Verbe HTTP non supporté : 405 `METHODE_NON_AUTORISEE` au lieu de 500.

### Retiré du périmètre
- RG4, blocage après 5 codes erronés (#12), et remplacement du lien d'exercice (#17), sacrifiés pour tenir le changement de besoin.

## [0.1.0] — 2026-09-25

### Ajouté
- Backend Spring Boot : les 5 opérations du contrat, plus les listes de sessions, de promotions, d'étudiants et de relectures (PR #20, #3–#7, #13).
- Migrations Flyway V1–V5, avec données de démonstration.
- Gestion centralisée des erreurs au format `{ code, message }`. Une route inconnue renvoie 404.
- Frontend React : écrans formateur, étudiant et relecteur (PR #21, #14).
- README : démarrage en 3 commandes (PR #22).
- Analyse : cahier des charges v2, diagrammes D1 à D4, contrat d'API (PR #9, #10, #11).

### Retiré
- Authentification JWT et domaine Order/Product/User, hors sujet et contraires à Q1 (PR #19).
