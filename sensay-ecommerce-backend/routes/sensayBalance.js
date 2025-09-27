const express = require('express');
const SensayBalance = require('../models/SensayBalance');
const SensayTransaction = require('../models/SensayTransaction');
const { verifyToken, verifyCustomer } = require('../middleware/auth');

const router = express.Router();

// Get Current Balance
router.get('/', verifyToken, async (req, res) => {
  try {
    const balance = await SensayBalance.findOne({ userId: req.user._id });
    
    if (!balance) {
      return res.status(404).json({
        success: false,
        error: 'Balance record not found'
      });
    }

    res.json({
      success: true,
      data: {
        currentBalance: balance.currentBalance,
        totalSpent: balance.totalSpent,
        lastUpdated: balance.lastUpdated
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get balance',
      details: error.message
    });
  }
});

// Get Transaction History
router.get('/transactions', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await SensayTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SensayTransaction.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        transactions,
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
      error: 'Failed to get transactions',
      details: error.message
    });
  }
});

// Refill Balance (Simulation)
router.post('/refill', verifyCustomer, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid refill amount'
      });
    }

    const balance = await SensayBalance.findOne({ userId: req.user._id });
    if (!balance) {
      return res.status(404).json({
        success: false,
        error: 'Balance record not found'
      });
    }

    const balanceBefore = balance.currentBalance;
    balance.currentBalance += amount;
    balance.lastUpdated = new Date();
    await balance.save();

    // Record transaction
    const transaction = new SensayTransaction({
      userId: req.user._id,
      transactionType: 'balance_refill',
      amount: amount,
      balanceBefore: balanceBefore,
      balanceAfter: balance.currentBalance,
      description: `Balance refill of ${amount} units`
    });
    await transaction.save();

    res.json({
      success: true,
      message: 'Balance refilled successfully',
      data: {
        previousBalance: balanceBefore,
        currentBalance: balance.currentBalance,
        refillAmount: amount,
        transaction: transaction
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to refill balance',
      details: error.message
    });
  }
});

module.exports = router;
