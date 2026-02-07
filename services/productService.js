// services/productService.js
const productRepository = require("../repositories/productRepositoryORM");

class ProductService {
  async findAll() {
    const products = await productRepository.findAllInStock();
    return { products, total: products.length };
  }

  async findProductById(id) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) throw { status: 400, message: "Invalid product ID" };

    const product = await productRepository.findById(numericId);
    if (!product) throw { status: 404, message: "Product not found" };

    return product;
  }

  async create(newProduct, sellerId) {
    if (!newProduct) throw { status: 400, message: "Body vacío" };

    const { name, description, quantity, price } = newProduct;

    if (!name || !description || quantity === undefined || price === undefined) {
      throw { status: 400, message: "Fields missing (name, description, quantity, price)" };
    }

    const qty = parseInt(quantity);
    const pr = Number(price);

    if (typeof name !== "string" || name.trim().length < 3) {
      throw { status: 400, message: "Name must be at least 3 characters" };
    }
    if (typeof description !== "string" || description.trim().length < 5) {
      throw { status: 400, message: "Description must be at least 5 characters" };
    }
    if (isNaN(qty) || qty < 0) throw { status: 400, message: "Quantity must be a number >= 0" };
    if (isNaN(pr) || pr <= 0) throw { status: 400, message: "Price must be a number > 0" };

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

  async update(id, updatedProduct) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) throw { status: 400, message: "Invalid product ID" };

    const cleaned = {};
    if (updatedProduct.name !== undefined) cleaned.name = String(updatedProduct.name).trim();
    if (updatedProduct.description !== undefined) cleaned.description = String(updatedProduct.description).trim();
    if (updatedProduct.quantity !== undefined) cleaned.quantity = parseInt(updatedProduct.quantity);
    if (updatedProduct.price !== undefined) cleaned.price = Number(updatedProduct.price);

    const updated = await productRepository.update(numericId, cleaned);
    if (!updated) throw { status: 404, message: "Product not found" };
    return updated;
  }

  async delete(id) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) throw { status: 400, message: "Invalid product ID" };

    const deleted = await productRepository.delete(numericId);
    if (!deleted) throw { status: 404, message: "Product not found" };

    return { message: "Product deleted successfully", product: deleted };
  }

  // compra simple: descuenta stock (1 producto a la vez)
  async requestPurchase(productId, buyerId, quantity) {
    const pid = parseInt(productId);
    const bid = parseInt(buyerId);
    const qty = parseInt(quantity);

    if (isNaN(pid)) throw { status: 400, message: "Invalid product ID" };
    if (isNaN(bid) || bid <= 0) throw { status: 401, message: "No autenticado" };
    if (isNaN(qty) || qty <= 0) throw { status: 400, message: "Cantidad inválida" };

    const product = await productRepository.findById(pid);
    if (!product) throw { status: 404, message: "Producto no existe" };

    if (parseInt(product.seller_id) === bid) {
      throw { status: 400, message: "No puedes comprar tu propio producto" };
    }

    if (product.quantity < qty) {
      throw { status: 400, message: "Stock insuficiente" };
    }

    // descontar stock
    const newQty = product.quantity - qty;
    await productRepository.update(pid, { quantity: newQty });

    // devolver el producto actualizado (con seller)
    const updated = await productRepository.findById(pid);

    return {
      message: "Solicitud registrada. Contacta al vendedor para coordinar.",
      purchased_quantity: qty,
      product: updated,
    };
  }
}

module.exports = new ProductService();
