/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaComments, FaFolderOpen } from 'react-icons/fa';

const sessions = ['Session A', 'Session B', 'Session C'];

const SessionList = () => {
  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="w-full md:w-64 bg-background-gray text-light p-6 border-r border-border-gray h-full hidden md:block"
    >
      <h2 className="text-xl font-semibold mb-6 text-primary">Lab Sessions</h2>

      <motion.ul
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="space-y-4"
      >
        {sessions.map((session) => (
          <motion.li
            key={session}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.03 }}
            className="bg-background-dark p-3 rounded-lg shadow-md cursor-pointer hover:bg-primary transition-all duration-300 group"
          >
            <span className="group-hover:text-white transition-colors font-medium">{session}</span>
          </motion.li>
        ))}
      </motion.ul>

      <div className="mt-10 space-y-4 text-muted text-sm">
        <div className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer">
          <FaComments className="text-lg" />
          <span>Messaging</span>
        </div>
        <div className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer">
          <FaFolderOpen className="text-lg" />
          <span>File Sharing</span>
        </div>
      </div>
    </motion.aside>
  );
};

export default SessionList;
