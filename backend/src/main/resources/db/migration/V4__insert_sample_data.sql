-- V4: Insert sample data for demo
-- Default demo user
INSERT INTO users (name, email, phone, shop_name, preferred_language)
VALUES ('Demo Owner', 'demo@dukanai.com', '+91-9876543210', 'Sri Lakshmi General Store', 'te');

-- Sample products (user_id = 1)
-- Rice: normal stock (above minimum)
INSERT INTO products (user_id, name, category, unit, current_stock, minimum_stock, price)
VALUES (1, 'Rice', 'Grocery', 'bags', 20.00, 10.00, 1200.00);

-- Sugar: LOW STOCK (below minimum) - good for demo
INSERT INTO products (user_id, name, category, unit, current_stock, minimum_stock, price)
VALUES (1, 'Sugar', 'Grocery', 'kg', 3.00, 10.00, 45.00);

-- Oil: LOW STOCK (below minimum) - good for demo
INSERT INTO products (user_id, name, category, unit, current_stock, minimum_stock, price)
VALUES (1, 'Oil', 'Grocery', 'litres', 2.00, 5.00, 130.00);

-- Biscuits: normal stock
INSERT INTO products (user_id, name, category, unit, current_stock, minimum_stock, price)
VALUES (1, 'Biscuits', 'Snacks', 'boxes', 50.00, 20.00, 10.00);

-- Wheat: normal stock
INSERT INTO products (user_id, name, category, unit, current_stock, minimum_stock, price)
VALUES (1, 'Wheat', 'Grocery', 'bags', 15.00, 5.00, 900.00);

-- Salt: normal stock
INSERT INTO products (user_id, name, category, unit, current_stock, minimum_stock, price)
VALUES (1, 'Salt', 'Grocery', 'kg', 25.00, 10.00, 20.00);

-- Dal: normal stock
INSERT INTO products (user_id, name, category, unit, current_stock, minimum_stock, price)
VALUES (1, 'Dal', 'Grocery', 'kg', 18.00, 8.00, 110.00);

-- Sample transactions (to show history)
INSERT INTO inventory_transactions (product_id, quantity, operation, source, previous_stock, new_stock, notes)
VALUES
    (1, 20.00, 'ADD', 'MANUAL', 0.00, 20.00, 'Initial stock'),
    (2, 3.00, 'ADD', 'MANUAL', 0.00, 3.00, 'Initial stock'),
    (3, 2.00, 'ADD', 'MANUAL', 0.00, 2.00, 'Initial stock'),
    (4, 50.00, 'ADD', 'MANUAL', 0.00, 50.00, 'Initial stock'),
    (5, 15.00, 'ADD', 'MANUAL', 0.00, 15.00, 'Initial stock');
