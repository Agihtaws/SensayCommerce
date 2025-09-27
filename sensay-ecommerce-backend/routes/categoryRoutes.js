const express = require('express');
const ProductCategory = require('../models/ProductCategory');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all categories (Public & Admin)
router.get('/', async (req, res) => {
  try {
    const categories = await ProductCategory.find().sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('❌ Failed to get categories:', error);
    res.status(500).json({ success: false, error: 'Failed to get categories', details: error.message });
  }
});

// Create a new category (Admin only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const existingCategory = await ProductCategory.findOne({ name: name.toLowerCase() });
    if (existingCategory) {
      return res.status(409).json({ success: false, error: 'Category already exists' });
    }

    const newCategory = new ProductCategory({ name: name.toLowerCase() });
    await newCategory.save();

    res.status(201).json({ success: true, message: 'Category created successfully', data: newCategory });
  } catch (error) {
    console.error('❌ Failed to create category:', error);
    res.status(500).json({ success: false, error: 'Failed to create category', details: error.message });
  }
});

// Delete a category (Admin only) - Optional, but good for management
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const category = await ProductCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('❌ Failed to delete category:', error);
    res.status(500).json({ success: false, error: 'Failed to delete category', details: error.message });
  }
});

module.exports = router;
