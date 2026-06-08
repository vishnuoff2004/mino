import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Unauthorized = () => {
  const { t } = useTranslation();
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

        <h1 className="text-4xl font-bold text-gray-800 mb-3">{t('unauthorized.title')}</h1>
        <p className="text-gray-500 text-lg mb-8">
          {t('unauthorized.message')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="unauthorized-back-btn"
            onClick={handleGoBack}
            className="btn-primary"
          >
            {t('unauthorized.go_back')}
          </button>
          <Link to="/login" className="btn-secondary">
            {t('unauthorized.switch_account')}
          </Link>
        </div>

        <div className="mt-8 p-4 bg-white/70 rounded-2xl border border-cream-200">
          <p className="text-sm text-gray-500">
            {t('unauthorized.contact_admin')}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
