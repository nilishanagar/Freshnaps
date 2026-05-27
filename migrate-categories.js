/**
 * Migration: Move legacy string category values to categoryLegacy field
 * Existing products have category stored as plain strings like 'mattress', 'pillow', etc.
 * The new schema expects category to be a MongoDB ObjectId ref to the Category collection.
 * This script moves the old string values to categoryLegacy and sets category to null.
 */
const mongoose = require('mongoose');
require('dotenv').config();

const LEGACY_CATEGORIES = [
  'mattress', 'pillow', 'bedsheet', 'cushion',
  'comforter', 'blanket', 'curtain', 'accessory',
];

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const col = mongoose.connection.collection('products');

  // Use aggregation pipeline update to copy category → categoryLegacy and null out category
  const result = await col.updateMany(
    { category: { $in: LEGACY_CATEGORIES } },
    [{ $set: { categoryLegacy: '$category', category: null } }]
  );

  console.log(`✅ Migrated ${result.modifiedCount} legacy products`);

  // Verify
  const sample = await col.findOne({ categoryLegacy: { $exists: true, $ne: null } });
  if (sample) {
    console.log(`   Sample: "${sample.name}" → categoryLegacy="${sample.categoryLegacy}", category=${sample.category}`);
  }

  await mongoose.disconnect();
  console.log('✅ Done. Legacy categories migrated successfully.');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
