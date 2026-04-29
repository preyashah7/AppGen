import React from 'react';

const Modal = ({ title, open, onClose, children, footer }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-3 sm:items-center sm:px-4 sm:py-6">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-modal sm:max-h-[calc(100dvh-3rem)]">
        <div className="shrink-0 flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-text-primary sm:text-xl">{title}</h2>
          <button className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {children}
        </div>
        {footer && <div className="shrink-0 border-t border-border px-4 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
