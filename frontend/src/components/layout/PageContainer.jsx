import React from 'react';
import { motion } from 'framer-motion';

export default function PageContainer({ children, className = '' }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className={`max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full ${className}`}
    >
      {children}
    </motion.main>
  );
}
