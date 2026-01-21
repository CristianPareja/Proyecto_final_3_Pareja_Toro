const express = require("express")
const router = express.Router()
const productService = require('../services/productService')

// GET ALL
router.get('/', (req, res) => {
    try {
        const result = productService.findAll()
        res.json(result)
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message })
    }
})

// GET BY ID
router.get('/:id', (req, res) => {
    try {
        const result = productService.searchById(req.params.id)
        res.json(result)
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message })
    }
})

// CREATE
router.post('/', (req, res) => {
    try {
        const newProduct = productService.create(req.body)
        res.status(201).json(newProduct)
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message })
    }
})

// UPDATE
router.put('/:id', (req, res) => {
    try {
        const updatedProduct = productService.update(req.params.id, req.body)
        res.json(updatedProduct)
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message })
    }
})

// DELETE
router.delete('/:id', (req, res) => {
    try {
        const deletedProduct = productService.delete(req.params.id)
        res.json(deletedProduct)
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message })
    }
})

module.exports = router

