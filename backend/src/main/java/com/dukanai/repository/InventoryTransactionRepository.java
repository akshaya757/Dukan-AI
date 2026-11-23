package com.dukanai.repository;

import com.dukanai.entity.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

    List<InventoryTransaction> findByProductIdOrderByCreatedAtDesc(Long productId);

    Page<InventoryTransaction> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT t FROM InventoryTransaction t ORDER BY t.createdAt DESC")
    List<InventoryTransaction> findRecentTransactions(Pageable pageable);

    @Query("SELECT COUNT(t) FROM InventoryTransaction t WHERE t.operation = 'ADD'")
    long countStockIn();

    @Query("SELECT COUNT(t) FROM InventoryTransaction t WHERE t.operation = 'REMOVE'")
    long countStockOut();
}
