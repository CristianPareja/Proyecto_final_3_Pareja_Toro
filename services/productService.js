// services/productService.js
const productRepository = require("../repositories/productRepositoryORM");

class ProductService {
  async findAll() {
    const products = await productRepository.findAll();
    return { products, total: products.length };
  }

  async findProductById(id) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) throw { status: 400, message: "Invalid product ID" };

    const product = await productRepository.findById(numericId);
    if (!product) throw { status: 404, message: "Product not found" };

    return product;
  }

  async findProductByQuantity(min, max) {
    const minQ = parseInt(min);
    const maxQ = parseInt(max);
    if (isNaN(minQ) || isNaN(maxQ)) throw { status: 400, message: "Invalid quantity range" };

    const products = await productRepository.findByQuantityRange(minQ, maxQ);
    return { products, total: products.length };
  }

  // ✅ CREATE protegido: seller_id viene del token
  async create(newProduct, sellerId) {
    if (!newProduct) throw { status: 400, message: "Body vacío" };

    const { name, description, quantity, price } = newProduct;

    if (!name || !description || quantity === undefined || price === undefined) {
      throw { status: 400, message: "Fields missing (name, description, quantity, price)" };
    }

    if (typeof name !== "string" || name.trim().length < 3) {
      throw { status: 400, message: "Name must be at least 3 characters" };
    }

    if (typeof description !== "string" || description.trim().length < 10) {
      throw { status: 400, message: "Description must be at least 10 characters" };
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      throw { status: 400, message: "Quantity must be a number >= 0" };
    }

    const pr = Number(price);
    if (isNaN(pr) || pr <= 0) {
      throw { status: 400, message: "Price must be a number > 0" };
    }

    const numericSellerId = parseInt(sellerId);
    if (isNaN(numericSellerId) || numericSellerId <= 0) {
      throw { status: 401, message: "Invalid seller (token)" };
    }

    return await productRepository.create({
      name: name.trim(),
      description: description.trim(),
      quantity: qty,
      price: pr,
      seller_id: numericSellerId,
    });
  }

  // ✅ UPDATE protegido por dueño
  async update(id, updatedProduct, userId) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) throw { status: 400, message: "Invalid product ID" };

    const product = await productRepository.findById(numericId);
    if (!product) throw { status: 404, message: "Product not found" };

    // 🔐 Solo el dueño puede editar
    if (product.seller_id !== userId) {
      throw { status: 403, message: "You are not the owner of this product" };
    }

    const cleaned = {};

    if (updatedProduct?.name !== undefined) {
      if (typeof updatedProduct.name !== "string" || updatedProduct.name.trim().length < 3) {
        throw { status: 400, message: "Name must be at least 3 characters" };
      }
      cleaned.name = updatedProduct.name.trim();
    }

    if (updatedProduct?.description !== undefined) {
      if (typeof updatedProduct.description !== "string" || updatedProduct.description.trim().length < 10) {
        throw { status: 400, message: "Description must be at least 10 characters" };
      }
      cleaned.description = updatedProduct.description.trim();
    }

    if (updatedProduct?.quantity !== undefined) {
      const qty = parseInt(updatedProduct.quantity);
      if (isNaN(qty) || qty < 0) throw { status: 400, message: "Quantity must be a number >= 0" };
      cleaned.quantity = qty;
    }

    if (updatedProduct?.price !== undefined) {
      const pr = Number(updatedProduct.price);
      if (isNaN(pr) || pr <= 0) throw { status: 400, message: "Price must be a number > 0" };
      cleaned.price = pr;
    }

    if (Object.keys(cleaned).length === 0) {
      throw { status: 400, message: "No fields to update" };
    }

    return await productRepository.update(numericId, cleaned);
  }

  // ✅ DELETE protegido por dueño
  async delete(id, userId) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) throw { status: 400, message: "Invalid product ID" };

    const product = await productRepository.findById(numericId);
    if (!product) throw { status: 404, message: "Product not found" };

    // 🔐 Solo el dueño puede borrar
    if (product.seller_id !== userId) {
      throw { status: 403, message: "You are not the owner of this product" };
    }

    await productRepository.delete(numericId);
    return { message: "Product deleted successfully" };
  }
}

module.exports = new ProductService();
