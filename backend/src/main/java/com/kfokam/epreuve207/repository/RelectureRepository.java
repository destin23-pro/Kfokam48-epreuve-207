package com.kfokam.epreuve207.repository;

import com.kfokam.epreuve207.model.Relecture;
import com.kfokam.epreuve207.model.RelectureStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RelectureRepository extends JpaRepository<Relecture, Long> {

    List<Relecture> findByExerciceIdAndStatus(Long exerciceId, RelectureStatus status);

    /** Relectures attribuées à un exercice (au plus deux, RG7). */
    List<Relecture> findByExerciceId(Long exerciceId);

    /** Relectures dont l'étudiant est le relecteur (ce qu'il doit faire / a fait). */
    List<Relecture> findByEtudiantIdOrderBySoumissionAtDesc(Long etudiantId);

    /** Notes reçues par l'étudiant sur SES exercices (moyenne du tableau, Q16). */
    @Query("SELECT r.note FROM Relecture r WHERE r.exercice.etudiant.id = :etudiantId AND r.note IS NOT NULL")
    List<Integer> findNotesRecuesByEtudiantId(@Param("etudiantId") Long etudiantId);

    /** Relectures que l'étudiant (comme relecteur) n'a pas encore rendues. */
    @Query("SELECT COUNT(r) FROM Relecture r WHERE r.etudiant.id = :etudiantId AND r.status = :status")
    int countByEtudiantIdAndStatus(@Param("etudiantId") Long etudiantId, @Param("status") RelectureStatus status);
}
