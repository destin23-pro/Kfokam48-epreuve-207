package com.kfokam.epreuve207.controller;

import com.kfokam.epreuve207.dto.ApiDtos.TableauItemResponse;
import com.kfokam.epreuve207.service.TableauService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TableauController {

    private final TableauService tableauService;

    /** Contrat : GET /api/tableau?promotionId=X -> 200 [ { etudiantId, nom, ... } ] */
    @GetMapping("/tableau")
    public ResponseEntity<List<TableauItemResponse>> getTableau(@RequestParam Long promotionId) {
        return ResponseEntity.ok(tableauService.getTableau(promotionId));
    }
}
