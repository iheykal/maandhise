const mongoose = require('mongoose');
require('dotenv').config();

// Import Category model
const Category = require('../src/models/Category');

// Updated category colors - stronger and more vibrant
const categoryColorUpdates = {
  'supermarket': { from: 'from-green-600', to: 'to-green-800' },
  'pharmacy': { from: 'from-blue-600', to: 'to-blue-800' },
  'restaurant': { from: 'from-red-600', to: 'to-red-800' },
  'clothing': { from: 'from-purple-600', to: 'to-purple-800' },
  'electronics': { from: 'from-indigo-600', to: 'to-indigo-800' },
  'beauty': { from: 'from-pink-600', to: 'to-pink-800' },
  'healthcare': { from: 'from-teal-600', to: 'to-teal-800' },
  'telecommunication': { from: 'from-cyan-600', to: 'to-cyan-800' },
  'cargo-travel-agency': { from: 'from-orange-600', to: 'to-orange-800' },
  'other': { from: 'from-gray-700', to: 'to-gray-900' }
};

async function updateCategoryColors() {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/maandhise';
    await mongoose.connect(mongoUri, options);
    console.log('✅ Connected to MongoDB successfully!');

    let updated = 0;
    let notFound = 0;

    // Update each category
    for (const [categoryName, colors] of Object.entries(categoryColorUpdates)) {
      try {
        const category = await Category.findOne({ name: categoryName });
        
        if (category) {
          category.color = colors;
          await category.save();
          console.log(`✅ Updated "${categoryName}": ${colors.from} → ${colors.to}`);
          updated++;
        } else {
          console.log(`⏭️  Category "${categoryName}" not found - skipping`);
          notFound++;
        }
      } catch (error) {
        console.error(`❌ Error updating category "${categoryName}":`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Updated: ${updated}`);
    console.log(`   Not Found: ${notFound}`);
    console.log(`   Total: ${Object.keys(categoryColorUpdates).length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Color update completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the update function
updateCategoryColors();

