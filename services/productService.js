const productRepository = require('../repositories/productRepository')

class productService {

    findAll() {
        const products = productRepository.findAll()
        return {
            products,
            total: products.length
        }
    }

    searchById(id) {
        const numericId = parseInt(id)

        if (isNaN(numericId)) {
            throw {
                status: 400,
                message: "ID must be a numeric value"
            }
        }

        const product = productRepository.findById(numericId)

        if (!product) {
            throw {
                status: 404,
                message: `Product with ID ${numericId} not found`
            }
        }

        return product
    }

    create(newProduct) {
        const { description, price, stock, sku } = newProduct

        if (!description || !price || !stock || !sku) {
            throw {
                status: 400,
                message: "Field missing"
            }
        }

        if (typeof stock !== 'number' || stock < 0) {
            throw {
                status: 400,
                message: "Stock must be a number greater than 0"
            }
        }

        const existingSku = productRepository.findBysku(sku)
        if (existingSku) {
            throw {
                status: 400,
                message: "SKU provided already exists"
            }
        }

        const savedProduct = productRepository.create({
            description: description.trim(),
            price,
            stock,
            sku: sku.trim()
        })

        return savedProduct
    }

    update(id, updatedData) {
        const numericId = parseInt(id)

        if (isNaN(numericId)) {
            throw {
                status: 400,
                message: "ID must be numeric"
            }
        }

        const existingProduct = productRepository.findById(numericId)
        if (!existingProduct) {
            throw {
                status: 404,
                message: `Product with ID ${numericId} not found`
            }
        }

        const { description, price, stock, sku } = updatedData

        if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
            throw {
                status: 400,
                message: "Stock must be a number greater than 0"
            }
        }

        if (sku) {
            const skuExists = productRepository.findBysku(sku)
            if (skuExists && skuExists.id !== numericId) {
                throw {
                    status: 400,
                    message: "SKU already exists"
                }
            }
        }

        const updatedProduct = productRepository.update(numericId, {
            description,
            price,
            stock,
            sku
        })

        return updatedProduct
    }

    delete(id) {
        const numericId = parseInt(id)

        if (isNaN(numericId)) {
            throw {
                status: 400,
                message: "ID must be numeric"
            }
        }

        const deletedProduct = productRepository.delete(numericId)

        if (!deletedProduct) {
            throw {
                status: 404,
                message: `Product with ID ${numericId} not found`
            }
        }

        return deletedProduct
    }
}

module.exports = new productService()
