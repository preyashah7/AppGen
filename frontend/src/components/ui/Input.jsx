import React from 'react';

const Input = ({ label, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium mb-2 text-text-secondary">{label}</label>}
      <input
        className={`w-full h-9 px-3 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/20 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;