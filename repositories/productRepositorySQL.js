const { Pool } = require('pg'); 

class ProductRepository {
    constructor() {
        this.pool = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'products_db',
            password: 'postgres',
            port: 5435,
        });
    }

    async findAll() {
        const result = await this.pool.query('SELECT * FROM products');
        return result.rows;
    }

    async findById(id) {
        const result = await this.pool.query(
            'SELECT * FROM products WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    async findBySku(sku) {
        const result = await this.pool.query(
            'SELECT * FROM products WHERE sku = $1',
            [sku]
        );
        return result.rows[0];
    }

    async findProductByExistence(minExistence, maxExistence) {
        const result = await this.pool.query(
            'SELECT * FROM products WHERE stock BETWEEN $1 AND $2',
            [minExistence, maxExistence]
        );
        return result.rows;
    }

    async create(product) {
        const { description, sku, price, stock } = product;

        const query = `
            INSERT INTO products (description, sku, price, stock) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *`;

        const values = [description, sku, price, stock];
        const result = await this.pool.query(query, values);

        return result.rows[0];
    }

    async update(id, updatedProduct) {
        const { description, sku, price, stock } = updatedProduct;

        const query = `
            UPDATE products 
            SET description = $1, sku = $2, price = $3, stock = $4 
            WHERE id = $5 
            RETURNING *`;

        const values = [description, sku, price, stock, id];
        const result = await this.pool.query(query, values);

        return result.rows[0] || null;
    }

    async delete(id) {
        const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }
}

module.exports = new ProductRepository();
