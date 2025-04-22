/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { setUserLoggedIn, setUserRole } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    setUserLoggedIn(false);
    setUserRole('');
    navigate('/login');
  };

  return (
    <motion.header
      className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-lg z-10"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <h1 className="text-3xl font-extrabold tracking-tight text-white">
        Shadow Sync
      </h1>

      <div className="flex items-center gap-4 flex-wrap">
        <motion.button
          className="px-6 py-2 rounded-lg text-lg font-semibold bg-primary hover:bg-primary-dark text-white transition-all duration-300"
          whileHover={{ scale: 1.05 }}
        >
          End Session
        </motion.button>

        <motion.div
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-light rounded-md cursor-pointer hover:bg-gray-700 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
        >
          <FaSignOutAlt className="text-xl" />
          <span className="text-sm font-medium">Logout</span>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
