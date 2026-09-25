package com.kfokam.epreuve207.service;

import com.kfokam.epreuve207.dto.ApiDtos.PromotionResponse;
import com.kfokam.epreuve207.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;

    public List<PromotionResponse> listAll() {
        return promotionRepository.findAll()
                .stream()
                .map(p -> {
                    PromotionResponse response = new PromotionResponse();
                    response.setId(p.getId());
                    response.setNom(p.getNom());
                    return response;
                })
                .toList();
    }
}
