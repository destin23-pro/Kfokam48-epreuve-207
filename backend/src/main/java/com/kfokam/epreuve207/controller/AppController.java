package com.kfokam.epreuve207.controller;

import com.kfokam.epreuve207.dto.ApiDtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AppController {

    @PostMapping("/sessions")
    public ResponseEntity<SessionResponse> createSession(@RequestBody SessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new SessionResponse());
    }

    @PostMapping("/presences")
    public ResponseEntity<PresenceResponse> markPresence(@RequestBody PresenceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new PresenceResponse());
    }

    @PostMapping("/exercices")
    public ResponseEntity<ExerciceResponse> submitExercice(@RequestBody ExerciceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ExerciceResponse());
    }

    @PostMapping("/relectures/{id}")
    public ResponseEntity<Void> reviewExercice(@PathVariable Long id, @RequestBody RelectureRequest request) {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/tableau")
    public ResponseEntity<List<TableauItemResponse>> getTableau(@RequestParam Long promotionId) {
        return ResponseEntity.ok(List.of());
    }
}
