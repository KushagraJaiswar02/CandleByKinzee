import { connectDb, disconnectDb } from '../src/config/db.js';
import { Product } from '../src/models/Product.js';
import { CATEGORIES } from '../src/constants.js';

const placeholderImage = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

const products = CATEGORIES.map((category, index) => ({
  name: `${category} placeholder`,
  description: `Placeholder catalog item for ${category}. Replace name, copy, price, and photos before launch.`,
  images: [placeholderImage],
  basePrice: 249 + index * 50,
  category,
  customizable: true,
  customOptions: [
    {
      label: 'Color',
      choices: ['White', 'Blush pink', 'Sky blue'],
      surcharges: { White: 0, 'Blush pink': 20, 'Sky blue': 20 }
    },
    {
      label: 'Scent',
      choices: ['Vanilla', 'Rose', 'Unscented'],
      surcharges: { Vanilla: 0, Rose: 25, Unscented: 0 }
    }
  ],
  isActive: true
}));

await connectDb();
await Product.deleteMany({});
await Product.insertMany(products);
console.log(`Seeded ${products.length} placeholder products.`);
await disconnectDb();
