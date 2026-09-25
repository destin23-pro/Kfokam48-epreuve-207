package com.kfokam.epreuve207.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kfokam.epreuve207.dto.ApiDtos.PresenceRequest;
import com.kfokam.epreuve207.dto.ApiDtos.PresenceResponse;
import com.kfokam.epreuve207.exception.BusinessException;
import com.kfokam.epreuve207.service.PresenceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PresenceController.class)
class PresenceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PresenceService presenceService;

    private PresenceRequest request;

    @BeforeEach
    void setUp() {
        request = new PresenceRequest();
        request.setCode("KF8942");
        request.setEtudiantId(101L);
    }

    @Test
    void markPresence_avecCodeValide_etudiantExistant_retourne201() throws Exception {
        // Given
        PresenceResponse response = new PresenceResponse();
        response.setId(1L);
        response.setSessionId(1L);
        response.setEtudiantId(101L);
        response.setSource("ETUDIANT");
        when(presenceService.markPresence(any(PresenceRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/presences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.sessionId").value(1))
                .andExpect(jsonPath("$.etudiantId").value(101))
                .andExpect(jsonPath("$.source").value("ETUDIANT"));
    }

    @Test
    void markPresence_avecSessionExpiree_retourne410() throws Exception {
        // Given
        BusinessException exception410 = new BusinessException("CODE_EXPIRE", "Le code de présence a expiré.");
        when(presenceService.markPresence(any(PresenceRequest.class)))
                .thenThrow(exception410);

        // When & Then
        mockMvc.perform(post("/api/presences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isGone())
                .andExpect(jsonPath("$.code").value("CODE_EXPIRE"))
                .andExpect(jsonPath("$.message").value("Le code de présence a expiré."));
    }

    @Test
    void markPresence_avecDoublon_retourne409() throws Exception {
        // Given
        BusinessException exception409 = new BusinessException("DEJA_PRESENT", "Cet étudiant a déjà émargé.");
        when(presenceService.markPresence(any(PresenceRequest.class)))
                .thenThrow(exception409);

        // When & Then
        mockMvc.perform(post("/api/presences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("DEJA_PRESENT"))
                .andExpect(jsonPath("$.message").value("Cet étudiant a déjà émargé."));
    }
}
