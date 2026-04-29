import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`card-base shadow-card ${className}`}>
      {children}
    </div>
  );
};

export default Card;