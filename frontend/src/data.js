export const categories = [
  'Gift favour candles',
  'Bobble candles',
  'Heart collection',
  'Daisy & glass candles',
  'Candle bouquets & sticks',
  'Floral candle bouquets',
  'Handcrafted flower baskets',
  'Return gift candles',
  'Gift box sets',
  'Festive sweet collection',
  'Cocktail candle collection'
];

export const fallbackProducts = categories.map((category, index) => ({
  _id: `placeholder-${index}`,
  name: category,
  description: 'Made-to-order candle piece. Real photos and copy can be added from the catalog manager.',
  images: ['https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=900&q=80'],
  basePrice: 249 + index * 50,
  category,
  customOptions: [
    { label: 'Color', choices: ['White', 'Blush pink', 'Sky blue'] },
    { label: 'Scent', choices: ['Vanilla', 'Rose', 'Unscented'] }
  ]
}));
