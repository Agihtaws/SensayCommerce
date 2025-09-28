const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const sensayService = require('../services/sensayService');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Enhanced authenticated chat with DATABASE VALIDATION
router.post('/authenticated', verifyToken, async (req, res) => {
  try {
    const { message, conversationId = 'default' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const startTime = Date.now();
    const Product = require('../models/Product');

    // Build user context
    const context = {
      customerName: `${req.user.firstName} ${req.user.lastName}`,
      email: req.user.email,
      isLoggedIn: true,
      userType: 'customer',
      userId: req.user._id.toString()
    };

    // Get user's cart info
    let cart = null;
    try {
      cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId', 'name price');
      if (cart && cart.items.length > 0) {
        context.cartItems = cart.items.length;
        context.cartTotal = cart.total;
        context.cartProducts = cart.items.map(item => ({
          name: item.productId?.name,
          quantity: item.quantity,
          price: item.price
        }));
      }
    } catch (cartError) {
      console.log('Cart context error:', cartError.message);
    }

    // Get user's recent orders
    let recentOrders = [];
    try {
      recentOrders = await Order.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('orderNumber orderStatus total createdAt');
      
      if (recentOrders.length > 0) {
        context.recentOrders = recentOrders.map(order => ({
          orderNumber: order.orderNumber,
          status: order.orderStatus,
          total: order.total,
          date: order.createdAt
        }));
      }
    } catch (orderError) {
      console.log('Order context error:', orderError.message);
    }

    // --- LOCAL CONTEXT HANDLING ---
    
    // 1. Check for order tracking requests
    const orderTrackingPattern = /(?:track|order|status).*?(ORD-[\w-]+)/i;
    const trackingMatch = message.match(orderTrackingPattern);
    
    if (trackingMatch) {
      const orderNumber = trackingMatch[1];
      try {
        const order = await Order.findOne({ orderNumber, userId: req.user._id });
        if (order) {
          const trackingResponse = `🔍 **Order Tracking: ${orderNumber}**\n\n` +
            `📦 **Status**: ${order.orderStatus ? order.orderStatus.toUpperCase() : 'UNKNOWN'}\n` +
            `💰 **Total**: USD ${order.total ? order.total.toFixed(2) : '0.00'}\n` +
            `📅 **Order Date**: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}\n` +
            `🚚 **Estimated Delivery**: ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'TBD'}\n` +
            `📍 **Shipping Address**: ${order.shippingAddress?.street || 'N/A'}, ${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.state || 'N/A'} ${order.shippingAddress?.zipCode || 'N/A'}\n\n` +
            `**Items Ordered:**\n` +
            order.items.map(item => `• ${item.productSnapshot?.name || 'Unknown Product'} (Qty: ${item.quantity || 0}) - USD ${(item.total || 0).toFixed(2)}`).join('\n') +
            `\n\nNeed help with anything else regarding your order?`;

          const userMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'user', content: message, context });
          await userMessage.save();
          const assistantMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'assistant', content: trackingResponse, context, metadata: { model: 'local-order-tracking', responseTime: Date.now() - startTime, orderNumber: orderNumber } });
          await assistantMessage.save();

          return res.json({
            success: true,
            data: { content: trackingResponse, context, metadata: { model: 'local-order-tracking', responseTime: Date.now() - startTime, orderTracked: orderNumber } }
          });
        }
      } catch (trackingError) {
        console.log('Order tracking error:', trackingError.message);
      }
    }

    // 2. Check for cart questions
    if (message.toLowerCase().includes('what\'s in my cart') || message.toLowerCase().includes('my cart')) {
      if (cart && cart.items.length > 0) {
        const cartResponse = `🛒 **Your Shopping Cart**\n\n` +
          cart.items.map(item => `• ${item.productId?.name || 'Unknown Product'} (Qty: ${item.quantity || 0}) - USD ${(item.price * item.quantity || 0).toFixed(2)}`).join('\n') +
          `\n\n**Subtotal**: USD ${cart.subtotal.toFixed(2)}\n` +
          `**Tax**: USD ${cart.tax.toFixed(2)}\n` +
          `**Shipping**: ${cart.shipping === 0 ? 'Free' : `USD ${cart.shipping.toFixed(2)}`}\n` +
          `**Total**: USD ${cart.total.toFixed(2)}\n\n` +
          `Ready to proceed to checkout or need to update your cart?`;

        const userMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'user', content: message, context });
        await userMessage.save();
        const assistantMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'assistant', content: cartResponse, context, metadata: { model: 'local-cart-summary', responseTime: Date.now() - startTime } });
        await assistantMessage.save();

        return res.json({
          success: true,
          data: { content: cartResponse, context, metadata: { model: 'local-cart-summary', responseTime: Date.now() - startTime } }
        });
      } else {
        const emptyCartResponse = `Your shopping cart is currently empty. Why not browse our products to find something you like?`;
        
        const userMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'user', content: message, context });
        await userMessage.save();
        const assistantMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'assistant', content: emptyCartResponse, context, metadata: { model: 'local-cart-summary', responseTime: Date.now() - startTime } });
        await assistantMessage.save();

        return res.json({
          success: true,
          data: { content: emptyCartResponse, context, metadata: { model: 'local-cart-summary', responseTime: Date.now() - startTime } }
        });
      }
    }

    // 3. Check for order history questions
    if (message.toLowerCase().includes('my recent orders') || message.toLowerCase().includes('my past orders') || message.toLowerCase().includes('my orders')) {
      if (recentOrders.length > 0) {
        const ordersResponse = `📦 **Your Recent Orders**\n\n` +
         recentOrders.map(order => `• Order **${order.orderNumber || 'N/A'}** (Status: ${order.status ? order.status.toUpperCase() : 'UNKNOWN'}, Total: USD ${(order.total || 0).toFixed(2)})`).join('\n') + 
`\n\nVisit your order history page to see all your past orders.`;
        const userMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'user', content: message, context });
        await userMessage.save();
        const assistantMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'assistant', content: ordersResponse, context, metadata: { model: 'local-order-summary', responseTime: Date.now() - startTime } });
        await assistantMessage.save();

        return res.json({
          success: true,
          data: { content: ordersResponse, context, metadata: { model: 'local-order-summary', responseTime: Date.now() - startTime } }
        });
      } else {
        const noOrdersResponse = `You haven't placed any orders recently. Why not browse our amazing products and make your first purchase?`;
        
        const userMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'user', content: message, context });
        await userMessage.save();
        const assistantMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'assistant', content: noOrdersResponse, context, metadata: { model: 'local-order-summary', responseTime: Date.now() - startTime } });
        await assistantMessage.save();

        return res.json({
          success: true,
          data: { content: noOrdersResponse, context, metadata: { model: 'local-order-summary', responseTime: Date.now() - startTime } }
        });
      }
    }

    // 4. Check for wishlist questions
    if (message.toLowerCase().includes('wishlist') || message.toLowerCase().includes('wish list')) {
      try {
        const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('items.productId', 'name price');
        
        if (wishlist && wishlist.items.length > 0) {
          const wishlistResponse = `💝 **Your Wishlist**\n\n` +
            wishlist.items.map(item => `• ${item.productId?.name || 'Unknown Product'} - USD ${item.productId?.price?.toFixed(2) || '0.00'}`).join('\n') +
            `\n\nReady to move any items to your cart?`;

          const userMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'user', content: message, context });
          await userMessage.save();
          const assistantMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'assistant', content: wishlistResponse, context, metadata: { model: 'local-wishlist-summary', responseTime: Date.now() - startTime } });
          await assistantMessage.save();

          return res.json({
            success: true,
            data: { content: wishlistResponse, context, metadata: { model: 'local-wishlist-summary', responseTime: Date.now() - startTime } }
          });
        } else {
          const emptyWishlistResponse = `Your wishlist is currently empty. Why not browse our products and add some favorites?`;
          
          const userMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'user', content: message, context });
          await userMessage.save();
          const assistantMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'assistant', content: emptyWishlistResponse, context, metadata: { model: 'local-wishlist-summary', responseTime: Date.now() - startTime } });
          await assistantMessage.save();

          return res.json({
            success: true,
            data: { content: emptyWishlistResponse, context, metadata: { model: 'local-wishlist-summary', responseTime: Date.now() - startTime } }
          });
        }
      } catch (wishlistError) {
        console.log('Wishlist context error:', wishlistError.message);
      }
    }

    // 5. **CRITICAL: Handle product questions with DATABASE VALIDATION**
    const productQuestions = [
      'what products', 'available products', 'show me products', 'products available',
      'what do you have', 'what can i buy', 'product catalog', 'browse products'
    ];
    
    const isProductQuestion = productQuestions.some(phrase => 
      message.toLowerCase().includes(phrase)
    );

    if (isProductQuestion) {
      // Check actual database for products
      const activeProducts = await Product.find({ isActive: true }).limit(10);
      
      if (activeProducts.length === 0) {
        const emptyResponse = `Currently, there are no products available in our catalog. Please check back later or contact support.`;
        
        const userMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'user', content: message, context });
        await userMessage.save();
        const assistantMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'assistant', content: emptyResponse, context, metadata: { model: 'database-validated', responseTime: Date.now() - startTime } });
        await assistantMessage.save();

        return res.json({
          success: true,
          data: { content: emptyResponse, context, metadata: { model: 'database-validated', responseTime: Date.now() - startTime } }
        });
      } else {
        // Show actual products from database
        const productList = activeProducts.map(product => 
          `• **${product.name}** - USD ${product.price.toFixed(2)} (${product.stock} in stock)`
        ).join('\n');
        
        const productsResponse = `Here are our available products:\n\n${productList}\n\nWould you like more details about any specific product?`;
        
        const userMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'user', content: message, context });
        await userMessage.save();
        const assistantMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'assistant', content: productsResponse, context, metadata: { model: 'database-validated', responseTime: Date.now() - startTime } });
        await assistantMessage.save();

        return res.json({
          success: true,
          data: { content: productsResponse, context, metadata: { model: 'database-validated', responseTime: Date.now() - startTime } }
        });
      }
    }

    // 6. Handle specific product queries
    const productNameMatch = message.match(/(?:tell me about|what is|info about|details about)\s+(.+)/i);
    if (productNameMatch) {
      const searchTerm = productNameMatch[1].trim();
      const product = await Product.findOne({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: new RegExp(searchTerm, 'i') },
              { description: new RegExp(searchTerm, 'i') }
            ]
          }
        ]
      });

      if (product) {
        const productResponse = `**${product.name}**\n\n` +
          `💰 **Price**: USD ${product.price.toFixed(2)}\n` +
          `📦 **Stock**: ${product.stock} units available\n` +
          `🏷️ **Brand**: ${product.brand}\n` +
          `📂 **Category**: ${product.category}\n` +
          `📝 **Description**: ${product.description}\n\n` +
          `Would you like to add this to your cart?`;

        const userMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'user', content: message, context });
        await userMessage.save();
        const assistantMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'assistant', content: productResponse, context, metadata: { model: 'database-validated', responseTime: Date.now() - startTime } });
        await assistantMessage.save();

        return res.json({
          success: true,
          data: { content: productResponse, context, metadata: { model: 'database-validated', responseTime: Date.now() - startTime } }
        });
      } else {
        const notFoundResponse = `I don't have information about "${searchTerm}" in our current catalog. Would you like to see our available products instead?`;
        
        const userMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'user', content: message, context });
        await userMessage.save();
        const assistantMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'assistant', content: notFoundResponse, context, metadata: { model: 'database-validated', responseTime: Date.now() - startTime } });
        await assistantMessage.save();

        return res.json({
          success: true,
          data: { content: notFoundResponse, context, metadata: { model: 'database-validated', responseTime: Date.now() - startTime } }
        });
      }
    }

    // --- END DATABASE VALIDATION ---

    // For all other questions, use Sensay AI but with database context
    const userMessage = new ChatMessage({ userId: req.user._id, conversationId, role: 'user', content: message, context });
    await userMessage.save();

    try {
      const aiResponse = await sensayService.chatCompletion(req.user._id, message, context);
      
      const assistantMessage = new ChatMessage({
        userId: req.user._id, conversationId, role: 'assistant', content: aiResponse.content, context,
        metadata: { model: aiResponse.model || 'sensay-real-api', replicaUUID: aiResponse.replicaUUID, responseTime: Date.now() - startTime, balanceDeducted: 15 }
      });
      await assistantMessage.save();

      res.json({
        success: true,
        data: { content: aiResponse.content, context, metadata: { model: aiResponse.model || 'sensay-real-api', replicaUUID: aiResponse.replicaUUID, responseTime: Date.now() - startTime } }
      });
    } catch (error) {
      if (error.message.includes('rate limit') || error.message.includes('Too many requests')) {
        // Fallback to database-only response
        const fallbackResponse = `I'm experiencing high traffic right now. For product information, please check our catalog directly or try again in a moment.`;
        
        const assistantMessage = new ChatMessage({
          userId: req.user._id, conversationId, role: 'assistant', content: fallbackResponse, context,
          metadata: { model: 'rate-limit-fallback', responseTime: Date.now() - startTime }
        });
        await assistantMessage.save();

        return res.json({
          success: true,
          data: { content: fallbackResponse, context, metadata: { model: 'rate-limit-fallback', responseTime: Date.now() - startTime } }
        });
      }
      throw error; // Re-throw other errors
    }
  } catch (error) {
    if (error.message === 'Insufficient balance') {
      return res.status(402).json({ success: false, error: 'Insufficient Sensay balance', details: error.message });
    }
    
    console.error('❌ Enhanced chat error:', error);
    res.status(500).json({ success: false, error: 'Chat completion failed', details: error.message });
  }
});


