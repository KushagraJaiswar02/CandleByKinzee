'use client';

import React from 'react';
import { Flame } from 'lucide-react';

export function FlameButton({ children, ...props }) {
  return (
    <button
      className="primary-btn"
      {...props}
    >
      <span aria-hidden="true"><Flame size={16} fill="currentColor" /></span>
      {children}
    </button>
  );
}
