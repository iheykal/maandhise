#!/usr/bin/env node

/**
 * Create Superadmin User Script
 * 
 * This script creates a superadmin user with the specified credentials
 * Run with: node scripts/create-superadmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const createSuperadmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');

    // Connect to MongoDB Atlas
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('✅ Connected to MongoDB Atlas');

    // Check if superadmin already exists
    const existingSuperadmin = await User.findOne({ 
      $or: [
        { phone: '+252613273911' },
        { role: 'superadmin' }
      ]
    });

    if (existingSuperadmin) {
      console.log('⚠️  Superadmin already exists:');
      console.log(`   Phone: ${existingSuperadmin.phone}`);
      console.log(`   Role: ${existingSuperadmin.role}`);
      console.log(`   Name: ${existingSuperadmin.fullName}`);
      
      // Update password and role
      console.log('\n🔄 Updating superadmin information...');
      existingSuperadmin.fullName = 'Abdullahi Abdi Elmi';
      existingSuperadmin.phone = '+252613273911';
      existingSuperadmin.idNumber = '001';
      existingSuperadmin.location = 'Mogadishu';
      existingSuperadmin.password = 'maandhise11';
      existingSuperadmin.role = 'superadmin';
      existingSuperadmin.isVerified = true;
      await existingSuperadmin.save();
      console.log('✅ Superadmin information updated successfully');
    } else {
      // Create new superadmin
      console.log('🔄 Creating superadmin user...');
      
      const superadmin = new User({
        fullName: 'Abdullahi Abdi Elmi',
        phone: '+252613273911',
        idNumber: '001',
        location: 'Mogadishu',
        password: 'maandhise11',
        role: 'superadmin'
      });

      await superadmin.save();
      console.log('✅ Superadmin created successfully');
    }

    // Display superadmin details
    const superadmin = await User.findOne({ phone: '+252613273911' });
    console.log('\n📋 Superadmin Details:');
    console.log(`   Name: ${superadmin.fullName}`);
    console.log(`   Phone: ${superadmin.phone}`);
    console.log(`   ID Number: ${superadmin.idNumber}`);
    console.log(`   Location: ${superadmin.location}`);
    console.log(`   Role: ${superadmin.role}`);
    console.log(`   Created: ${superadmin.createdAt}`);

    console.log('\n🎉 Superadmin setup completed successfully!');
    console.log('\n🔐 Login Credentials:');
    console.log('   Phone: +252613273911');
    console.log('   Password: maandhise11');
    console.log('\n📧 Contact Information:');
    console.log('   Email: Maandhisecorporate@gmail.com');

  } catch (error) {
    console.error('\n❌ Error creating superadmin:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n🔐 Authentication failed. Please check:');
      console.error('   - MongoDB connection string in .env file');
      console.error('   - Database user permissions');
    } else if (error.message.includes('network')) {
      console.error('\n🌐 Network error. Please check:');
      console.error('   - Internet connection');
      console.error('   - MongoDB Atlas cluster status');
    }
    
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
};

// Run the script
if (require.main === module) {
  createSuperadmin();
}

module.exports = createSuperadmin;
