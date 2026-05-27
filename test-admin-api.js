/**
 * Comprehensive API Test Suite — Freshnaps Admin Panel
 * Tests all new admin functionality added during the production upgrade.
 * Run: node test-admin-api.js
 */

require('dotenv').config();
const http = require('http');

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let createdProductId = '';
let createdCategoryId = '';

// ─── HTTP helper ────────────────────────────────────────
const request = (method, path, body = null, token = null) =>
  new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });
    req.on('error', (e) => resolve({ status: 0, body: { message: e.message } }));
    if (data) req.write(data);
    req.end();
  });

// ─── Reporter ────────────────────────────────────────────
const results = [];
let passed = 0, failed = 0;

function report(name, ok, detail = '') {
  const icon = ok ? '✅' : '❌';
  const msg = `${icon} ${name}${detail ? ` — ${detail}` : ''}`;
  console.log(msg);
  results.push({ name, ok, detail });
  if (ok) passed++; else failed++;
}

// ─── Tests ───────────────────────────────────────────────

async function testAdminLogin() {
  console.log('\n━━━ 1. Admin Authentication ━━━');

  const res = await request('POST', '/auth/admin-login', {
    email: 'admin@freshnaps.com',
    password: 'Admin@123',
  });

  if (res.status === 200 && res.body.token) {
    adminToken = res.body.token;
    report('Admin Login', true, `Token received (${adminToken.slice(0, 20)}...)`);
  } else {
    report('Admin Login', false, `Status ${res.status}: ${res.body.message || 'No token'}`);
    console.log('⛔ Cannot continue without auth token.');
    process.exit(1);
  }
}

async function testProductList() {
  console.log('\n━━━ 2. Product List (was returning 500) ━━━');

  const res = await request('GET', '/admin/products', null, adminToken);
  report('GET /admin/products — 200 OK', res.status === 200, `Status: ${res.status}`);

  if (res.status === 200) {
    const { products, total, pages } = res.body;
    report('Products array returned', Array.isArray(products), `Count: ${products?.length}`);
    report('Pagination fields present', total !== undefined && pages !== undefined, `total=${total}, pages=${pages}`);

    if (products?.length > 0) {
      const p = products[0];
      report('Product has name field', !!p.name, `"${p.name}"`);
      report('Product has categoryData (fallback)', !!p.categoryData, `"${p.categoryData?.name}"`);
      report('Legacy category migrated (null ObjectId)', p.category === null || p.category == null, `category=${p.category}`);
      report('categoryLegacy preserved', !!p.categoryLegacy, `"${p.categoryLegacy}"`);
    }
  }
}

async function testProductSearch() {
  console.log('\n━━━ 3. Product Search & Filter ━━━');

  const searchRes = await request('GET', '/admin/products?search=mattress', null, adminToken);
  report('Search by name', searchRes.status === 200, `Found ${searchRes.body.products?.length} results`);

  const statusRes = await request('GET', '/admin/products?status=draft', null, adminToken);
  report('Filter by status=draft', statusRes.status === 200, `Found ${statusRes.body.products?.length}`);

  const sortRes = await request('GET', '/admin/products?sort=price', null, adminToken);
  report('Sort by price', sortRes.status === 200, `Found ${sortRes.body.products?.length}`);

  const pageRes = await request('GET', '/admin/products?page=1&limit=3', null, adminToken);
  report('Pagination limit=3', pageRes.status === 200 && pageRes.body.products?.length <= 3, `Got ${pageRes.body.products?.length}`);
}

async function testCategories() {
  console.log('\n━━━ 4. Category Management ━━━');

  // Create root category
  const createRes = await request('POST', '/categories', {
    name: 'Home & Bedding',
    description: 'All home and bedding products',
  }, adminToken);
  report('POST /categories — Create root category', createRes.status === 201, `Status: ${createRes.status}, ID: ${createRes.body.category?._id}`);

  if (createRes.status === 201) {
    createdCategoryId = createRes.body.category._id;

    // Create subcategory
    const subRes = await request('POST', '/categories', {
      name: 'Mattresses',
      parent: createdCategoryId,
    }, adminToken);
    report('POST /categories — Create subcategory with parent', subRes.status === 201, `ID: ${subRes.body.category?._id}`);
  }

  // List categories
  const listRes = await request('GET', '/categories', null);
  report('GET /categories — Public list', listRes.status === 200, `Count: ${listRes.body.categories?.length}`);

  // Get tree
  const treeRes = await request('GET', '/categories/tree', null);
  report('GET /categories/tree — Nested tree', treeRes.status === 200, `Roots: ${treeRes.body.categories?.length}`);

  // Duplicate slug protection
  const dupRes = await request('POST', '/categories', { name: 'Home & Bedding' }, adminToken);
  report('Duplicate category name creates unique slug', dupRes.status === 201 && dupRes.body.category?.slug !== 'home-bedding', `Slug: ${dupRes.body.category?.slug}`);

  // Update
  if (createdCategoryId) {
    const updateRes = await request('PUT', `/categories/${createdCategoryId}`, { name: 'Home & Bedding (Updated)' }, adminToken);
    report('PUT /categories/:id — Update category', updateRes.status === 200, `Status: ${updateRes.status}`);
  }
}

