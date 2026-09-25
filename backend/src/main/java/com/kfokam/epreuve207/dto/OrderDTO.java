package com.kfokam.epreuve207.dto;

import com.kfokam.epreuve207.model.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDTO {

    @Data
    public static class ItemRequest {
        private Long productId;
        private Integer quantity;
    }

    @Data
    public static class CreateRequest {
        private Long userId;
        private List<ItemRequest> items;
    }

    @Data
    @Builder
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal price;
    }

    @Data
    @Builder
    public static class Response {
        private Long id;
        private Long userId;
        private String username;
        private LocalDateTime createdAt;
        private OrderStatus status;
        private BigDecimal totalAmount;
        private List<ItemResponse> items;
    }
}
