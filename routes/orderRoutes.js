const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  } else {
    // Check stock availability for each item before creating the order
    try {
      for (const item of orderItems) {
        const product = await Product.findById(item.product);

        if (!product) {
          res.status(404).json({ message: `Product not found for item "${item.name}"` });
          return;
        }

        if (product.stock < item.qty) {
          res.status(400).json({
            message: `Not enough stock for "${product.name}". Available: ${product.stock}, requested: ${item.qty}`,
          });
          return;
        }
      }

      // All items are available; decrement stock
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        product.stock -= item.qty;
        await product.save();
      }
    } catch (stockError) {
      console.error('Error validating/updating stock for order:', stockError);
      res.status(500).json({ message: 'Error validating product stock' });
      return;
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Send order confirmation emails (non-blocking)
    (async () => {
      try {
        const user = req.user;
        const admins = await User.find({ isAdmin: true }).select('email name');

        const adminEmails = admins.map((admin) => admin.email).filter(Boolean);
        const customerEmail = user && user.email ? user.email : null;
        const envAdminEmail = process.env.ADMIN_ORDER_EMAIL;

        const recipientSet = new Set();
        const addRecipient = (email) => {
          if (!email) return;
          recipientSet.add(email.toLowerCase());
        };

        addRecipient(envAdminEmail);
        adminEmails.forEach(addRecipient);
        addRecipient(customerEmail);

        const recipients = Array.from(recipientSet);

        if (recipients.length === 0) {
          return;
        }

        const subject = `New order ${createdOrder._id}`;

        const itemsText = createdOrder.orderItems
          .map((item) => `${item.qty} x ${item.name} ($${item.price})`)
          .join('\n');

        const shippingText = createdOrder.shippingAddress
          ? `${createdOrder.shippingAddress.address}, ${createdOrder.shippingAddress.city}, ${createdOrder.shippingAddress.postalCode}, ${createdOrder.shippingAddress.country}`
          : 'N/A';

        const text = [
          `A new order has been placed on Sweech.`,
          ``,
          `Order ID: ${createdOrder._id}`,
          user ? `Customer: ${user.name} <${user.email}>` : '',
          ``,
          `Items:`,
          itemsText,
          ``,
          `Total: $${createdOrder.totalPrice}`,
          ``,
          `Shipping address:`,
          shippingText,
        ]
          .filter(Boolean)
          .join('\n');

        const itemsRowsHtml = createdOrder.orderItems
          .map(
            (item) => `
              <tr>
                <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price}</td>
              </tr>`
          )
          .join('');

        const html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; padding: 24px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e5e5;">
              <div style="background: linear-gradient(135deg, #111827, #1f2937); padding: 16px 24px;">
                <h1 style="margin: 0; font-size: 20px; color: #ffffff;">Sweech - New Order</h1>
                <p style="margin: 4px 0 0; font-size: 13px; color: #d1d5db;">Order ID: ${createdOrder._id}</p>
              </div>

              <div style="padding: 20px 24px;">
                <p style="margin: 0 0 12px; font-size: 14px; color: #111827;">
                  A new order has been placed on <strong>Sweech</strong>.
                </p>

                ${
                  user
                    ? `<p style="margin: 0 0 16px; font-size: 14px; color: #4b5563;">
                        <strong>Customer:</strong> ${user.name} &lt;${user.email}&gt;
                      </p>`
                    : ''
                }

                <h2 style="margin: 0 0 8px; font-size: 16px; color: #111827;">Order Items</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; color: #111827;">
                  <thead>
                    <tr>
                      <th style="text-align: left; padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">Item</th>
                      <th style="text-align: center; padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">Qty</th>
                      <th style="text-align: right; padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsRowsHtml}
                  </tbody>
                </table>

                <p style="margin: 0 0 8px; font-size: 14px; color: #111827;">
                  <strong>Total:</strong> $${createdOrder.totalPrice}
                </p>

                <h3 style="margin: 16px 0 4px; font-size: 14px; color: #111827;">Shipping Address</h3>
                <p style="margin: 0 0 4px; font-size: 13px; color: #4b5563;">
                  ${shippingText}
                </p>

                <p style="margin: 16px 0 0; font-size: 12px; color: #9ca3af;">
                  You’re receiving this email because an order was placed on Sweech.
                </p>
              </div>
            </div>
          </div>
        `;

        await sendEmail({
          to: recipients,
          subject,
          text,
          html,
        });
      } catch (error) {
        console.error('Failed to send order emails:', error.message || error);
      }
    })();

    res.status(201).json(createdOrder);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

module.exports = router;
