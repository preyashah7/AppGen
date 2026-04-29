import React from 'react';

const Skeleton = ({ width = '100%', height = '1rem', className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-surface-raised ${className}`}
      style={{ width, height }}
    />
  );
};

export default Skeleton;