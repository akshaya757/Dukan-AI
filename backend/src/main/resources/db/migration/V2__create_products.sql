-- V2: Create products table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(50) NOT NULL,
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    minimum_stock DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price DECIMAL(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_current_stock CHECK (current_stock >= 0),
    CONSTRAINT chk_minimum_stock CHECK (minimum_stock >= 0),
    INDEX idx_products_user_id (user_id),
    INDEX idx_products_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
