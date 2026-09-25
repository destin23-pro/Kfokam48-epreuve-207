package com.kfokam.epreuve207.controller;

import com.kfokam.epreuve207.dto.ApiDtos.PromotionResponse;
import com.kfokam.epreuve207.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PromotionController {

    private final PromotionService promotionService;

    /** Lecture libre : référentiel des promotions. */
    @GetMapping("/promotions")
    public ResponseEntity<List<PromotionResponse>> listPromotions() {
        return ResponseEntity.ok(promotionService.listAll());
    }
}
