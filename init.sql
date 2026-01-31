CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO products (
    description, price, stock, sku
)
VALUES
    ('Laptop Samsung', 700.99, 10, 'LAP-SAM-001'),
    ('Mouse Banc', 19.99, 50, 'MOU-BAN-002'),
    ('Teclado Band', 23.99, 20, 'TEC-BAN-003'),
    ('iPhone 17', 1000.99, 5, 'IPH-APPL-004');