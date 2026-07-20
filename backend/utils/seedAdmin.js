require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Settings = require('../models/Settings');

const run = async () => {
  await connectDB();

  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!existing) {
    await User.create({
      name: process.env.ADMIN_NAME || 'Super Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'superadmin',
    });
    console.log('Admin user created:', process.env.ADMIN_EMAIL);
  } else {
    console.log('Admin user already exists');
  }

  const settingsExisting = await Settings.findOne();
  if (!settingsExisting) {
    await Settings.create({
      companyName: 'CRAZYGROWMIND STUDIO',
      gstin: '29OSJPS7462F1ZR',
      addressLine1: 'NO 23, FIRST, AKASH COMPLEX',
      addressLine2: 'ISFC MAIN ROAD TEACHERS COLONY',
      city: 'Bengaluru Urban',
      state: 'KARNATAKA',
      pincode: '560072',
      mobile: '+91 9743141099',
      email: 'infocrzygrowmindstudio@gmail.com',
      invoicePrefix: 'INV-',
      invoiceStartNumber: 1,
      defaultTdsPercent: 2,
      bankDetails: {
        bankName: 'State Bank of India',
        accountHolder: 'CRAZYGROWMIND STUDIO',
        accountNumber: '45302797032',
        ifscCode: 'SBIN0003966',
        branch: 'RAJARAJESHWARI NAGAR',
      },
    });
    console.log('Default settings created');
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
