const productRepository = require('../repositories/productRepositorySQL');

class ProductService {
    async findAll() {
        const products = await productRepository.findAll();
        return {
            products,
            total: products.length
        };
    }

    async findProductById(id) {
        const numericId = parseInt(id);
        if (isNaN(numericId)) {
            throw { status: 400, message: 'Invalid product ID' };
        }

        const product = await productRepository.findById(numericId);

        if (!product) {
            throw { status: 404, message: 'Product not found' };
        }

        return product;
    }

    async findProductByExistence(minExistence, maxExistence) {
        const products = await productRepository.findProductByExistence(minExistence, maxExistence);
        return {
            products,
            total: products.length
        };
    }

    async create(newProduct) {
        const { description, price, stock, sku } = newProduct;

        if (!description || price === undefined || stock === undefined || !sku) {
            throw { status: 400, message: 'Fields missing' };
        }

        if (typeof description !== 'string' || description.length < 10) {
            throw { status: 400, message: 'Description must be at least 10 characters' };
        }

        const existingProduct = await productRepository.findBySku(sku.trim());
        if (existingProduct) {
            throw { status: 400, message: 'SKU must be unique' };
        }

        const newCreatedProduct = await productRepository.create({
            description: description.trim(),
            price,
            stock,
            sku: sku.trim()
        });

        return newCreatedProduct;
    }

    async update(id, updatedProduct) {
        const numericId = parseInt(id);
        if (isNaN(numericId)) {
            throw { status: 400, message: 'Invalid product ID' };
        }

        const existingProduct = await productRepository.findById(numericId);
        if (!existingProduct) {
            throw { status: 404, message: 'Product not found' };
        }

        if (updatedProduct.description !== undefined) {
            if (typeof updatedProduct.description !== 'string' || updatedProduct.description.length < 10) {
                throw { status: 400, message: 'Description must be at least 10 chars' };
            }
        }

        if (updatedProduct.sku !== undefined) {
            const productWithSku = await productRepository.findBySku(updatedProduct.sku.trim());
            if (productWithSku && productWithSku.id !== numericId) {
                throw { status: 400, message: 'SKU must be unique' };
            }
        }

        const cleanedData = {
            description: updatedProduct.description?.trim() || existingProduct.description,
            sku: updatedProduct.sku?.trim() || existingProduct.sku,
            price: updatedProduct.price !== undefined ? updatedProduct.price : existingProduct.price,
            stock: updatedProduct.stock !== undefined ? updatedProduct.stock : existingProduct.stock
        };

        return await productRepository.update(numericId, cleanedData);
    }

    async delete(id) {
        const numericId = parseInt(id);
        if (isNaN(numericId)) {
            throw { status: 400, message: 'Invalid product ID' };
        }

        const existingProduct = await productRepository.findById(numericId);
        if (!existingProduct) {
            throw { status: 404, message: 'Product not found' };
        }

        const deletedProduct = await productRepository.delete(numericId);

        return {
            message: 'Product deleted successfully',
            product: deletedProduct
        };
    }
}

module.exports = new ProductService();
