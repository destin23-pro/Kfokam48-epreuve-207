# D3 — Séquence : marquer sa présence

Opération `POST /api/presences { code, etudiantId }` du contrat. Les statuts et les codes d'erreur sont ceux de `api/contrat.yaml`. Toutes les erreurs passent par `GlobalExceptionHandler` et renvoient le format `{ code, message }`.

```mermaid
sequenceDiagram
    autonumber
    actor E as Étudiant
    participant F as Front (lib/api.ts)
    participant C as PresenceController
    participant S as PresenceService
    participant SR as SessionRepository
    participant PR as PresenceRepository
    participant H as GlobalExceptionHandler

    E->>F: choisit son nom (EF8) et saisit le code
    F->>C: POST /api/presences { code, etudiantId }
    C->>S: markPresence(request)

    alt bloqué : 5 codes erronés dans les 2 dernières minutes (RG4)
        S-->>H: BusinessException TROP_DE_TENTATIVES
        H-->>F: 429 { code: "TROP_DE_TENTATIVES", message }
    else
        S->>SR: findByCode(code)
        alt code inconnu
            SR-->>S: vide
            S->>S: compte une erreur pour l'étudiant (RG4)
            S-->>H: BusinessException CODE_INCONNU
            H-->>F: 400 { code: "CODE_INCONNU", message }
        else session trouvée
            SR-->>S: Session
            alt maintenant > expirationAt ou session clôturée (RG1, RG6)
                S-->>H: BusinessException CODE_EXPIRE
                H-->>F: 410 { code: "CODE_EXPIRE", message }
            else code valide
                S->>PR: findByEtudiantIdAndSessionId(etudiantId, sessionId)
                alt déjà présent (RG5)
                    PR-->>S: présence existante
                    S-->>H: BusinessException DEJA_PRESENT
                    H-->>F: 409 { code: "DEJA_PRESENT", message }
                else cas nominal
                    PR-->>S: aucune
                    S->>PR: save(Presence source=ETUDIANT)
                    S->>S: remet le compteur d'erreurs à zéro (RG4)
                    S-->>C: PresenceResponse (DTO)
                    C-->>F: 201 { id, sessionId, etudiantId, source }
                end
            end
        end
    end
    F-->>E: confirmation ou message d'erreur lisible
```

| Cas | Statut | Code d'erreur | Règle |
|---|---|---|---|
| Cas nominal | 201 | — | EF2 |
| Code inconnu | 400 | `CODE_INCONNU` | contrat, RG4 |
| Déjà présent | 409 | `DEJA_PRESENT` | RG5 |
| Code expiré ou session clôturée | 410 | `CODE_EXPIRE` | RG1, RG6 |
| Trop de tentatives | 429 | `TROP_DE_TENTATIVES` | RG4 (ajouté au contrat) |
