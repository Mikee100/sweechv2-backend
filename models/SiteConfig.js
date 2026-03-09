const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    image: String,
    cta: String,
    link: String,
    color: String,
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

const curatedCollectionSchema = new mongoose.Schema(
  {
    id: String,
    title: String,
    tagline: String,
    query: String,
  },
  { _id: false }
);

const siteConfigSchema = new mongoose.Schema(
  {
    taxRate: { type: Number, default: 0.16 }, // 16% VAT by default
    promoBarText: { type: String, default: 'Same day delivery for all orders placed before 1pm.' },
    promoBarLink: { type: String },
    heroSlides: [heroSlideSchema],
    curatedCollections: [curatedCollectionSchema],
  },
  {
    timestamps: true,
  }
);

siteConfigSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({});
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);

module.exports = SiteConfig;

