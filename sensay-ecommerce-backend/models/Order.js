const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productSnapshot: {
    name: String,
    description: String,
    price: Number,
    sku: String,
    brand: String,
    category: String,
    image: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
    // Removed required: true to let pre-save generate it
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  shipping: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'],
    default: 'credit_card'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  trackingNumber: String,
  estimatedDelivery: Date
}, {
  timestamps: true
});

// Auto-generate order number - FIXED
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    try {
      const timestamp = Date.now().toString();
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      let baseOrderNumber = `ORD-${timestamp.slice(-8)}-${randomSuffix}`;
      
      // Check for uniqueness
      let counter = 1;
      let finalOrderNumber = baseOrderNumber;
      
      while (await mongoose.model('Order').findOne({ orderNumber: finalOrderNumber })) {
        finalOrderNumber = `${baseOrderNumber}-${counter}`;
        counter++;
      }
      
      this.orderNumber = finalOrderNumber;
      console.log(`✅ Generated Order Number: ${this.orderNumber}`);
    } catch (error) {
      console.error('❌ Order number generation error:', error);
      // Fallback order number
      this.orderNumber = `ORD-${Date.now()}`;
    }
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
