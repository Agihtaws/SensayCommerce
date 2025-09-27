const express = require('express');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { verifyCustomer } = require('../middleware/auth');

const router = express.Router();

// Get user's wishlist
router.get('/', verifyCustomer, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id }).populate({
      path: 'items.productId',
      select: 'name description price brand category images stock isActive discount originalPrice'
    });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, items: [] });
      await wishlist.save();
    }

    // Filter out inactive products
    wishlist.items = wishlist.items.filter(item => item.productId && item.productId.isActive);
    
    if (wishlist.isModified()) {
      await wishlist.save();
    }

    res.json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get wishlist',
      details: error.message
    });
  }
});

// Add item to wishlist
router.post('/add', verifyCustomer, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or inactive'
      });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, items: [] });
    }

    // Check if item already exists in wishlist
    const existingItem = wishlist.items.find(
      item => item.productId.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        error: 'Item already in wishlist'
      });
    }

    wishlist.items.push({ productId });
    await wishlist.save();

    await wishlist.populate({
      path: 'items.productId',
      select: 'name description price brand category images stock isActive discount originalPrice'
    });

    res.json({
      success: true,
      message: 'Item added to wishlist successfully',
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add item to wishlist',
      details: error.message
    });
  }
});

// Remove item from wishlist
router.delete('/remove/:productId', verifyCustomer, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist not found'
      });
    }

    wishlist.items = wishlist.items.filter(
      item => item.productId.toString() !== productId
    );

    await wishlist.save();

    await wishlist.populate({
      path: 'items.productId',
      select: 'name description price brand category images stock isActive discount originalPrice'
    });

    res.json({
      success: true,
      message: 'Item removed from wishlist successfully',
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from wishlist',
      details: error.message
    });
  }
});

// Clear entire wishlist
router.delete('/clear', verifyCustomer, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist not found'
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear wishlist',
      details: error.message
    });
  }
});

module.exports = router;
