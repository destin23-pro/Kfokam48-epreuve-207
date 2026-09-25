package com.kfokam.epreuve207.exception;

import com.kfokam.epreuve207.dto.ApiDtos.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Gestion centralisée des erreurs (B4) : toute erreur renvoie le format imposé
 * { "code": ..., "message": ... } et jamais de stack trace au client.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Mapping des codes métier vers les codes HTTP du contrat d'API. */
    private static HttpStatus mapToHttpStatus(String code) {
        return switch (code) {
            // 410 Gone : code expiré (contrat /api/presences)
            case "CODE_EXPIRE" -> HttpStatus.GONE;
            // 409 Conflict : doublons métier
            case "DEJA_PRESENT", "EXERCICE_DEJA_DEPOSE", "DEJA_RELATURE" -> HttpStatus.CONFLICT;
            // 404 Not Found : ressources inconnues
            case "PROMOTION_INCONNUE", "PROMOTION_INEXISTANTE",
                    "SESSION_INCONNUE", "SESSION_INVALIDE",
                    "ETUDIANT_INCONNU", "EXERCICE_INCONNU",
                    "RELECTURE_INCONNUE", "PRESENCE_INCONNUE" -> HttpStatus.NOT_FOUND;
            // 400 Bad Request : entrées invalides / champs manquants
            case "TITRE_REQUIS", "PROMOTION_REQUISE", "CODE_REQUIS", "ETUDIANT_REQUIS",
                    "SESSION_REQUISE", "CODE_INCONNU", "SESSION_FERMEE", "SOURCE_INVALIDE",
                    "LIEN_INVALIDE", "NOTE_INVALIDE", "COMMENTAIRE_INVALIDE",
                    "REQUETE_INVALIDE", "JSON_INVALIDE" -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.BAD_REQUEST;
        };
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        ErrorResponse error = new ErrorResponse(ex.getCode(), ex.getMessage());
        return ResponseEntity.status(mapToHttpStatus(ex.getCode())).body(error);
    }

    /** Corps JSON illisible ou non conforme au type attendu (ex : note décimale). */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableBody(HttpMessageNotReadableException ex) {
        ErrorResponse error = new ErrorResponse("JSON_INVALIDE", "Le corps de la requête est invalide ou mal formé.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        ErrorResponse error = new ErrorResponse("REQUETE_INVALIDE", "Des champs requis sont manquants ou invalides.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler({MissingServletRequestParameterException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> handleMissingParam(Exception ex) {
        ErrorResponse error = new ErrorResponse("REQUETE_INVALIDE", "Un paramètre de la requête est manquant ou invalide.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /** Contrainte unique violée (ex : double émargement) malgré un contrôle concurrent. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
        ErrorResponse error = new ErrorResponse("CONFLIT_DONNEES", "Cette opération viole une contrainte d'intégrité des données.");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /** Route inexistante : 404 au format imposé, et non un 500 générique. */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResource(NoResourceFoundException ex) {
        ErrorResponse error = new ErrorResponse("RESSOURCE_INCONNUE", "Cette route n'existe pas : " + ex.getResourcePath());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /** Verbe HTTP non prévu par le contrat : 405 au format imposé. */
    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(org.springframework.web.HttpRequestMethodNotSupportedException ex) {
        ErrorResponse error = new ErrorResponse("METHODE_NON_AUTORISEE", "Méthode " + ex.getMethod() + " non prise en charge sur cette route.");
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(error);
    }

    /** Filet de sécurité : message générique au client, stack trace dans les logs serveur uniquement. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Erreur non gérée", ex);
        ErrorResponse error = new ErrorResponse("GENERIC_ERROR", "Une erreur interne est survenue.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
