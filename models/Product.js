const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: { type: String, required: true },
    subCategory: { type: String },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
    keyFeatures: [{ type: String }],
    specs: [{ key: String, value: String }],
    sku: { type: String },
    brand: { type: String },
    // Variant grouping (e.g. Liberty 5 White/Black)
    variantGroup: { type: String },
    variantLabel: { type: String },
    // Extra taxonomy used for product footer like "Valentine's Day Gifts"
    categories: [{ type: String }],
    featureHeadline: { type: String },
    featureSubtext: { type: String },
    notes: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
