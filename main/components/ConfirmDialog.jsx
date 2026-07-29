import React from 'react';
import LoadingButton from './LoadingButton';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isConfirming = false, variant = 'default' }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog-box animate-scale-up">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-dialog-actions">
          <button 
            className="confirm-cancel-btn"
            onClick={onCancel} 
            disabled={isConfirming}
          >
            {cancelText}
          </button>
          <LoadingButton 
            className={`confirm-action-btn ${variant !== 'default' ? variant : ''}`.trim()}
            isLoading={isConfirming} 
            onClick={onConfirm}
          >
            {confirmText}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
