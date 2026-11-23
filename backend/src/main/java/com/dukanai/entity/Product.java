package com.dukanai.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products",
    indexes = {
        @Index(name = "idx_products_user_id", columnList = "user_id"),
        @Index(name = "idx_products_name", columnList = "name")
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 100)
    private String category;

    @Column(nullable = false, length = 50)
    private String unit;

    @Column(name = "current_stock", nullable = false, precision = 10, scale = 2)
    private BigDecimal currentStock = BigDecimal.ZERO;

    @Column(name = "minimum_stock", nullable = false, precision = 10, scale = 2)
    private BigDecimal minimumStock = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<InventoryTransaction> transactions;

    @Transient
    public boolean isLowStock() {
        return currentStock.compareTo(minimumStock) <= 0;
    }
}
