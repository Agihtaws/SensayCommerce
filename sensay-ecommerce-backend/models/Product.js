const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    unique: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  tags: [{
    type: String,
    trim: true
  }],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: {
      type: String,
      enum: ['cm', 'in', 'kg', 'lb'],
      default: 'cm'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Sensay Integration Fields
  sensayKnowledgeId: {
    type: String,
    default: null
  },
  sensayLastSynced: {
    type: Date,
    default: null
  },
  sensayStatus: {
    type: String,
    enum: ['pending', 'synced', 'error'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Auto-generate SKU if not provided
productSchema.pre('save', async function(next) {
  if (!this.sku) {
    try {
      const brandCode = this.brand.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
      const nameCode = this.name.replace(/\s+/g, '').substring(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, '');
      const timestamp = Date.now().toString().slice(-4);
      
      let baseSku = `${brandCode.padEnd(3, 'X')}-${nameCode.padEnd(5, 'X')}-${timestamp}`;
      
      // Check for uniqueness
      let counter = 1;
      let finalSku = baseSku;
      
      while (await mongoose.model('Product').findOne({ sku: finalSku })) {
        finalSku = `${baseSku}-${counter}`;
        counter++;
      }
      
      this.sku = finalSku;
      console.log(`✅ Generated SKU: ${this.sku} for product: ${this.name}`);
    } catch (error) {
      console.error('❌ SKU generation error:', error);
      this.sku = `PRD-${Date.now()}`;
    }
  }
  next();
});

// Calculate final price with discount
productSchema.virtual('finalPrice').get(function() {
  return this.discount > 0 ? this.price * (1 - this.discount / 100) : this.price;
});

// Format product for Sensay knowledge base
productSchema.methods.toSensayKnowledge = function() {
  const specs = Object.entries(this.specifications || {})
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  
  const dimensions = this.dimensions?.length 
    ? `${this.dimensions.length}x${this.dimensions.width}x${this.dimensions.height} ${this.dimensions.unit}, ${this.dimensions.weight} ${this.dimensions.unit === 'cm' ? 'kg' : 'lb'}`
    : '';

  const finalPrice = this.discount > 0 ? this.price * (1 - this.discount / 100) : this.price;

  return `Product: ${this.name} - Brand: ${this.brand} - Category: ${this.category} - SKU: ${this.sku} - Price: USD ${finalPrice.toFixed(2)}${this.discount > 0 ? ` (${this.discount}% off from USD ${this.price})` : ''} - Stock: ${this.stock} units - Description: ${this.description}${specs ? ` - Specifications: ${specs}` : ''}${dimensions ? ` - Dimensions: ${dimensions}` : ''}${this.tags.length ? ` - Tags: ${this.tags.join(', ')}` : ''}`;
};

module.exports = mongoose.model('Product', productSchema);
