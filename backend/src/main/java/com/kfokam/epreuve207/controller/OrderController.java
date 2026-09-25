package com.kfokam.epreuve207.controller;

import com.kfokam.epreuve207.dto.OrderDTO;
import com.kfokam.epreuve207.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDTO.Response> createOrder(@RequestBody OrderDTO.CreateRequest request) {
        OrderDTO.Response createdOrder = orderService.createOrder(request);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO.Response>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}
