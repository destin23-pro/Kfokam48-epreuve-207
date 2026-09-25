package com.kfokam.epreuve207.controller;

import com.kfokam.epreuve207.dto.ApiDtos.RelectureItemResponse;
import com.kfokam.epreuve207.dto.ApiDtos.RelectureRequest;
import com.kfokam.epreuve207.dto.ApiDtos.RelectureResponse;
import com.kfokam.epreuve207.service.RelectureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RelectureController {

    private final RelectureService relectureService;

    /**
     * Contrat : POST /api/relectures/{id} avec { note, commentaire } -> 200.
     * L'identifiant est celui de la relecture assignée au pair.
     */
    @PostMapping("/relectures/{id}")
    public ResponseEntity<RelectureResponse> submitRelecture(
            @PathVariable Long id,
            @RequestBody RelectureRequest request) {
        RelectureResponse response = relectureService.submitRelecture(id, request);
        return ResponseEntity.ok(response);
    }

    /** Lecture libre : relectures dont l'étudiant est relecteur (?relecteurId=X). */
    @GetMapping("/relectures")
    public ResponseEntity<List<RelectureItemResponse>> listRelectures(
            @RequestParam Long relecteurId) {
        return ResponseEntity.ok(relectureService.listByRelecteur(relecteurId));
    }

    @GetMapping("/relectures/{id}")
    public ResponseEntity<RelectureResponse> getRelecture(@PathVariable Long id) {
        return ResponseEntity.ok(relectureService.getRelectureById(id));
    }
}
