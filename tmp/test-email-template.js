const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { generateOrderConfirmationEmail } = require('../utils/emailTemplates');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testEmail = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Fetch a sample order
    const order = await Order.findOne({}).sort({ createdAt: -1 });
    if (!order) {
      console.log('No orders found to test with.');
      process.exit(0);
    }

    // Mock a user
    const user = {
      name: 'Test Mike',
      email: 'mike@example.com'
    };

    // Fetch related products
    let recommendedProducts = [];
    const firstItem = order.orderItems[0];
    if (firstItem) {
      const product = await Product.findById(firstItem.product);
      if (product) {
        recommendedProducts = await Product.find({
          category: product.category,
          _id: { $nin: [product._id, ...order.orderItems.map(i => i.product)] },
          isActive: true
        })
        .limit(3)
        .select('name price images slug');
      }
    }

    // Generate HTML
    const html = generateOrderConfirmationEmail(order, user, recommendedProducts);

    // Save to preview file
    const previewPath = path.join(__dirname, 'preview.html');
    fs.writeFileSync(previewPath, html);
    console.log(`Email template generated! Preview saved to: ${previewPath}`);

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testEmail();
