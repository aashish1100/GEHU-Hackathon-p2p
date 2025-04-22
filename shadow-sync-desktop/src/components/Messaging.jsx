/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';

const Message = ({ message, isSelf }) => {
  return (
    <motion.div
      className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`p-4 max-w-xs rounded-lg shadow-lg ${
          isSelf
            ? 'bg-primary text-white'
            : 'bg-background-gray text-light'
        }`}
      >
        {message}
      </div>
    </motion.div>
  );
};

const Messaging = () => {
  const messages = [
    { text: 'Hello, how can I help you?', isSelf: false },
    { text: 'I need help with file distribution.', isSelf: true },
  ];

  return (
    <div className="flex flex-col p-6 h-full">
      <div className="flex-1 overflow-y-auto mb-6 space-y-4">
        {messages.map((msg, index) => (
          <Message key={index} message={msg.text} isSelf={msg.isSelf} />
        ))}
      </div>
      <motion.div
        className="flex items-center space-x-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <input
          type="text"
          placeholder="Type a message..."
          className="p-4 w-full rounded-lg border-2 border-border-gray bg-background-gray text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
        />
        <button className="bg-primary p-3 rounded-lg text-white hover:bg-primary-dark focus:ring-2 focus:ring-primary transition-all duration-300">
          <FaPaperPlane className="text-lg" />
        </button>
      </motion.div>
    </div>
  );
};

export default Messaging;
