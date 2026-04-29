import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-card border border-border rounded-3xl p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export default Card;