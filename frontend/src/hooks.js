import { useEffect, useState } from 'react';
import { api } from './api/client.js';
import { fallbackProducts } from './data.js';

export function useProducts(category) {
  const [products, setProducts] = useState(fallbackProducts);
  useEffect(() => {
    api.get('/products', { params: category ? { category } : {} })
      .then((res) => setProducts(res.data.products.length ? res.data.products : fallbackProducts))
      .catch(() => setProducts(category ? fallbackProducts.filter((p) => p.category === category) : fallbackProducts));
  }, [category]);
  return products;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

