require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newshub');
    console.log('Connected to MongoDB...');

    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin already exists.');
      process.exit();
    }

    // Create admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@newshub.com',
      password: 'admin123', // This will be hashed by the model pre-save hook
      role: 'admin',
      status: 'active'
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@newshub.com');
    console.log('Password: admin123');
    process.exit();
  } catch (err) {
    console.error('Error seeding admin:', err.message);
    process.exit(1);
  }
};

seedAdmin();
