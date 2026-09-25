package com.kfokam.epreuve207.service;

import com.kfokam.epreuve207.dto.ApiDtos.RelectureRequest;
import com.kfokam.epreuve207.dto.ApiDtos.RelectureResponse;
import com.kfokam.epreuve207.exception.BusinessException;
import com.kfokam.epreuve207.model.*;
import com.kfokam.epreuve207.repository.EtudiantRepository;
import com.kfokam.epreuve207.repository.ExerciceRepository;
import com.kfokam.epreuve207.repository.RelectureRepository;
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
class RelectureServiceTest {

    @Mock
    private RelectureRepository relectureRepository;

    @Mock
    private ExerciceRepository exerciceRepository;

    @Mock
    private EtudiantRepository etudiantRepository;

    @InjectMocks
    private RelectureService relectureService;

    private Relecture relectureEnAttente;
    private Exercice exercice;

    @BeforeEach
    void setUp() {
        Promotion promotion = Promotion.builder().id(1L).nom("Promo 1").build();
        Etudiant auteur = Etudiant.builder().id(101L).nom("Fokam").prenom("Christian").promotion(promotion).build();
        Etudiant relecteur = Etudiant.builder().id(102L).nom("Ndongmo").prenom("Mireille").promotion(promotion).build();

        Session session = Session.builder()
                .id(10L)
                .titre("TP Spring Boot")
                .status(SessionStatus.FERMEE)
                .promotion(promotion)
                .build();

        exercice = Exercice.builder()
                .id(42L)
                .session(session)
                .etudiant(auteur)
                .lien("https://github.com/kfokam48/tp")
                .soumissionAt(LocalDateTime.now())
                .status(ExerciceStatus.EN_RELECTURE)
                .build();

        relectureEnAttente = Relecture.builder()
                .id(7L)
                .exercice(exercice)
                .etudiant(relecteur)
                .status(RelectureStatus.EN_ATTENTE)
                .soumissionAt(LocalDateTime.now())
                .build();
    }

    @Test
    void submitRelecture_noteValide_commentaireValide_marqueRealiseEtExerciceRelu() {
        // Given
        when(relectureRepository.findById(7L)).thenReturn(Optional.of(relectureEnAttente));
        RelectureRequest request = new RelectureRequest();
        request.setNote(15);
        request.setCommentaire("Travail sérieux et bien structuré.");

        // When
        RelectureResponse response = relectureService.submitRelecture(7L, request);

        // Then (Q9 : note entière 0-20, Q15 : rendue = définitive)
        assertEquals(15, response.getNote());
        assertEquals(RelectureStatus.REALISE.name(), response.getStatut());
        assertEquals(ExerciceStatus.RELU, exercice.getStatus());
        verify(relectureRepository, times(1)).save(relectureEnAttente);
        verify(exerciceRepository, times(1)).save(exercice);
    }

    @Test
    void submitRelecture_noteHorsBornes_renvoieNoteInvalide() {
        // Q9 : une note hors 0-20 est refusée (400).
        when(relectureRepository.findById(7L)).thenReturn(Optional.of(relectureEnAttente));
        RelectureRequest request = new RelectureRequest();
        request.setNote(21);
        request.setCommentaire("Travail sérieux.");

        BusinessException exception = assertThrows(BusinessException.class, () ->
                relectureService.submitRelecture(7L, request)
        );
        assertEquals("NOTE_INVALIDE", exception.getCode());
        verify(relectureRepository, never()).save(any());
    }

    @Test
    void submitRelecture_dejaRendue_renvoieDejaRelaure() {
        // Contrat : 409 si la relecture a déjà été rendue.
        Relecture dejaRendue = Relecture.builder()
                .id(8L)
                .exercice(exercice)
                .etudiant(relectureEnAttente.getEtudiant())
                .note(12)
                .status(RelectureStatus.REALISE)
                .soumissionAt(LocalDateTime.now())
                .build();
        when(relectureRepository.findById(8L)).thenReturn(Optional.of(dejaRendue));
        RelectureRequest request = new RelectureRequest();
        request.setNote(15);
        request.setCommentaire("Travail sérieux et bien structuré.");

        BusinessException exception = assertThrows(BusinessException.class, () ->
                relectureService.submitRelecture(8L, request)
        );
        assertEquals("DEJA_RELATURE", exception.getCode());
        verify(relectureRepository, never()).save(any());
        verify(relectureRepository, never()).save(any(Relecture.class));
    }

    @Test
    void submitRelecture_relectureInexistante_renvoie404() {
        when(relectureRepository.findById(anyLong())).thenReturn(Optional.empty());
        RelectureRequest request = new RelectureRequest();
        request.setNote(15);
        request.setCommentaire("Travail sérieux et bien structuré.");

        BusinessException exception = assertThrows(BusinessException.class, () ->
                relectureService.submitRelecture(999L, request)
        );
        assertEquals("RELECTURE_INCONNUE", exception.getCode());
    }
}
