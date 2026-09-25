# D1 — Cas d'utilisation

Mermaid n'a pas de type « cas d'utilisation » : les acteurs sont à gauche, les cas d'utilisation (ovales) sont regroupés dans le cadre du système. Chaque cas renvoie à son exigence EFx du cahier des charges.

```mermaid
flowchart LR
    F["👤 Formateur"]
    E["👤 Étudiant"]
    R["👤 Relecteur<br/>(étudiant présent)"]
    S["⚙️ Système"]

    E -.->|est un| R

    subgraph APP["Application KFOKAM48"]
        UC1(["Ouvrir une session<br/>et obtenir un code — EF1"])
        UC3(["Ajouter une présence<br/>à la main — EF3"])
        UC10(["Clôturer une session — EF10"])
        UC7(["Consulter le tableau<br/>de la promotion — EF7"])

        UC8(["Choisir son nom<br/>dans une liste — EF8"])
        UC2(["Marquer sa présence<br/>avec un code — EF2"])
        UC4(["Déposer / remplacer le lien<br/>de son exercice — EF4"])
        UC9(["Consulter sa note — EF9"])

        UC5(["Attribuer un relecteur<br/>au hasard — EF5"])
        UC6(["Rendre une note<br/>et un commentaire — EF6"])
    end

    F --- UC1
    F --- UC3
    F --- UC10
    F --- UC7

    E --- UC8
    E --- UC2
    E --- UC4
    E --- UC9

    R --- UC6
    S --- UC5

    UC4 -.->|include| UC5
    UC2 -.->|include| UC8
```

| Acteur | Cas d'utilisation | Règles principales |
|---|---|---|
| Formateur | EF1, EF3, EF7, EF10 | RG1, RG11, RG13, RG14 |
| Étudiant | EF2, EF4, EF8, EF9 | RG1, RG4, RG5, RG6, RG8, RG9, RG12 |
| Relecteur | EF6 | RG2, RG3, RG10 |
| Système | EF5 (déclenché par le dépôt EF4) | RG2, RG7 |

Il n'y a pas de cas « se connecter » : pas d'authentification (Q1).
