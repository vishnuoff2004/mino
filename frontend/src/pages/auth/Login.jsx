import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Login = () => {
  const { t } = useTranslation();
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const schema = useMemo(() => yup.object({
    email: yup.string().email(t('validation.email_invalid')).required(t('validation.email_required')),
    password: yup.string().min(6, t('validation.password_min')).required(t('validation.password_required')),
  }), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      toast.success(t('error.welcome_back'));
      navigate(result.role === 'admin' ? '/admin' : '/dashboard');
    } else if (result.needsVerification) {
      toast.error(t('error.verify_email'));
      navigate('/verify-email', { state: { email: result.email } });
    } else {
      toast.error(result.message || t('error.login_failed'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-cream-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center shadow-lg">
            <span className="text-3xl">🗓️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">{t('common.bookease')}</h1>
          <p className="text-gray-500 mt-1">{t('auth.login.subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card shadow-card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('auth.login.heading')}</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="label">{t('auth.login.email_label')}</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder={t('auth.login.email_placeholder')}
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                {...register('email')}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="login-password" className="label">{t('auth.login.password_label')}</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder={t('auth.login.password_placeholder')}
                className={`input-field ${errors.password ? 'border-red-400' : ''}`}
                {...register('password')}
              />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  {t('auth.login.signing_in')}
                </span>
              ) : (
                t('auth.login.sign_in')
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              {t('auth.login.no_account')}{' '}
              <Link to="/register" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                {t('auth.login.create_account')}
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-cream-50 rounded-xl border border-cream-200">
            <p className="text-xs font-semibold text-gray-600 mb-1">{t('auth.login.demo_heading')}</p>
            <p className="text-xs text-gray-500">{t('auth.login.demo_text')}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
