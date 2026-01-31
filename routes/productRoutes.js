const express = require('express')
const router = express.Router()

const productService = require('../services/productService')

router.get('/', async (req, res) => {
    const result = await productService.findAll()
    res.json(result)
})

router.get('/:id', async (req, res) => {
    const result = await productService.findProductById(req.params.id)
    res.json(result)
})

router.get('/existence/:min/:max', async (req, res) => {
    const minExistence = parseInt(req.params.min);
    const maxExistence = parseInt(req.params.max);  
    const products = await productService.findProductByExistence(minExistence, maxExistence);
    res.json(products);
    
});

router.post('/', async (req, res) => {
    const newProduct = await productService.create(req.body);
    res.status(201).json(newProduct);
});


router.put('/:id', async (req, res) => {
    const updatedProduct = await productService.update(req.params.id, req.body);
    if (!updatedProduct) return res.status(404).json({ message: "Producto no encontrado para actualizar" });
    res.json(updatedProduct);
});


router.delete('/:id', async (req, res) => {
    const deletedProduct = await productService.delete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(deletedProduct);
}); 


module.exports = router;