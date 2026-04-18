import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import './FAB.css';

export default function FAB({ isOpen, onClick }) {
  return (
    <motion.button
      className="fab"
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isOpen ? 'Close modal' : 'Open AI assistant'}
    >
      <motion.div
        className="fab-icon-wrap"
        animate={{ rotate: isOpen ? 135 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {isOpen ? <X size={26} strokeWidth={2.5} /> : <Plus size={26} strokeWidth={2.5} />}
      </motion.div>
      <div className="fab-glow" />
    </motion.button>
  );
}
