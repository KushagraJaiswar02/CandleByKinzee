import React from 'react';
import { ShopPage } from '@/components/ShopPage.jsx';

export function generateMetadata({ params }) {
  const category = params?.category ? decodeURIComponent(params.category) : 'Collection';
  return {
    title: `${category} Candles — Candle by Kinzee`,
    description: `Explore our premium range of ${category.toLowerCase()} candles, hand-poured in India for your special occasions.`
  };
}

export default function Collection() {
  return <ShopPage />;
}
