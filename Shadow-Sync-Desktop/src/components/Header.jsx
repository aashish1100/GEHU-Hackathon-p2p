import { motion } from 'framer-motion';

const Header = () => {
  return (
    <header className="flex justify-between items-center p-6 bg-background-gray shadow-md">
      <motion.h1
        className="text-3xl font-bold text-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Shadow Sync
      </motion.h1>
      <motion.button
        className="px-6 py-2 rounded-lg text-white bg-primary-dark hover:bg-primary transition-all"
        whileHover={{ scale: 1.1 }}
      >
        Start Session
      </motion.button>
    </header>
  );
};

export default Header;
