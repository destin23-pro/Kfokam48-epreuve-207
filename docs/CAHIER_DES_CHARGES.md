# Cahier des charges — Suivi de présence et relecture croisée KFOKAM48

Auteur : 207 · Version 2 · Frontend choisi : React (Vite + TypeScript), parce que trois écrans simples sans rendu serveur ne justifient pas Next.js, et Vite donne un build rapide et reproductible.

> Version 2 : remplace la version 1, qui décrivait une pile Node/Express/Prisma avec authentification JWT. Cette version contredisait les contraintes imposées (backend Spring Boot) et la réponse du client en Q1.

## 1. Contexte et objectif

La direction de la formation KFOKAM48 suit aujourd'hui la présence, les exercices et les relectures entre pairs sans outil commun. Le formateur ne sait pas en temps réel qui était présent, qui a rendu son exercice ni quelles relectures restent à faire.

L'application doit permettre :
- au formateur d'ouvrir une session de cours qui produit un code de présence ;
- à l'étudiant de marquer sa présence avec ce code, puis de déposer le lien de son exercice ;
- à un pair tiré au sort de relire cet exercice, avec une note et un commentaire ;
- au formateur de consulter un tableau par étudiant : présences, exercices déposés, moyenne des notes reçues, relectures encore à faire.

## 2. Acteurs et rôles

| Acteur | Ce qu'il peut faire |
|---|---|
| Formateur | Ouvrir une session et obtenir son code (EF1) · ajouter une présence à la main (EF3) · clôturer une session (EF10) · consulter le tableau de sa promotion (EF7) |
| Étudiant | Choisir son nom dans une liste (EF8) · marquer sa présence avec un code (EF2) · déposer ou remplacer le lien de son exercice (EF4) · consulter la note reçue (EF9) |
| Relecteur | Un étudiant présent, désigné par le système (EF5). Il rend une note et un commentaire sur l'exercice qui lui est attribué (EF6) |
| Système | Génère le code de session, tire au sort le relecteur, calcule la moyenne |

Il n'y a ni administrateur ni visiteur anonyme. Les promotions et les étudiants sont chargés comme données de démonstration (voir §3).

## 3. Périmètre

**Inclus :**
- ouverture et clôture de session, avec code de présence de 6 caractères valable 15 minutes ;
- présence par code, et présence ajoutée par le formateur (tracée) ;
- dépôt d'un lien d'exercice (un par étudiant et par session), remplaçable avant la relecture ;
- attribution automatique d'un relecteur unique et relecture notée ;
- tableau de suivi par promotion ;
- trois écrans : formateur, étudiant, relecteur ;
- données de démonstration chargées au démarrage.

**Exclu :**
- authentification, mots de passe, rôles et sessions de connexion (Q1) ;
- gestion des promotions et des étudiants par l'interface (création, modification, suppression) : ils sont fournis par une migration de démonstration ;
- dépôt de fichiers : seul un lien est accepté ;
- réattribution manuelle d'un relecteur, pluralité de relecteurs (Q6) ;
- correction ou surcharge de la note par le formateur ;
- export CSV/PDF, notifications, application mobile native.

## 4. Exigences fonctionnelles

| Réf | Exigence | Critère d'acceptation | Priorité |
|---|---|---|---|
| EF1 | Le formateur ouvre une session et obtient un code de présence | Quand il envoie `POST /api/sessions { titre, promotionId }`, il reçoit `201 { id, code, ouvertureAt, expirationAt }`, avec `expirationAt = ouvertureAt + 15 min`. S'il manque un champ ou si la promotion est inconnue, il reçoit `400` | Must |
| EF2 | L'étudiant marque sa présence avec un code | Quand il saisit un code valide et non expiré, il reçoit `201 { id, sessionId, etudiantId, source: "ETUDIANT" }` et sa présence apparaît dans le tableau. Code inconnu → `400`, déjà présent → `409`, code expiré → `410` | Must |
| EF3 | Le formateur ajoute une présence à la main | Quand il ajoute la présence d'un étudiant (`POST /api/sessions/{id}/presences`), elle est enregistrée avec `source = "FORMATEUR"` et le tableau l'affiche « ajouté par le formateur » | Should |
| EF4 | L'étudiant dépose le lien de son exercice | Quand il envoie `POST /api/exercices { sessionId, etudiantId, lien }` avec une URL http(s), il reçoit `201 { id, statut }`. Lien invalide → `400`, exercice déjà déposé → `409` | Must |
| EF5 | Le système attribue un relecteur à chaque exercice | Quand un exercice est déposé et qu'au moins un autre étudiant est présent à la session, exactement une relecture est créée pour un présent tiré au hasard, jamais l'auteur | Must |
| EF6 | Le relecteur rend une note et un commentaire | Quand il envoie `POST /api/relectures/{id} { note, commentaire }` avec une note entière de 0 à 20, il reçoit `200` et l'exercice passe à « relu ». Note invalide → `400`, propre exercice → `403`, déjà rendue → `409` | Must |
| EF7 | Le formateur voit le tableau de suivi d'une promotion | Quand il appelle `GET /api/tableau?promotionId=`, il reçoit `200 [ { etudiantId, nom, presences, exercicesDeposes, moyenne, relecturesEnAttente } ]`. Promotion inconnue → `404` | Must |
| EF8 | L'étudiant choisit son nom dans une liste | Quand il ouvre l'écran étudiant, la liste des étudiants de la promotion est chargée depuis l'API. Quand il choisit son nom, ses présences, dépôts et relectures à faire s'affichent | Must |
| EF9 | L'étudiant relu consulte sa note | Quand la relecture de son exercice est rendue, il voit la note et le commentaire. La réponse de l'API ne contient pas l'identité du relecteur | Should |
| EF10 | Le formateur clôture une session | Quand il clôture une session, toute nouvelle présence ou tout nouveau dépôt pour cette session est refusé, et la session apparaît « clôturée » | Should |

