import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';

export function useProducts(category) {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    api.get('/products', { params: category ? { category } : {} })
      .then((res) => setProducts(res.data.products || []))
      .catch(() => setProducts([]));
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
