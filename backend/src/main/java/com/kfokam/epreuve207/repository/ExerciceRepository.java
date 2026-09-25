package com.kfokam.epreuve207.repository;

import com.kfokam.epreuve207.model.Exercice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciceRepository extends JpaRepository<Exercice, Long> {
    List<Exercice> findByEtudiantIdOrderBySoumissionAtDesc(Long etudiantId);

    Optional<Exercice> findBySessionIdAndEtudiantId(Long sessionId, Long etudiantId);
}
