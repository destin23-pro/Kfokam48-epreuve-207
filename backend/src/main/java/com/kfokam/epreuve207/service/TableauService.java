package com.kfokam.epreuve207.service;

import com.kfokam.epreuve207.dto.ApiDtos.ExerciceResponse;
import com.kfokam.epreuve207.dto.ApiDtos.TableauItemResponse;
import com.kfokam.epreuve207.exception.BusinessException;
import com.kfokam.epreuve207.model.Etudiant;
import com.kfokam.epreuve207.model.PresenceStatus;
import com.kfokam.epreuve207.model.RelectureStatus;
import com.kfokam.epreuve207.repository.EtudiantRepository;
import com.kfokam.epreuve207.repository.PresenceRepository;
import com.kfokam.epreuve207.repository.PromotionRepository;
import com.kfokam.epreuve207.repository.RelectureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * GET /api/tableau?promotionId=X : vue du formateur (Q16).
 * La moyenne provient de l'API, jamais recalculée côté frontend (F3).
 */
@Service
@RequiredArgsConstructor
public class TableauService {

    private final EtudiantRepository etudiantRepository;
    private final PromotionRepository promotionRepository;
    private final PresenceRepository presenceRepository;
    private final ExerciceService exerciceService;
    private final RelectureRepository relectureRepository;

    public List<TableauItemResponse> getTableau(Long promotionId) {
        // Contrat : 404 si la promotion est inconnue.
        promotionRepository.findById(promotionId)
                .orElseThrow(() -> new BusinessException(
                        "PROMOTION_INCONNUE",
                        "La promotion demandée n'existe pas."
                ));

        return etudiantRepository.findByPromotionId(promotionId)
                .stream()
                .map(this::buildRow)
                .toList();
    }

    private TableauItemResponse buildRow(Etudiant etudiant) {
        TableauItemResponse response = new TableauItemResponse();
        response.setEtudiantId(etudiant.getId());
        response.setNom(etudiant.getPrenom() + " " + etudiant.getNom());

        // Q16 : présence à chaque session.
        long presences = presenceRepository.countByEtudiantIdAndStatus(etudiant.getId(), PresenceStatus.PRESENT);
        response.setPresences((int) presences);

        // Q16 : combien d'exercices déposés.
        List<ExerciceResponse> exercices = exerciceService.getExercicesByEtudiant(etudiant.getId());
        response.setExercicesDeposes(exercices.size());

        // Q16 + RG14 (issue #25) : moyenne des notes d'EXERCICE (chaque exercice pèse 1,
        // note provisoire comprise, RG15). Sans note, la moyenne est null et non 0.
        exercices.stream()
                .map(ExerciceResponse::getNote)
                .filter(java.util.Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .ifPresentOrElse(
                        moyenne -> response.setMoyenne(Math.round(moyenne * 10.0) / 10.0),
                        () -> response.setMoyenne(null));

        // Q16 : relectures qu'il doit encore rendre (en tant que relecteur).
        int enAttente = relectureRepository.countByEtudiantIdAndStatus(etudiant.getId(), RelectureStatus.EN_ATTENTE);
        response.setRelecturesEnAttente(enAttente);

        return response;
    }
}
