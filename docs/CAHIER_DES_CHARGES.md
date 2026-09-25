# Cahier des charges — Système de Suivi des Présences et Évaluations (KFOKAM48)

* **Auteur / Matricule** : 207 (Code sujet : KFOKAM48)
* **Date** : 25 Septembre 2026
* **Stack choisie** : Frontend React / Next.js (TypeScript) — Backend Node.js / Express — Base de données PostgreSQL / Prisma
* **Statut** : Version 1.0 — Validation initiale

---

## 1. Contexte et objectif

Dans le cadre des activités académiques, la gestion du suivi des présences, de la soumission des travaux pratiques (exercices) et de la relecture/évaluation croisée par les pairs nécessite un outil unifié, fiable et traçable.

Actuellement, l'absence de centralisation entraîne la perte d'informations, des contestations lors des présences ou des soumissions, et un manque de visibilité globale sur l'assiduité et les performances des étudiants.

### Objectif principal
Développer une application web complète (KFOKAM48) permettant de :
* Gérer l'ouverture/fermeture des sessions de cours en temps réel par les enseignants.
* Enregistrer de façon sécurisée les déclarations de présence des étudiants.
* Permettre le dépôt digital d'exercices sous forme de fichiers ou liens rendus.
* Assurer la relecture par les pairs (peer-review) ou par l'enseignant avec attribution de notes et commentaires.
* Générer un tableau de suivi synthétique (dashboard) récapitulant la participation et les résultats de chaque étudiant.

---

## 2. Acteurs et rôles

L'application distingue quatre catégories d'utilisateurs avec des droits d'accès strictly hiérarchisés :

| Acteur | Rôle & Description |
| :--- | :--- |
| **Administrateur** | Gestionnaire du système. Il configure les promotions, inscrit les utilisateurs, gère les rôles et supervise la plate-forme. |
| **Enseignant** | Responsable pédagogique. Il crée/ouvre/ferme les sessions de cours, publie les sujets d'exercices, assigne les relectures, attribue ou valide les notes finales et consulte l'ensemble du tableau de suivi. |
| **Étudiant** | Utilisateur principal. Il s'émarge lors d'une session active, dépose ses exercices, effectue les relectures attribuées et consulte ses notes et taux de présence personnalisés. |
| **Visiteur / Anonyme** | Utilisateur non authentifié. Il n'a accès qu'à la page de connexion et à la documentation publique de l'API. |

---

## 3. Périmètre

### Inclus dans le périmètre (In-Scope)
* **Module 1 : Authentification & Profils** : Connexion sécurisée (JWT), gestion des rôles (RBAC).
* **Module 2 : Gestion des Sessions & Présences** : Création de session avec clé temporaire, émargement horodaté de l'étudiant.
* **Module 3 : Soumission des Exercices** : Dépôt de fichiers/liens, horodatage, limitation du nombre de soumissions.
* **Module 4 : Relecture par les Pairs & Évaluation** : Attribution aléatoire ou manuelle d'exercices à corriger, grille d'évaluation, commentaires.
* **Module 5 : Tableau de Bord & Rapports** : Calcul automatique des taux de présence, moyennes d'exercices, export des données au format CSV/PDF.
* **API REST OpenSource** : Documentation OpenAPI 3.0 complète et contrat d'interface respecté.

### Exclus du périmètre (Out-of-Scope)
* Visioconférence intégrée ou messagerie instantanée en direct.
* Application mobile native (Android/iOS) — une interface web responsive (Mobile First) est privilégiée.
* Reconnaissance faciale ou géolocalisation GPS stricte pour le pointage.

---

## 4. Exigences fonctionnelles

### EF-01 : Authentification et Sécurité des accès
* L'utilisateur doit pouvoir se connecter avec son identifiant/email et mot de passe.
* Le système génère un jeton JWT contenant l'identifiant et le rôle de l'utilisateur.

### EF-02 : Gestion des Sessions de cours
* L'enseignant peut démarrer une session de cours (ex: "Cours de Web - 25/09/2026").
* Le système génère un code unique de validation (ex: `KFK-207-A9X`) valide pour une durée configurable (ex: 15 minutes).
* L'enseignant peut fermer manuellement la session à tout moment.

### EF-03 : Émargement / Prise de Présence
* L'étudiant saisit le code unique transmis par l'enseignant durant la fenêtre d'ouverture.
* Le système enregistre l'émargement avec le statut `PRÉSENT` et l'horodatage précis.
* Si la session est expirée ou fermée, la tentative est refusée (`RETARD` ou `ABSENT`).

### EF-04 : Dépôt des travaux (Exercices)
* L'étudiant peut soumettre un devoir lié à une session avant la date limite (*deadline*).
* Type de rendu accepté : Lien URL (GitHub, Google Drive) ou fichier joint (PDF, ZIP).
* Le système confirme la réception et conserve un historique de soumission.

### EF-05 : Relecture et Notation
* L'enseignant peut distribuer les devoirs aux relecteurs (étudiants pairs ou lui-même).
* Le relecteur saisit une note (sur 20) et une appréciation motivée.
* L'enseignant a un droit de révision (override) sur la note finale.

