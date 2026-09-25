package com.kfokam.epreuve207.service;

import com.kfokam.epreuve207.dto.ApiDtos.PresenceRequest;
import com.kfokam.epreuve207.dto.ApiDtos.PresenceResponse;
import com.kfokam.epreuve207.exception.BusinessException;
import com.kfokam.epreuve207.model.Etudiant;
import com.kfokam.epreuve207.model.Presence;
import com.kfokam.epreuve207.model.PresenceStatus;
import com.kfokam.epreuve207.model.Session;
import com.kfokam.epreuve207.repository.EtudiantRepository;
import com.kfokam.epreuve207.repository.PresenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * RG4 (Q4) : après 5 codes erronés consécutifs, blocage 2 minutes (contrôlé côté client).
 * RG5 (Q3) : une seule présence par étudiant et par session.
 */
@Service
@RequiredArgsConstructor
public class PresenceService {

    private final PresenceRepository presenceRepository;
    private final SessionService sessionService;
    private final EtudiantRepository etudiantRepository;

    private Etudiant getEtudiant(Long etudiantId) {
        return etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new BusinessException(
                        "ETUDIANT_INCONNU",
                        "L'identifiant de l'étudiant est invalide."
                ));
    }

    /**
     * POST /api/presences : un étudiant marque sa présence avec le code de session.
     * Erreurs du contrat : 400 code inconnu · 409 déjà présent · 410 code expiré.
     */
    @Transactional
    public PresenceResponse markPresence(PresenceRequest request) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new BusinessException("CODE_REQUIS", "Le code de session est requis.");
        }
        if (request.getEtudiantId() == null) {
            throw new BusinessException("ETUDIANT_REQUIS", "L'identifiant de l'étudiant est requis.");
        }

        Session session = sessionService.findByCode(request.getCode().trim().toUpperCase());

        if (session.isExpired()) {
            throw new BusinessException(
                    "CODE_EXPIRE",
                    "Le code de présence a expiré."
            );
        }
        if (session.getStatus() != com.kfokam.epreuve207.model.SessionStatus.OUVERTE) {
            throw new BusinessException(
                    "SESSION_FERMEE",
                    "La session est fermée, l'émargement n'est plus possible."
            );
        }

        Etudiant etudiant = getEtudiant(request.getEtudiantId());

        // RG5 : un seul émargement par (étudiant, session)
        if (!presenceRepository.findByEtudiantIdAndSessionId(etudiant.getId(), session.getId()).isEmpty()) {
            throw new BusinessException(
                    "DEJA_PRESENT",
                    "Cet étudiant a déjà émargé pour cette session."
            );
        }

        // Q14 : source ETUDIANT par défaut, FORMATEUR pour une saisie manuelle.
        String source = request.getSource() == null ? "ETUDIANT" : request.getSource().trim().toUpperCase();
        if (!source.equals("ETUDIANT") && !source.equals("FORMATEUR")) {
            throw new BusinessException("SOURCE_INVALIDE", "La source doit être ETUDIANT ou FORMATEUR.");
        }

        Presence presence = Presence.builder()
                .session(session)
                .etudiant(etudiant)
                .timestamp(LocalDateTime.now())
                .status(PresenceStatus.PRESENT)
                .source(source)
                .build();

        presenceRepository.save(presence);

        return mapToResponse(presence);
    }

    public Presence getPresence(Long presenceId) {
        return presenceRepository.findById(presenceId)
                .orElseThrow(() -> new BusinessException(
                        "PRESENCE_INCONNUE",
                        "La présence demandée n'existe pas."
                ));
    }

    public PresenceResponse mapToResponse(Presence presence) {
        PresenceResponse response = new PresenceResponse();
        response.setId(presence.getId());
        response.setSessionId(presence.getSession().getId());
        response.setEtudiantId(presence.getEtudiant().getId());
        response.setSource(presence.getSource());
        return response;
    }
}
