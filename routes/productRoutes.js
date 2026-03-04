const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Fetch products (with optional search, filters, pagination, and sorting)
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const keywordFilter = req.query.keyword
      ? {
          $or: [
            {
              name: {
                $regex: req.query.keyword,
                $options: 'i',
              },
            },
            {
              description: {
                $regex: req.query.keyword,
                $options: 'i',
              },
            },
            {
              category: {
                $regex: req.query.keyword,
                $options: 'i',
              },
            },
            {
              subCategory: {
                $regex: req.query.keyword,
                $options: 'i',
              },
            },
          ],
        }
      : {};

    const category = req.query.category;
    const subCategory = req.query.subCategory;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

    const page = req.query.page ? Number(req.query.page) || 1 : 0;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) || 12 : 12;

    let sortOption = { createdAt: -1 };
    const sort = req.query.sort;
    if (sort === 'priceAsc') {
      sortOption = { price: 1 };
    } else if (sort === 'priceDesc') {
      sortOption = { price: -1 };
    } else if (sort === 'nameAsc') {
      sortOption = { name: 1 };
    } else if (sort === 'nameDesc') {
      sortOption = { name: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const query = {
      ...keywordFilter,
    };

    if (category) {
      query.category = category;
    }

    if (subCategory) {
      query.subCategory = subCategory;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        query.price.$lte = maxPrice;
      }
    }

    // If a page is provided, use paginated response shape
    if (page > 0) {
      const count = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort(sortOption)
        .limit(pageSize)
        .skip(pageSize * (page - 1));

      res.json({
        products,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
      });
      return;
    }

    // Fallback: no pagination requested, return full list (sorted)
    const products = await Product.find(query).sort(sortOption);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Fetch single product by slug
// @route   GET /api/products/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, slug, description, price, originalPrice, category, subCategory, images, stock, specs, isFeatured, onSale } = req.body;
    
    const product = new Product({
      name,
      slug,
      description,
      price,
      originalPrice,
      category,
      subCategory,
      images,
      stock,
      specs,
      isFeatured,
      onSale
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, slug, description, price, originalPrice, category, subCategory, images, stock, specs, isFeatured, onSale } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.slug = slug || product.slug;
      product.description = description || product.description;
      product.price = price || product.price;
      product.originalPrice = originalPrice || product.originalPrice;
      product.category = category || product.category;
      product.subCategory = subCategory || product.subCategory;
      product.images = images || product.images;
      product.stock = stock !== undefined ? stock : product.stock;
      product.specs = specs || product.specs;
      product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
      product.onSale = onSale !== undefined ? onSale : product.onSale;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Fetch single product by ID
// @route   GET /api/products/id/:id
// @access  Public
router.get('/id/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
