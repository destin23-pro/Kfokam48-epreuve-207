# D4 — États-transitions d'un exercice

Valeurs de `exercices.status` (migration V3). Les statuts `VALIDE`, `EN_RETARD` et `ANNULE` viennent de V1 : ils sont conservés en base mais ne sont jamais produits par l'application.

```mermaid
stateDiagram-v2
    [*] --> DEPOSE : dépôt du lien, session non clôturée (EF4, RG8)

    state choix <<choice>>
    DEPOSE --> choix : tirage du relecteur (EF5)
    choix --> EN_RELECTURE : au moins un autre présent, 1 ou 2 relectures créées (RG7, RG2)
    choix --> DEPOSE : aucun autre présent, reste en attente (RG13)

    DEPOSE --> DEPOSE : remplacement du lien (RG9)
    EN_RELECTURE --> EN_RELECTURE : remplacement du lien (RG9)

    EN_RELECTURE --> EN_RELECTURE : 1re relecture rendue, note provisoire (RG15)
    EN_RELECTURE --> RELU : toutes les relectures rendues, note = moyenne (RG14)
    RELU --> [*]

    note right of DEPOSE
        « en attente » dans le tableau
        du formateur (RG13, Q11)
    end note
    note right of EN_RELECTURE
        « en attente » tant que
        le relecteur n'a pas rendu
    end note
    note right of RELU
        État final : la note est définitive,
        et le lien n'est plus remplaçable (RG10, RG9)
    end note
```

| Transition | Déclencheur | Refus possible |
|---|---|---|
| → DEPOSE | Dépôt d'un lien | 400 `LIEN_INVALIDE`, 409 `EXERCICE_DEJA_DEPOSE`, session clôturée |
| DEPOSE → EN_RELECTURE | Dépôt, si un autre étudiant est présent | — |
| DEPOSE ou EN_RELECTURE → lui-même | Remplacement du lien | — |
| EN_RELECTURE → EN_RELECTURE | Première des deux relectures rendue : note provisoire (RG15) | 400 `NOTE_INVALIDE` |
| EN_RELECTURE → RELU | Dernière relecture attribuée rendue : note = moyenne (RG14) | 400 `NOTE_INVALIDE`, 403 `AUTO_RELECTURE_INTERDITE` |
| Depuis RELU | Nouvelle relecture ou remplacement du lien | 409 `RELECTURE_DEJA_RENDUE`, 409 `EXERCICE_DEJA_RELU` |
