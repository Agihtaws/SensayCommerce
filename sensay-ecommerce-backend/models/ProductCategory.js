const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  // You could add more fields here like description, image, etc.
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductCategory', productCategorySchema);
