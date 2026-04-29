import React from 'react';

const Input = ({ label, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        {...props}
      />
    </div>
  );
};

export default Input;