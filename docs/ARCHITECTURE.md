# Conception & Architecture Technique — KFOKAM48

* **Projet** : Système de Suivi des Présences et Évaluations (KFOKAM48)
* **Auteur / Matricule** : 207
* **Date** : 25 Septembre 2026

---

## 1. Architecture Logicielle Globale

L'application repose sur une architecture à 3 tiers :

* **Frontend** : Next.js / React (TypeScript) avec TailwindCSS pour l'interface utilisateur.
* **Backend** : API REST développée avec Node.js / Express gérant la logique métier, la sécurité JWT et l'accès aux données.
* **Base de données** : PostgreSQL gérée via l'ORM Prisma.

---

## 2. Diagrammes UML (Mermaid)

### D1 : Diagramme de Cas d'Utilisation

```mermaid
graph TD
    user((Utilisateur))
    etudiant((Étudiant))
    enseignant((Enseignant))
    admin((Administrateur))

    user <|-- etudiant
    user <|-- enseignant
    user <|-- admin

    user --> (S'authentifier / Connexion JWT)

    etudiant --> (S'émarger / Marquer présence via Code)
    etudiant --> (Soumettre un Exercice)
    etudiant --> (Effectuer une Relecture par les Pairs)
    etudiant --> (Consulter ses Notes & Présences)

    enseignant --> (Ouvrir / Fermer une Session de Cours)
    enseignant --> (Publier un Sujet d'Exercice)
    enseignant --> (Assigner les Relectures)
    enseignant --> (Évaluer / Ajuster les Notes)
    enseignant --> (Consulter le Tableau de Suivi Global)

    admin --> (Gérer les Utilisateurs et Rôles)
```

### D2 : Diagramme de Classes

```mermaid
classDiagram
    class User {
        +String id
        +String email
        +String passwordHash
        +String nom
        +String prenom
        +Role role
    }

    class Session {
        +String id
        +String intitule
        +String codeValidation
        +DateTime dateDebut
        +DateTime dateFin
        +StatutSession statut
    }

    class Presence {
        +String id
        +String sessionId
        +String etudiantId
        +DateTime horodatage
        +StatutPresence statut
    }

    class Exercice {
        +String id
        +String titre
        +String description
        +DateTime deadline
    }

    class Soumission {
        +String id
        +String exerciceId
        +String etudiantId
        +String contenuUrl
        +DateTime horodatage
    }

    class Relecture {
        +String id
        +String soumissionId
        +String correcteurId
        +Float note
        +String commentaire
    }

    User "1" -- "0..*" Session : cree
    User "1" -- "0..*" Presence : emarge
    Session "1" -- "0..*" Presence : contient
    Session "1" -- "0..*" Exercice : comporte
    User "1" -- "0..*" Soumission : soumet
    Exercice "1" -- "0..*" Soumission : recoit
    Soumission "1" -- "0..*" Relecture : evaluee_par
    User "1" -- "0..*" Relecture : corrige
```

### D3 : Diagramme de Séquence

```mermaid
sequenceDiagram
    autonumber
    actor E as Étudiant
    participant FE as Frontend (Next.js)
    participant BE as Backend (API Express)
    participant DB as Base de Données (PostgreSQL)

    E->>FE: Saisit le code de présence (ex: KFK-207-A9X)
    FE->>BE: POST /api/presences { codeValidation } + Header JWT
    BE->>BE: Vérification du token JWT
    BE->>DB: Rechercher la session active correspondant au code
    DB-->>BE: Retourne la Session

    alt Session active
        BE->>DB: INSERT INTO Presence (sessionId, etudiantId)
        DB-->>BE: Confirmation enregistrement
        BE-->>FE: HTTP 201 Created ("Présence enregistrée")
        FE-->>E: Affiche confirmation de présence
    else Session inactive ou expirée
        BE-->>FE: HTTP 400 Bad Request ("Code invalide")
        FE-->>E: Affiche message d'erreur
    end
```
