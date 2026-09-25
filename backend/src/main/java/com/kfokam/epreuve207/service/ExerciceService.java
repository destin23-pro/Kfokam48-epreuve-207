package com.kfokam.epreuve207.service;

import com.kfokam.epreuve207.dto.ApiDtos.ExerciceRequest;
import com.kfokam.epreuve207.dto.ApiDtos.ExerciceResponse;
import com.kfokam.epreuve207.exception.BusinessException;
import com.kfokam.epreuve207.model.Etudiant;
import com.kfokam.epreuve207.model.Exercice;
import com.kfokam.epreuve207.model.ExerciceStatus;
import com.kfokam.epreuve207.model.Presence;
import com.kfokam.epreuve207.model.Relecture;
import com.kfokam.epreuve207.model.RelectureStatus;
import com.kfokam.epreuve207.model.Session;
import com.kfokam.epreuve207.model.SessionStatus;
import com.kfokam.epreuve207.repository.EtudiantRepository;
import com.kfokam.epreuve207.repository.ExerciceRepository;
import com.kfokam.epreuve207.repository.PresenceRepository;
import com.kfokam.epreuve207.repository.RelectureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;

/**
 * RG6 (Q12) : un exercice peut etre depose apres la fin de la session, tant que le
 * formateur n'a pas cloture la session manuellement.
 * RG7 (Q7) : le systeme choisit au hasard le relecteur parmi les etudiants presents.
 */
@Service
@RequiredArgsConstructor
public class ExerciceService {

    private static final Pattern URL_PATTERN = Pattern.compile("^https?://.+", Pattern.CASE_INSENSITIVE);

    private final ExerciceRepository exerciceRepository;
    private final SessionService sessionService;
    private final EtudiantRepository etudiantRepository;
    private final PresenceRepository presenceRepository;
    private final RelectureRepository relectureRepository;

    private Session getValidSession(Long sessionId) {
        return sessionService.getSessionById(sessionId)
                .orElseThrow(() -> new BusinessException(
                        "SESSION_INCONNUE",
                        "La session demandee n'existe pas."
                ));
    }

    private Etudiant getEtudiant(Long etudiantId) {
        return etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new BusinessException(
                        "ETUDIANT_INCONNU",
                        "L'identifiant de l'etudiant est invalide."
                ));
    }
    /**
     * POST /api/exercices : l'etudiant depose le lien de son exercice.
     * Erreurs du contrat : 400 lien invalide · 409 exercice deja depose.
     */
    @Transactional
    public ExerciceResponse submitExercice(ExerciceRequest request) {
        if (request.getSessionId() == null) {
            throw new BusinessException("SESSION_REQUISE", "L'identifiant de la session est requis.");
        }
        if (request.getEtudiantId() == null) {
            throw new BusinessException("ETUDIANT_REQUIS", "L'identifiant de l'etudiant est requis.");
        }
        if (request.getLien() == null || request.getLien().isBlank()
                || !URL_PATTERN.matcher(request.getLien().trim()).matches()) {
            throw new BusinessException(
                    "LIEN_INVALIDE",
                    "Le lien du rendu est invalide : il doit etre une URL http(s)."
            );
        }

        Session session = getValidSession(request.getSessionId());

        // RG4 (Q3) : pas de depot apres cloture manuelle de la session.
        if (session.getStatus() == SessionStatus.FERMEE) {
            throw new BusinessException("SESSION_FERMEE", "La session est cloturee par le formateur.");
        }

        Etudiant etudiant = getEtudiant(request.getEtudiantId());

        // Contrat : 409 si l'exercice est deja depose pour cette (session, etudiant).
        exerciceRepository.findBySessionIdAndEtudiantId(session.getId(), etudiant.getId())
                .ifPresent(e -> {
                    throw new BusinessException(
                            "EXERCICE_DEJA_DEPOSE",
                            "Cet etudiant a deja depose son exercice pour cette session."
                    );
                });

        Exercice exercice = Exercice.builder()
                .session(session)
                .etudiant(etudiant)
                .lien(request.getLien().trim())
                .soumissionAt(LocalDateTime.now())
                .status(ExerciceStatus.DEPOSE)
                .build();

        exerciceRepository.save(exercice);

        // RG7 (Q7) : assignation aleatoire du relecteur parmi les presents, hors auteur.
        assignerRelecteur(session, etudiant, exercice);

        return mapToResponse(exercice);
    }
    /**
     * RG2 (Q5) + RG7 (Q7) : un seul relecteur, tire au hasard parmi les presences
     * de la session, jamais l'auteur lui-meme. Si personne d'autre n'est present,
     * l'exercice reste en attente (Q11).
     */
    private void assignerRelecteur(Session session, Etudiant auteur, Exercice exercice) {
        List<Etudiant> presents = presenceRepository.findAllBySessionId(session.getId())
                .stream()
                .map(Presence::getEtudiant)
                .filter(e -> !e.getId().equals(auteur.getId()))
                .distinct()
                .toList();

        if (presents.isEmpty()) {
            return; // aucun relecteur disponible : l'exercice reste en attente (Q11)
        }

        Collections.shuffle(presents);
        Etudiant relecteur = presents.get(0);

        Relecture relecture = Relecture.builder()
                .exercice(exercice)
                .etudiant(relecteur)
                .status(RelectureStatus.EN_ATTENTE)
                .soumissionAt(LocalDateTime.now())
                .build();

        relectureRepository.save(relecture);
        exercice.setStatus(ExerciceStatus.EN_RELECTURE);
        exerciceRepository.save(exercice);
    }

    public java.util.Optional<Exercice> getExerciceById(Long exerciceId) {
        return exerciceRepository.findById(exerciceId);
    }

    public List<ExerciceResponse> getExercicesByEtudiant(Long etudiantId) {
        return exerciceRepository.findByEtudiantIdOrderBySoumissionAtDesc(etudiantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ExerciceResponse mapToResponse(Exercice exercice) {
        ExerciceResponse response = new ExerciceResponse();
        response.setId(exercice.getId());
        response.setStatut(exercice.getStatus().name());
        response.setSessionId(exercice.getSession().getId());
        response.setEtudiantId(exercice.getEtudiant().getId());
        response.setLien(exercice.getLien());
        response.setSoumissionAt(exercice.getSoumissionAt());
        return response;
    }
}
