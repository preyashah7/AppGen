import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-textPrimary mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Build apps from JSON config
        </h1>
        <p className="text-xl text-textSecondary mb-8">
          Create, configure and deploy data apps instantly
        </p>
        <div className="space-x-4">
          <Link to="/signup" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Get Started
          </Link>
          <Link to="/login" className="border border-border px-6 py-3 rounded-lg hover:bg-gray-50">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;