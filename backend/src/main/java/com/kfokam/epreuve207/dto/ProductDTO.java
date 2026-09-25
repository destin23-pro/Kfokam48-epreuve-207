package com.kfokam.epreuve207.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

public class ProductDTO {

    @Data
    public static class Request {
        private String name;
        private String description;
        private BigDecimal price;
        private Integer stockQuantity;
    }

    @Data
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private Integer stockQuantity;
    }
}
