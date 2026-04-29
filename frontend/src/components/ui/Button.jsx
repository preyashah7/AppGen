import React from 'react';

const Button = ({ children, loading, variant = 'primary', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700',
    secondary: 'bg-white border border-border text-textPrimary hover:bg-gray-50',
  };
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;