async function testSkuCheck() {
  console.log('\n━━━ 5. SKU Availability Check ━━━');

  const availRes = await request('GET', '/admin/products/check-sku?sku=TEST-SKU-UNIQUE-12345', null, adminToken);
  report('SKU check — available SKU', availRes.status === 200 && availRes.body.available === true, `available=${availRes.body.available}`);

  // Missing SKU param
  const missingRes = await request('GET', '/admin/products/check-sku', null, adminToken);
  report('SKU check — missing SKU param returns 422', missingRes.status === 422, `Status: ${missingRes.status}`);
}

async function testCreateProduct() {
  console.log('\n━━━ 6. Create Product (Full Production Schema) ━━━');

  const productPayload = {
    name: 'Test Premium Pillow',
    sku: 'FN-PILLOW-TEST-001',
    barcode: '1234567890123',
    brand: 'Freshnaps',
    vendor: 'Test Vendor',
    shortDescription: 'A premium test pillow.',
    description: '<p>This is a <strong>premium</strong> test pillow with excellent quality.</p>',
    material: '100% Egyptian Cotton',
    washCare: 'Machine wash cold, tumble dry low',
    warranty: '2 years manufacturer warranty',
    costPrice: 500,
    price: 1999,
    discountPrice: 1499,
    taxPercent: 18,
    status: 'draft',
    isFeatured: false,
    isBestseller: false,
    isTrending: false,
    isNewArrival: true,
    isVisible: true,
    isSearchable: true,
    stock: 50,
    trackInventory: true,
    lowStockThreshold: 10,
    allowBackorders: false,
    warehouseLocation: 'Shelf A-3',
    hasVariants: true,
    variantAttributes: ['Size', 'Firmness'],
    variants: [
      {
        name: 'Standard / Soft',
        sku: 'FN-PILLOW-TEST-001-STD-SOFT',
        price: 1499,
        discountPrice: 1299,
        stock: 25,
        attributes: { Size: 'Standard', Firmness: 'Soft' },
      },
      {
        name: 'King / Medium',
        sku: 'FN-PILLOW-TEST-001-KNG-MED',
        price: 1699,
        discountPrice: 1499,
        stock: 25,
        attributes: { Size: 'King', Firmness: 'Medium' },
      },
    ],
    weight: 0.8,
    dimensions: { length: 70, width: 50, height: 15 },
    shippingClass: 'standard',
    isFreeShipping: false,
    isCOD: true,
    tags: ['pillow', 'test', 'premium'],
    seo: {
      metaTitle: 'Test Premium Pillow | Freshnaps',
      metaDescription: 'Buy the best premium test pillow from Freshnaps. Soft, comfortable, and long-lasting.',
      focusKeyword: 'premium pillow',
      seoSlug: 'test-premium-pillow',
    },
  };

  const res = await request('POST', '/admin/products', productPayload, adminToken);
  report('POST /admin/products — Create full product', res.status === 201, `Status: ${res.status}, ID: ${res.body.product?._id}`);

  if (res.status === 201) {
    createdProductId = res.body.product._id;
    const p = res.body.product;
    report('Product name saved correctly', p.name === 'Test Premium Pillow', `"${p.name}"`);
    report('Slug auto-generated', !!p.slug && p.slug.includes('test-premium-pillow'), `"${p.slug}"`);
    report('SKU saved', p.sku === 'FN-PILLOW-TEST-001', `"${p.sku}"`);
    report('Status is draft', p.status === 'draft', `"${p.status}"`);
    report('Variants saved', Array.isArray(p.variants) && p.variants.length === 2, `Count: ${p.variants?.length}`);
    report('SEO data saved', !!p.seo?.metaTitle, `"${p.seo?.metaTitle}"`);
    report('Shipping data saved', p.weight === 0.8 && p.isCOD === true, `weight=${p.weight}, COD=${p.isCOD}`);
    report('Inventory data saved', p.stock === 50 && p.lowStockThreshold === 10, `stock=${p.stock}, threshold=${p.lowStockThreshold}`);
    report('Pricing data saved', p.price === 1999 && p.discountPrice === 1499, `MRP=${p.price}, selling=${p.discountPrice}`);
  } else {
    console.log('   Error details:', JSON.stringify(res.body).slice(0, 300));
  }
}

