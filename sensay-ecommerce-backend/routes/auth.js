const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SensayBalance = require('../models/SensayBalance');
const SensayTransaction = require('../models/SensayTransaction');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Register Customer
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: 'customer'
    });

    await user.save();

    const sensayBalance = new SensayBalance({
      userId: user._id,
      currentBalance: 1000
    });
    await sensayBalance.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token,
        sensayBalance: sensayBalance.currentBalance
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: error.message
    });
  }
});

// Login (Admin & Customer)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    let sensayBalance = null;
    if (user.role === 'customer') {
      const balance = await SensayBalance.findOne({ userId: user._id });
      sensayBalance = balance ? balance.currentBalance : 0;
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token,
        sensayBalance
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error.message
    });
  }
});

// Get Current User
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    
    let sensayBalance = null;
    if (user.role === 'customer') {
      const balance = await SensayBalance.findOne({ userId: user._id });
      sensayBalance = balance ? balance.currentBalance : 0;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phone: user.phone,
          address: user.address
        },
        sensayBalance
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user data',
      details: error.message
    });
  }
});

// Update User Profile (Customer's own profile update only)
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    if (email && email !== user.email) {
      const existingUserWithEmail = await User.findOne({ email });
      if (existingUserWithEmail && existingUserWithEmail._id.toString() !== user._id.toString()) {
        return res.status(400).json({ success: false, error: 'Email already in use' });
      }
      user.email = email;
    }
    user.phone = phone || user.phone;
    user.address = {
      street: address?.street || user.address?.street,
      city: address?.city || user.address?.city,
      state: address?.state || user.address?.state,
      zipCode: address?.zipCode || user.address?.zipCode,
      country: address?.country || user.address?.country,
    };

    await user.save();

    let sensayBalance = null;
    if (user.role === 'customer') {
      const balance = await SensayBalance.findOne({ userId: user._id });
      sensayBalance = balance ? balance.currentBalance : 0;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phone: user.phone,
          address: user.address
        },
        sensayBalance
      }
    });

  } catch (error) {
    console.error('Profile update failed:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile', details: error.message });
  }
});

// Get customer statistics for admin
router.get('/admin/customers/stats', verifyAdmin, async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const activeCustomers = await User.countDocuments({ role: 'customer', isActive: true });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = await User.countDocuments({ role: 'customer', createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        newCustomers,
      }
    });
  } catch (error) {
    console.error('❌ Failed to get customer stats for admin:', error);
    res.status(500).json({ success: false, error: 'Failed to get customer stats', details: error.message });
  }
});

// --- ADMIN CUSTOMER MANAGEMENT ROUTES ---

// Get all customers for admin
router.get('/admin/customers/all', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { role: 'customer' };
    if (req.query.search) {
      filter.$or = [
        { firstName: new RegExp(req.query.search, 'i') },
        { lastName: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') },
      ];
    }
    if (req.query.status) {
      filter.isActive = req.query.status === 'active';
    }

    const customers = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ Failed to get all customers for admin:', error);
    res.status(500).json({ success: false, error: 'Failed to get all customers', details: error.message });
  }
});

// Get a single customer's details for admin (read-only)
router.get('/admin/customers/:id', verifyAdmin, async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const sensayBalance = await SensayBalance.findOne({ userId: customer._id });

    res.json({
      success: true,
      data: {
        customer,
        sensayBalance: sensayBalance ? sensayBalance.currentBalance : 0
      }
    });
  } catch (error) {
    console.error('❌ Failed to get customer details for admin:', error);
    res.status(500).json({ success: false, error: 'Failed to get customer details', details: error.message });
  }
});

// Update a customer's Sensay balance (Admin only)
router.patch('/admin/customers/:id/balance', verifyAdmin, async (req, res) => {
  try {
    const { amount, transactionType, description } = req.body;

    if (amount === undefined || isNaN(amount)) {
      return res.status(400).json({ success: false, error: 'Valid amount is required' });
    }
    if (!transactionType || !['balance_refill', 'adjustment'].includes(transactionType)) {
      return res.status(400).json({ success: false, error: 'Valid transaction type (balance_refill or adjustment) is required' });
    }

    const customer = await User.findById(req.params.id);
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    let sensayBalance = await SensayBalance.findOne({ userId: customer._id });
    if (!sensayBalance) {
      sensayBalance = new SensayBalance({ userId: customer._id, currentBalance: 0 });
    }

    const balanceBefore = sensayBalance.currentBalance;
    sensayBalance.currentBalance += amount;
    sensayBalance.lastUpdated = new Date();
    await sensayBalance.save();

    const transaction = new SensayTransaction({
      userId: customer._id,
      transactionType: transactionType,
      amount: amount,
      balanceBefore: balanceBefore,
      balanceAfter: sensayBalance.currentBalance,
      description: description || `Admin ${amount > 0 ? 'added' : 'deducted'} ${Math.abs(amount)} units`,
      metadata: { adminUserId: req.user._id.toString() }
    });
    await transaction.save();

    res.json({
      success: true,
      message: `Customer ${customer.email} Sensay balance updated`,
      data: {
        userId: customer._id,
        currentBalance: sensayBalance.currentBalance,
        transaction
      }
    });
  } catch (error) {
    console.error('❌ Failed to update customer Sensay balance:', error);
    res.status(500).json({ success: false, error: 'Failed to update customer balance', details: error.message });
  }
});

module.exports = router;
