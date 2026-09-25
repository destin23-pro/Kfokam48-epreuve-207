package com.kfokam.epreuve207.repository;

import com.kfokam.epreuve207.model.Presence;
import com.kfokam.epreuve207.model.PresenceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PresenceRepository extends JpaRepository<Presence, Long> {

    List<Presence> findByEtudiantIdAndSessionId(Long etudiantId, Long sessionId);

    List<Presence> findAllBySessionId(Long sessionId);

    @Query("SELECT COUNT(p) FROM Presence p WHERE p.etudiant.id = :etudiantId AND p.status = :status")
    long countByEtudiantIdAndStatus(@Param("etudiantId") Long etudiantId, @Param("status") PresenceStatus status);
}