// Anonymous chat with DATABASE VALIDATION
router.post('/anonymous', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const adminUser = await require('../models/User').findOne({ role: 'admin' });
    if (!adminUser) {
      return res.status(500).json({ success: false, error: 'System not properly configured' });
    }

    const startTime = Date.now();
    const Product = require('../models/Product');

    // Handle product questions with database validation for anonymous users too
    const productQuestions = [
      'what products', 'available products', 'show me products', 'products available',
      'what do you have', 'what can i buy', 'product catalog', 'browse products'
    ];
    
    const isProductQuestion = productQuestions.some(phrase => 
      message.toLowerCase().includes(phrase)
    );

    if (isProductQuestion) {
      const activeProducts = await Product.find({ isActive: true }).limit(10);
      
      if (activeProducts.length === 0) {
        const emptyResponse = `Currently, there are no products available in our catalog. Please check back later or contact support.`;
        
        const anonymousMessage = new ChatMessage({ userId: adminUser._id, conversationId: 'anonymous', role: 'user', content: message, context: { isAnonymous: true }, isPrivate: true });
        await anonymousMessage.save();

        const assistantMessage = new ChatMessage({
          userId: adminUser._id, conversationId: 'anonymous', role: 'assistant', content: emptyResponse, context: { isAnonymous: true },
          metadata: { model: 'database-validated', responseTime: Date.now() - startTime },
          isPrivate: true
        });
        await assistantMessage.save();

        return res.json({
          success: true,
          data: { content: emptyResponse, context: { isAnonymous: true }, metadata: { model: 'database-validated', responseTime: Date.now() - startTime } }
        });
      } else {
        const productList = activeProducts.map(product => 
          `• **${product.name}** - USD ${product.price.toFixed(2)} (${product.stock} in stock)`
        ).join('\n');
        
        const productsResponse = `Here are our available products:\n\n${productList}\n\nWould you like more details about any specific product? Please sign up or login to add items to your cart.`;
        
        const anonymousMessage = new ChatMessage({ userId: adminUser._id, conversationId: 'anonymous', role: 'user', content: message, context: { isAnonymous: true }, isPrivate: true });
        await anonymousMessage.save();

        const assistantMessage = new ChatMessage({
          userId: adminUser._id, conversationId: 'anonymous', role: 'assistant', content: productsResponse, context: { isAnonymous: true },
          metadata: { model: 'database-validated', responseTime: Date.now() - startTime },
          isPrivate: true
        });
        await assistantMessage.save();

        return res.json({
          success: true,
          data: { content: productsResponse, context: { isAnonymous: true }, metadata: { model: 'database-validated', responseTime: Date.now() - startTime } }
        });
      }
    }

    // For other questions, use Sensay AI with rate limiting
    try {
      const aiResponse = await sensayService.chatCompletion(adminUser._id, message, {
        isAnonymous: true,
        userType: 'anonymous'
      });
      
      const anonymousMessage = new ChatMessage({ userId: adminUser._id, conversationId: 'anonymous', role: 'user', content: message, context: { isAnonymous: true }, isPrivate: true });
      await anonymousMessage.save();

      const assistantMessage = new ChatMessage({
        userId: adminUser._id, conversationId: 'anonymous', role: 'assistant', content: aiResponse.content, context: { isAnonymous: true },
        metadata: { model: aiResponse.model || 'sensay-real-api', replicaUUID: aiResponse.replicaUUID, responseTime: Date.now() - startTime, balanceDeducted: 15 },
        isPrivate: true
      });
      await assistantMessage.save();

      res.json({
        success: true,
        data: { content: aiResponse.content, context: { isAnonymous: true }, metadata: { model: aiResponse.model || 'sensay-real-api', replicaUUID: aiResponse.replicaUUID, responseTime: Date.now() - startTime } }
      });
    } catch (error) {
      if (error.message.includes('rate limit') || error.message.includes('Too many requests')) {
        const fallbackResponse = `I'm experiencing high traffic right now. Please browse our products directly or try again in a moment.`;
        
        const anonymousMessage = new ChatMessage({ userId: adminUser._id, conversationId: 'anonymous', role: 'user', content: message, context: { isAnonymous: true }, isPrivate: true });
        await anonymousMessage.save();

        const assistantMessage = new ChatMessage({
          userId: adminUser._id, conversationId: 'anonymous', role: 'assistant', content: fallbackResponse, context: { isAnonymous: true },
          metadata: { model: 'rate-limit-fallback', responseTime: Date.now() - startTime },
          isPrivate: true
        });
        await assistantMessage.save();

        return res.json({
          success: true,
          data: { content: fallbackResponse, context: { isAnonymous: true }, metadata: { model: 'rate-limit-fallback', responseTime: Date.now() - startTime } }
        });
      }
      throw error;
    }
  } catch (error) {
    if (error.message === 'Insufficient balance') {
      return res.status(402).json({ success: false, error: 'System temporarily unavailable', details: 'Please try again later' });
    }
    
    console.error('❌ Anonymous chat error:', error);
    res.status(500).json({ success: false, error: 'Chat completion failed', details: error.message });
  }
});


