const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// Basic robots.txt
router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(
    [
      'User-agent: *',
      'Disallow:',
      '',
      `Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`,
    ].join('\n')
  );
});

// Simple XML sitemap for products and key pages
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const staticUrls = [
      '/',
      '/search',
      '/delivery',
      '/returns',
      '/faq',
      '/customer-support',
      '/contact',
    ];

    const products = await Product.find({ isActive: true }).select(
      'slug updatedAt createdAt'
    );

    const urls = [
      ...staticUrls.map((path) => ({
        loc: `${baseUrl}${path}`,
      })),
      ...products.map((p) => ({
        loc: `${baseUrl}/product/${p.slug}`,
        lastmod: (p.updatedAt || p.createdAt || new Date()).toISOString(),
        changefreq: 'weekly',
      })),
    ];

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map((u) => {
        return [
          '  <url>',
          `    <loc>${u.loc}</loc>`,
          u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : '',
          u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>` : '',
          '  </url>',
        ]
          .filter(Boolean)
          .join('\n');
      }),
      '</urlset>',
    ].join('\n');

    res.type('application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    res.status(500).send('Failed to generate sitemap');
  }
});

module.exports = router;

