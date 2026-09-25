package com.kfokam.epreuve207.service;

import com.kfokam.epreuve207.dto.ProductDTO;
import com.kfokam.epreuve207.model.Product;
import com.kfokam.epreuve207.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public ProductDTO.Response createProduct(ProductDTO.Request request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .build();

        return mapToResponse(productRepository.save(product));
    }

    public List<ProductDTO.Response> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProductDTO.Response getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé avec ID: " + id));
        return mapToResponse(product);
    }

    public ProductDTO.Response mapToResponse(Product product) {
        return ProductDTO.Response.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .build();
    }
}
