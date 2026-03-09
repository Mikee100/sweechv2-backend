const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

// Last 8 characters of the product IDs you want to KEEP.
// Everything else in the products collection will be deleted.
const KEEP_ID_SUFFIXES = [
  'bcc7087f', // Anker Power point mini adapter
  'bcc70375', // Soundcore R50i
  'bcc6fe6b', // Anker zolo adapter(30w,PD 3.0) A2698K11 - Black
  'bcc6f961', // Anker 322 C to C braided cable
  'bcc6f457', // AnkerP25i
  '9f3e315d', // Soundcore R50i NC
];

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const allProducts = await Product.find({});
    console.log(`Total products found: ${allProducts.length}`);

    const keepProducts = allProducts.filter((p) =>
      KEEP_ID_SUFFIXES.some((suffix) => String(p._id).endsWith(suffix))
    );

    if (keepProducts.length !== KEEP_ID_SUFFIXES.length) {
      console.error(
        `Safety check failed: expected to match ${KEEP_ID_SUFFIXES.length} products, but found ${keepProducts.length}. Aborting without deleting anything.`
      );
      console.error(
        'Matched products:',
        keepProducts.map((p) => ({ id: p._id.toString(), name: p.name }))
      );
      process.exit(1);
    }

    const keepIds = keepProducts.map((p) => p._id);

    console.log('Products that will be KEPT:');
    keepProducts.forEach((p) => {
      console.log(`- ${p.name} (${p._id.toString()})`);
    });

    const result = await Product.deleteMany({ _id: { $nin: keepIds } });
    console.log(`Deleted products count: ${result.deletedCount}`);

    console.log('Prune completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error while pruning products:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

run();

