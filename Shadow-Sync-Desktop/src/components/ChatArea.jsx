import { motion } from 'framer-motion';
import './ChatArea.css';

const ChatArea = () => {
  return (
    <motion.section
      className="chat-area"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h2 className="chat-area-title">Chat</h2>
      <div className="messages">
        <div className="message">
          <p className="message-text">Hello, how are you?</p>
        </div>
        <div className="message">
          <p className="message-text">I'm good, thanks! How about you?</p>
        </div>
      </div>
      <textarea className="message-input" placeholder="Type your message..." />
      <button className="send-message-btn">Send</button>
    </motion.section>
  );
};

export default ChatArea;
