package com.kfokam.epreuve207.repository;

import com.kfokam.epreuve207.model.Etudiant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    Optional<Etudiant> findByEmail(String email);

    List<Etudiant> findByPromotionId(Long promotionId);
}
