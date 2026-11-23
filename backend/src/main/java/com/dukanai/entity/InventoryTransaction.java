package com.dukanai.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions",
    indexes = {
        @Index(name = "idx_transactions_product_id", columnList = "product_id"),
        @Index(name = "idx_transactions_created_at", columnList = "created_at")
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Operation operation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Source source;

    @Column(name = "previous_stock", nullable = false, precision = 10, scale = 2)
    private BigDecimal previousStock;

    @Column(name = "new_stock", nullable = false, precision = 10, scale = 2)
    private BigDecimal newStock;

    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum Operation {
        ADD, REMOVE
    }

    public enum Source {
        VOICE, MANUAL
    }
}
