const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const products = [
  {
    name: 'Apple iPhone 15 Pro Max - 256GB - Titanium Blue',
    slug: 'iphone-15-pro-max-titanium-blue',
    description: 'The iPhone 15 Pro Max. Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
    price: 185000,
    originalPrice: 195000,
    category: 'Apple',
    subCategory: 'iPhone',
    images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800'],
    stock: 15,
    onSale: true,
    specs: [
      { key: 'Display', value: '6.7-inch Super Retina XDR' },
      { key: 'Chip', value: 'A17 Pro chip' },
      { key: 'Camera', value: '48MP Main | Ultra Wide | Telephoto' }
    ]
  },
  {
    name: 'MacBook Air M3 - 13.6-inch - 8GB/256GB - Midnight',
    slug: 'macbook-air-m3-midnight',
    description: 'The MacBook Air with M3 chip is super portable and incredibly fast. It has up to 18 hours of battery life and a stunning Liquid Retina display.',
    price: 165000,
    originalPrice: 175000,
    category: 'Apple',
    subCategory: 'MacBook',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
    stock: 10,
    onSale: false,
    specs: [
      { key: 'Display', value: '13.6-inch Liquid Retina' },
      { key: 'Chip', value: 'Apple M3 chip' },
      { key: 'RAM', value: '8GB Unified Memory' }
    ]
  },
  {
    name: 'Sony WH-1000XM5 Noise Cancelling Headphones',
    slug: 'sony-wh-1000xm5-black',
    description: 'The Sony WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control 8 microphones for unprecedented noise cancellation and exceptional call quality.',
    price: 48000,
    originalPrice: 55000,
    category: 'Audio & Music',
    subCategory: 'Headphones',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
    stock: 25,
    onSale: true,
    specs: [
      { key: 'Type', value: 'Over-ear' },
      { key: 'Noise Cancelling', value: 'Yes' },
      { key: 'Battery Life', value: 'Up to 30 hours' }
    ]
  },
  {
    name: 'Samsung Galaxy S24 Ultra - 512GB - Titanium Gray',
    slug: 'samsung-s24-ultra-titanium-gray',
    description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility - starting with the most important device in your life. Your smartphone.',
    price: 175000,
    originalPrice: 185000,
    category: 'Smartphones',
    subCategory: 'Samsung',
    images: ['https://images.unsplash.com/photo-1707230491566-b33342af4d30?w=800'],
    stock: 12,
    onSale: false,
    specs: [
      { key: 'Display', value: '6.8-inch QHD+' },
      { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
      { key: 'Camera', value: '200MP Main' }
    ]
  },
  {
    name: 'DJI Mini 4 Pro Drone with DJI RC 2',
    slug: 'dji-mini-4-pro-rc2',
    description: 'DJI Mini 4 Pro is our most advanced mini-camera drone to date. It integrates powerful imaging capabilities, omnidirectional obstacle sensing, ActiveTrack 360° with the new Trace Mode, and 20km FHD video transmission, bringing even more things to love for pros and beginners alike.',
    price: 135000,
    originalPrice: 145000,
    category: 'Cameras & Drones',
    subCategory: 'Drones',
    images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800'],
    stock: 8,
    onSale: true,
    specs: [
      { key: 'Weight', value: '<249g' },
      { key: 'Camera', value: '4K/60fps HDR' },
      { key: 'Flight Time', value: '34 mins' }
    ]
  },
  {
    name: 'iPad Pro M4 13-inch - 256GB - Space Black',
    slug: 'ipad-pro-m4-13-inch',
    description: 'The thinnest Apple product ever. iPad Pro features the world’s most advanced display, a thin and light design, and the powerful M4 chip.',
    price: 195000,
    originalPrice: 210000,
    category: 'Apple',
    subCategory: 'iPad',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'],
    stock: 10,
    onSale: false,
    specs: [
      { key: 'Display', value: '13-inch Ultra Retina XDR' },
      { key: 'Chip', value: 'Apple M4 chip' },
      { key: 'Storage', value: '256GB' }
    ]
  },
  {
    name: 'Apple Watch Series 9 - 45mm - GPS - Midnight',
    slug: 'apple-watch-s9-midnight',
    description: 'Smarter. Brighter. Mightier. Apple Watch Series 9 features the S9 SiP, a magical new way to use your watch without touching the screen, and a brighter display.',
    price: 65000,
    originalPrice: 72000,
    category: 'Wearables',
    subCategory: 'Apple Watch',
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'],
    stock: 20,
    onSale: true,
    specs: [
      { key: 'Case Size', value: '45mm' },
      { key: 'Connectivity', value: 'GPS' },
      { key: 'Feature', value: 'Blood Oxygen app' }
    ]
  },
  {
    name: 'Samsung Galaxy Watch 6 - 44mm - Bluetooth - Graphite',
    slug: 'samsung-galaxy-watch-6-graphite',
    description: 'Start your day with a health partner. Galaxy Watch6 features a sleek design, personalized heart rate zones, and advanced sleep coaching.',
    price: 45000,
    originalPrice: 50000,
    category: 'Wearables',
    subCategory: 'Samsung Watch',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
    stock: 15,
    onSale: true,
    specs: [
      { key: 'Display', value: '1.5-inch Super AMOLED' },
      { key: 'Compatibility', value: 'Android 10.0 or later' },
      { key: 'Sensors', value: 'Samsung BioActive Sensor' }
    ]
  },
  {
    name: 'Nintendo Switch OLED Model - White',
    slug: 'nintendo-switch-oled-white',
    description: 'Play at home on the TV or on-the-go with a vibrant 7-inch OLED screen. Features a wide adjustable stand, a dock with a wired LAN port, 64 GB of internal storage, and enhanced audio.',
    price: 55000,
    originalPrice: 60000,
    category: 'Gaming',
    subCategory: 'Consoles',
    images: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800'],
    stock: 30,
    onSale: false,
    specs: [
      { key: 'Display', value: '7-inch OLED' },
      { key: 'Storage', value: '64GB' },
      { key: 'Modes', value: 'TV, Tabletop, Handheld' }
    ]
  },
  {
    name: 'Sony PlayStation 5 Slim - Digital Edition',
    slug: 'ps5-slim-digital',
    description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio, and an all-new generation of incredible PlayStation games.',
    price: 85000,
    originalPrice: 95000,
    category: 'Gaming',
    subCategory: 'Consoles',
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800'],
    stock: 5,
    onSale: false,
    specs: [
      { key: 'Storage', value: '1TB Custom SSD' },
      { key: 'Performance', value: 'Up to 120fps with 120Hz output' },
      { key: 'Tech', value: 'Ray Tracing support' }
    ]
  },
  {
    name: 'Bose QuietComfort Ultra Headphones - White Smoke',
    slug: 'bose-quietcomfort-ultra-white',
    description: 'The ultimate noise-cancelling headphones. World-class quiet, more personalized than ever, and groundbreaking spatial audio that makes everything you listen to sound more immersive.',
    price: 58000,
    originalPrice: 65000,
    category: 'Audio & Music',
    subCategory: 'Headphones',
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'],
    stock: 12,
    onSale: true,
    specs: [
      { key: 'Mode', value: 'Quiet, Aware, Immersion' },
      { key: 'Battery', value: 'Up to 24 hours' },
      { key: 'Charging', value: 'USB-C' }
    ]
  },
  {
    name: 'Canon EOS R6 Mark II Mirrorless Camera (Body Only)',
    slug: 'canon-eos-r6-mark-ii',
    description: 'The EOS R6 Mark II sets a new benchmark with its unique blend of class-leading performance, breathtaking speed, stability and professional filmmaking features.',
    price: 320000,
    originalPrice: 350000,
    category: 'Cameras & Drones',
    subCategory: 'Cameras',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'],
    stock: 3,
    onSale: false,
    specs: [
      { key: 'Sensor', value: '24.2 MP Full-frame CMOS' },
      { key: 'Video', value: '4K/60p (uncropped)' },
      { key: 'AF System', value: 'Dual Pixel CMOS AF II' }
    ]
  },
  {
    name: 'Dell XPS 15 9530 - Core i9 - 32GB/1TB - OLED',
    slug: 'dell-xps-15-9530-oled',
    description: 'Unleash your creative potential with the power of the new Dell XPS 15. Featuring a stunning 3.5K OLED InfinityEdge display and 13th Gen Intel Core processors.',
    price: 385000,
    originalPrice: 420000,
    category: 'Laptops',
    subCategory: 'Dell',
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800'],
    stock: 2,
    onSale: true,
    specs: [
      { key: 'Processor', value: 'Intel Core i9-13900H' },
      { key: 'RAM', value: '32GB DDR5' },
      { key: 'Display', value: '15.6" 3.5K OLED Touch' }
    ]
  },
  {
    name: 'ASUS ROG Zephyrus G14 (2024) - RTX 4070 - Eclipse Gray',
    slug: 'asus-rog-zephyrus-g14-2024',
    description: 'The world’s most powerful 14-inch Windows 11 gaming laptop. Featuring an all-new CNC-milled chassis, AMD Ryzen 8000 series processors, and NVIDIA RTX 40 series GPUs.',
    price: 275000,
    originalPrice: 295000,
    category: 'Laptops',
    subCategory: 'ASUS',
    images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800'],
    stock: 4,
    onSale: false,
    specs: [
      { key: 'GPU', value: 'NVIDIA GeForce RTX 4070' },
      { key: 'CPU', value: 'AMD Ryzen 9 8945HS' },
      { key: 'Display', value: '14" 3K 120Hz OLED' }
    ]
  },
  {
    name: 'Logitech MX Master 3S Wireless Mouse - Graphite',
    slug: 'logitech-mx-master-3s-graphite',
    description: 'The icon, remastered. MX Master 3S features Quiet Click technology, an 8000 DPI track-anywhere sensor, and Hyper-fast scrolling for ultimate precision.',
    price: 15000,
    originalPrice: 18000,
    category: 'Accessories',
    subCategory: 'Peripherals',
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800'],
    stock: 40,
    onSale: true,
    specs: [
      { key: 'Sensor', value: 'Darkfield high precision' },
      { key: 'Battery', value: 'Up to 70 days' },
      { key: 'Buttons', value: '7 Buttons' }
    ]
  },
  {
    name: 'Samsung T7 Shield 2TB Portable SSD - Blue',
    slug: 'samsung-t7-shield-2tb-blue',
    description: 'Super-fast external storage. Rugged, durable, and ready for adventure. High-speed transfers and tough protection from water, dust, and drops.',
    price: 32000,
    originalPrice: 38000,
    category: 'Storage',
    subCategory: 'Samsung',
    images: ['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800'],
    stock: 30,
    onSale: false,
    specs: [
      { key: 'Capacity', value: '2TB' },
      { key: 'Speed', value: 'Up to 1,050 MB/s' },
      { key: 'Protection', value: 'IP65 Water/Dust Resistant' }
    ]
  },
  {
    name: 'Anker 737 Power Bank (PowerCore 24K)',
    slug: 'anker-737-power-bank',
    description: 'Equipped with Power Delivery 3.1 and bi-directional technology to quickly recharge the portable charger or get a 140W ultra-powerful charge.',
    price: 18000,
    originalPrice: 22000,
    category: 'Accessories',
    subCategory: 'Power',
    images: ['https://images.unsplash.com/photo-1619131651557-0104616210f0?w=800'],
    stock: 25,
    onSale: true,
    specs: [
      { key: 'Capacity', value: '24,000mAh' },
      { key: 'Max Output', value: '140W' },
      { key: 'Ports', value: '2x USB-C, 1x USB-A' }
    ]
  },
  {
    name: 'Kindle Paperwhite (16 GB) - 6.8-inch display',
    slug: 'kindle-paperwhite-11th-gen',
    description: 'With a flush-front design and 300 ppi glare-free display that reads like real paper, even in bright sunlight. Waterproof and includes adjustable warm light.',
    price: 24000,
    originalPrice: 28000,
    category: 'Smartphones',
    subCategory: 'E-readers',
    images: ['https://images.unsplash.com/photo-1594980596276-133be30aa0cb?w=800'],
    stock: 18,
    onSale: false,
    specs: [
      { key: 'Display', value: '6.8-inch' },
      { key: 'Battery', value: 'Up to 10 weeks' },
      { key: 'Storage', value: '16GB' }
    ]
  },
  {
    name: 'GoPro HERO12 Black Action Camera',
    slug: 'gopro-hero12-black',
    description: 'Incredible image quality, even better HyperSmooth video stabilization and a huge boost in battery performance come together in the world’s most versatile camera.',
    price: 68000,
    originalPrice: 75000,
    category: 'Cameras & Drones',
    subCategory: 'Cameras',
    images: ['https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800'],
    stock: 12,
    onSale: true,
    specs: [
      { key: 'Video', value: '5.3K60 + 4K120' },
      { key: 'Stabilization', value: 'HyperSmooth 6.0' },
      { key: 'Photos', value: '27MP' }
    ]
  },
  {
    name: 'Apple AirPods Pro (2nd Generation) with MagSafe Case (USB‑C)',
    slug: 'airpods-pro-2nd-gen-usb-c',
    description: 'Rebuilt from the sound up. AirPods Pro feature up to 2x more Active Noise Cancellation, plus Adaptive Transparency, and Personalized Spatial Audio.',
    price: 38000,
    originalPrice: 45000,
    category: 'Apple',
    subCategory: 'Audio',
    images: ['https://images.unsplash.com/photo-1610492314412-f0efcad85301?w=800'],
    stock: 50,
    onSale: true,
    specs: [
      { key: 'Chip', value: 'Apple H2 chip' },
      { key: 'Case', value: 'MagSafe Charging Case (USB-C)' },
      { key: 'Battery', value: 'Up to 6 hours' }
    ]
  },
  {
    name: 'Samsung Galaxy Z Fold 5 - 512GB - Phantom Black',
    slug: 'samsung-galaxy-z-fold-5',
    description: 'The ultimate productivity powerhouse. Unfold a massive 7.6" screen for multitasking, gaming, and cinematic viewing. Features the powerful Snapdragon 8 Gen 2 for Galaxy.',
    price: 245000,
    originalPrice: 260000,
    category: 'Smartphones',
    subCategory: 'Samsung',
    images: ['https://images.unsplash.com/photo-1695420370889-183e92ad7c39?w=800'],
    stock: 8,
    onSale: true,
    specs: [
      { key: 'Main Display', value: '7.6" Dynamic AMOLED 2X' },
      { key: 'Processor', value: 'Snapdragon 8 Gen 2' },
      { key: 'RAM', value: '12GB' }
    ]
  },
  {
    name: 'Google Pixel 8 Pro - 128GB - Bay',
    slug: 'google-pixel-8-pro-bay',
    description: 'The most advanced Pixel yet. Featuring Google Tensor G3, it’s engineered with Google AI for powerful photo and video features and even more helpfulness.',
    price: 145000,
    originalPrice: 155000,
    category: 'Smartphones',
    subCategory: 'Google',
    images: ['https://images.unsplash.com/photo-1697526217436-1e07505a415a?w=800'],
    stock: 14,
    onSale: false,
    specs: [
      { key: 'Chip', value: 'Google Tensor G3' },
      { key: 'Display', value: '6.7-inch Super Actua' },
      { key: 'Camera', value: '50MP Main | 48MP Ultra Wide' }
    ]
  },
  {
    name: 'HP Spectre x360 14 - 13th Gen i7 - 16GB/512GB',
    slug: 'hp-spectre-x360-14',
    description: 'The HP Spectre x360 14-inch 2-in-1 Laptop PC automatically adapts to your surroundings for the best on-screen image. Features a stunning OLED touch display.',
    price: 215000,
    originalPrice: 230000,
    category: 'Laptops',
    subCategory: 'HP',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'],
    stock: 6,
    onSale: true,
    specs: [
      { key: 'Processor', value: 'Intel Core i7-1355U' },
      { key: 'Screen', value: '14" 3K2K OLED Touch' },
      { key: 'Battery', value: 'Up to 13 hours' }
    ]
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon Gen 11 - Core i7',
    slug: 'lenovo-thinkpad-x1-carbon-gen-11',
    description: 'The professional standard. Ultralight, ultrapowerful, and ultra-durable. The ThinkPad X1 Carbon Gen 11 is built for the modern professional.',
    price: 265000,
    originalPrice: 285000,
    category: 'Laptops',
    subCategory: 'Lenovo',
    images: ['https://images.unsplash.com/photo-1595039838779-f3139276220a?w=800'],
    stock: 5,
    onSale: false,
    specs: [
      { key: 'Weights', value: 'Starting at 1.12 kg' },
      { key: 'RAM', value: '32GB LPDDR5' },
      { key: 'Durability', value: 'MIL-STD 810H tested' }
    ]
  },
  {
    name: 'Sony Alfa 7 IV Full-frame Mirrorless Camera',
    slug: 'sony-a7-iv-camera',
    description: 'The Sony A7 IV is a powerhouse for both photo and video. Featuring a 33MP sensor and world-class autofocus, it’s the hybrid camera you’ve been waiting for.',
    price: 345000,
    originalPrice: 380000,
    category: 'Cameras & Drones',
    subCategory: 'Cameras',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'],
    stock: 4,
    onSale: true,
    specs: [
      { key: 'Sensor', value: '33MP Full-frame Exmor R' },
      { key: 'Video', value: '4K 60p 10-bit 4:2:2' },
      { key: 'AF', value: 'Real-time Eye AF' }
    ]
  },
  {
    name: 'Philips Hue White & Color Ambiance Starter Kit',
    slug: 'philips-hue-starter-kit',
    description: 'Add color to any room with this smart light bulbs. Connect to the Hue Bridge and discover endless smart lighting possibilities.',
    price: 28000,
    originalPrice: 32000,
    category: 'Smart Home',
    subCategory: 'Lighting',
    images: ['https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800'],
    stock: 20,
    onSale: true,
    specs: [
      { key: 'Bulbs', value: '3x A60 E27' },
      { key: 'Colors', value: '16 Million' },
      { key: 'Control', value: 'App, Voice, Hub' }
    ]
  },
  {
    name: 'Dyson V15 Detect Absolute Vacuum Cleaner',
    slug: 'dyson-v15-detect',
    description: 'Dyson’s most powerful, intelligent cordless vacuum. Laser reveals microscopic dust. Intelligently adapts suction power based on floor type.',
    price: 115000,
    originalPrice: 130000,
    category: 'Home Appliances',
    subCategory: 'Cleaning',
    images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800'],
    stock: 5,
    onSale: false,
    specs: [
      { key: 'Motor', value: 'Dyson Hyperdymium' },
      { key: 'Runtime', value: '60 minutes' },
      { key: 'Tech', value: 'LCD Screen + Laser Slim Fluffy' }
    ]
  },
  {
    name: 'LG C3 65" 4K OLED evo TV',
    slug: 'lg-c3-65-oled-tv',
    description: 'The ultimate cinema and gaming experience. Perfect black, infinite contrast, and over a billion vibrant colors. Optimized for gaming with G-Sync and FreeSync.',
    price: 315000,
    originalPrice: 350000,
    category: 'TV & Home Theatre',
    subCategory: 'Television',
    images: ['https://images.unsplash.com/photo-1593359677759-543733479e0c?w=800'],
    stock: 3,
    onSale: true,
    specs: [
      { key: 'Panel', value: 'OLED evo 4K' },
      { key: 'Processor', value: 'α9 AI Processor Gen6' },
      { key: 'Gaming', value: '120Hz | 0.1ms Response' }
    ]
  },
  {
    name: 'Apple Mac Studio - M2 Max chip - 32GB/512GB',
    slug: 'apple-mac-studio-m2-max',
    description: 'Mac Studio is an entirely new Mac desktop. It packs outrageous performance, extensive connectivity, and new capabilities into an unbelievably compact form.',
    price: 345000,
    originalPrice: 380000,
    category: 'Apple',
    subCategory: 'Mac',
    images: ['https://images.unsplash.com/photo-1647427060118-4911c9831f82?w=800'],
    stock: 2,
    onSale: false,
    specs: [
      { key: 'Chip', value: 'Apple M2 Max (12-core)' },
      { key: 'GPU', value: '30-core GPU' },
      { key: 'Connectivity', value: '12 high-performance ports' }
    ]
  },
  {
    name: 'EcoFlow DELTA 2 BLACK E980 – Portable Power Station (500W, 980Wh) with FREE GIFTS – EFE980-UK',
    slug: 'ecoflow-delta-2-black-e980-efe980-uk',
    description:
      'Experience premium portable power with the EcoFlow DELTA 2 BLACK E980. With a 980Wh LFP battery, 500W output (650W X-Boost), and ultra-fast 0–100% charging in 2 hours, it is built for backup, camping, and everyday use.',
    price: 63800,
    originalPrice: 84999,
    category: 'Power & Solar',
    subCategory: 'Portable Power Stations',
    images: [
      'https://sweech.co.ke/wp-content/uploads/2025/01/EcoFlow-DELTA-2-BLACK-E980-Portable-Power-Station-EFE980-UK-01.jpg'
    ],
    stock: 5,
    onSale: true,
    sku: '5020001004',
    brand: 'EcoFlow',
    variantGroup: 'ecoflow-delta-2-e980',
    variantLabel: 'Black',
    categories: ['Ecoflow Power Stations', 'Power Stations'],
    keyFeatures: [
      'Sizeable 980Wh capacity and 500W output.',
      'Battery Type: LFP (LiFePO4), 3,000 life cycles to 80% capacity.',
      'Recharge 0–100% in just 2 hours.',
      'Safest LFP battery provides 10 years of use.',
      'X-Boost output up to 650W.',
      '4 ways to charge: AC, car, solar, and USB‑C.',
      '<30ms EPS auto-switch for essential devices.',
      'Smart app control & LCD screen.'
    ],
    specs: [
      { key: 'Battery Capacity', value: '980Wh' },
      { key: 'Battery Type', value: 'LFP (LiFePO4), 3000+ cycles to 80%' },
      { key: 'AC Output', value: '500W (4× 230V UK sockets), X‑Boost 650W' },
      { key: 'USB-A', value: '2 × 12W, 2 × 18W (Fast Charge)' },
      { key: 'USB-C', value: '2 × 100W Max' },
      { key: 'Car Power Output', value: '12.6V, 10A, 126W Max' },
      { key: 'DC 5521 Output', value: '2 × 12.6V, 3A, 38W Max per port' },
      { key: 'AC Charging', value: '220–240V, 0–100% in 2 hours' },
      { key: 'Solar Charging', value: '11–60V, 15A, 500W Max, 0–100% in 2.9 hours' },
      { key: 'Car Charging', value: '12V/24V, 8A, 0–100% in 11 hours' },
      { key: 'Weight', value: '12kg' },
      { key: 'Dimensions', value: '40 × 21 × 28 cm' }
    ],
    notes: [
      '2 Year Limited Warranty. Warranty becomes null and void from user damage, using other brand solar panels, electrical & power surges or power related issues.',
      'Warranty becomes null and void if other brand solar panels are used instead of EcoFlow Solar Panels to recharge EcoFlow Portable Power Stations.',
      'Package includes: EcoFlow E980, AC charging cable (Type B power adapter), car charging cable, DC5521 connection cable, quick start guide, FREE EcoFlow RAPID Magnetic Power Bank (5000mAh, 15W), FREE 6-in-1 Multifunctional Fan.'
    ]
  },
  {
    name: 'Keychron Q1 Pro Wireless Mechanical Keyboard',
    slug: 'keychron-q1-pro-keyboard',
    description: 'A fully customizable wireless mechanical keyboard. Built with a CNC-milled aluminum body, hot-swappable switches, and QMK/VIA support.',
    price: 25000,
    originalPrice: 28000,
    category: 'Accessories',
    subCategory: 'Peripherals',
    images: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800'],
    stock: 12,
    onSale: true,
    specs: [
      { key: 'Layout', value: '75%' },
      { key: 'Material', value: 'Full Aluminum Body' },
      { key: 'Bluetooth', value: 'Version 5.1' }
    ]
  },
  {
    name: 'Razer DeathAdder V3 Pro Wireless Gaming Mouse',
    slug: 'razer-deathadder-v3-pro',
    description: 'For the Pro. Refined shape, ultra-lightweight design, and cutting-edge sensor. Engineered with professional players for performance that goes beyond.',
    price: 18000,
    originalPrice: 21000,
    category: 'Gaming',
    subCategory: 'Accessories',
    images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'],
    stock: 25,
    onSale: false,
    specs: [
      { key: 'Weight', value: '63g' },
      { key: 'Sensor', value: 'Focus Pro 30K Optical' },
      { key: 'Wireless', value: 'HyperSpeed 4000Hz support' }
    ]
  },
  {
    name: 'SteelSeries Arctis Nova Pro Wireless Headset',
    slug: 'steelseries-arctis-nova-pro',
    description: 'Almighty Audio is here. Hear game audio like never before. Immerse yourself in the action with 360° Spatial Audio and the ultimate noise cancellation.',
    price: 45000,
    originalPrice: 52000,
    category: 'Gaming',
    subCategory: 'Audio',
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'],
    stock: 15,
    onSale: true,
    specs: [
      { key: 'Drivers', value: 'Hi-Res Neodymium' },
      { key: 'System', value: 'Active Noise Cancellation' },
      { key: 'Feature', value: 'Multi-System Connect' }
    ]
  },
  {
    name: 'Meta Quest 3 - 128GB - All-in-one VR',
    slug: 'meta-quest-3-128gb',
    description: 'Expand your world with Mixed Reality. The world’s first mass-market VR headset with full-color passthrough and massive performance upgrades over Quest 2.',
    price: 85000,
    originalPrice: 95000,
    category: 'Gaming',
    subCategory: 'Consoles',
    images: ['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800'],
    stock: 10,
    onSale: false,
    specs: [
      { key: 'Resolution', value: '2064x2208 per eye' },
      { key: 'Chip', value: 'Snapdragon XR2 Gen 2' },
      { key: 'Feature', value: 'Touch Plus Controllers' }
    ]
  },
  {
    name: 'Sonos Era 300 Smart Speaker - Black',
    slug: 'sonos-era-300-black',
    description: 'Listen to the future. With spatial audio and Dolby Atmos, Sonos Era 300 delivers an immersive soundstage that puts you inside your music.',
    price: 65000,
    originalPrice: 75000,
    category: 'Audio & Music',
    subCategory: 'Speakers',
    images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800'],
    stock: 8,
    onSale: true,
    specs: [
      { key: 'Surround', value: 'Dolby Atmos support' },
      { key: 'Connectivity', value: 'Wi-Fi, Bluetooth, Line-In' },
      { key: 'Feature', value: 'Trueplay Tuning' }
    ]
  },
  {
    name: 'Garmin Fenix 7X Sapphire Solar - Carbon Gray',
    slug: 'garmin-fenix-7x-sapphire-solar',
    description: 'The ultimate multisport GPS watch. Featuring a large solar-powered display, LED flashlight, and advanced training metrics for top performance.',
    price: 115000,
    originalPrice: 130000,
    category: 'Wearables',
    subCategory: 'Sports Watch',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
    stock: 7,
    onSale: false,
    specs: [
      { key: 'Lens', value: 'Power Sapphire' },
      { key: 'GPS', value: 'Multi-band GNSS' },
      { key: 'Battery', value: 'Up to 37 days (Solar)' }
    ]
  },
  {
    name: 'Microsoft Surface Pro 9 - Core i7 - 16GB/256GB - Sapphire',
    slug: 'microsoft-surface-pro-9-sapphire',
    description: 'The flexibility of a tablet, the performance of a laptop. Surface Pro 9 gives you the best of both worlds with a nearly edge-to-edge screen.',
    price: 185000,
    originalPrice: 210000,
    category: 'Laptops',
    subCategory: 'Microsoft',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'],
    stock: 4,
    onSale: true,
    specs: [
      { key: 'Processor', value: 'Intel Core i7-1255U' },
      { key: 'Panel', value: '13" PixelSense Flow' },
      { key: 'Refresh Rate', value: 'Up to 120Hz' }
    ]
  },
  {
    name: 'WD Black SN850X 2TB NVMe SSD with Heatsink',
    slug: 'wd-black-sn850x-2tb',
    description: 'Extreme gaming performance. Reach insane speeds up to 7,300 MB/s for top-level performance and ridiculously short load times.',
    price: 35000,
    originalPrice: 42000,
    category: 'Storage',
    subCategory: 'SSD',
    images: ['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800'],
    stock: 20,
    onSale: true,
    specs: [
      { key: 'Speed', value: '7,300 MB/s Read' },
      { key: 'Capacity', value: '2TB' },
      { key: 'Interface', value: 'PCIe Gen4 x4' }
    ]
  },
  {
    name: 'Corsair RM850x (2021) 850W Gold PSU',
    slug: 'corsair-rm850x-psu',
    description: 'Quiet, efficient, reliable. Corsair RMx series power supplies are built with high-quality components for long-lasting performance.',
    price: 22000,
    originalPrice: 25000,
    category: 'PC Parts',
    subCategory: 'Power Supply',
    images: ['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800'],
    stock: 15,
    onSale: false,
    specs: [
      { key: 'Rating', value: '80 PLUS Gold' },
      { key: 'Cabling', value: 'Fully Modular' },
      { key: 'Fan', value: 'Zero RPM Mode' }
    ]
  },
  {
    name: 'Noctua NH-D15 Chromax.Black CPU Cooler',
    slug: 'noctua-nh-d15-chromax',
    description: 'The king of air coolers. Elite-class performance at whispered quietness. Now available in an all-black Chromax version.',
    price: 18000,
    originalPrice: 21000,
    category: 'PC Parts',
    subCategory: 'Cooling',
    images: ['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800'],
    stock: 10,
    onSale: true,
    specs: [
      { key: 'Design', value: 'Dual-tower' },
      { key: 'Fans', value: '2x NF-A15 PWM' },
      { key: 'Socket', value: 'Intel & AMD support' }
    ]
  },
  {
    name: 'Elgato Stream Deck MK.2 - 15 Macro Keys',
    slug: 'elgato-stream-deck-mk2',
    description: 'Take full control of your content. Trigger actions, launch apps, and post to social with a single touch of 15 LCD keys.',
    price: 24000,
    originalPrice: 28000,
    category: 'Accessories',
    subCategory: 'Streaming',
    images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'],
    stock: 15,
    onSale: false,
    specs: [
      { key: 'Keys', value: '15 Customizable LCD' },
      { key: 'Interface', value: 'USB 2.0' },
      { key: 'Stand', value: 'Fixed 45-degree angle' }
    ]
  },
  {
    name: 'Blue Yeti Professional USB Microphone - Multi-Pattern',
    slug: 'blue-yeti-usb-mic',
    description: 'Create unparalleled recordings. Blue Yeti is the world’s #1 USB microphone, perfect for podcasting, YouTube, game streaming, and more.',
    price: 22000,
    originalPrice: 26000,
    category: 'Audio & Music',
    subCategory: 'Microphones',
    images: ['https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800'],
    stock: 18,
    onSale: true,
    specs: [
      { key: 'Capsules', value: '3 Blue-proprietary' },
      { key: 'Patterns', value: 'Cardioid, Omni, Bi, Stereo' },
      { key: 'Bit Rate', value: '16-bit/48kHz' }
    ]
  },
  {
    name: 'Belkin BoostCharge Pro 3-in-1 Magsafe Charger',
    slug: 'belkin-boostcharge-pro-3in1',
    description: 'The ultimate charging solution for your Apple ecosystem. Charge your iPhone, Apple Watch, and AirPods simultaneously with MagSafe speed.',
    price: 18000,
    originalPrice: 22000,
    category: 'Accessories',
    subCategory: 'Power',
    images: ['https://images.unsplash.com/photo-1610492314412-f0efcad85301?w=800'],
    stock: 30,
    onSale: true,
    specs: [
      { key: 'Charging', value: '15W MagSafe' },
      { key: 'Build', value: 'Premium Stainless Steel' },
      { key: 'Compatibility', value: 'Apple MagSafe devices' }
    ]
  },
  {
    name: 'Ring Video Doorbell 4 - Wireless with Color Pre-Roll',
    slug: 'ring-video-doorbell-4',
    description: 'Better view, better protection. Ring Video Doorbell 4 features improved video previews and enhanced Wi-Fi for smarter home security.',
    price: 28000,
    originalPrice: 35000,
    category: 'Smart Home',
    subCategory: 'Security',
    images: ['https://images.unsplash.com/photo-1558002038-1055907df8d7?w=800'],
    stock: 12,
    onSale: false,
    specs: [
      { key: 'Video', value: '1080p HD' },
      { key: 'Battery', value: 'Rechargeable | Wifi' },
      { key: 'Feature', value: 'Color Pre-Roll Video' }
    ]
  },
  {
    name: 'Nest Learning Thermostat - 3rd Generation - Stainless',
    slug: 'nest-learning-thermostat-gen3',
    description: 'Programs itself to help save energy. The Nest Learning Thermostat learns what temperatures you like and builds a schedule around yours.',
    price: 35000,
    originalPrice: 42000,
    category: 'Smart Home',
    subCategory: 'Appliances',
    images: ['https://images.unsplash.com/photo-1567603254394-ba5f0612c974?w=800'],
    stock: 10,
    onSale: true,
    specs: [
      { key: 'Feature', value: 'Auto-Schedule' },
      { key: 'Display', value: 'Far-sight high-res' },
      { key: 'Savings', value: 'Proven Energy Savings' }
    ]
  },
  {
    name: 'iRobot Roomba j7+ Self-Emptying Robot Vacuum',
    slug: 'irobot-roomba-j7-plus',
    description: 'The vacuum that avoids pet accidents. The j7+ uses PrecisionVision Navigation to recognize and avoid obstacles like charging cables and pet waste.',
    price: 125000,
    originalPrice: 145000,
    category: 'Home Appliances',
    subCategory: 'Cleaning',
    images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800'],
    stock: 4,
    onSale: true,
    specs: [
      { key: 'Bin', value: 'Automatic Dirt Disposal' },
      { key: 'Mapping', value: 'Imprint Smart Mapping' },
      { key: 'Safety', value: 'P.O.O.P. Guarantee' }
    ]
  },
  {
    name: 'Breville Barista Express Espresso Machine - Silver',
    slug: 'breville-barista-express-espresso',
    description: 'Be your own barista. The Barista Express allows you to grind the beans right before extraction for full flavor and precise temperature control.',
    price: 115000,
    originalPrice: 135000,
    category: 'Home Appliances',
    subCategory: 'Kitchen',
    images: ['https://images.unsplash.com/photo-1517668808822-9eaa02f2a9e0?w=800'],
    stock: 5,
    onSale: false,
    specs: [
      { key: 'Grinder', value: 'Integrated Conical Burr' },
      { key: 'Bar', value: '15 Bar Italian Pump' },
      { key: 'Texture', value: 'Manual Micro-foam' }
    ]
  },
  {
    name: 'Ninja Foodi 8-in-1 Dual Basket Air Fryer - 8qt',
    slug: 'ninja-foodi-dual-air-fryer',
    description: 'The air fryer that cooks 2 foods, 2 ways, and finishes at the same time. Featuring 2 independent baskets for ultimate versatility.',
    price: 32000,
    originalPrice: 38000,
    category: 'Home Appliances',
    subCategory: 'Kitchen',
    images: ['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800'],
    stock: 15,
    onSale: true,
    specs: [
      { key: 'Capacity', value: '8 Quart (7.6L)' },
      { key: 'Functions', value: '8 (Air Fry, Roast, etc.)' },
      { key: 'Wattage', value: '1690 Watts' }
    ]
  },
  {
    name: 'Instant Pot Duo Plus 9-in-1 Pressure Cooker - 6qt',
    slug: 'instant-pot-duo-plus-6qt',
    description: 'The world’s most loved multi-cooker. Replaces 9 common kitchen appliances, including pressure cooker, slow cooker, and yogurt maker.',
    price: 22000,
    originalPrice: 28000,
    category: 'Home Appliances',
    subCategory: 'Kitchen',
    images: ['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800'],
    stock: 12,
    onSale: false,
    specs: [
      { key: 'Functions', value: '9-in-1 Versatility' },
      { key: 'Safety', value: '10+ Safety Features' },
      { key: 'Saves Time', value: 'Cooks up to 70% faster' }
    ]
  },
  {
    name: 'Bose SoundLink Flex Bluetooth Speaker - Stone Blue',
    slug: 'bose-soundlink-flex-blue',
    description: 'Astonishing sound. Wherever life takes you. The SoundLink Flex is the perfect musical sidekick, with a rugged design able to withstand water, dust, and more.',
    price: 24000,
    originalPrice: 28000,
    category: 'Audio & Music',
    subCategory: 'Speakers',
    images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800'],
    stock: 20,
    onSale: true,
    specs: [
      { key: 'Durability', value: 'IP67 Waterproof/Dustproof' },
      { key: 'Battery', value: 'Up to 12 hours' },
      { key: 'Feature', value: 'PositionIQ Technology' }
    ]
  },
  {
    name: 'Marshall Stanmore III Bluetooth Speaker - Cream',
    slug: 'marshall-stanmore-iii-cream',
    description: 'A legendary speaker for the home. Stanmore III has an even wider soundstage than its predecessor, bringing Marshall signature sound to your living room.',
    price: 58000,
    originalPrice: 65000,
    category: 'Audio & Music',
    subCategory: 'Speakers',
    images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800'],
    stock: 10,
    onSale: false,
    specs: [
      { key: 'Power', value: '80 Watt Class D' },
      { key: 'Bluetooth', value: 'Version 5.2' },
      { key: 'Design', value: 'Vintage Marshall Styling' }
    ]
  }
];

// Generate an extra 100 generic products to enrich the catalog
const extraProducts = Array.from({ length: 100 }).map((_, index) => {
  const n = index + 1;
  const basePrice = 5000 + n * 200;

  return {
    name: `Sample Gadget ${n}`,
    slug: `sample-gadget-${n}`,
    description:
      'Sample gadget product used to enrich the CaseProz catalog. You can later edit or replace these from the admin panel.',
    price: basePrice,
    originalPrice: basePrice + 1000,
    category: 'Accessories',
    subCategory: 'Sample Gadgets',
    images: ['https://via.placeholder.com/800x800.png?text=Sample+Gadget'],
    stock: 10 + (n % 20),
    onSale: n % 3 === 0,
    specs: [
      { key: 'Sample Spec', value: `Variant #${n}` },
      { key: 'Warranty', value: '12 Months' },
    ],
  };
});

// Generate another 100 products spread across many categories
const extraCategoryConfigs = [
  { category: 'Apple', subCategory: 'iPhone' },
  { category: 'Apple', subCategory: 'MacBook' },
  { category: 'Apple', subCategory: 'iPad' },
  { category: 'Apple', subCategory: 'Audio' },
  { category: 'Laptops', subCategory: 'Dell' },
  { category: 'Laptops', subCategory: 'ASUS' },
  { category: 'Laptops', subCategory: 'HP' },
  { category: 'Laptops', subCategory: 'Lenovo' },
  { category: 'Smartphones', subCategory: 'Samsung' },
  { category: 'Smartphones', subCategory: 'Google' },
  { category: 'Smartphones', subCategory: 'E-readers' },
  { category: 'Gaming', subCategory: 'Consoles' },
  { category: 'Gaming', subCategory: 'Accessories' },
  { category: 'Gaming', subCategory: 'Audio' },
  { category: 'Cameras & Drones', subCategory: 'Cameras' },
  { category: 'Cameras & Drones', subCategory: 'Drones' },
  { category: 'Audio & Music', subCategory: 'Headphones' },
  { category: 'Audio & Music', subCategory: 'Speakers' },
  { category: 'Audio & Music', subCategory: 'Microphones' },
  { category: 'Wearables', subCategory: 'Apple Watch' },
  { category: 'Wearables', subCategory: 'Samsung Watch' },
  { category: 'Wearables', subCategory: 'Sports Watch' },
  { category: 'Storage', subCategory: 'Samsung' },
  { category: 'Storage', subCategory: 'SSD' },
  { category: 'Accessories', subCategory: 'Peripherals' },
  { category: 'Accessories', subCategory: 'Power' },
  { category: 'Accessories', subCategory: 'Streaming' },
  { category: 'PC Parts', subCategory: 'Power Supply' },
  { category: 'PC Parts', subCategory: 'Cooling' },
  { category: 'TV & Home Theatre', subCategory: 'Television' },
  { category: 'Smart Home', subCategory: 'Lighting' },
  { category: 'Smart Home', subCategory: 'Security' },
  { category: 'Smart Home', subCategory: 'Appliances' },
  { category: 'Home Appliances', subCategory: 'Cleaning' },
  { category: 'Home Appliances', subCategory: 'Kitchen' },
];

const extraCategoryProducts = Array.from({ length: 100 }).map((_, index) => {
  const n = index + 1;
  const basePrice = 8000 + n * 250;
  const cfg = extraCategoryConfigs[index % extraCategoryConfigs.length];

  return {
    name: `${cfg.category} Special ${n}`,
    slug: `${cfg.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${cfg.subCategory
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}-special-${n}`,
    description: `Extra seeded product for category ${cfg.category} / ${cfg.subCategory}. This keeps all categories well-populated for browsing and testing.`,
    price: basePrice,
    originalPrice: basePrice + 1500,
    category: cfg.category,
    subCategory: cfg.subCategory,
    images: ['https://via.placeholder.com/800x800.png?text=Category+Product'],
    stock: 5 + (n % 15),
    onSale: n % 4 === 0,
    specs: [
      { key: 'Category', value: cfg.category },
      { key: 'Subcategory', value: cfg.subCategory },
    ],
  };
});

// Products aligned with frontend CATEGORIES (Computers & Laptops, Phones & Tablets, etc.)
const uiCategoryPairs = [
  // Computers & Laptops
  { category: 'Computers & Laptops', subCategory: 'Laptops' },
  { category: 'Computers & Laptops', subCategory: 'Desktops' },
  { category: 'Computers & Laptops', subCategory: 'Monitors' },
  { category: 'Computers & Laptops', subCategory: 'Printers & Scanners' },
  { category: 'Computers & Laptops', subCategory: 'Networking Equipment' },
  { category: 'Computers & Laptops', subCategory: 'Storage Devices' },
  // Phones & Tablets
  { category: 'Phones & Tablets', subCategory: 'Smartphones' },
  { category: 'Phones & Tablets', subCategory: 'Tablets' },
  { category: 'Phones & Tablets', subCategory: 'iPhones' },
  { category: 'Phones & Tablets', subCategory: 'iPads' },
  { category: 'Phones & Tablets', subCategory: 'Phone Accessories' },
  // Audio & Headphones
  { category: 'Audio & Headphones', subCategory: 'Bluetooth Speakers' },
  { category: 'Audio & Headphones', subCategory: 'Earbuds & In-ear' },
  { category: 'Audio & Headphones', subCategory: 'Over-ear Headphones' },
  { category: 'Audio & Headphones', subCategory: 'Home Audio Systems' },
  { category: 'Audio & Headphones', subCategory: 'Microphones' },
  // Power & Solar
  { category: 'Power & Solar', subCategory: 'Portable Power Stations' },
  { category: 'Power & Solar', subCategory: 'Solar Panels' },
  { category: 'Power & Solar', subCategory: 'Power Banks' },
  { category: 'Power & Solar', subCategory: 'UPS & Inverters' },
  { category: 'Power & Solar', subCategory: 'Batteries' },
  // Smart Home
  { category: 'Smart Home', subCategory: 'Security Cameras' },
  { category: 'Smart Home', subCategory: 'Smart Lighting' },
  { category: 'Smart Home', subCategory: 'Smart Plugs' },
  { category: 'Smart Home', subCategory: 'Home Automation' },
  // Gaming
  { category: 'Gaming', subCategory: 'Consoles' },
  { category: 'Gaming', subCategory: 'Gaming Laptops' },
  { category: 'Gaming', subCategory: 'Gaming Accessories' },
  { category: 'Gaming', subCategory: 'Games' },
  // Photography & Video
  { category: 'Photography & Video', subCategory: 'Cameras' },
  { category: 'Photography & Video', subCategory: 'Lenses' },
  { category: 'Photography & Video', subCategory: 'Gimbals & Stabilizers' },
  { category: 'Photography & Video', subCategory: 'Photography Accessories' },
  // Accessories
  { category: 'Accessories', subCategory: 'Cables & Adapters' },
  { category: 'Accessories', subCategory: 'Cases & Covers' },
  { category: 'Accessories', subCategory: 'Keyboard & Mouse' },
  { category: 'Accessories', subCategory: 'Laptop Bags' },
];

const uiCategoryProducts = uiCategoryPairs.map((cfg, index) => {
  const n = index + 1;
  const basePrice = 9000 + n * 180;

  return {
    name: `${cfg.subCategory} Deal ${n}`,
    slug: `${cfg.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${cfg.subCategory
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}-deal-${n}`,
    description: `Auto-seeded product for storefront category "${cfg.category}" and subcategory "${cfg.subCategory}". This ensures every visible category has at least one product.`,
    price: basePrice,
    originalPrice: basePrice + 1200,
    category: cfg.category,
    subCategory: cfg.subCategory,
    images: ['https://via.placeholder.com/800x800.png?text=Category+Item'],
    stock: 8 + (n % 10),
    onSale: n % 2 === 0,
    specs: [
      { key: 'Category', value: cfg.category },
      { key: 'Subcategory', value: cfg.subCategory },
    ],
  };
});

// Generate an additional ~300 products distributed across all UI categories/subcategories
const EXTRA_UI_CATEGORY_COUNT = 300;

const extraUiCategoryProducts = Array.from({ length: EXTRA_UI_CATEGORY_COUNT }).map((_, index) => {
  const cfg = uiCategoryPairs[index % uiCategoryPairs.length];
  // Offset n so slugs stay unique from the original uiCategoryProducts
  const n = uiCategoryPairs.length + index + 1;
  const basePrice = 9500 + n * 160;

  return {
    name: `${cfg.subCategory} Collection ${n}`,
    slug: `${cfg.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${cfg.subCategory
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}-collection-${n}`,
    description: `Additional auto-seeded product for storefront category "${cfg.category}" and subcategory "${cfg.subCategory}". Generated to keep this sub-category richly populated for browsing and testing.`,
    price: basePrice,
    originalPrice: basePrice + 1400,
    category: cfg.category,
    subCategory: cfg.subCategory,
    images: ['https://via.placeholder.com/800x800.png?text=Extra+Category+Item'],
    stock: 6 + (n % 12),
    onSale: n % 3 === 0,
    specs: [
      { key: 'Category', value: cfg.category },
      { key: 'Subcategory', value: cfg.subCategory },
    ],
  };
});

// Ensure Accessories subcategories each have multiple products
const accessoriesSubCategories = [
  'Cables & Adapters',
  'Cases & Covers',
  'Keyboard & Mouse',
  'Laptop Bags',
];

const accessoriesSubProducts = accessoriesSubCategories.flatMap((sub, subIndex) =>
  Array.from({ length: 6 }).map((_, idx) => {
    const n = idx + 1;
    const basePrice = 3500 + subIndex * 400 + n * 120;

    return {
      name: `${sub} Bundle ${n}`,
      slug: `accessories-${sub
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}-bundle-${n}`,
      description: `Seeded accessory product for "${sub}" so this sub-category always has items to browse.`,
      price: basePrice,
      originalPrice: basePrice + 800,
      category: 'Accessories',
      subCategory: sub,
      images: ['https://via.placeholder.com/800x800.png?text=Accessories'],
      stock: 12 + ((subIndex + n) % 10),
      onSale: n % 3 === 0,
      specs: [
        { key: 'Category', value: 'Accessories' },
        { key: 'Subcategory', value: sub },
      ],
    };
  })
);

const allProducts = [
  ...products,
  ...extraProducts,
  ...extraCategoryProducts,
  ...uiCategoryProducts,
  ...accessoriesSubProducts,
  ...extraUiCategoryProducts,
];

const seedData = async () => {
  try {
    // Only insert products that are not already in the database (by slug)
    const existing = await Product.find({}, 'slug');
    const existingSlugs = new Set(existing.map((p) => p.slug));

    const newProducts = allProducts.filter((p) => !existingSlugs.has(p.slug));

    if (newProducts.length === 0) {
      console.log(
        'No new products to import. Existing catalog already contains all seeded items.'
      );
      process.exit();
    }

    await Product.insertMany(newProducts);
    console.log(
      `Data Imported! Added ${newProducts.length} new products (total defined: ${allProducts.length}).`
    );
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

seedData();
