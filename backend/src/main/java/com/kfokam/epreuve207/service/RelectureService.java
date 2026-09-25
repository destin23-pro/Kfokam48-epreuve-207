package com.kfokam.epreuve207.service;

import com.kfokam.epreuve207.dto.ApiDtos.RelectureItemResponse;
import com.kfokam.epreuve207.dto.ApiDtos.RelectureRequest;
import com.kfokam.epreuve207.dto.ApiDtos.RelectureResponse;
import com.kfokam.epreuve207.exception.BusinessException;
import com.kfokam.epreuve207.model.Exercice;
import com.kfokam.epreuve207.model.ExerciceStatus;
import com.kfokam.epreuve207.model.Relecture;
import com.kfokam.epreuve207.model.RelectureStatus;
import com.kfokam.epreuve207.repository.EtudiantRepository;
import com.kfokam.epreuve207.repository.ExerciceRepository;
import com.kfokam.epreuve207.repository.RelectureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Relecture croisée. La relecture est assignée à un pair par le système au moment du
 * dépôt (Q7) ; l'étudiant la rend via POST /api/relectures/{id} (note entière 0-20,
 * Q9). Une fois rendue, la note est définitive (Q15) et l'exercice passe RELU.
 */
@Service
@RequiredArgsConstructor
public class RelectureService {

    private final RelectureRepository relectureRepository;
    private final ExerciceRepository exerciceRepository;
    private final EtudiantRepository etudiantRepository;

    private Relecture getRelecture(Long relectureId) {
        return relectureRepository.findById(relectureId)
                .orElseThrow(() -> new BusinessException(
                        "RELECTURE_INCONNUE",
                        "La relecture demandée n'existe pas."
                ));
    }

    /**
     * POST /api/relectures/{id} : le relecteur rend sa note et son commentaire.
     * Erreurs du contrat : 400 note hors 0-20 ou non entière / commentaire trop court,
     * 409 relecture déjà rendue, 403 relecture de son propre exercice (impossible ici
     * car l'assignation RG2 l'interdit en amont).
     */
    @Transactional
    public RelectureResponse submitRelecture(Long relectureId, RelectureRequest request) {
        Relecture relecture = getRelecture(relectureId);

        if (relecture.getStatus() != RelectureStatus.EN_ATTENTE) {
            throw new BusinessException(
                    "DEJA_RELATURE",
                    "Cette relecture a déjà été rendue."
            );
        }

        // Q9 : note entière de 0 à 20.
        if (request.getNote() == null || request.getNote() < 0 || request.getNote() > 20) {
            throw new BusinessException(
                    "NOTE_INVALIDE",
                    "La note doit être un nombre entier compris entre 0 et 20."
            );
        }

        // RG3 : un commentaire d'au moins 5 caractères.
        if (request.getCommentaire() == null || request.getCommentaire().trim().length() < 5) {
            throw new BusinessException(
                    "COMMENTAIRE_INVALIDE",
                    "Le commentaire de relecture doit contenir au moins 5 caractères."
            );
        }

        relecture.setNote(request.getNote());
        relecture.setCommentaire(request.getCommentaire().trim());
        relecture.setSoumissionAt(LocalDateTime.now());
        relecture.setStatus(RelectureStatus.REALISE);
        relectureRepository.save(relecture);

        // D4 (issue #25) : l'exercice passe RELU quand toutes ses relectures sont rendues ;
        // sinon il reste EN_RELECTURE avec une note provisoire (RG15).
        Exercice exercice = relecture.getExercice();
        boolean resteAFaire = !relectureRepository
                .findByExerciceIdAndStatus(exercice.getId(), RelectureStatus.EN_ATTENTE).isEmpty();
        if (!resteAFaire) {
            exercice.setStatus(ExerciceStatus.RELU);
            exerciceRepository.save(exercice);
        }

        return mapToResponse(relecture);
    }
    /**
     * GET /api/relectures?relecteurId=X : ce que l'étudiant doit relire (EN_ATTENTE)
     * et ce qu'il a déjà relu (REALISE).
     */
    public List<RelectureItemResponse> listByRelecteur(Long relecteurId) {
        etudiantRepository.findById(relecteurId)
                .orElseThrow(() -> new BusinessException(
                        "ETUDIANT_INCONNU",
                        "L'identifiant de l'étudiant est invalide."
                ));

        return relectureRepository.findByEtudiantIdOrderBySoumissionAtDesc(relecteurId)
                .stream()
                .map(this::mapToItemResponse)
                .toList();
    }

    public RelectureResponse getRelectureById(Long relectureId) {
        return mapToResponse(getRelecture(relectureId));
    }

    private RelectureItemResponse mapToItemResponse(Relecture relecture) {
        Exercice exercice = relecture.getExercice();
        RelectureItemResponse response = new RelectureItemResponse();
        response.setId(relecture.getId());
        response.setExerciceId(exercice.getId());
        response.setExerciceTitre(exercice.getSession().getTitre());
        response.setExerciceLien(exercice.getLien());
        response.setAuteurEtudiantId(exercice.getEtudiant().getId());
        response.setAuteurNom(exercice.getEtudiant().getPrenom() + " " + exercice.getEtudiant().getNom());
        response.setSessionId(exercice.getSession().getId());
        response.setSessionTitre(exercice.getSession().getTitre());
        response.setStatut(relecture.getStatus().name());
        response.setNote(relecture.getNote());
        response.setCommentaire(relecture.getCommentaire());
        return response;
    }

    private RelectureResponse mapToResponse(Relecture relecture) {
        RelectureResponse response = new RelectureResponse();
        response.setId(relecture.getId());
        response.setExerciceId(relecture.getExercice().getId());
        response.setEtudiantId(relecture.getEtudiant().getId());
        response.setNote(relecture.getNote());
        response.setCommentaire(relecture.getCommentaire());
        response.setSoumissionAt(relecture.getSoumissionAt());
        response.setStatut(relecture.getStatus().name());
        return response;
    }
}
