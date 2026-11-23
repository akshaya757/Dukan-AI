-- V3: Create inventory_transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    operation ENUM('ADD', 'REMOVE') NOT NULL,
    source ENUM('VOICE', 'MANUAL') NOT NULL DEFAULT 'MANUAL',
    previous_stock DECIMAL(10,2) NOT NULL,
    new_stock DECIMAL(10,2) NOT NULL,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT chk_quantity CHECK (quantity > 0),
    INDEX idx_transactions_product_id (product_id),
    INDEX idx_transactions_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
