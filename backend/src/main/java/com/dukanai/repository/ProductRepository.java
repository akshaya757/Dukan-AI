package com.dukanai.repository;

import com.dukanai.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByUserId(Long userId);

    List<Product> findByUserIdAndNameContainingIgnoreCase(Long userId, String name);

    Optional<Product> findByUserIdAndNameIgnoreCase(Long userId, String name);

    @Query("SELECT p FROM Product p WHERE p.user.id = :userId AND p.currentStock <= p.minimumStock")
    List<Product> findLowStockByUserId(@Param("userId") Long userId);

    @Query("SELECT p FROM Product p WHERE p.currentStock <= p.minimumStock")
    List<Product> findAllLowStock();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.currentStock <= p.minimumStock")
    long countLowStock();
}
