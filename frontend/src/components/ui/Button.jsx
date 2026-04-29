import React from 'react';

const Button = ({ children, loading, variant = 'primary', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150';

  const variants = {
    primary: 'px-4 py-2.5 bg-accent text-white hover:bg-accent-hover active:scale-99 shadow-sm hover:shadow-lg',
    secondary: 'px-4 py-2.5 bg-surface border border-border text-text-secondary hover:bg-surface-raised hover:border-border-strong hover:text-text-primary',
    ghost: 'p-2 bg-transparent text-text-secondary hover:bg-surface-raised rounded-lg',
    danger: 'px-4 py-2.5 bg-danger text-white hover:bg-red-700',
  };

  const disabledClass = loading || props.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${disabledClass} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;