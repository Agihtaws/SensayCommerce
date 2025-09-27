const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { verifyCustomer, verifyAdmin } = require('../middleware/auth'); // Import verifyAdmin

const router = express.Router();

// Create order from cart (checkout)
router.post('/create', verifyCustomer, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'credit_card', notes } = req.body;

    if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.lastName || 
        !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      return res.status(400).json({
        success: false,
        error: 'Complete shipping address is required'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Validate stock availability
    for (const item of cart.items) {
      if (!item.productId || !item.productId.isActive) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.productId?.name || 'Unknown'} is no longer available`
        });
      }

      if (item.productId.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${item.productId.name}. Available: ${item.productId.stock}, Requested: ${item.quantity}`
        });
      }
    }

    // Create order items with product snapshots
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      productSnapshot: {
        name: item.productId.name,
        description: item.productId.description,
        price: item.price,
        sku: item.productId.sku,
        brand: item.productId.brand,
        category: item.productId.category,
        image: item.productId.images.length > 0 ? item.productId.images[0].url : null
      },
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    }));

    // Create order
    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      total: cart.total,
      shippingAddress,
      paymentMethod,
      notes,
      paymentStatus: 'paid', // Simulated payment
      orderStatus: 'confirmed',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    await order.save();

    // Deduct stock from products
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.productId._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    console.log(`✅ Order created: ${order.orderNumber} for user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('❌ Order creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      details: error.message
    });
  }
});

// Get user's orders (Customer)
router.get('/', verifyCustomer, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
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
      error: 'Failed to get orders',
      details: error.message
    });
  }
});

// Get single order (Customer)
router.get('/:orderNumber', verifyCustomer, async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ 
      orderNumber, 
      userId: req.user._id 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get order',
      details: error.message
    });
  }
});

// --- ADMIN ORDER ROUTES (NEW) ---

// Get all orders for admin
router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { orderNumber: new RegExp(req.query.search, 'i') },
        { 'shippingAddress.firstName': new RegExp(req.query.search, 'i') },
        { 'shippingAddress.lastName': new RegExp(req.query.search, 'i') },
        { 'shippingAddress.city': new RegExp(req.query.search, 'i') },
      ];
    }

    const orders = await Order.find(filter)
      .populate('userId', 'firstName lastName email') // Populate user info
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);
    const totalRevenue = await Order.aggregate([
      { $match: filter },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalPending = await Order.countDocuments({ ...filter, orderStatus: 'pending' });
    const totalConfirmed = await Order.countDocuments({ ...filter, orderStatus: 'confirmed' });
    const totalProcessing = await Order.countDocuments({ ...filter, orderStatus: 'processing' });
    const totalShipped = await Order.countDocuments({ ...filter, orderStatus: 'shipped' });
    const totalDelivered = await Order.countDocuments({ ...filter, orderStatus: 'delivered' });
    const totalCancelled = await Order.countDocuments({ ...filter, orderStatus: 'cancelled' });


    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          totalRevenue: totalRevenue[0]?.totalRevenue || 0,
          totalOrders: total,
          pendingOrders: totalPending,
          confirmedOrders: totalConfirmed,
          processingOrders: totalProcessing,
          shippedOrders: totalShipped,
          deliveredOrders: totalDelivered,
          cancelledOrders: totalCancelled,
        }
      }
    });
  } catch (error) {
    console.error('❌ Failed to get all orders for admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get all orders',
      details: error.message
    });
  }
});

// Get single order for admin
router.get('/admin/:orderNumber', verifyAdmin, async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber }).populate('userId', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('❌ Failed to get admin order details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get order',
      details: error.message
    });
  }
});

// Update order status (Admin only)
router.patch('/admin/:orderNumber/status', verifyAdmin, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({ success: false, error: 'Order status is required' });
    }

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.json({
      success: true,
      message: `Order ${orderNumber} status updated to ${orderStatus}`,
      data: order
    });
  } catch (error) {
    console.error('❌ Failed to update order status:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status', details: error.message });
  }
});


module.exports = router;