## 5. Exigences non fonctionnelles

| Réf | Exigence | Comment on la vérifie |
|---|---|---|
| ENF1 | Volumétrie : jusqu'à 5 promotions de 40 étudiants et 100 sessions par promotion | Le jeu de démonstration contient plusieurs promotions ; le tableau d'une promotion de 40 étudiants s'affiche sans erreur |
| ENF2 | Temps de réponse inférieur à 500 ms pour `POST /api/presences` et `GET /api/tableau`, sur poste local avec les données de démo | Mesure dans l'onglet Réseau du navigateur |
| ENF3 | Usage mobile : l'écran étudiant est utilisable sur un téléphone de 360 px de large, car les étudiants marquent leur présence depuis leur téléphone | Affichage en mode responsive du navigateur, sans défilement horizontal |
| ENF4 | Toute erreur renvoie le format `{ "code", "message" }`, jamais une stack trace ni une page d'erreur Spring | Tests d'intégration sur les cas d'erreur ; requête avec un JSON invalide |
| ENF5 | L'application démarre depuis un clone vierge en trois commandes au plus, avec des données de démonstration | Procédure du README rejouée dans un dossier vide |
| ENF6 | Les tests tournent sans base de données locale | `./mvnw test` passe sans PostgreSQL démarré |
| ENF7 | Chaque état de chargement et d'erreur est visible à l'écran | Couper le backend : chaque écran affiche un message d'erreur, pas une page blanche |

## 6. Règles de gestion

| Réf | Règle | Source |
|---|---|---|
| RG1 | Le code de présence expire 15 minutes après l'ouverture de la session. Passé ce délai, il renvoie `410 CODE_EXPIRE` | Q2 |
| RG2 | Un étudiant ne relit jamais son propre exercice. Une tentative renvoie `403 AUTO_RELECTURE_INTERDITE` | Q5 |
| RG3 | La note est un entier compris entre 0 et 20. Sinon, `400 NOTE_INVALIDE` | Q9 |
| RG4 | Après 5 codes erronés consécutifs, l'étudiant est bloqué 2 minutes (`429 TROP_DE_TENTATIVES`), même s'il saisit ensuite le bon code. Un code correct remet le compteur à zéro. Le blocage est appliqué par l'API | Q4 |
| RG5 | Un étudiant a au plus une présence par session. Une deuxième renvoie `409 DEJA_PRESENT`, quelle que soit la source | Q3, contrat |
| RG6 | Aucune présence par code n'est acceptée après l'expiration du code ou la clôture de la session : `410 CODE_EXPIRE` | Q2, Q3 |
| RG7 | Chaque exercice a au plus un relecteur, tiré au hasard parmi les étudiants présents à la session, auteur exclu. L'attribution a lieu au dépôt | Q6, Q7 |
| RG8 | Le dépôt d'un exercice est accepté après l'expiration du code, tant que le formateur n'a pas clôturé la session | Q12 |
| RG9 | Un étudiant dépose au plus un exercice par session (`409 EXERCICE_DEJA_DEPOSE`). Il peut en remplacer le lien tant que la relecture n'est pas rendue | Q13, contrat |
| RG10 | Une relecture rendue est définitive : une nouvelle soumission renvoie `409 RELECTURE_DEJA_RENDUE` | Q15, contrat (voir §7) |
| RG11 | Une présence ajoutée par le formateur porte `source = FORMATEUR`. Elle est acceptée même après l'expiration du code | Q14 |
| RG12 | L'étudiant relu voit sa note et le commentaire, jamais l'identité du relecteur | Q8 |
| RG13 | Un exercice sans relecture rendue reste « en attente » et apparaît comme tel dans le tableau du formateur | Q11 |
| RG14 | La moyenne d'un étudiant est la moyenne des notes reçues sur ses exercices, arrondie au dixième et calculée par l'API. Sans note reçue, elle vaut `null` (affichée « — ») et non 0 | Q16, F3 |

