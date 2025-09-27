const mongoose = require('mongoose');

const productBrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductBrand', productBrandSchema);
