package com.kfokam.epreuve207.service;

import com.kfokam.epreuve207.dto.ApiDtos.EtudiantResponse;
import com.kfokam.epreuve207.repository.EtudiantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EtudiantService {

    private final EtudiantRepository etudiantRepository;

    public List<EtudiantResponse> listByPromotion(Long promotionId) {
        return etudiantRepository.findByPromotionId(promotionId)
                .stream()
                .map(e -> {
                    EtudiantResponse response = new EtudiantResponse();
                    response.setId(e.getId());
                    response.setNom(e.getNom());
                    response.setPrenom(e.getPrenom());
                    response.setEmail(e.getEmail());
                    response.setPromotionId(e.getPromotion().getId());
                    return response;
                })
                .toList();
    }

    public List<EtudiantResponse> listAll() {
        return etudiantRepository.findAll()
                .stream()
                .map(e -> {
                    EtudiantResponse response = new EtudiantResponse();
                    response.setId(e.getId());
                    response.setNom(e.getNom());
                    response.setPrenom(e.getPrenom());
                    response.setEmail(e.getEmail());
                    response.setPromotionId(e.getPromotion().getId());
                    return response;
                })
                .toList();
    }
}
