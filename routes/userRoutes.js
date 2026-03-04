const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
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
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
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
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
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

module.exports = router;
