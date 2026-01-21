class productRepository{
    constructor(){
        this.products = [
            {
                id: 1,
                description: 'Laptop DELL',
                price: 899.99,
                stock: 10,
                sku: 'LAP-DELL-001'
            },
            {
                id: 2,
                description: 'Mouse Logitech Inalámbrico',
                price: 29.99,
                stock: 50,
                sku: 'MOU-LOGI-002'
            },
            {
                id: 3,
                description: 'Teclado Mecánico Redragon',
                price: 79.99,
                stock: 25,
                sku: 'TEC-RED-003'
            },
            {
                id: 4,
                description: 'Monitor Samsung 24"',
                price: 199.99,
                stock: 15,
                sku: 'MON-SAM-004'
            },
            {
                id: 5,
                description: 'Disco SSD Kingston 1TB',
                price: 109.99,
                stock: 30,
                sku: 'SSD-KING-005'
            }

        ]
    }
//todo repositorio debe tener al menos los siguientes metodos:
    findAll(){
        return this.products
    }

    findById(id){
        return this.products.find(p => p.id == id)
    }

    findBysku(sku){
        return this.products.find(p => p.sku == sku)
    }


    create(product){
        const newProduct = {
            id: this.products.length + 1,
            ...product
            // description: product.description,
            // price: product.price,
            // stock: product.stock,
        }
        this.products.push(newProduct)
        return newProduct
    }
    update(id, product){
        const index = this.products.findIndex(p => p.id == id)

        //early stopping
        if (index == -1){
            return null
        }

        //actualizar a la fuerza
        this.products[index] = product 

        //actualizando con spread operator //ejemplo update 3, {stock:18, id:88888}
        this.products[index] = {
            ...this.products[index],
            ...product,
            id
        }

        return this.products[index]

    }

    delete(id){
        const index = this.products.findIndex(p => p.id == id)

        //early stopping
        if (index == -1){
            return null
        }

        //js te provee de un metodo para eliminar un objeto de un arreglo y al mismo tiempo obtenerlo (splice)

        const deletedProduct = this.products.splice(index,1)[0]

        return deletedProduct
    }
}

module.exports = new productRepository()