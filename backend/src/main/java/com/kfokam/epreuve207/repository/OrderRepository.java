package com.kfokam.epreuve207.repository;

import com.kfokam.epreuve207.model.Order;
import com.kfokam.epreuve207.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
    List<Order> findByUserId(Long userId);
}
