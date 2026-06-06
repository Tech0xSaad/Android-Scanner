import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="spinner-wrap" aria-label="Loading">
      <motion.div
        className="spinner-ring"
        animate={{ rotate: 360 }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.1, ease: 'linear' }}
      />
      <motion.div
        className="spinner-core"
        animate={{ scale: [0.92, 1.05, 0.92] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.2, ease: 'easeInOut' }}
      />
    </div>
  );
}