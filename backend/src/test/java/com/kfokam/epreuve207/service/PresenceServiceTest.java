package com.kfokam.epreuve207.service;

import com.kfokam.epreuve207.dto.ApiDtos.PresenceRequest;
import com.kfokam.epreuve207.dto.ApiDtos.PresenceResponse;
import com.kfokam.epreuve207.exception.BusinessException;
import com.kfokam.epreuve207.model.Etudiant;
import com.kfokam.epreuve207.model.Presence;
import com.kfokam.epreuve207.model.PresenceStatus;
import com.kfokam.epreuve207.model.Session;
import com.kfokam.epreuve207.model.SessionStatus;
import com.kfokam.epreuve207.repository.EtudiantRepository;
import com.kfokam.epreuve207.repository.PresenceRepository;
import com.kfokam.epreuve207.repository.SessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PresenceServiceTest {

    @Mock
    private PresenceRepository presenceRepository;

    @Mock
    private SessionService sessionService;

    @Mock
    private EtudiantRepository etudiantRepository;

    @InjectMocks
    private PresenceService presenceService;

    private Session session;
    private Etudiant etudiant;
    private PresenceRequest request;

    @BeforeEach
    void setUp() {
        session = Session.builder()
                .id(1L)
                .code("KF8942")
                .titre("Session Test")
                .status(SessionStatus.OUVERTE)
                .ouvertureAt(LocalDateTime.now().minusMinutes(5))
                .expirationAt(LocalDateTime.now().plusMinutes(15))
                .build();

        etudiant = Etudiant.builder()
                .id(101L)
                .nom("Fokam")
                .prenom("Christian")
                .email("c.fokam@univ-kfokam.ac")
                .build();

        request = new PresenceRequest();
        request.setCode("KF8942");
        request.setEtudiantId(101L);
    }

    @Test
    void markPresence_avecCodeValide_etudiantExistant_devraitCreerPresence() {
        // Given
        when(sessionService.findByCode(request.getCode())).thenReturn(session);
        when(etudiantRepository.findById(anyLong())).thenReturn(Optional.of(etudiant));
        when(presenceRepository.findByEtudiantIdAndSessionId(anyLong(), anyLong()))
                .thenReturn(java.util.Collections.emptyList());

        PresenceResponse response = presenceService.markPresence(request);

        assertNotNull(response);
        verify(presenceRepository, times(1)).save(any(Presence.class));

        // Then
        assertNotNull(response);
        assertEquals(1L, response.getSessionId());
        assertEquals(101L, response.getEtudiantId());
        verify(presenceRepository, times(1)).save(any(Presence.class));
    }

    @Test
    void markPresence_avecSessionExpiree_devraitLancerBusinessException() {
        // Given
        Session sessionExpiree = Session.builder()
                .id(2L)
                .code("KF7710")
                .titre("Session Expirée")
                .status(SessionStatus.FERMEE)
                .ouvertureAt(LocalDateTime.now().minusHours(1))
                .expirationAt(LocalDateTime.now().minusMinutes(5))
                .build();
        when(sessionService.findByCode(request.getCode())).thenReturn(sessionExpiree);

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, () ->
                presenceService.markPresence(request)
        );
        assertEquals("CODE_EXPIRE", exception.getCode());
    }

    @Test
    void markPresence_avecCodeInconnu_devraitLancerBusinessException() {
        // Given
        request.setCode("CODE_INEXISTANT");
        when(sessionService.findByCode(request.getCode()))
                .thenThrow(new BusinessException("CODE_INCONNU", "Le code de session est inconnu"));

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, () ->
                presenceService.markPresence(request)
        );
        assertEquals("CODE_INCONNU", exception.getCode());
    }

    @Test
    void markPresence_avecEtudiantInexistant_devraitLancerBusinessException() {
        // Given
        when(sessionService.findByCode(request.getCode())).thenReturn(session);
        when(etudiantRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, () ->
                presenceService.markPresence(request)
        );
        assertEquals("ETUDIANT_INCONNU", exception.getCode());
    }
}

