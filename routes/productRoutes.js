const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');
const { protect, admin } = require('../middleware/authMiddleware');

// Simple in-memory cache for the full products list (no filters)
let productsCache = {
  data: null,
  timestamp: 0,
};
const PRODUCTS_CACHE_TTL_MS = 60 * 1000; // 60 seconds

const invalidateProductsCache = () => {
  productsCache = { data: null, timestamp: 0 };
};

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
    const brand = req.query.brand;
    const variantGroup = req.query.variantGroup;
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

    let baseQuery = {
      ...keywordFilter,
    };

    if (category) {
      baseQuery = { ...baseQuery, category };
    }

    if (subCategory) {
      baseQuery = { ...baseQuery, subCategory };
    }

    if (variantGroup) {
      baseQuery = { ...baseQuery, variantGroup };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      baseQuery.price = {};
      if (minPrice !== undefined) {
        baseQuery.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        baseQuery.price.$lte = maxPrice;
      }
    }

    let query = baseQuery;

    if (brand) {
      const brandFilter = {
        $or: [
          { category: { $regex: brand, $options: 'i' } },
          { subCategory: { $regex: brand, $options: 'i' } },
          { name: { $regex: brand, $options: 'i' } },
        ],
      };

      query = Object.keys(baseQuery).length
        ? { $and: [baseQuery, brandFilter] }
        : brandFilter;
    }

    const hasFilters =
      req.query.keyword ||
      category ||
      subCategory ||
      brand ||
      minPrice !== undefined ||
      maxPrice !== undefined ||
      sort;

    const isCacheableRequest = !hasFilters && page === 0;

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
    if (isCacheableRequest && productsCache.data) {
      const age = Date.now() - productsCache.timestamp;
      if (age < PRODUCTS_CACHE_TTL_MS) {
        return res.json(productsCache.data);
      }
    }

    const products = await Product.find(query).sort(sortOption);

    if (isCacheableRequest) {
      productsCache = {
        data: products,
        timestamp: Date.now(),
      };
    }

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
    const { name, slug, description, price, originalPrice, category, subCategory, images, stock, specs, isFeatured, onSale, keyFeatures, sku, brand, variantGroup, variantLabel, categories, featureHeadline, featureSubtext, notes } = req.body;
    
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
      onSale,
      keyFeatures,
      sku,
      brand,
      variantGroup,
      variantLabel,
      categories,
      featureHeadline,
      featureSubtext,
      notes,
    });

    const createdProduct = await product.save();
    invalidateProductsCache();
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
    const { name, slug, description, price, originalPrice, category, subCategory, images, stock, specs, isFeatured, onSale, keyFeatures, sku, brand, variantGroup, variantLabel, categories, featureHeadline, featureSubtext, notes } = req.body;
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
      if (keyFeatures !== undefined) product.keyFeatures = keyFeatures;
      if (sku !== undefined) product.sku = sku;
      if (brand !== undefined) product.brand = brand;
      if (variantGroup !== undefined) product.variantGroup = variantGroup;
      if (variantLabel !== undefined) product.variantLabel = variantLabel;
      if (categories !== undefined) product.categories = categories;
      if (featureHeadline !== undefined) product.featureHeadline = featureHeadline;
      if (featureSubtext !== undefined) product.featureSubtext = featureSubtext;
      if (notes !== undefined) product.notes = notes;

      const updatedProduct = await product.save();
      invalidateProductsCache();
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
      invalidateProductsCache();
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

// @desc    Contact form submission
// @route   POST /api/products/contact  (mounted under /api/products)
// @access  Public
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: 'Name, email, and message are required.' });
    }

    const safeSubject = subject && subject.trim().length > 0
      ? subject.trim()
      : 'New contact message from CaseProz site';

    const html = `
      <h2>New contact message from CaseProz</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br />')}</p>
    `;

    const to = process.env.ADMIN_ORDER_EMAIL || process.env.SMTP_USER;

    await sendEmail({
      to,
      subject: safeSubject,
      text: `From: ${name} <${email}>\n\n${message}`,
      html,
    });

    res.json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Contact endpoint error:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
});

module.exports = router;

