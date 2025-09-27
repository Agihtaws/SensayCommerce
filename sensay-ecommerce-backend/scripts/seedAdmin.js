const mongoose = require('mongoose');
const User = require('../models/User');
const SensayBalance = require('../models/SensayBalance');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      
      // Check if balance exists for admin
      const existingBalance = await SensayBalance.findOne({ userId: existingAdmin._id });
      if (!existingBalance) {
        console.log('Creating balance record for existing admin...');
        const adminBalance = new SensayBalance({
          userId: existingAdmin._id,
          currentBalance: 5000 // Higher balance for admin
        });
        await adminBalance.save();
        console.log('Admin balance record created');
      } else {
        console.log('Admin balance record already exists');
      }
      
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      email: 'admin@sensay-ecommerce.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully');

    // Create admin balance record
    const adminBalance = new SensayBalance({
      userId: admin._id,
      currentBalance: 5000 // Higher balance for admin
    });
    await adminBalance.save();
    console.log('Admin balance record created');

    console.log('Email: admin@sensay-ecommerce.com');
    console.log('Password: Admin123!');
    console.log('Initial Balance: 5000 units');

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();
