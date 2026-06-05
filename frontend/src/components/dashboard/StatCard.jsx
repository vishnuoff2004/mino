import { motion } from 'framer-motion';

const StatCard = ({ icon, label, value, gradient, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="stat-card"
    >
      <div className={`stat-icon ${gradient}`}>
        <span>{icon}</span>
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
