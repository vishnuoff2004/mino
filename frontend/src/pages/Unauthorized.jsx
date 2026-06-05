import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (!isAuthenticated) navigate('/login');
    else if (isAdmin) navigate('/admin');
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-cream-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full"
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-8xl mb-6"
        >
          🚫
        </motion.div>

        <h1 className="text-4xl font-bold text-gray-800 mb-3">Access Denied</h1>
        <p className="text-gray-500 text-lg mb-8">
          You don't have permission to view this page. This area is restricted to authorized personnel only.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="unauthorized-back-btn"
            onClick={handleGoBack}
            className="btn-primary"
          >
            ← Go Back
          </button>
          <Link to="/login" className="btn-secondary">
            Sign in with different account
          </Link>
        </div>

        <div className="mt-8 p-4 bg-white/70 rounded-2xl border border-cream-200">
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
