package com.kfokam.epreuve207.service;

import com.kfokam.epreuve207.dto.ApiDtos.SessionRequest;
import com.kfokam.epreuve207.dto.ApiDtos.SessionResponse;
import com.kfokam.epreuve207.exception.BusinessException;
import com.kfokam.epreuve207.model.Promotion;
import com.kfokam.epreuve207.model.Session;
import com.kfokam.epreuve207.model.SessionStatus;
import com.kfokam.epreuve207.repository.PromotionRepository;
import com.kfokam.epreuve207.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionService {

    private static final long SESSION_DURATION_MINUTES = 15;
    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final SessionRepository sessionRepository;
    private final PromotionRepository promotionRepository;

    /**
     * RG1 / Q2 : génère un code unique de 6 caractères valide 15 minutes.
     */
    private String generateSessionCode() {
        StringBuilder code = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            code.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
        }
        return code.toString();
    }

    /**
     * Vérifie si une session existe et est bien ouverte et valide
     */
    private Session validateSessionOpen(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException(
                        "SESSION_INVALIDE",
                        "La session demandée n'existe pas ou n'est pas ouverte."
                ));
    }

    /**
     * POST /api/sessions : crée une nouvelle session de cours.
     */
    @Transactional
    public SessionResponse ouvrirSession(SessionRequest request) {
        if (request.getTitre() == null || request.getTitre().isBlank()) {
            throw new BusinessException(
                    "TITRE_REQUIS",
                    "Le titre de la session est requis."
            );
        }
        if (request.getPromotionId() == null) {
            throw new BusinessException(
                    "PROMOTION_REQUISE",
                    "L'identifiant de la promotion est requis."
            );
        }

        Promotion promotion = promotionRepository.findById(request.getPromotionId())
                .orElseThrow(() -> new BusinessException(
                        "PROMOTION_INCONNUE",
                        "La promotion demandée n'existe pas."
                ));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expirationAt = now.plusMinutes(SESSION_DURATION_MINUTES);

        Session session = Session.builder()
                .titre(request.getTitre())
                .code(generateSessionCode())
                .ouvertureAt(now)
                .expirationAt(expirationAt)
                .status(SessionStatus.OUVERTE)
                .promotion(promotion)
                .teacherId(null) // À lier à l'enseignant authentifié le jour où l'auth existe
                .build();

        sessionRepository.save(session);

        return mapToResponse(session);
    }

    /**
     * RG1 : trouve une session par son code d'émargement.
     */
    public Session findByCode(String code) {
        return sessionRepository.findByCode(code)
                .orElseThrow(() -> new BusinessException(
                        "CODE_INCONNU",
                        "Le code de session est inconnu."
                ));
    }

    /**
     * Ferme une session manuellement (par l'enseignant)
     */
    @Transactional
    public SessionResponse fermerSession(Long sessionId) {
        Session session = validateSessionOpen(sessionId);
        session.setStatus(SessionStatus.FERMEE);
        session.setExpirationAt(LocalDateTime.now());
        sessionRepository.save(session);
        return mapToResponse(session);
    }

    public java.util.Optional<Session> getSessionById(Long sessionId) {
        return sessionRepository.findById(sessionId);
    }

    public boolean isSessionActive(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .map(Session::isOpen)
                .orElse(false);
    }

    /**
     * GET /api/sessions : historique pour le formateur et la vue étudiante.
     */
    public List<SessionResponse> listAll() {
        return sessionRepository.findAllByOrderByOuvertureAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private SessionResponse mapToResponse(Session session) {
        SessionResponse response = new SessionResponse();
        response.setId(session.getId());
        response.setCode(session.getCode());
        response.setOuvertureAt(session.getOuvertureAt());
        response.setExpirationAt(session.getExpirationAt());
        response.setTitre(session.getTitre());
        response.setPromotionId(session.getPromotion().getId());
        response.setStatus(session.getStatus().name());
        return response;
    }
}
