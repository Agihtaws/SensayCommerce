const express = require('express');
const ProductBrand = require('../models/ProductBrand');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all brands (Public & Admin)
router.get('/', async (req, res) => {
  try {
    const brands = await ProductBrand.find().sort({ name: 1 });
    res.json({ success: true, data: brands });
  } catch (error) {
    console.error('❌ Failed to get brands:', error);
    res.status(500).json({ success: false, error: 'Failed to get brands', details: error.message });
  }
});

// Create a new brand (Admin only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Brand name is required' });
    }

    const existingBrand = await ProductBrand.findOne({ name: name.toLowerCase() });
    if (existingBrand) {
      return res.status(409).json({ success: false, error: 'Brand already exists' });
    }

    const newBrand = new ProductBrand({ name: name.toLowerCase() });
    await newBrand.save();

    res.status(201).json({ success: true, message: 'Brand created successfully', data: newBrand });
  } catch (error) {
    console.error('❌ Failed to create brand:', error);
    res.status(500).json({ success: false, error: 'Failed to create brand', details: error.message });
  }
});

// Delete a brand (Admin only) - Optional
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const brand = await ProductBrand.findByIdAndDelete(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, error: 'Brand not found' });
    }
    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('❌ Failed to delete brand:', error);
    res.status(500).json({ success: false, error: 'Failed to delete brand', details: error.message });
  }
});

module.exports = router;
