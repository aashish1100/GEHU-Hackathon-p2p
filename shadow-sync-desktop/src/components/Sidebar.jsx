/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { FaShareAlt, FaChalkboardTeacher } from 'react-icons/fa';
import { AuthContext } from '../AuthContext';

const Sidebar = () => {
  const { userRole } = useContext(AuthContext);

  return (
    <motion.div
      className="bg-background-gray w-64 h-screen shadow-lg p-6"
      initial={{ x: -200 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 50 }}
    >
      <h2 className="text-primary text-xl font-semibold mb-8">GEHU Lab</h2>
      <ul className="space-y-6">
        <li>
          <motion.div whileHover={{ scale: 1.05 }}>
            <a
              href="#"
              className="flex items-center space-x-3 text-light hover:text-primary transition-all duration-300"
            >
              <FaShareAlt className="text-2xl" />
              <span>File Sharing</span>
            </a>
          </motion.div>
        </li>

        {userRole === 'faculty' && (
          <li>
            <motion.div whileHover={{ scale: 1.05 }}>
              <a
                href="#"
                className="flex items-center space-x-3 text-light hover:text-primary transition-all duration-300"
              >
                <FaChalkboardTeacher className="text-2xl" />
                <span>Manage Sessions</span>
              </a>
            </motion.div>
          </li>
        )}
      </ul>
    </motion.div>
  );
};

export default Sidebar;
