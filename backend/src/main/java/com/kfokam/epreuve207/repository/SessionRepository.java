package com.kfokam.epreuve207.repository;

import com.kfokam.epreuve207.model.Session;
import com.kfokam.epreuve207.model.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    Optional<Session> findByCode(String code);

    Optional<Session> findByStatusAndExpirationAtAfter(SessionStatus status, LocalDateTime now);

    List<Session> findAllByOrderByOuvertureAtDesc();
}
