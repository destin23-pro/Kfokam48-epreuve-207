package com.kfokam.epreuve207.controller;

import com.kfokam.epreuve207.dto.ApiDtos.PresenceRequest;
import com.kfokam.epreuve207.dto.ApiDtos.PresenceResponse;
import com.kfokam.epreuve207.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PresenceController {

    private final PresenceService presenceService;

    @PostMapping("/presences")
    public ResponseEntity<PresenceResponse> markPresence(@RequestBody PresenceRequest request) {
        PresenceResponse response = presenceService.markPresence(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/presences/{id}")
    public ResponseEntity<PresenceResponse> getPresence(@PathVariable Long id) {
        com.kfokam.epreuve207.model.Presence presence = presenceService.getPresence(id);
        PresenceResponse response = presenceService.mapToResponse(presence);
        return ResponseEntity.ok(response);
    }
}