async function testDuplicateSku() {
  console.log('\n━━━ 7. Duplicate SKU Prevention ━━━');

  const res = await request('POST', '/admin/products', {
    name: 'Duplicate SKU Product',
    sku: 'FN-PILLOW-TEST-001', // already used above
    price: 999,
  }, adminToken);
  report('Duplicate SKU blocked (409)', res.status === 409, `Status: ${res.status}, msg: "${res.body.message}"`);
}

async function testValidation() {
  console.log('\n━━━ 8. Validation (express-validator) ━━━');

  // Missing name
  const noName = await request('POST', '/admin/products', { price: 999 }, adminToken);
  report('Missing name → 422', noName.status === 422, `Status: ${noName.status}`);

  // Negative price
  const negPrice = await request('POST', '/admin/products', { name: 'Bad Product', price: -100 }, adminToken);
  report('Negative price → 422', negPrice.status === 422, `Status: ${negPrice.status}`);

  // Discount >= MRP
  const badDiscount = await request('POST', '/admin/products', {
    name: 'Bad Discount',
    price: 1000,
    discountPrice: 1500,
  }, adminToken);
  report('Discount >= MRP → 422', badDiscount.status === 422, `Status: ${badDiscount.status}`);

  // Negative stock
  const negStock = await request('POST', '/admin/products', {
    name: 'Neg Stock',
    price: 999,
    stock: -5,
  }, adminToken);
  report('Negative stock → 422', negStock.status === 422, `Status: ${negStock.status}`);
}

async function testGetSingleProduct() {
  console.log('\n━━━ 9. Get Single Product (for Edit) ━━━');

  if (!createdProductId) {
    report('GET /admin/products/:id', false, 'No product ID (create test failed)');
    return;
  }

  const res = await request('GET', `/admin/products/${createdProductId}`, null, adminToken);
  report('GET /admin/products/:id — 200 OK', res.status === 200, `Status: ${res.status}`);

  if (res.status === 200) {
    const p = res.body.product;
    report('Full product data returned', !!p.name && !!p.sku, `name="${p.name}", sku="${p.sku}"`);
    report('Variants included', Array.isArray(p.variants), `Count: ${p.variants?.length}`);
    report('SEO included', !!p.seo, `metaTitle="${p.seo?.metaTitle}"`);
  }
}

async function testUpdateProduct() {
  console.log('\n━━━ 10. Update Product ━━━');

  if (!createdProductId) {
    report('PUT /admin/products/:id', false, 'No product ID');
    return;
  }

  const res = await request('PUT', `/admin/products/${createdProductId}`, {
    name: 'Test Premium Pillow (Updated)',
    status: 'published',
    price: 2199,
    discountPrice: 1699,
    isFeatured: true,
    stock: 75,
    seo: {
      metaTitle: 'Updated Meta Title | Freshnaps',
      metaDescription: 'Updated meta description for SEO testing.',
    },
  }, adminToken);

  report('PUT /admin/products/:id — 200 OK', res.status === 200, `Status: ${res.status}`);

  if (res.status === 200) {
    const p = res.body.product;
    report('Name updated', p.name === 'Test Premium Pillow (Updated)', `"${p.name}"`);
    report('Status changed to published', p.status === 'published', `"${p.status}"`);
    report('Price updated', p.price === 2199, `${p.price}`);
    report('isFeatured updated', p.isFeatured === true, `${p.isFeatured}`);
    report('Slug regenerated from new name', p.slug?.includes('test-premium-pillow'), `"${p.slug}"`);
  }
}

async function testSkuCheckExcludeId() {
  console.log('\n━━━ 11. SKU Check with excludeId (Edit Mode) ━━━');

  if (!createdProductId) {
    report('SKU check with excludeId', false, 'No product ID');
    return;
  }

  // Same SKU but excluded by own ID — should be available (for edit own product)
  const selfRes = await request('GET', `/admin/products/check-sku?sku=FN-PILLOW-TEST-001&excludeId=${createdProductId}`, null, adminToken);
  report('SKU available when excluded by own ID', selfRes.status === 200 && selfRes.body.available === true, `available=${selfRes.body.available}`);
}

