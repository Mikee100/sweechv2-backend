const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');

const VALID_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'dispatched',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

// Helper to build a Mongo query object from common admin filter params
const buildOrderAdminQuery = async (req) => {
  const {
    status,
    from,
    to,
    email,
    paymentMethod,
    minTotal,
    maxTotal,
  } = req.query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  if (minTotal || maxTotal) {
    filter.totalPrice = {};
    if (minTotal) {
      filter.totalPrice.$gte = Number(minTotal);
    }
    if (maxTotal) {
      filter.totalPrice.$lte = Number(maxTotal);
    }
  }

  if (from || to) {
    filter.createdAt = {};
    if (from) {
      filter.createdAt.$gte = new Date(from);
    }
    if (to) {
      // Include the entire end day by setting to end of day if date-only string
      const toDate = new Date(to);
      if (!Number.isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }
  }

  // Filter by customer email (case-insensitive)
  if (email) {
    const users = await User.find({
      email: { $regex: email, $options: 'i' },
    }).select('_id');

    const userIds = users.map((u) => u._id);

    if (!userIds.length) {
      // No matching users: ensure query returns empty set
      filter.user = { $in: [] };
    } else {
      filter.user = { $in: userIds };
    }
  }

  return filter;
};

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
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          note: 'Order placed',
        },
      ],
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
          `A new order has been placed on CaseProz.`,
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
                <h1 style="margin: 0; font-size: 20px; color: #ffffff;">CaseProz - New Order</h1>
                <p style="margin: 4px 0 0; font-size: 13px; color: #d1d5db;">Order ID: ${createdOrder._id}</p>
              </div>

              <div style="padding: 20px 24px;">
                <p style="margin: 0 0 12px; font-size: 14px; color: #111827;">
                  A new order has been placed on <strong>CaseProz</strong>.
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
                  You’re receiving this email because an order was placed on CaseProz.
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

// @desc    Get all orders (with optional filters for admin)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const filter = await buildOrderAdminQuery(req);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'id name email');

    res.json(orders);
  } catch (error) {
    console.error('Failed to fetch admin orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: 'delivered',
      note: 'Order marked as delivered',
      updatedAt: new Date(),
    });

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// @desc    Update order status / tracking
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  const { status, trackingNumber, carrier, note } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid or missing status value' });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = status;

  if (trackingNumber !== undefined) {
    order.trackingNumber = trackingNumber;
  }

  if (carrier !== undefined) {
    order.carrier = carrier;
  }

  order.statusHistory = order.statusHistory || [];
  order.statusHistory.push({
    status,
    note: note || undefined,
    updatedAt: new Date(),
  });

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

// @desc    Bulk update order status
// @route   PUT /api/orders/bulk/status
// @access  Private/Admin
router.put('/bulk/status', protect, admin, async (req, res) => {
  const { orderIds, status, note } = req.body;

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ message: 'orderIds array is required' });
  }

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid or missing status value' });
  }

  try {
    const orders = await Order.find({ _id: { $in: orderIds } });

    const now = new Date();
    const statusEntry = {
      status,
      note: note || undefined,
      updatedAt: now,
    };

    for (const order of orders) {
      order.status = status;
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push(statusEntry);

      if (status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = now;
      }
    }

    const updatedOrders = await Promise.all(orders.map((o) => o.save()));

    res.json({
      updatedCount: updatedOrders.length,
      orders: updatedOrders,
    });
  } catch (error) {
    console.error('Failed to bulk update order status:', error);
    res.status(500).json({ message: 'Failed to bulk update order status' });
  }
});

// @desc    Export orders as CSV (respects same filters as GET /api/orders)
// @route   GET /api/orders/export
// @access  Private/Admin
router.get('/export', protect, admin, async (req, res) => {
  try {
    const filter = await buildOrderAdminQuery(req);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    const header = [
      'Order ID',
      'Created At',
      'Customer Name',
      'Customer Email',
      'Status',
      'Payment Method',
      'Items Total',
      'Shipping',
      'Tax',
      'Total',
      'Paid',
      'Delivered',
    ];

    const escapeCsv = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = orders.map((order) => [
      order._id,
      order.createdAt ? order.createdAt.toISOString() : '',
      order.user && order.user.name ? order.user.name : '',
      order.user && order.user.email ? order.user.email : '',
      order.status || '',
      order.paymentMethod || '',
      order.itemsPrice != null ? order.itemsPrice : '',
      order.shippingPrice != null ? order.shippingPrice : '',
      order.taxPrice != null ? order.taxPrice : '',
      order.totalPrice != null ? order.totalPrice : '',
      order.isPaid ? 'Yes' : 'No',
      order.isDelivered ? 'Yes' : 'No',
    ]);

    const csvLines = [
      header.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ];

    const csvContent = csvLines.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="orders-export.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    console.error('Failed to export orders CSV:', error);
    res.status(500).json({ message: 'Failed to export orders' });
  }
});

module.exports = router;
