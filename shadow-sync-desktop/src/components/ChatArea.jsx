/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiSmile } from 'react-icons/fi';
import { IoCheckmarkDone } from 'react-icons/io5';

const ChatArea = ({ messages, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  useEffect(() => {
    if (message) setIsTyping(true);
    else setIsTyping(false);

    const timer = setTimeout(() => setIsTyping(false), 2000);
    return () => clearTimeout(timer);
  }, [message]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const enhancedMessages = messages.map(msg => ({
    ...msg,
    time: formatTime(new Date()),
    read: Math.random() > 0.5
  }));

  return (
    <div className="flex flex-col h-full bg-background-dark rounded-lg overflow-hidden border border-border-gray">
      <div className="bg-background-gray px-6 py-4 border-b border-border-gray flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              CS
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background-dark"></span>
          </div>
          <div>
            <h3 className="font-semibold text-light">Class Chat</h3>
            <p className="text-xs text-muted">
              {isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-background-dark">
        <AnimatePresence initial={false}>
          {enhancedMessages.map((msg, idx) => (
            <motion.div
              key={idx}
              className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={`flex max-w-xs lg:max-w-md xl:max-w-lg 2xl:max-w-xl rounded-lg px-4 py-2 ${
                  msg.sender === 'You' 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-background-gray text-light rounded-bl-none'
                }`}
              >
                <div className="flex flex-col">
                  {msg.sender !== 'You' && (
                    <span className="text-xs font-semibold text-primary mb-1">
                      {msg.sender}
                    </span>
                  )}
                  <p className="text-sm">{msg.text}</p>
                  <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                    msg.sender === 'You' ? 'text-primary-dark' : 'text-muted'
                  }`}>
                    <span>{msg.time}</span>
                    {msg.sender === 'You' && (
                      <IoCheckmarkDone className={msg.read ? 'text-secondary' : 'text-muted'} />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="bg-background-gray p-4 border-t border-border-gray">
        <div className="flex items-center space-x-2">
          <button type="button" className="p-2 rounded-full hover:bg-background-dark text-muted">
            <FiSmile className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-background-dark text-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder-muted"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiSend className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatArea;