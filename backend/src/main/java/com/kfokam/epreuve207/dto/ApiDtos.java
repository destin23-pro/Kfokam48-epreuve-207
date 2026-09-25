package com.kfokam.epreuve207.dto;

import lombok.Data;
import java.time.LocalDateTime;

public class ApiDtos {

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
    }

    @Data
    public static class PresenceRequest {
        private String code;
        private Long etudiantId;
    }

    @Data
    public static class PresenceResponse {
        private Long id;
        private Long sessionId;
        private Long etudiantId;
        private String source;
    }

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
    }

    @Data
    public static class RelectureRequest {
        private Integer note;
        private String commentaire;
    }

    @Data
    public static class TableauItemResponse {
        private Long etudiantId;
        private String nom;
        private Integer presences;
        private Integer exercicesDeposes;
        private Double moyenne;
        private Integer relecturesEnAttente;
    }

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
