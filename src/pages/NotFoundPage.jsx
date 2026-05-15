import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-navy-900 text-center px-4">
    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
      <span className="text-8xl">😴</span>
    </motion.div>
    <h1 className="font-display text-6xl font-bold text-gray-900 dark:text-white mb-3">404</h1>
    <h2 className="font-display text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Page Not Found</h2>
    <p className="text-gray-500 mb-8 max-w-md">This page seems to be sleeping. Let's get you back to the good stuff.</p>
    <Link to="/" className="btn-primary px-8 py-4">Back to Home</Link>
  </div>
);

export default NotFoundPage;
