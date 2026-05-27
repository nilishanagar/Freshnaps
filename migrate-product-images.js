/**
 * Migration Script: Migrate Product plain string images to [imageSchema] objects
 * All legacy products had images stored as plain arrays of strings like ["https://..."]
 * The expanded schema expects an array of objects like [{ url: "...", publicId: "", isPrimary: true, sortOrder: 0 }]
 * Run: node migrate-product-images.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function migrate() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to check.`);

    let migratedCount = 0;

    for (const product of products) {
      let needsMigration = false;
      const newImages = [];

      for (let i = 0; i < product.images.length; i++) {
        const img = product.images[i];
        // If image is a string, migrate it
        if (typeof img === 'string') {
          needsMigration = true;
          newImages.push({
            url: img,
            publicId: '',
            isPrimary: i === 0,
            sortOrder: i,
          });
        } else if (img && typeof img === 'object' && !img.url) {
          // Sometimes mongoose might return an object without a url if it failed to cast
          needsMigration = true;
        } else {
          // Already an object, keep it
          newImages.push(img);
        }
      }

      if (needsMigration || product.images.length === 0) {
        // If we fetched the document using Mongoose and the schema tried to parse the strings,
        // it might have failed or returned empty/broken elements. 
        // To be safe, we can use the raw MongoDB connection to update the document directly.
        const dbProduct = await mongoose.connection.collection('products').findOne({ _id: product._id });
        
        if (dbProduct && Array.isArray(dbProduct.images)) {
          const rawImages = dbProduct.images;
          const mapped = rawImages.map((img, index) => {
            if (typeof img === 'string') {
              return {
                url: img,
                publicId: '',
                isPrimary: index === 0,
                sortOrder: index,
              };
            }
            return img; // Already in object format
          });

          await mongoose.connection.collection('products').updateOne(
            { _id: product._id },
            { $set: { images: mapped } }
          );
          migratedCount++;
          console.log(`Migrated images for product: ${product.name}`);
        }
      }
    }

    console.log(`\n🎉 Image migration complete! ${migratedCount} products updated successfully.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
