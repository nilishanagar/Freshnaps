require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');

const adminUser = {
  name: 'Freshnaps Admin',
  email: 'admin@freshnaps.com',
  password: 'Admin@123',
  role: 'admin',
};

// Dummy object ID for user in reviews
const DUMMY_USER_ID = new mongoose.Types.ObjectId();

const products = [
  {
    name: 'Cloud Comfort Memory Foam Mattress',
    slug: 'cloud-comfort-memory-foam-mattress',
    description: 'Experience heavenly sleep with our premium memory foam mattress. Engineered for perfect spinal alignment, temperature regulation, and pressure relief. The Cloud Comfort series uses adaptive cooling technology to ensure you never sleep hot, while the 5-zone support system targets your shoulders, back, and hips to relieve pressure points.',
    shortDescription: 'Premium memory foam with 5-zone support and cooling tech.',
    category: 'mattress',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800',
    ],
    price: 24999,
    discountPrice: 18999,
    stock: 25,
    variants: [
      { size: 'Single', stock: 8, price: 18999, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' },
      { size: 'Double', stock: 10, price: 21999, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800' },
      { size: 'Queen', stock: 5, price: 24999, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' },
      { size: 'King', stock: 2, price: 28999, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800' },
    ],
    features: ['Cooling memory foam', '5-zone orthopedic support', '10-year warranty', 'CertiPUR-US certified', 'Removable washable cover'],
    tags: ['mattress', 'memory foam', 'orthopedic', 'luxury'],
    reviews: [
      { user: DUMMY_USER_ID, name: 'Ankita Verma', rating: 5, comment: 'Absolutely life-changing mattress. My back pain is gone!' },
      { user: DUMMY_USER_ID, name: 'Rohan Sharma', rating: 4, comment: 'Very comfortable, but it took a few days to get used to the memory foam feel.' }
    ],
    isFeatured: true,
    isBestseller: true,
  },
  {
    name: 'Royal Silk Pillowcase Set',
    slug: 'royal-silk-pillowcase-set',
    description: 'Indulge in the luxury of 100% pure mulberry silk pillowcases. Woven at a luxurious 22 momme weight, these pillowcases are incredibly soft and gentle on your hair and skin. Silk naturally regulates temperature, keeping you cool in summer and warm in winter. They also prevent hair breakage and sleep creases.',
    shortDescription: '100% Mulberry Silk — gentle on hair & skin, set of 2.',
    category: 'pillow',
    images: [
      'https://images.unsplash.com/photo-1592789705501-f9ae4278a9bc?w=800',
      'https://images.unsplash.com/photo-1560472355-536de3962603?w=800',
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800'
    ],
    price: 3499,
    discountPrice: 2499,
    stock: 80,
    variants: [
      { color: 'Ivory White', stock: 30, price: 3499, image: 'https://images.unsplash.com/photo-1592789705501-f9ae4278a9bc?w=800' },
      { color: 'Blush Pink', stock: 25, price: 3499, image: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800' },
      { color: 'Charcoal Grey', stock: 25, price: 3499, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800' },
    ],
    features: ['100% Pure Mulberry Silk', '22 momme premium weight', 'Hypoallergenic & breathable', 'Reduces friction & hair breakage', 'Hidden zipper design'],
    tags: ['pillow', 'silk', 'luxury', 'hair care'],
    reviews: [
      { user: DUMMY_USER_ID, name: 'Kavya S.', rating: 5, comment: 'These are gorgeous. My hair is noticeably less frizzy in the mornings.' },
      { user: DUMMY_USER_ID, name: 'Megha P.', rating: 5, comment: 'So soft and cool to the touch. Highly recommend!' }
    ],
    isFeatured: true,
    isBestseller: true,
  },
  {
    name: 'Linen Dreams Bedsheet Set',
    slug: 'linen-dreams-bedsheet-set',
    description: 'Our 500 thread count Egyptian cotton bedsheet set includes 1 flat sheet, 1 fitted sheet and 2 pillowcases. Crafted with a premium sateen weave, these sheets offer a lustrous finish and exceptional durability. They grow softer with every wash and provide excellent breathability for a perfect night’s sleep.',
    shortDescription: '500 TC Egyptian Cotton — Complete set of 4 pieces.',
    category: 'bedsheet',
    images: [
      'https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    ],
    price: 4999,
    discountPrice: 3499,
    stock: 60,
    variants: [
      { size: 'Queen', color: 'Pure White', stock: 20, price: 4999, image: 'https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?w=800' },
      { size: 'King', color: 'Pure White', stock: 15, price: 5499, image: 'https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?w=800' },
      { size: 'Queen', color: 'Sage Green', stock: 15, price: 4999, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800' },
      { size: 'King', color: 'Sage Green', stock: 10, price: 5499, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800' },
    ],
    features: ['500 thread count Egyptian cotton', 'Luxurious sateen weave', 'Extra-deep pocket fitted sheet', 'Oeko-Tex certified', 'Fade & wrinkle resistant'],
    tags: ['bedsheet', 'cotton', 'luxury', 'set'],
    reviews: [
      { user: DUMMY_USER_ID, name: 'Vikas T.', rating: 4, comment: 'Excellent quality and very breathable. The Sage Green color is beautiful.' }
    ],
    isFeatured: true,
    isBestseller: false,
  },
  {
    name: 'Velvet Comfort Cushion Set',
    slug: 'velvet-comfort-cushion-set',
    description: 'Transform your living space or bedroom with our premium velvet cushions. This set of 5 features a rich, plush texture that adds instant elegance to any room. Filled with high-resilience premium fiber, they maintain their shape while offering perfect lumbar support.',
    shortDescription: 'Premium velvet — Set of 5 plush decorative cushions.',
    category: 'cushion',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800'
    ],
    price: 2999,
    discountPrice: 1999,
    stock: 45,
    variants: [
      { color: 'Emerald Green', stock: 15, price: 2999, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800' },
      { color: 'Sapphire Blue', stock: 15, price: 2999, image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800' },
      { color: 'Burgundy', stock: 15, price: 2999, image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800' },
    ],
    features: ['Luxe velvet fabric', 'Concealed zipper closure', 'Includes premium inserts', '45x45cm perfect size', 'Machine washable covers'],
    tags: ['cushion', 'velvet', 'decorative', 'set'],
    reviews: [
      { user: DUMMY_USER_ID, name: 'Sneha R.', rating: 5, comment: 'The velvet feels incredibly premium and the colors are deep and rich.' },
      { user: DUMMY_USER_ID, name: 'Priya K.', rating: 5, comment: 'Perfect addition to my living room couch!' }
    ],
    isFeatured: false,
    isBestseller: true,
    isTrending: true,
  },
  {
    name: 'All-Season Goose Down Comforter',
    slug: 'all-season-goose-down-comforter',
    description: 'Experience hotel-quality luxury with our premium goose down comforter. It provides exceptional warmth without the heavy weight. The baffle-box construction ensures the down stays evenly distributed, eliminating cold spots. Encased in a soft, 300-thread count cotton shell.',
    shortDescription: 'Premium goose down — lightweight yet supremely warm.',
    category: 'comforter',
    images: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
      'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800',
    ],
    price: 8999,
    discountPrice: 6499,
    stock: 30,
    variants: [
      { size: 'Double', stock: 10, price: 8999, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800' },
      { size: 'Queen', stock: 8, price: 9999, image: 'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800' },
      { size: 'King', stock: 2, price: 11999, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800' },
    ],
    features: ['Premium responsibly-sourced goose down', 'Baffle-box construction', '300 TC breathable cotton shell', 'Corner tabs for duvet cover', 'All-season thermal rating'],
    tags: ['comforter', 'goose down', 'all season', 'luxury'],
    reviews: [
      { user: DUMMY_USER_ID, name: 'Ajay M.', rating: 5, comment: 'So fluffy and warm! Best sleep investment ever.' }
    ],
    isFeatured: true,
    isBestseller: false,
    isTrending: true,
  },
  {
    name: 'Cashmere Touch Weighted Blanket',
    slug: 'cashmere-touch-weighted-blanket',
    description: 'Our weighted blanket uses Deep Touch Pressure stimulation to mimic the feeling of a gentle hug. It reduces cortisol levels and boosts melatonin to help you fall asleep faster. Featuring a luxurious cashmere-feel outer layer and premium glass bead filling for quiet, even weight distribution.',
    shortDescription: 'Weighted comfort for deeper, calmer sleep & anxiety relief.',
    category: 'blanket',
    images: [
      'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=800',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    ],
    price: 5999,
    discountPrice: 4299,
    stock: 40,
    variants: [
      { size: '7kg', color: 'Stone Grey', stock: 20, price: 5999, image: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=800' },
      { size: '9kg', color: 'Navy Blue', stock: 20, price: 6999, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' },
    ],
    features: ['Reduces stress & anxiety naturally', 'Ultra-soft cashmere-blend cover', 'Micro-glass bead filling', '7-layer leak-proof structure', 'Machine washable cover'],
    tags: ['blanket', 'weighted', 'anxiety relief', 'luxury'],
    reviews: [
      { user: DUMMY_USER_ID, name: 'Siddharth G.', rating: 5, comment: 'It really helps me fall asleep faster. The material is very cozy.' },
      { user: DUMMY_USER_ID, name: 'Nisha B.', rating: 4, comment: 'Great quality, but 9kg is quite heavy for a single person. Go for 7kg if unsure.' }
    ],
    isFeatured: false,
    isBestseller: false,
    isTrending: true,
  },
  {
    name: 'Blackout Linen Curtains',
    slug: 'blackout-linen-curtains',
    description: 'Transform your bedroom into a perfect sleep sanctuary. These premium blackout curtains block 100% of external light while adding an elegant, textured linen look to your space. They also offer thermal insulation and noise reduction for maximum comfort.',
    shortDescription: '100% blackout with an elegant textured linen look.',
    category: 'curtain',
    images: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    ],
    price: 3999,
    discountPrice: 2799,
    stock: 55,
    variants: [
      { size: '7 feet', color: 'Ivory', stock: 18, price: 3999, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800' },
      { size: '9 feet', color: 'Charcoal', stock: 19, price: 4499, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800' },
    ],
    features: ['Blocks 100% of UV rays and light', 'Thermal insulation', 'Reduces outside noise', 'Elegant textured linen face', 'Easy-to-hang rustproof grommets'],
    tags: ['curtain', 'blackout', 'linen', 'bedroom'],
    reviews: [
      { user: DUMMY_USER_ID, name: 'Tanya W.', rating: 5, comment: 'They truly block out all the sunlight. Perfect for my Sunday sleep-ins.' }
    ],
    isFeatured: false,
    isBestseller: false,
    isTrending: false,
  },
  {
    name: 'Bamboo Mattress Protector',
    slug: 'bamboo-mattress-protector',
    description: 'Protect your mattress investment with our premium bamboo protector. The top layer is made of sustainable bamboo viscose which is incredibly soft, breathable, and naturally cooling. The 100% waterproof backing protects against spills without making any crinkling noise.',
    shortDescription: 'Waterproof, breathable bamboo layer — silent protection.',
    category: 'accessory',
    images: [
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800',
      'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800',
    ],
    price: 1999,
    discountPrice: 1399,
    stock: 100,
    variants: [
      { size: 'Single', stock: 30, price: 1999, image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800' },
      { size: 'Double', stock: 30, price: 2199, image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800' },
      { size: 'Queen', stock: 25, price: 2399, image: 'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800' },
      { size: 'King', stock: 15, price: 2599, image: 'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800' },
    ],
    features: ['100% liquid proof protection', 'Cooling bamboo surface', 'Noiseless TPU backing', 'Hypoallergenic barrier against dust mites', 'Deep 360° fitted skirt'],
    tags: ['accessory', 'mattress protector', 'bamboo', 'waterproof'],
    reviews: [
      { user: DUMMY_USER_ID, name: 'Ravi D.', rating: 5, comment: 'Saved my mattress from a coffee spill. Washed it and it\'s good as new!' },
      { user: DUMMY_USER_ID, name: 'Neha S.', rating: 5, comment: 'You don\'t even feel that there is a waterproof layer underneath. Very breathable.' }
    ],
    isFeatured: false,
    isBestseller: true,
    isTrending: false,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for seeding');

    await User.deleteMany({ role: 'admin', email: adminUser.email });
    await Product.deleteMany({});

    const admin = await User.create(adminUser);
    console.log('✅ Admin user created: admin@freshnaps.com / Admin@123');

    // Attach admin id to all reviews
    products.forEach(p => {
      p.reviews.forEach(r => r.user = admin._id);
    });

    const createdProducts = await Product.insertMany(products);
    
    // Auto compute ratings
    for(let prod of createdProducts) {
      prod.updateRating();
      await prod.save();
    }
    
    console.log(`✅ ${products.length} products seeded`);

    console.log('\n🎉 Database seeded successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();
