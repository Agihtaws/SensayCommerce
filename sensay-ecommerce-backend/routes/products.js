const express = require('express');
const Product = require('../models/Product');
const sensayService = require('../services/sensayService');
const { verifyAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Get all products (Public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const filter = { isActive: true };
    
    // Apply filters
    if (req.query.category) {
      filter.category = new RegExp(req.query.category, 'i');
    }
    
    if (req.query.brand) {
      filter.brand = new RegExp(req.query.brand, 'i');
    }
    
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc':
          sort = { price: 1 };
          break;
        case 'price_desc':
          sort = { price: -1 };
          break;
        case 'name_asc':
          sort = { name: 1 };
          break;
        case 'name_desc':
          sort = { name: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'oldest':
          sort = { createdAt: 1 };
          break;
      }
    }
    
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get products',
      details: error.message
    });
  }
});

// Get single product (Public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get product',
      details: error.message
    });
  }
});

// Get categories and brands (Public)
router.get('/meta/filters', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    const brands = await Product.distinct('brand', { isActive: true });
    
    res.json({
      success: true,
      data: {
        categories: categories.sort(),
        brands: brands.sort()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get filters',
      details: error.message
    });
  }
});

// Create product with auto Sensay sync (Admin only) - FIXED
router.post('/', verifyAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // Handle nested objects properly - no need to parse if already objects
    if (typeof req.body.specifications === 'string') {
      productData.specifications = JSON.parse(req.body.specifications);
    }
    
    if (typeof req.body.tags === 'string') {
      productData.tags = JSON.parse(req.body.tags);
    }
    
    if (typeof req.body.dimensions === 'string') {
      productData.dimensions = JSON.parse(req.body.dimensions);
    }
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file, index) => ({
        url: file.path,
        alt: `${productData.name} - Image ${index + 1}`,
        isPrimary: index === 0
      }));
    }
    
    const product = new Product(productData);
    await product.save();
    
    console.log(`✅ Product created: ${product.name} (${product._id})`);
    
    // Auto-sync with Sensay
    try {
      const knowledgeContent = product.toSensayKnowledge();
      console.log(`🔄 Syncing with Sensay: ${knowledgeContent.substring(0, 100)}...`);
      
      const sensayResult = await sensayService.addKnowledge(req.user._id, knowledgeContent, 'product');
      
      // Update product with Sensay info
      product.sensayKnowledgeId = sensayResult.knowledgeBaseID;
      product.sensayLastSynced = new Date();
      product.sensayStatus = 'synced';
      await product.save();
      
      console.log(`✅ Product ${product.name} synced with Sensay: ${sensayResult.knowledgeBaseID}`);
    } catch (sensayError) {
      console.error('❌ Sensay sync failed:', sensayError.message);
      product.sensayStatus = 'error';
      await product.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Product created and synced with Sensay AI',
      data: product
    });
  } catch (error) {
    console.error('❌ Product creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      details: error.message
    });
  }
});

// Update product with auto Sensay sync (Admin only) - FIXED
router.put('/:id', verifyAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Update product data
    const updateData = { ...req.body };
    
    // Handle nested objects properly
    if (typeof req.body.specifications === 'string') {
      updateData.specifications = JSON.parse(req.body.specifications);
    } else if (req.body.specifications) {
      updateData.specifications = req.body.specifications;
    }
    
    if (typeof req.body.tags === 'string') {
      updateData.tags = JSON.parse(req.body.tags);
    } else if (req.body.tags) {
      updateData.tags = req.body.tags;
    }
    
    if (typeof req.body.dimensions === 'string') {
      updateData.dimensions = JSON.parse(req.body.dimensions);
    } else if (req.body.dimensions) {
      updateData.dimensions = req.body.dimensions;
    }
    
    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: file.path,
        alt: `${updateData.name || product.name} - Image ${index + 1}`,
        isPrimary: index === 0 && product.images.length === 0
      }));
      updateData.images = [...product.images, ...newImages];
    }
    
    Object.assign(product, updateData);
    await product.save();
    
    // Auto-sync with Sensay if knowledge ID exists
    if (product.sensayKnowledgeId) {
      try {
        const knowledgeContent = product.toSensayKnowledge();
        await sensayService.updateKnowledge(req.user._id, product.sensayKnowledgeId, knowledgeContent, 'product');
        
        product.sensayLastSynced = new Date();
        product.sensayStatus = 'synced';
        await product.save();
        
        console.log(`✅ Product ${product.name} updated in Sensay: ${product.sensayKnowledgeId}`);
      } catch (sensayError) {
        console.error('❌ Sensay update failed:', sensayError.message);
        product.sensayStatus = 'error';
        await product.save();
      }
    }
    
    res.json({
      success: true,
      message: 'Product updated and synced with Sensay AI',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      details: error.message
    });
  }
});

// Delete product with Sensay cleanup (Admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Remove from Sensay if synced
    if (product.sensayKnowledgeId) {
      try {
        await sensayService.deleteKnowledge(req.user._id, product.sensayKnowledgeId);
        console.log(`✅ Product ${product.name} removed from Sensay: ${product.sensayKnowledgeId}`);
      } catch (sensayError) {
        console.error('❌ Sensay deletion failed:', sensayError.message);
      }
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Product deleted and removed from Sensay AI'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      details: error.message
    });
  }
});

// Get all products for admin
router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { sku: new RegExp(req.query.search, 'i') },
        { brand: new RegExp(req.query.search, 'i') }
      ];
    }
    
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get admin products',
      details: error.message
    });
  }
});

// Manually sync product with Sensay (Admin only)
router.post('/:id/sync-sensay', verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    const knowledgeContent = product.toSensayKnowledge();
    
    if (product.sensayKnowledgeId) {
      // Update existing knowledge
      await sensayService.updateKnowledge(req.user._id, product.sensayKnowledgeId, knowledgeContent, 'product');
    } else {
      // Create new knowledge
      const sensayResult = await sensayService.addKnowledge(req.user._id, knowledgeContent, 'product');
      product.sensayKnowledgeId = sensayResult.knowledgeBaseID;
    }
    
    product.sensayLastSynced = new Date();
    product.sensayStatus = 'synced';
    await product.save();
    
    res.json({
      success: true,
      message: 'Product manually synced with Sensay AI',
      data: {
        sensayKnowledgeId: product.sensayKnowledgeId,
        lastSynced: product.sensayLastSynced,
        status: product.sensayStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to sync product with Sensay',
      details: error.message
    });
  }
});

module.exports = router;
