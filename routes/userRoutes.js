const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const generateToken = require('../utils/generateToken');
const { protect, admin } = require('../middleware/authMiddleware');

const buildUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  role: user.role || (user.isAdmin ? 'MANAGER' : 'CUSTOMER'),
});

const getAuthCookieOptions = (req) => {
  const host = req.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  const isSecure = !isLocalhost || req.secure || req.get('x-forwarded-proto') === 'https' || process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  };
};



// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);
    res
      .cookie('authToken', token, getAuthCookieOptions(req))
      .json(buildUserPayload(user));
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    const token = generateToken(user._id);
    res
      .status(201)
      .cookie('authToken', token, getAuthCookieOptions(req))
      .json(buildUserPayload(user));
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json(buildUserPayload(user));
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Update logged in user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();
  const token = generateToken(updatedUser._id);

  res
    .cookie('authToken', token, getAuthCookieOptions(req))
    .json(buildUserPayload(updatedUser));
});

// @desc    Get logged in user's favourite products
// @route   GET /api/users/favourites
// @access  Private
router.get('/favourites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favourites');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.favourites || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get logged in user's cart (account-linked)
// @route   GET /api/users/cart
// @access  Private
router.get('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cartItems.product');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const items = (user.cartItems || []).map((item) => {
      const product = item.product;
      if (!product) {
        return null;
      }

      return {
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images || [],
        slug: product.slug,
        stock: product.stock,
        quantity: item.qty,
      };
    }).filter(Boolean);

    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Logout user (clear auth cookie)
// @route   POST /api/users/logout
// @access  Public (just clears cookie)
router.post('/logout', (req, res) => {
  res
    .clearCookie('authToken', getAuthCookieOptions(req))
    .status(200)
    .json({ message: 'Logged out' });
});

// @desc    Replace or merge logged in user's cart with provided items
// @route   PUT /api/users/cart
// @access  Private
router.put('/cart', protect, async (req, res) => {
  try {
    const { items, merge } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'items array is required' });
    }

    const sanitizedMap = new Map();

    for (const item of items) {
      const { productId, quantity } = item || {};

      if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
        continue;
      }

      const product = await Product.findById(productId);

      if (!product || !product.isActive || product.stock <= 0) {
        continue;
      }

      const safeQty = Math.min(quantity, product.stock);

      const existing = sanitizedMap.get(String(product._id));
      const mergedQty = existing ? Math.min(existing.qty + safeQty, product.stock) : safeQty;

      sanitizedMap.set(String(product._id), {
        product: product._id,
        qty: mergedQty,
        priceAtAdd: product.price,
        nameAtAdd: product.name,
        imageAtAdd: product.images && product.images[0],
        slugAtAdd: product.slug,
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newItems = Array.from(sanitizedMap.values());

    if (merge && Array.isArray(user.cartItems) && user.cartItems.length > 0) {
      const existingMap = new Map();

      for (const item of user.cartItems) {
        existingMap.set(String(item.product), {
          product: item.product,
          qty: item.qty,
          priceAtAdd: item.priceAtAdd,
          nameAtAdd: item.nameAtAdd,
          imageAtAdd: item.imageAtAdd,
          slugAtAdd: item.slugAtAdd,
        });
      }

      for (const incoming of newItems) {
        const key = String(incoming.product);
        const existing = existingMap.get(key);
        if (existing) {
          const mergedQty = Math.min(existing.qty + incoming.qty, incoming.qty);
          existingMap.set(key, { ...incoming, qty: mergedQty });
        } else {
          existingMap.set(key, incoming);
        }
      }

      user.cartItems = Array.from(existingMap.values());
    } else {
      user.cartItems = newItems;
    }

    await user.save();

    res.status(200).json({ message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add a product to favourites
// @route   POST /api/users/favourites
// @access  Private
router.post('/favourites', protect, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { favourites: productId } },
      { new: true }
    ).populate('favourites');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(201).json(user.favourites || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Remove a product from favourites
// @route   DELETE /api/users/favourites/:productId
// @access  Private
router.delete('/favourites/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favourites: productId } },
      { new: true }
    ).populate('favourites');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.favourites || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    const {
      name,
      email,
      isAdmin,
      role,
      notes,
      tags,
    } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;

    if (typeof isAdmin === 'boolean') {
      user.isAdmin = isAdmin;
    }

    if (role) {
      user.role = role;
      // Keep boolean in sync for admin-only routes
      if (role === 'CUSTOMER') {
        user.isAdmin = false;
      } else if (!user.isAdmin) {
        user.isAdmin = true;
      }
    }

    if (notes !== undefined) {
      user.notes = notes;
    }

    if (Array.isArray(tags)) {
      user.tags = tags;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      role: updatedUser.role || (updatedUser.isAdmin ? 'MANAGER' : 'CUSTOMER'),
      notes: updatedUser.notes || '',
      tags: updatedUser.tags || [],
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
