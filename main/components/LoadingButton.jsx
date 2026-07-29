import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingButton({ isLoading, children, className, style, disabled, ...props }) {
  return (
    <button
      className={`loading-button ${className || ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity: (isLoading || disabled) ? 0.7 : 1,
        cursor: (isLoading || disabled) ? 'not-allowed' : 'pointer',
        ...style
      }}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="spinner-icon" style={{ animation: 'spin 1s linear infinite' }} />}
      {children}
    </button>
  );
}
