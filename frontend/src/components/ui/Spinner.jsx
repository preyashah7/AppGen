import React from 'react';

const Spinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

export default Spinner;
