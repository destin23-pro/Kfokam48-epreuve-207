package com.kfokam.epreuve207.controller;

import com.kfokam.epreuve207.dto.ApiDtos.ExerciceRequest;
import com.kfokam.epreuve207.dto.ApiDtos.ExerciceResponse;
import com.kfokam.epreuve207.service.ExerciceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExerciceController {

    private final ExerciceService exerciceService;

    @PostMapping("/exercices")
    public ResponseEntity<ExerciceResponse> submitExercice(@RequestBody ExerciceRequest request) {
        ExerciceResponse response = exerciceService.submitExercice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/etudiants/{etudiantId}/exercices")
    public ResponseEntity<List<ExerciceResponse>> getExercicesByEtudiant(@PathVariable Long etudiantId) {
        List<ExerciceResponse> responses = exerciceService.getExercicesByEtudiant(etudiantId);
        return ResponseEntity.ok(responses);
    }
}