Cycle de vie d'un exercice (diagramme D4) : `DEPOSE` → `EN_RELECTURE` (relecteur attribué) → `RELU` (relecture rendue). Un exercice qui reste `DEPOSE` faute de relecteur disponible est lui aussi « en attente » au sens de RG13.

## 7. Zones d'ombre, hypothèses et contradictions

| Point | Réponse client (Qx) ou hypothèse | Décision retenue | Pourquoi |
|---|---|---|---|
| **Contradiction** : correction d'une note après envoi | Q10 : « oui, tant que la session n'est pas clôturée ». Q15 : « non, une fois validée c'est fini » | Q15 l'emporte : une relecture rendue est définitive (RG10) | Le contrat imposé prévoit `409 relecture déjà rendue` sur `POST /api/relectures/{id}`, ce qui n'a de sens que si la note est définitive. Q15 donne aussi la raison métier (« plus honnête pour tout le monde ») |
| **Trou non vu** : aucun relecteur possible | Q7 tire le relecteur « parmi les présents », mais Q12 autorise le dépôt après la séance et rien n'oblige l'auteur à être présent. Si l'auteur est le seul présent, ou si personne n'est présent, le tirage est impossible | L'exercice est déposé, reste `DEPOSE` sans relecteur et apparaît « en attente » dans le tableau (RG13). Un étudiant absent peut déposer son exercice mais ne sera jamais tiré comme relecteur | Refuser le dépôt pénaliserait l'étudiant pour un fait qui ne dépend pas de lui. Q11 prévoit déjà l'état « en attente » visible par le formateur |
| « Fin de la session » (Q3) | La session n'a pas d'heure de fin dans le contrat | Pour la présence, la fin est l'expiration du code (15 min) ou la clôture, la première des deux (RG6). Pour le dépôt, seule la clôture compte (RG8) | Q2 et Q12 donnent ces deux bornes. Le Q3 « non » et le Q12 « oui » portent sur des actions différentes et ne se contredisent pas |
| « Personne n'a commencé à relire » (Q13) | Le début d'une relecture n'est pas observable : seul l'envoi l'est | Le lien est remplaçable tant que la relecture n'est pas rendue (RG9) | C'est le seul événement que le système enregistre |
| Pas de mot de passe (Q1) | L'étudiant choisit son nom dans une liste | Aucune authentification ; l'identité est l'`etudiantId` choisi dans la liste (EF8) | Décision explicite du client. Le risque d'usurpation est accepté par lui |
| Blocage après 5 erreurs (Q4) | Le contrat n'a pas de code d'erreur pour ce cas | `429 TROP_DE_TENTATIVES`, ajouté au contrat pour `POST /api/presences`, appliqué côté serveur par étudiant (RG4) | 429 est le statut HTTP standard du « trop de requêtes ». Un blocage côté écran seulement serait contournable |
| Où voir « ajouté par le formateur » (Q14) | Q14 : « il faut que ça se voie » | Champ `source` renvoyé par l'API et affiché dans le détail des présences du tableau | Le contrat impose déjà `source = ETUDIANT \| FORMATEUR` |
| Contenu du tableau (Q16 et contrat) | Q16 veut « sa présence à chaque session », le contrat donne un nombre `presences` | Le tableau imposé renvoie le nombre de présences. Le détail par session est fourni par une opération complémentaire | Le contrat est figé. Le détail est un ajout, il ne modifie pas l'opération imposée |
| `relecturesEnAttente` | Q16 : « les relectures qu'il doit encore faire » | Nombre de relectures attribuées à l'étudiant **en tant que relecteur** et non rendues | Lecture littérale de Q16 |
| Commentaire de relecture | Aucune question ne le précise | Obligatoire, 5 caractères minimum après suppression des espaces (`400 COMMENTAIRE_INVALIDE`) | Une relecture sans commentaire n'aide pas l'étudiant relu |
| Code de présence inconnu | Contrat : `400` | `400 CODE_INCONNU`. Chaque code inconnu compte comme une erreur pour RG4 | C'est exactement le cas que Q4 veut empêcher |
| Q6 | Un seul relecteur | Repris tel quel (RG7) | — |
| Qui rend la relecture ? (403 du contrat) | Sans authentification (Q1), l'API ne sait pas qui appelle `POST /api/relectures/{id}` | Le corps accepte un `relecteurId` facultatif, choisi dans la liste. S'il désigne l'auteur de l'exercice → `403 AUTO_RELECTURE_INTERDITE` (RG2) ; s'il désigne un autre étudiant que le relecteur attribué → `403 RELECTURE_NON_ATTRIBUEE` | Le 403 imposé n'a de sens que si l'appelant est identifié. Le champ est facultatif pour ne pas casser le corps imposé `{ note, commentaire }` |
| 400 ou 404 pour une référence inconnue | Le contrat donne `400 code inconnu` sur `POST /api/presences` et `404 promotion inconnue` sur `GET /api/tableau?promotionId=` | Une référence inconnue dans le **corps** renvoie 400 ; une ressource inconnue désignée par l'**URL** (chemin ou paramètre) renvoie 404 | C'est la règle qui rend les deux cas imposés cohérents ; elle s'applique à toutes les opérations ajoutées |
| Présence manuelle (Q14) | Le code peut avoir expiré quand le formateur ajoute l'étudiant | Opération distincte `POST /api/sessions/{id}/presences { etudiantId }`, qui ne passe pas par le code | L'opération imposée `POST /api/presences` reste celle de l'étudiant, avec ses 409/410 inchangés |

