package com.kfokam.epreuve207.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kfokam.epreuve207.dto.ApiDtos.SessionRequest;
import com.kfokam.epreuve207.dto.ApiDtos.SessionResponse;
import com.kfokam.epreuve207.exception.BusinessException;
import com.kfokam.epreuve207.service.SessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SessionController.class)
class SessionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SessionService sessionService;

    private SessionRequest request;

    @BeforeEach
    void setUp() {
        request = new SessionRequest();
        request.setTitre("Séance Test");
        request.setPromotionId(1L);
    }

    @Test
    void ouvrirSession_retourne201() throws Exception {
        // Given
        SessionResponse response = new SessionResponse();
        response.setId(1L);
        response.setCode("KF8942");
        response.setOuvertureAt(java.time.LocalDateTime.now());
        response.setExpirationAt(java.time.LocalDateTime.now().plusMinutes(15));
        when(sessionService.ouvrirSession(any(SessionRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.code").value("KF8942"))
                .andExpect(jsonPath("$.ouvertureAt").exists())
                .andExpect(jsonPath("$.expirationAt").exists());
    }

    @Test
    void ouvrirSession_sansTitre_retourne400() throws Exception {
        // Given
        request.setTitre(null);
        when(sessionService.ouvrirSession(any(SessionRequest.class)))
                .thenThrow(new BusinessException("TITRE_REQUIS", "Le titre de la session est requis."));

        // When & Then
        mockMvc.perform(post("/api/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TITRE_REQUIS"))
                .andExpect(jsonPath("$.message").value("Le titre de la session est requis."));
    }

    @Test
    void ouvrirSession_sansPromotion_retourne400() throws Exception {
        // Given
        request.setPromotionId(null);
        when(sessionService.ouvrirSession(any(SessionRequest.class)))
                .thenThrow(new BusinessException("PROMOTION_REQUISE", "L'identifiant de la promotion est requis."));

        // When & Then
        mockMvc.perform(post("/api/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("PROMOTION_REQUISE"))
                .andExpect(jsonPath("$.message").value("L'identifiant de la promotion est requis."));
    }
}
