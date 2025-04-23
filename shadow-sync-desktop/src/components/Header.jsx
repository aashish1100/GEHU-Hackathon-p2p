/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { setUserLoggedIn, setUserRole } = useContext(AuthContext);

  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');
  const lab = localStorage.getItem('lab');

  const handleLogout = () => {
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    localStorage.removeItem('lab');
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
      <div className="flex flex-col md:flex-row items-start md:items-center md:gap-6 w-full md:w-auto">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Shadow Sync</h1>

        {name && role && lab && (
          <div className="text-sm md:text-base mt-1 md:mt-0 bg-white/10 px-4 py-2 rounded-lg shadow-inner border border-white/20 text-white backdrop-blur-sm">
            <span className="font-semibold">{name}</span> &bull; <span>{role}</span> &bull; <span>{lab}</span>
          </div>
        )}
      </div>

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