## 8. Contraintes techniques

- **B1** : backend Java 17, Spring Boot, Maven, wrapper `mvnw` commité.
- **B2** : `api/contrat.yaml` respecté à la lettre (chemins, verbes, codes de statut) ; erreurs au format `{ "code", "message" }`.
- **B3** : couches contrôleur, service et repository séparées ; aucune requête en base dans un contrôleur ; aucune entité JPA exposée, uniquement des DTO.
- **B4** : validation des entrées et gestion centralisée des erreurs par `@RestControllerAdvice` ; aucune stack trace renvoyée.
- **B5** : schéma PostgreSQL versionné par Flyway, migrations commitées ; `ddl-auto` jamais à `update` hors tests.
- **B6** : un test unitaire sur une règle métier réelle et un test d'intégration sur un endpoint, qui tournent sans base locale.
- **F1** : frontend React (Vite, TypeScript) déclaré et justifié dans le README ; `npm run build` passe.
- **F2** : trois écrans : formateur, étudiant, relecteur.
- **F3** : appels API regroupés dans une couche dédiée ; états de chargement et d'erreur gérés ; aucune règle métier recalculée côté front.
- **Démarrage** : `docker compose up` ou trois commandes au plus, avec données de démonstration.
- **Diagrammes** : Mermaid en texte dans `docs/diagrammes/`.

## 9. Livrables

| Livrable | Emplacement |
|---|---|
| Cahier des charges (ce document) | `docs/CAHIER_DES_CHARGES.md` |
| D1 cas d'utilisation, D2 modèle de données, D3 séquence « marquer sa présence », D4 états d'un exercice (bonus) | `docs/diagrammes/` |
| Contrat d'API complété | `api/contrat.yaml` |
| Backlog | Issues GitHub du dépôt, rattachées aux EFx et RGx |
| Backend Spring Boot, migrations Flyway, tests | `backend/` |
| Frontend React | `frontend/` |
| Journal de bord, une entrée par étape | `docs/JOURNAL.md` |
| README d'installation, CHANGELOG | racine du dépôt |
| Fichier de soumission | `SOUMISSION.md`, déposé sur la plateforme |

## 10. Démarche prévue

1. **Analyse et conception** : ce cahier des charges, les diagrammes D1 à D4, le backlog en issues (une issue par résultat utilisateur, avec critères « quand … alors … », priorité et renvoi EFx/RGx), le contrat complété. Commit `[JALON] analyse`.
2. **Première version** : issues Must uniquement (EF1, EF2, EF4 à EF8). Une branche par issue, une PR par branche, un commit qui ferme l'issue (`Closes #n`) en citant la règle. Commit `[JALON] v0.1`.
3. **Enveloppe** : ouverture d'une issue par point avant de coder ; reproduction du bug par un test ; nouvelle migration Flyway ; contrat, cahier des charges et diagrammes mis à jour dans un commit dédié ; correctif et évolution dans des branches séparées ; repriorisation écrite dans les issues.
4. **Version finale** : issues Should restantes, CHANGELOG, README testé depuis un clone vierge, backlog restant trié. Commit `[JALON] v1.0`.
5. **Soumission** : `SOUMISSION.md` avec le hash complet du dernier commit poussé.

Le journal reçoit une entrée à la fin de chaque étape, dans le même mouvement.

**Definition of Done** : une issue est terminée quand chacun de ses critères d'acceptation est vérifié ; quand la règle RGx concernée est couverte par un test ou vérifiée à la main ; quand le code d'erreur renvoyé correspond au contrat ; quand la PR est fusionnée dans `main` sans casser `./mvnw test` ni `npm run build` ; et quand l'issue est fermée par le commit qui la cite.
