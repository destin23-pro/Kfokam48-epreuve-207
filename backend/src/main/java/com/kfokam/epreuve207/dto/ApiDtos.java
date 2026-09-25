package com.kfokam.epreuve207.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTOs de l'API KFOKAM48. Aucune entité JPA n'est exposée en JSON (B3) :
 * contrôleurs et services échangent exclusivement ces objets.
 */
public class ApiDtos {

    // -----------------------------------------------------------
    // Sessions
    // -----------------------------------------------------------
    @Data
    public static class SessionRequest {
        private String titre;
        private Long promotionId;
    }

    @Data
    public static class SessionResponse {
        private Long id;
        private String code;
        private LocalDateTime ouvertureAt;
        private LocalDateTime expirationAt;
        private String titre;
        private Long promotionId;
        private String status;
    }

    // -----------------------------------------------------------
    // Présences
    // -----------------------------------------------------------
    @Data
    public static class PresenceRequest {
        private String code;
        private Long etudiantId;
        /** Optionnel : ETUDIANT (défaut) pour l'étudiant, FORMATEUR pour une saisie manuelle (Q14). */
        private String source;
    }

    @Data
    public static class PresenceResponse {
        private Long id;
        private Long sessionId;
        private Long etudiantId;
        private String source;
    }

    // -----------------------------------------------------------
    // Exercices
    // -----------------------------------------------------------
    @Data
    public static class ExerciceRequest {
        private Long sessionId;
        private Long etudiantId;
        private String lien;
    }

    @Data
    public static class ExerciceResponse {
        private Long id;
        private String statut;
        private Long sessionId;
        private Long etudiantId;
        private String lien;
        private LocalDateTime soumissionAt;
        /** RG14 : moyenne des notes rendues, null si aucune. */
        private Double note;
        /** RG15 : true si une seule des deux relectures est rendue. */
        private boolean noteProvisoire;
        private int relecturesRendues;
        /** Commentaires rendus, sans l'identité des relecteurs (RG12). */
        private java.util.List<String> commentaires;
    }

    // -----------------------------------------------------------
    // Relectures
    // -----------------------------------------------------------
    @Data
    public static class RelectureRequest {
        private Integer note;
        private String commentaire;
    }

    @Data
    public static class RelectureResponse {
        private Long id;
        private Long exerciceId;
        private Long etudiantId;
        private Integer note;
        private String commentaire;
        private LocalDateTime soumissionAt;
        private String statut;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelectureItemResponse {
        private Long id;
        private Long exerciceId;
        private String exerciceTitre;
        private String exerciceLien;
        private Long auteurEtudiantId;
        private String auteurNom;
        private Long sessionId;
        private String sessionTitre;
        private String statut; // EN_ATTENTE | REALISE
        private Integer note;
        private String commentaire;
    }

    // -----------------------------------------------------------
    // Référentiels (lectures libres en plus du contrat imposé)
    // -----------------------------------------------------------
    @Data
    public static class PromotionResponse {
        private Long id;
        private String nom;
    }

    @Data
    public static class EtudiantResponse {
        private Long id;
        private String nom;
        private String prenom;
        private String email;
        private Long promotionId;
    }

    // -----------------------------------------------------------
    // Tableau de bord (GET /api/tableau retourne une liste)
    // -----------------------------------------------------------
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TableauItemResponse {
        private Long etudiantId;
        private String nom;
        private Integer presences;
        private Integer exercicesDeposes;
        private Double moyenne;
        private Integer relecturesEnAttente;
    }

    // -----------------------------------------------------------
    // Erreurs (format imposé par le contrat)
    // -----------------------------------------------------------
    @Data
    public static class ErrorResponse {
        private String code;
        private String message;

        public ErrorResponse(String code, String message) {
            this.code = code;
            this.message = message;
        }
    }
}
