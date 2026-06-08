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

const Register = () => {
  const { t } = useTranslation();
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const schema = useMemo(() => yup.object({
    name: yup.string().min(2, t('validation.name_min')).max(100).required(t('validation.name_required')),
    email: yup.string().email(t('validation.email_invalid')).required(t('validation.email_required')),
    password: yup
      .string()
      .min(6, t('validation.password_min'))
      .required(t('validation.password_required')),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], t('validation.confirm_match'))
      .required(t('validation.confirm_required')),
  }), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    const result = await registerUser(data.name, data.email, data.password);
    if (result.success) {
      toast.success(t('auth.register.success'));
      navigate('/verify-email', { state: { email: result.email } });
    } else {
      toast.error(result.message || t('error.registration_failed'));
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
          <p className="text-gray-500 mt-1">{t('auth.register.subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card shadow-card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('auth.register.heading')}</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reg-name" className="label">{t('auth.register.name_label')}</label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                placeholder={t('auth.register.name_placeholder')}
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                {...register('name')}
              />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="label">{t('auth.register.email_label')}</label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder={t('auth.register.email_placeholder')}
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                {...register('email')}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-password" className="label">{t('auth.register.password_label')}</label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                placeholder={t('auth.register.password_placeholder')}
                className={`input-field ${errors.password ? 'border-red-400' : ''}`}
                {...register('password')}
              />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-confirm-password" className="label">{t('auth.register.confirm_label')}</label>
              <input
                id="reg-confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder={t('auth.register.confirm_placeholder')}
                className={`input-field ${errors.confirmPassword ? 'border-red-400' : ''}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="error-text">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  {t('auth.register.creating')}
                </span>
              ) : (
                t('auth.register.create_btn')
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              {t('auth.register.has_account')}{' '}
              <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                {t('auth.register.sign_in')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
