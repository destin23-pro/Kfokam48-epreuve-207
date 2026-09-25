package com.kfokam.epreuve207.controller;

import com.kfokam.epreuve207.dto.ApiDtos.EtudiantResponse;
import com.kfokam.epreuve207.service.EtudiantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EtudiantController {

    private final EtudiantService etudiantService;

    /** Lecture libre : liste des étudiants (optionnellement filtrée par promotion). */
    @GetMapping("/etudiants")
    public ResponseEntity<List<EtudiantResponse>> listEtudiants(
            @RequestParam(required = false) Long promotionId) {
        List<EtudiantResponse> result = promotionId != null
                ? etudiantService.listByPromotion(promotionId)
                : etudiantService.listAll();
        return ResponseEntity.ok(result);
    }
}
