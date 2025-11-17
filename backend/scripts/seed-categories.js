const mongoose = require('mongoose');
require('dotenv').config();

// Import Category model
const Category = require('../src/models/Category');

// Category definitions with strong, vibrant colors
const categoriesToSeed = [
  { name: 'supermarket', displayName: { en: 'Supermarket', so: 'Suuqa' }, color: { from: 'from-green-600', to: 'to-green-800' }, order: 1 },
  { name: 'pharmacy', displayName: { en: 'Pharmacy', so: 'Farmashiyo' }, color: { from: 'from-blue-600', to: 'to-blue-800' }, order: 2 },
  { name: 'restaurant', displayName: { en: 'Restaurant', so: 'Maqaayad' }, color: { from: 'from-red-600', to: 'to-red-800' }, order: 3 },
  { name: 'clothing', displayName: { en: 'Clothing', so: 'Dharka' }, color: { from: 'from-purple-600', to: 'to-purple-800' }, order: 4 },
  { name: 'electronics', displayName: { en: 'Electronics', so: 'Elektroonigga' }, color: { from: 'from-indigo-600', to: 'to-indigo-800' }, order: 5 },
  { name: 'beauty', displayName: { en: 'Beauty', so: 'Quruxda' }, color: { from: 'from-pink-600', to: 'to-pink-800' }, order: 6 },
  { name: 'healthcare', displayName: { en: 'Healthcare', so: 'Caafimaadka' }, color: { from: 'from-teal-600', to: 'to-teal-800' }, order: 7 },
  { name: 'telecommunication', displayName: { en: 'Telecommunication', so: 'Isgaarsiinta' }, color: { from: 'from-cyan-600', to: 'to-cyan-800' }, order: 8 },
  { name: 'cargo-travel-agency', displayName: { en: 'Cargo & Travel Agency', so: 'Gaadiidka & Safarka' }, color: { from: 'from-orange-600', to: 'to-orange-800' }, order: 9 },
  { name: 'other', displayName: { en: 'Other', so: 'Kale' }, color: { from: 'from-gray-700', to: 'to-gray-900' }, order: 10 }
];

async function seedCategories() {
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

    let created = 0;
    let skipped = 0;

    // Seed each category
    for (const categoryData of categoriesToSeed) {
      try {
        // Check if category already exists
        const existingCategory = await Category.findOne({ name: categoryData.name });
        
        if (existingCategory) {
          console.log(`⏭️  Skipping "${categoryData.displayName.en}" - already exists`);
          skipped++;
        } else {
          // Create new category
          const category = new Category({
            name: categoryData.name,
            displayName: categoryData.displayName,
            color: categoryData.color,
            order: categoryData.order,
            isActive: true
          });

          await category.save();
          console.log(`✅ Created category: "${categoryData.displayName.en}" (${categoryData.name})`);
          created++;
        }
      } catch (error) {
        console.error(`❌ Error creating category "${categoryData.displayName.en}":`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${categoriesToSeed.length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed function
seedCategories();

