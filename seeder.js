require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const products = [
  {
    name: 'Cloud Comfort Memory Foam Mattress',
    slug: 'cloud-comfort-memory-foam-mattress',
    description: 'Experience heavenly sleep with our premium memory foam mattress. Engineered for perfect spinal alignment, temperature regulation, and pressure relief. Available in multiple sizes.',
    shortDescription: 'Premium memory foam for perfect sleep',
    category: 'mattress',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800',
    ],
    price: 24999,
    discountPrice: 18999,
    stock: 25,
    variants: [
      { size: 'Single (75x36)', stock: 8, price: 18999 },
      { size: 'Double (75x48)', stock: 10, price: 21999 },
      { size: 'Queen (75x60)', stock: 5, price: 24999 },
      { size: 'King (75x72)', stock: 2, price: 28999 },
    ],
    features: ['Memory foam technology', 'Orthopedic support', '10-year warranty', 'CertiPUR certified', 'Washable cover'],
    tags: ['mattress', 'memory foam', 'orthopedic', 'luxury'],
    rating: 4.8,
    numReviews: 124,
    isFeatured: true,
    isBestseller: true,
  },
  {
    name: 'Royal Silk Pillowcase Set',
    slug: 'royal-silk-pillowcase-set',
    description: 'Indulge in the luxury of 100% mulberry silk pillowcases. Gentle on hair and skin, temperature regulating and incredibly soft. Set of 2.',
    shortDescription: '100% Mulberry Silk — gentle on hair & skin',
    category: 'pillow',
    images: [
      'https://images.unsplash.com/photo-1592789705501-f9ae4278a9bc?w=800',
      'https://images.unsplash.com/photo-1560472355-536de3962603?w=800',
    ],
    price: 3499,
    discountPrice: 2499,
    stock: 80,
    variants: [
      { color: 'Ivory White', stock: 30 },
      { color: 'Blush Pink', stock: 25 },
      { color: 'Charcoal Grey', stock: 25 },
    ],
    features: ['100% Mulberry Silk', '22 momme weight', 'Hypoallergenic', 'Machine washable', 'Reduces hair breakage'],
    tags: ['pillow', 'silk', 'luxury', 'hair care'],
    rating: 4.9,
    numReviews: 89,
    isFeatured: true,
    isBestseller: true,
  },
  {
    name: 'Linen Dreams Bedsheet Set',
    slug: 'linen-dreams-bedsheet-set',
    description: 'Our 500 thread count Egyptian cotton bedsheet set includes 1 flat sheet, 1 fitted sheet and 2 pillowcases. Breathable, durable and luxuriously soft.',
    shortDescription: '500 TC Egyptian Cotton — Set of 4',
    category: 'bedsheet',
    images: [
      'https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    ],
    price: 4999,
    discountPrice: 3499,
    stock: 60,
    variants: [
      { size: 'Single', color: 'Pure White', stock: 20 },
      { size: 'Double', color: 'Pure White', stock: 15 },
      { size: 'Queen', color: 'Sage Green', stock: 15 },
      { size: 'King', color: 'Dusty Lilac', stock: 10 },
    ],
    features: ['500 thread count', 'Egyptian cotton', 'Sateen weave', 'Deep pocket fitted sheet', 'Fade resistant'],
    tags: ['bedsheet', 'cotton', 'luxury', 'set'],
    rating: 4.7,
    numReviews: 156,
    isFeatured: true,
    isBestseller: false,
  },
  {
    name: 'Velvet Comfort Cushion Set',
    slug: 'velvet-comfort-cushion-set',
    description: 'Transform your living space with our premium velvet cushions filled with premium fiber fill. Available in rich jewel tones. Set of 5.',
    shortDescription: 'Premium velvet — Set of 5 cushions',
    category: 'cushion',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800',
    ],
    price: 2999,
    discountPrice: 1999,
    stock: 45,
    variants: [
      { color: 'Emerald Green', stock: 15 },
      { color: 'Sapphire Blue', stock: 15 },
      { color: 'Burgundy', stock: 15 },
    ],
    features: ['Premium velvet fabric', 'Removable covers', 'Washable', '45x45cm size', 'Premium fiber fill'],
    tags: ['cushion', 'velvet', 'decorative', 'set'],
    rating: 4.6,
    numReviews: 72,
    isFeatured: false,
    isBestseller: true,
    isTrending: true,
  },
  {
    name: 'All-Season Goose Down Comforter',
    slug: 'all-season-goose-down-comforter',
    description: 'Our premium goose down comforter provides warmth without weight. Box-stitch construction prevents fill from shifting. Perfect for all seasons.',
    shortDescription: 'Goose down — lightweight yet supremely warm',
    category: 'comforter',
    images: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
      'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800',
    ],
    price: 8999,
    discountPrice: 6499,
    stock: 30,
    variants: [
      { size: 'Single', stock: 10 },
      { size: 'Double', stock: 10 },
      { size: 'Queen', stock: 8 },
      { size: 'King', stock: 2 },
    ],
    features: ['Premium goose down fill', 'Box-stitch construction', '300 thread count shell', 'Hypoallergenic', 'Machine washable'],
    tags: ['comforter', 'goose down', 'all season', 'luxury'],
    rating: 4.8,
    numReviews: 98,
    isFeatured: true,
    isBestseller: false,
    isTrending: true,
  },
  {
    name: 'Cashmere Touch Weighted Blanket',
    slug: 'cashmere-touch-weighted-blanket',
    description: 'Our 7kg weighted blanket mimics the feeling of a gentle embrace, promoting deeper sleep and reducing anxiety. Cashmere-like outer fabric.',
    shortDescription: 'Weighted comfort for deeper, calmer sleep',
    category: 'blanket',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=800',
    ],
    price: 5999,
    discountPrice: 4299,
    stock: 40,
    variants: [
      { size: '48x72" (7kg)', color: 'Stone Grey', stock: 20 },
      { size: '60x80" (9kg)', color: 'Navy Blue', stock: 20 },
    ],
    features: ['7kg / 9kg options', 'Cashmere-blend outer', 'Glass bead fill', 'Promotes deep sleep', 'Machine washable'],
    tags: ['blanket', 'weighted', 'anxiety relief', 'luxury'],
    rating: 4.7,
    numReviews: 63,
    isFeatured: false,
    isBestseller: false,
    isTrending: true,
  },
  {
    name: 'Blackout Linen Curtains',
    slug: 'blackout-linen-curtains',
    description: 'Our premium blackout curtains combine style with functionality. 100% blackout for perfect sleep environment. Available in 3 lengths.',
    shortDescription: '100% blackout — elegant linen texture',
    category: 'curtain',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
    ],
    price: 3999,
    discountPrice: 2799,
    stock: 55,
    variants: [
      { size: '7 feet', color: 'Ivory', stock: 18 },
      { size: '8 feet', color: 'Ivory', stock: 18 },
      { size: '9 feet', color: 'Charcoal', stock: 19 },
    ],
    features: ['100% blackout', 'Linen texture', 'Noise reducing', 'Eyelet top', 'Machine washable'],
    tags: ['curtain', 'blackout', 'linen', 'bedroom'],
    rating: 4.5,
    numReviews: 47,
    isFeatured: false,
    isBestseller: false,
    isTrending: false,
  },
  {
    name: 'Bamboo Mattress Protector',
    slug: 'bamboo-mattress-protector',
    description: 'Protect your mattress investment with our premium bamboo mattress protector. 100% waterproof yet breathable. Silent and cooling.',
    shortDescription: 'Waterproof bamboo — breathable protection',
    category: 'accessory',
    images: [
      'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800',
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800',
    ],
    price: 1999,
    discountPrice: 1399,
    stock: 100,
    variants: [
      { size: 'Single', stock: 30 },
      { size: 'Double', stock: 30 },
      { size: 'Queen', stock: 25 },
      { size: 'King', stock: 15 },
    ],
    features: ['100% waterproof', 'Bamboo top layer', 'Silent when moving', 'Hypoallergenic', '360° fitted skirt'],
    tags: ['accessory', 'mattress protector', 'bamboo', 'waterproof'],
    rating: 4.6,
    numReviews: 211,
    isFeatured: false,
    isBestseller: true,
    isTrending: false,
  },
];

const adminUser = {
  name: 'Freshnaps Admin',
  email: 'admin@freshnaps.com',
  password: 'Admin@123',
  role: 'admin',
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for seeding');

    await User.deleteMany({ role: 'admin', email: adminUser.email });
    await Product.deleteMany({});

    await User.create(adminUser);
    console.log('✅ Admin user created: admin@freshnaps.com / Admin@123');

    await Product.insertMany(products);
    console.log(`✅ ${products.length} products seeded`);

    console.log('\n🎉 Database seeded successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();