async function testProductListAfterPublish() {
  console.log('\n━━━ 12. Product List After Updates ━━━');

  const statusRes = await request('GET', '/admin/products?status=published', null, adminToken);
  report('Filter published products', statusRes.status === 200, `Found ${statusRes.body.products?.length} published products`);

  const hasOurProduct = statusRes.body.products?.some((p) => p._id === createdProductId);
  report('Our product appears as published', hasOurProduct, createdProductId);
}

async function testDeleteProduct() {
  console.log('\n━━━ 13. Soft Delete Product ━━━');

  if (!createdProductId) {
    report('DELETE /admin/products/:id', false, 'No product ID');
    return;
  }

  const res = await request('DELETE', `/admin/products/${createdProductId}`, null, adminToken);
  report('DELETE /admin/products/:id — 200 OK (soft delete)', res.status === 200, `Status: ${res.status}, msg: "${res.body.message}"`);

  // Verify it's archived (not returned in active list)
  const listRes = await request('GET', '/admin/products', null, adminToken);
  const stillActive = listRes.body.products?.some((p) => p._id === createdProductId);
  report('Deleted product not in active list', !stillActive, stillActive ? 'STILL VISIBLE (bug!)' : 'Correctly hidden');
}

async function testPublicProductApi() {
  console.log('\n━━━ 14. Public Product API (Storefront Backward Compat) ━━━');

  const res = await request('GET', '/products', null);
  report('GET /api/products — Still works', res.status === 200, `Status: ${res.status}, Count: ${res.body.products?.length}`);

  const byCategory = await request('GET', '/products?category=mattress', null);
  report('Filter by legacy category string "mattress"', byCategory.status === 200, `Count: ${byCategory.body.products?.length}`);

  const featured = await request('GET', '/products?featured=true&limit=4', null);
  report('Featured products still work', featured.status === 200, `Count: ${featured.body.products?.length}`);
}

async function testCategoryUnauthorized() {
  console.log('\n━━━ 15. Auth Protection ━━━');

  // No token
  const noAuth = await request('POST', '/categories', { name: 'Hack Attempt' });
  report('POST /categories without token → 401', noAuth.status === 401, `Status: ${noAuth.status}`);

  const noAuthProduct = await request('POST', '/admin/products', { name: 'Hack', price: 100 });
  report('POST /admin/products without token → 401', noAuthProduct.status === 401, `Status: ${noAuthProduct.status}`);

  const noAuthDelete = await request('DELETE', `/admin/products/${createdProductId || '123'}`);
  report('DELETE /admin/products without token → 401', noAuthDelete.status === 401, `Status: ${noAuthDelete.status}`);
}

// ─── Main runner ──────────────────────────────────────────

async function cleanupPreviousRun() {
  // Clean test SKU via admin API (requires auth)
  if (!adminToken) return;
  // Try to find and delete test product by SKU via check
  const check = await request('GET', '/admin/products/check-sku?sku=FN-PILLOW-TEST-001', null, adminToken);
  if (check.body?.available === false) {
    // Find by listing and delete
    const list = await request('GET', '/admin/products?search=Test+Premium+Pillow', null, adminToken);
    for (const p of (list.body?.products || [])) {
      if (p.sku === 'FN-PILLOW-TEST-001') {
        await request('DELETE', `/admin/products/${p._id}`, null, adminToken);
        // Also hard delete via direct purge isn't possible via API — rely on soft delete
      }
    }
  }
}

async function run() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  Freshnaps Admin Panel — Full API Test     ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`Target: ${BASE_URL}`);

  try {
    await testAdminLogin();
    await cleanupPreviousRun(); // Remove stale test data from previous runs
    await testProductList();
    await testProductSearch();
    await testCategories();
    await testSkuCheck();
    await testCreateProduct();
    await testDuplicateSku();
    await testValidation();
    await testGetSingleProduct();
    await testUpdateProduct();
    await testSkuCheckExcludeId();
    await testProductListAfterPublish();
    await testDeleteProduct();
    await testPublicProductApi();
    await testCategoryUnauthorized();
  } catch (err) {
    console.error('\n💥 Unexpected error:', err.message);
  }

  // ─── Summary ──────────────────────────────────────────────
  console.log('\n╔════════════════════════════════════════════╗');
  console.log(`║  Results: ${passed} passed, ${failed} failed${' '.repeat(Math.max(0, 21 - String(passed + failed).length))} ║`);
  console.log('╚════════════════════════════════════════════╝');

  if (failed > 0) {
    console.log('\n❌ Failed tests:');
    results.filter((r) => !r.ok).forEach((r) => console.log(`  • ${r.name}: ${r.detail}`));
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

run();
