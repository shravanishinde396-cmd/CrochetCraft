import { PrismaClient, Role, DiscountType, OrderStatus, PaymentStatus, PaymentMethod, StockStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean database
  await prisma.abandonedCartEmail.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.browsingHistory.deleteMany();
  await prisma.customOrder.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Admin User
  const adminPassword = await bcrypt.hash('Admin@1234!', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@crochetcraftpro.com',
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: true,
      phone: '9876543210',
    },
  });
  console.log('Admin user seeded:', admin.email);

  // 3. Create Customer User
  const customerPassword = await bcrypt.hash('Customer@1234!', 12);
  const customer = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: customerPassword,
      role: Role.CUSTOMER,
      emailVerified: true,
      phone: '9999988888',
      addresses: {
        create: {
          fullName: 'Jane Doe',
          phone: '9999988888',
          line1: 'Flat 402, Sunshine Apartments',
          line2: 'MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          country: 'India',
          isDefault: true,
        }
      }
    },
    include: {
      addresses: true
    }
  });
  const address = customer.addresses[0];
  console.log('Customer user seeded:', customer.email);

  // 4. Create Categories
  const categoryData = [
    { name: 'Crochet Flowers', slug: 'crochet-flowers', description: 'Beautiful handmade everlasting flowers for all occasions.', image: 'https://res.cloudinary.com/placeholder/image/upload/flowers.jpg' },
    { name: 'Crochet Bouquets', slug: 'crochet-bouquets', description: 'Premade and custom designed hand-tied yarn bouquets.', image: 'https://res.cloudinary.com/placeholder/image/upload/bouquets.jpg' },
    { name: 'Crochet Keychains', slug: 'crochet-keychains', description: 'Cute, pocket-sized crochet keychains for bags and keys.', image: 'https://res.cloudinary.com/placeholder/image/upload/keychains.jpg' },
    { name: 'Crochet Toys', slug: 'crochet-toys', description: 'Soft, safe, amigurumi toys for toddlers and children.', image: 'https://res.cloudinary.com/placeholder/image/upload/toys.jpg' },
    { name: 'Crochet Bags', slug: 'crochet-bags', description: 'Trendy, aesthetic hand-woven shoulder bags and purses.', image: 'https://res.cloudinary.com/placeholder/image/upload/bags.jpg' },
    { name: 'Home Decor', slug: 'home-decor', description: 'Artisanal crochet coasters, wall hangings, and pillows.', image: 'https://res.cloudinary.com/placeholder/image/upload/decor.jpg' },
    { name: 'Custom Gifts', slug: 'custom-gifts', description: 'Completely personalized items crafted to match your design.', image: 'https://res.cloudinary.com/placeholder/image/upload/gifts.jpg' },
  ];

  const categories = [];
  for (const cat of categoryData) {
    const created = await prisma.category.create({ data: cat });
    categories.push(created);
  }
  console.log(`${categories.length} categories seeded.`);

  // 5. Create Coupons
  const coupons = [
    {
      code: 'WELCOME10',
      description: 'Get 10% off on your first purchase.',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minimumOrder: 200,
      expiryDate: new Date('2028-12-31'),
      isFirstPurchase: true,
    },
    {
      code: 'SAVE50',
      description: 'Flat Rs. 50 off on orders above Rs. 500.',
      discountType: DiscountType.FLAT,
      discountValue: 50,
      minimumOrder: 500,
      expiryDate: new Date('2028-12-31'),
      isFirstPurchase: false,
    },
    {
      code: 'CRAFT20',
      description: '20% off on all items, capped at Rs. 200.',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
      maximumDiscount: 200,
      minimumOrder: 300,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isFirstPurchase: false,
    },
    {
      code: 'FLOWERS15',
      description: '15% off specifically on Crochet Flowers category.',
      discountType: DiscountType.CATEGORY,
      discountValue: 15,
      minimumOrder: 100,
      expiryDate: new Date('2028-12-31'),
      categoryId: categories.find(c => c.slug === 'crochet-flowers')?.id,
      isFirstPurchase: false,
    },
    {
      code: 'FREESHIP',
      description: 'Free shipping on orders above Rs. 1000.',
      discountType: DiscountType.FLAT,
      discountValue: 100, // Representing value of shipping
      minimumOrder: 1000,
      expiryDate: new Date('2028-12-31'),
      isFirstPurchase: false,
    }
  ];

  for (const c of coupons) {
    await prisma.coupon.create({ data: c });
  }
  console.log('Coupons seeded.');

  // 6. Create 20 Sample Products
  const productsData = [
    // Crochet Flowers
    { title: 'Premium Red Rose Stems', slug: 'premium-red-rose-stems', description: 'Individually hand-knitted romantic deep red roses. Perfect for desks, vases, or long-lasting gifts.', price: 199, stock: 45, sku: 'FLOW-ROSE-RED', categorySlug: 'crochet-flowers', featured: true, rating: 4.8 },
    { title: 'Cute Yellow Sunflowers', slug: 'cute-yellow-sunflowers', description: 'Sunny, bright, cheer-inducing hand-knitted yellow sunflowers with a flexible stem.', price: 249, stock: 3, sku: 'FLOW-SUN-YEL', categorySlug: 'crochet-flowers', featured: false, rating: 4.6 },
    { title: 'Pastel Lavender Twigs', slug: 'pastel-lavender-twigs', description: 'Calming lavender stems made with soft cotton yarn. Scented with lavender essential oil options.', price: 179, stock: 28, sku: 'FLOW-LAV-PST', categorySlug: 'crochet-flowers', featured: false, rating: 4.5 },
    
    // Crochet Bouquets
    { title: 'Everlasting Love Rose Bouquet', slug: 'everlasting-love-rose-bouquet', description: 'A gorgeous arrangement of 5 red roses, 2 white daisies, and baby breath filler, wrapped in premium mesh paper.', price: 1199, salePrice: 999, stock: 15, sku: 'BOUQ-ROSE-LOVE', categorySlug: 'crochet-bouquets', featured: true, bestSeller: true, rating: 4.9 },
    { title: 'Sunshine Joy Mixed Bouquet', slug: 'sunshine-joy-mixed-bouquet', description: 'A vibrant mixture of sunflowers, pink tulips, and eucalyptus green foliage. Sure to brighten any room.', price: 1399, stock: 8, sku: 'BOUQ-SUN-MIX', categorySlug: 'crochet-bouquets', featured: false, rating: 4.7 },
    { title: 'Whimsical Tulip Bunch', slug: 'whimsical-tulip-bunch', description: 'A bouquet of 6 pastel tulips in pink, purple, and cream shades, bundled with an aesthetic jute rope.', price: 899, salePrice: 799, stock: 20, sku: 'BOUQ-TULIP-WHIM', categorySlug: 'crochet-bouquets', featured: true, rating: 4.8 },

    // Crochet Keychains
    { title: 'Chubby Amigurumi Bee Keychain', slug: 'chubby-amigurumi-bee-keychain', description: 'A cute little yellow-and-black bumblebee keychain with tiny white wings and a sturdy metal clip.', price: 149, stock: 60, sku: 'KEY-BEE-CHUB', categorySlug: 'crochet-keychains', featured: true, bestSeller: true, rating: 4.9 },
    { title: 'Cute Strawberry Charm Keychain', slug: 'cute-strawberry-charm-keychain', description: 'Mini hand-knitted red strawberry charm with a green leafy top and key ring.', price: 99, stock: 80, sku: 'KEY-STRAW-MINI', categorySlug: 'crochet-keychains', featured: false, rating: 4.4 },
    { title: 'Fluffy White Bunny Keychain', slug: 'fluffy-white-bunny-keychain', description: 'A round, fluffy amigurumi bunny rabbit keychain with pink ears and details.', price: 169, stock: 2, sku: 'KEY-BUNNY-FLF', categorySlug: 'crochet-keychains', featured: false, rating: 4.7 },
    { title: 'Mini Boba Milk Tea Keychain', slug: 'mini-boba-milk-tea-keychain', description: 'Adorable miniature milk tea cup with tiny crocheted boba pearls and straw.', price: 159, stock: 40, sku: 'KEY-BOBA-MINI', categorySlug: 'crochet-keychains', featured: false, rating: 4.6 },

    // Crochet Toys
    { title: 'Friendly Dino Soft Toy', slug: 'friendly-dino-soft-toy', description: 'A child-safe, soft, plush green dinosaur amigurumi toy stuffed with premium hypoallergenic polyfill.', price: 699, stock: 12, sku: 'TOY-DINO-GRN', categorySlug: 'crochet-toys', featured: true, rating: 4.9 },
    { title: 'Sleepy Bear Plushie', slug: 'sleepy-bear-plushie', description: 'A brown teddy bear wearing a tiny blue knitted scarf. Perfect sleeping companion for babies.', price: 799, salePrice: 649, stock: 10, sku: 'TOY-BEAR-SLP', categorySlug: 'crochet-toys', featured: false, rating: 4.8 },
    { title: 'Interactive Octopus Wobbler', slug: 'interactive-octopus-wobbler', description: 'A cute octopus with curly springy tentacles that infants love to pull and stretch.', price: 499, stock: 18, sku: 'TOY-OCT-WOB', categorySlug: 'crochet-toys', featured: false, rating: 4.7 },

    // Crochet Bags
    { title: 'Boho Daisy Sling Bag', slug: 'boho-daisy-sling-bag', description: 'Retro 70s style granny square crochet bag with daisies. Fitted with a soft inner fabric lining and zipper.', price: 999, salePrice: 849, stock: 7, sku: 'BAG-DAISY-SLG', categorySlug: 'crochet-bags', featured: true, bestSeller: true, rating: 4.8 },
    { title: 'Aesthetic Checkerboard Tote', slug: 'aesthetic-checkerboard-tote', description: 'Modern pastel green and cream checkerboard patterned crochet shoulder bag, spacious enough for laptops.', price: 1299, stock: 5, sku: 'BAG-CHECK-TOTE', categorySlug: 'crochet-bags', featured: false, rating: 4.6 },
    { title: 'Elegant Shell Stitch Clutch', slug: 'elegant-shell-stitch-clutch', description: 'A sophisticated evening bag with a secure metallic clasp and gold chain strap.', price: 1199, stock: 11, sku: 'BAG-SHELL-CLT', categorySlug: 'crochet-bags', featured: false, rating: 4.7 },

    // Home Decor
    { title: 'Set of 4 Sunflower Coasters', slug: 'set-of-4-sunflower-coasters', description: 'Vibrant flower-shaped mug coasters to protect tables while adding a sunny aesthetic.', price: 299, stock: 30, sku: 'DEC-COAST-SUN', categorySlug: 'home-decor', featured: false, rating: 4.9 },
    { title: 'Macrame-Style Wall Hanging', slug: 'macrame-style-wall-hanging', description: 'Intricate crochet wall art mounted on a polished natural wooden branch. Cozy boho vibes.', price: 799, stock: 6, sku: 'DEC-WALL-HANG', categorySlug: 'home-decor', featured: true, rating: 4.8 },
    { title: 'Vintage Rose Cushion Cover', slug: 'vintage-rose-cushion-cover', description: 'Soft, textured square pillow case featuring premium relief floral stitches.', price: 599, stock: 14, sku: 'DEC-CUSH-ROSE', categorySlug: 'home-decor', featured: false, rating: 4.5 },

    // Custom Gifts
    { title: 'Custom Pet Portrait Portrait', slug: 'custom-pet-portrait-portrait', description: 'Send a photo of your pet, and we will handcraft a personalized 3D miniature plush frame.', price: 1499, stock: 10, sku: 'CUST-PET-PORT', categorySlug: 'custom-gifts', featured: true, rating: 5.0 },
  ];

  const products = [];
  for (const prod of productsData) {
    const cat = categories.find(c => c.slug === prod.categorySlug);
    if (!cat) continue;

    const stockStatus = prod.stock === 0 ? StockStatus.OUT_OF_STOCK : prod.stock <= 5 ? StockStatus.LOW_STOCK : StockStatus.IN_STOCK;

    const created = await prisma.product.create({
      data: {
        title: prod.title,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        salePrice: prod.salePrice || null,
        stock: prod.stock,
        sku: prod.sku,
        images: [`/images/products/${prod.slug}.jpg`, `/images/products/${prod.slug}-2.jpg`],
        categoryId: cat.id,
        featured: prod.featured,
        bestSeller: prod.bestSeller || false,
        rating: prod.rating,
        reviewsCount: 1,
        stockStatus: stockStatus,
        tags: [prod.categorySlug, 'handmade', 'crochet', 'gift'],
        material: '100% Organic Cotton Yarn',
        careInstructions: 'Gentle hand wash in cold water. Lay flat to dry.',
        totalSold: prod.bestSeller ? 50 : 5,
      }
    });

    // Seed initial inventory log
    await prisma.inventoryLog.create({
      data: {
        productId: created.id,
        quantity: prod.stock,
        reason: 'RESTOCK',
        reference: 'INITIAL_SEED',
      }
    });

    products.push(created);
  }
  console.log(`${products.length} products seeded.`);

  // 7. Create Reviews
  const reviews = [
    { rating: 5, title: 'Breathtakingly Beautiful!', review: 'I bought the everlasting red roses and they look so real but feel even better. Fantastic craft work!', productSlug: 'premium-red-rose-stems' },
    { rating: 4, title: 'Incredible detail', review: 'Very cute, though a tiny bit smaller than I expected. Excellent quality.', productSlug: 'cute-yellow-sunflowers' },
    { rating: 5, title: 'Gifted to my mother', review: 'She absolutely loved the rose bouquet. Perfect packaging and came in pristine condition.', productSlug: 'everlasting-love-rose-bouquet' },
    { rating: 5, title: 'So cute!', review: 'The bee keychain has become my favorite charm. Very sturdy clip too!', productSlug: 'chubby-amigurumi-bee-keychain' },
    { rating: 5, title: 'Safe and adorable', review: 'Got the Dino for my newborn nephew and it is incredibly soft with no dangerous plastic eyes.', productSlug: 'friendly-dino-soft-toy' },
    { rating: 5, title: 'Very aesthetic bag', review: 'Matches all my boho outfits perfectly. Holds my keys, wallet, and phone easily.', productSlug: 'boho-daisy-sling-bag' },
    { rating: 5, title: 'Unique coaster set', review: 'These sunflower coasters are the talk of my tea parties. Easy to clean as well.', productSlug: 'set-of-4-sunflower-coasters' },
    { rating: 5, title: 'Best custom gift ever!', review: 'Sent a picture of my Golden Retriever and they captured him perfectly in yarn. Stunned by the details.', productSlug: 'custom-pet-portrait-portrait' },
    { rating: 4, title: 'Lovely decor', review: 'Adds a really cozy vibe to my living room. Fast shipping.', productSlug: 'macrame-style-wall-hanging' },
    { rating: 5, title: 'Highly recommend!', review: 'Amazing tulip bunch. Worth every rupee. Will definitely buy again.', productSlug: 'whimsical-tulip-bunch' }
  ];

  for (const rev of reviews) {
    const prod = products.find(p => p.slug === rev.productSlug);
    if (!prod) continue;

    await prisma.review.create({
      data: {
        userId: customer.id,
        productId: prod.id,
        rating: rev.rating,
        title: rev.title,
        review: rev.review,
        isApproved: true,
        isVerifiedPurchase: true,
        helpfulCount: 2,
      }
    });
  }
  console.log('Reviews seeded.');

  // 8. Create Orders
  const orderStatuses = [
    { status: OrderStatus.PENDING, payStatus: PaymentStatus.PENDING, method: PaymentMethod.RAZORPAY },
    { status: OrderStatus.CONFIRMED, payStatus: PaymentStatus.PAID, method: PaymentMethod.RAZORPAY },
    { status: OrderStatus.SHIPPED, payStatus: PaymentStatus.PAID, method: PaymentMethod.RAZORPAY, trackNum: 'DTDC1234567', courier: 'DTDC' },
    { status: OrderStatus.DELIVERED, payStatus: PaymentStatus.PAID, method: PaymentMethod.RAZORPAY, trackNum: 'DTDC7891011', courier: 'DTDC' },
    { status: OrderStatus.CANCELLED, payStatus: PaymentStatus.FAILED, method: PaymentMethod.RAZORPAY }
  ];

  for (let i = 0; i < 5; i++) {
    const oStatus = orderStatuses[i];
    const item1 = products[i];
    const item2 = products[i + 5];

    const subtotal = item1.price + (item2 ? item2.price * 2 : 0);
    const taxAmount = parseFloat((subtotal * 0.18).toFixed(2)); // 18% GST
    const shippingCharge = subtotal > 1000 ? 0 : 80;
    const total = subtotal + taxAmount + shippingCharge;

    const order = await prisma.order.create({
      data: {
        orderNumber: `CC-2606-MOCK0${i + 1}`,
        userId: customer.id,
        addressId: address.id,
        subtotal: subtotal,
        taxAmount: taxAmount,
        shippingCharge: shippingCharge,
        total: total,
        paymentStatus: oStatus.payStatus,
        paymentMethod: oStatus.method,
        orderStatus: oStatus.status,
        razorpayOrderId: oStatus.payStatus === PaymentStatus.PAID ? `order_mock_razorpay_${i}` : null,
        razorpayPaymentId: oStatus.payStatus === PaymentStatus.PAID ? `pay_mock_razorpay_${i}` : null,
        trackingNumber: oStatus.trackNum || null,
        courierName: oStatus.courier || null,
        trackingUrl: oStatus.trackNum ? `https://dtdc.in/track/${oStatus.trackNum}` : null,
        createdAt: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000), // staggered dates
        items: {
          create: [
            {
              productId: item1.id,
              title: item1.title,
              image: item1.images[0],
              quantity: 1,
              price: item1.price,
              totalPrice: item1.price,
            },
            ...(item2 ? [{
              productId: item2.id,
              title: item2.title,
              image: item2.images[0],
              quantity: 2,
              price: item2.price,
              totalPrice: item2.price * 2,
            }] : [])
          ]
        },
        statusHistory: {
          create: [
            { status: OrderStatus.PENDING, note: 'Order placed successfully' },
            ...(oStatus.status !== OrderStatus.PENDING && oStatus.status !== OrderStatus.CANCELLED ? [
              { status: OrderStatus.CONFIRMED, note: 'Payment received. Preparing item.' }
            ] : []),
            ...(oStatus.status === OrderStatus.SHIPPED || oStatus.status === OrderStatus.DELIVERED ? [
              { status: OrderStatus.SHIPPED, note: `Dispatched via ${oStatus.courier}. Tracking ID: ${oStatus.trackNum}` }
            ] : []),
            ...(oStatus.status === OrderStatus.DELIVERED ? [
              { status: OrderStatus.DELIVERED, note: 'Package delivered.' }
            ] : []),
            ...(oStatus.status === OrderStatus.CANCELLED ? [
              { status: OrderStatus.CANCELLED, note: 'Order cancelled due to non-payment' }
            ] : [])
          ]
        }
      }
    });

    console.log(`Order ${order.orderNumber} seeded with status ${order.orderStatus}`);
  }

  // 9. Newsletter Subscriber
  await prisma.newsletterSubscriber.create({
    data: {
      email: 'jane@example.com',
      userId: customer.id,
      isSubscribed: true,
    }
  });

  // 10. Browsing History
  await prisma.browsingHistory.create({
    data: {
      userId: customer.id,
      productId: products[0].id,
      viewCount: 3,
    }
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