### EF-06 : Consultation et Tableau de Suivi
* Synthèse globale affichant :
  * Taux d'assiduité par étudiant (%).
  * Liste des devoirs rendus, en retard ou manquants.
  * Moyenne générale cumulée.
* Exportation du tableau récapitulatif pour les enseignants.

---

## 5. Exigences non fonctionnelles

* **Performance** : Temps de réponse des requêtes de pointage et consultation `< 500 ms` pour une charge de 100 requêtes simultanées.
* **Ergonomie & UX** : Interface responsive (adaptée PC, tablette et smartphone), respectant les normes d'accessibilité WCAG 2.1 AA.
* **Disponibilité** : Taux de disponibilité cible de 99 % durant les heures de cours.
* **Traçabilité & Auditability** : Journalisation (*logging*) de toutes les actions critiques (création de session, modification de note, émargement).
* **Maintenabilité** : Architecture claire en couches (MVC/Clean Architecture), code documenté et présence de tests unitaires/d'intégration.

---

## 6. Règles de gestion

* **RG-01 (Unicité de présence)** : Un étudiant ne peut émarger qu'une seule fois par session active.
* **RG-02 (Fenêtre temporelle)** : L'émargement n'est autorisé que si `Heure_Courante <= Heure_Ouverture + Duree_Validite` ET que `Statut_Session == 'OUVERTE'`.
* **RG-03 (Immuabilité des rendus validés)** : Une fois la date limite dépassée, toute soumission d'exercice est soit bloquée, soit marquée irrévocablement avec le statut `EN_RETARD`.
* **RG-04 (Anonymat des relectures)** : Par défaut, la relecture par les pairs s'effectue en double-aveugle (le relecteur ne voit pas l'auteur de l'exercice et vice versa).
* **RG-05 (Calcul de la moyenne)** : La note finale d'un exercice est déterminée par la note de l'enseignant si elle existe, sinon par la moyenne des notes des relecteurs pairs.

---

## 7. Zones d'ombre, hypothèses et contradictions

| Identification | Analyse / Hypothèse retenue |
| :--- | :--- |
| **Abonnement / Fraude de présence** | *Risque* : Un étudiant présent partage le code à un camarade absent.<br>*Hypothèse retenue* : La validation repose sur un code à durée très courte (5-10 min). Un contrôle par IP/Sous-réseau ou un QR code dynamique pourra être envisagé en V2. |
| **Absence de relecture par un pair** | *Risque* : Un étudiant ne reçoit pas de note car son relecteur attribué n'a pas fait son travail.<br>*Hypothèse retenue* : En cas de relecture non rendue à l'échéance, le devoir est automatiquement réassigné à l'enseignant. |
| **Conflit de notes entre pairs** | *Risque* : Écart important entre 2 relecteurs pairs (ex: 05/20 et 18/20).<br>*Hypothèse retenue* : Si l'écart entre deux notes dépasse 5 points, une alerte est levée et l'enseignant doit trancher. |

---

## 8. Contraintes techniques

* **Langages & Frameworks** :
  * **Frontend** : Next.js / React (TypeScript), TailwindCSS.
  * **Backend** : Node.js avec Express ou NestJS.
  * **ORM & Base de données** : PostgreSQL avec Prisma ORM.
* **Gestion de versioning & DevOps** :
  * Git, GitHub avec branches de fonctionnalités (`feature/*`).
  * Conteneurisation avec **Docker** et **Docker Compose** pour l'environnement de développement.
* **Documentation API** : OpenAPI 3.0 (Swagger) hébergée sur `/api/docs`.

---

## 9. Livrables

1. **Dépôt Git public** : `kfokam48-epreuve-207` contenant le code source complet.
2. **Spécification API** : Fichier `api/contrat.yaml` valide OpenAPI 3.0.
3. **Documentation** :
   * `docs/CAHIER_DES_CHARGES.md` (ce document).
   * `docs/ARCHITECTURE.md` (conception logicielle et BDD).
   * `docs/RECETTE.md` (cahier de tests et résultats).
4. **Journal de bord** : `JOURNAL.md` retraçant chaque étape du projet.
5. **Code Source & Scripts** : Code Frontend, Backend, et scripts de migration DB.
6. **Livrables d'export** : Fichiers PDF/Markdown générés pour archivage.

---

## 10. Démarche prévue

Le projet sera réalisé suivant une approche itérative rigoureuse jalonnée par des commits Git spécifiques :

1. **Phase 1 : Cadrage & Conception**
   * Rédaction du Cahier des charges, de l'Architecture et du Contrat OpenAPI (`api/contrat.yaml`).
   * Pose des jalons initial (`depart`) et de conception (`jalon-1`).
2. **Phase 2 : Développement Backend & Base de données**
   * Modélisation Prisma, créations des migrations PostgreSQL.
   * Implémentation des routes d'API REST (Présences, Exercices, Relectures, Dashboard).
3. **Phase 3 : Développement Frontend**
   * Intégration des vues React/Next.js (Interface Étudiant & Enseignant).
   * Connexion avec l'API REST.
4. **Phase 4 : Recette, Tests & Finalisation**
   * Exécution des scénarios de test (Cahier de recette).
   * Mise à jour du journal de bord (`JOURNAL.md`).
   * Pose du jalon final (`final`).