// Get chat history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const { conversationId = 'default', limit = 50 } = req.query;

    const messages = await ChatMessage.find({ userId: req.user._id, conversationId }).sort({ createdAt: -1 }).limit(parseInt(limit));

    res.json({ success: true, data: { messages: messages.reverse(), conversationId, total: messages.length } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get chat history', details: error.message });
  }
});

// Get customer dashboard data
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId }).populate('items.productId', 'name');
    const cartSummary = { itemCount: cart?.items.length || 0, total: cart?.total || 0 };

    const wishlist = await Wishlist.findOne({ userId });
    const wishlistSummary = { itemCount: wishlist?.items.length || 0 };

    const totalOrders = await Order.countDocuments({ userId });
    const totalSpent = await Order.aggregate([ { $match: { userId: userId } }, { $group: { _id: null, total: { $sum: '$total' } } } ]);

    const recentOrders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(5).select('orderNumber orderStatus total createdAt');

    res.json({
      success: true,
      data: {
        user: { name: `${req.user.firstName} ${req.user.lastName}`, email: req.user.email },
        cart: cartSummary,
        wishlist: wishlistSummary,
        orders: { total: totalOrders, totalSpent: totalSpent[0]?.total || 0, recent: recentOrders }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get dashboard data', details: error.message });
  }
});

module.exports = router;
