import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const VerifyEmail = () => {
  const { t } = useTranslation();
  const { verifyEmail, resendCode, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [code, setCode] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('auth.verify.no_email'));
      return;
    }
    const result = await verifyEmail(email, code);
    if (result.success) {
      toast.success(t('auth.verify.success'));
      navigate(result.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error(t('error.no_email_found'));
      return;
    }
    const result = await resendCode(email);
    if (result.success) {
      toast.success(t('auth.verify.code_resent'));
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-cream-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center shadow-lg">
            <span className="text-3xl">📧</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">{t('auth.verify.heading')}</h1>
          <p className="text-gray-500 mt-1">
            {t('auth.verify.subtitle')} <strong>{email}</strong>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card shadow-card"
        >
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="verify-code" className="label">{t('auth.verify.code_label')}</label>
              <input
                id="verify-code"
                type="text"
                maxLength={6}
                placeholder={t('auth.verify.code_placeholder')}
                className="input-field text-center text-2xl tracking-[8px]"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>

            <button
              type="submit"
              disabled={code.length !== 6 || loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  {t('auth.verify.verifying')}
                </span>
              ) : (
                t('auth.verify.verify_btn')
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-orange-500 font-semibold hover:text-orange-600 transition-colors text-sm"
            >
              {t('auth.verify.resend')}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                {t('auth.verify.back_to_login')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmail;
