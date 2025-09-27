const mongoose = require('mongoose');

const sensayBalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentBalance: {
    type: Number,
    default: 1000,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SensayBalance', sensayBalanceSchema);
