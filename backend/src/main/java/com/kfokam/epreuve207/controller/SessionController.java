package com.kfokam.epreuve207.controller;

import com.kfokam.epreuve207.dto.ApiDtos.SessionRequest;
import com.kfokam.epreuve207.dto.ApiDtos.SessionResponse;
import com.kfokam.epreuve207.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SessionController {

    private final SessionService sessionService;

    /** Contrat : POST /api/sessions -> 201 { id, code, ouvertureAt, expirationAt } */
    @PostMapping("/sessions")
    public ResponseEntity<SessionResponse> createSession(@RequestBody SessionRequest request) {
        SessionResponse response = sessionService.ouvrirSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Lecture libre : liste des sessions pour le formateur et la vue étudiante. */
    @GetMapping("/sessions")
    public ResponseEntity<List<SessionResponse>> listSessions() {
        return ResponseEntity.ok(sessionService.listAll());
    }
}
