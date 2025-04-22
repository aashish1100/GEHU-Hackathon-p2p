/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer
      className="bg-background-gray text-light px-6 py-4 border-t border-border-gray"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 80 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
        <span className="text-muted">&copy; 2025 GEHU Labs</span>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-primary transition-all duration-200">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-primary transition-all duration-200">
            Terms of Service
          </a>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
