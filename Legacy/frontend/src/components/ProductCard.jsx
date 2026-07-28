import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export function ProductCard({ product }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article className="product-card" whileHover={reduceMotion ? undefined : { y: -4 }}>
      <img src={product.images?.[0]} alt={product.name} />
      <div>
        <p className="eyebrow">{product.category}</p>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-meta">
          <strong>From ₹{product.basePrice}</strong>
          <Link className="icon-link" to={`/products/${product._id}`}><ShoppingBag size={16} /> Buy</Link>
        </div>
      </div>
    </motion.article>
  );
}
