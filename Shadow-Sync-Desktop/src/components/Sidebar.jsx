import { motion } from 'framer-motion';

const Sidebar = () => {
  return (
    <motion.div
      className="fixed top-0 left-0 h-full w-64 bg-background-dark text-text-light p-6 shadow-lg"
      initial={{ x: -200 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <h2 className="text-xl font-bold">Active Sessions</h2>
      <ul className="mt-4">
        <li className="hover:bg-background-gray rounded-lg p-2">Session 1</li>
        <li className="hover:bg-background-gray rounded-lg p-2">Session 2</li>
        <li className="hover:bg-background-gray rounded-lg p-2">Session 3</li>
      </ul>
    </motion.div>
  );
};

export default Sidebar;
