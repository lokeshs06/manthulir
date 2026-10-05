import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { getApiErrorMessage } from '../../lib/errorHandler';
import { Sprout, Phone, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation schema
  const loginSchema = z.object({
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, t('auth.phoneInvalid')),
    password: z
      .string()
      .min(6, t('auth.passwordMin')),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      const user = await login(data);
      const fromPath = location.state?.from?.pathname;
      const targetPath = (fromPath && fromPath !== '/login' && fromPath !== '/register')
        ? fromPath
        : (user.role === 'farmer' ? '/farmer' : user.role === 'buyer' ? '/buyer' : '/admin');
      navigate(targetPath, { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill helper for easy testing
  const quickFill = (phone, pass) => {
    setValue('phone', phone, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-agri-800 to-agri-700 text-white p-6 sm:p-8 text-center">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
            <Sprout className="w-7 h-7 text-agri-300" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-agri-100 text-xs sm:text-sm mt-1">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {serverError && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>
            {/* Phone */}
            <div>
              <label
                htmlFor="phone-input"
                className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
              >
                {t('auth.phone')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  id="phone-input"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={t('auth.phonePlaceholder')}
                  {...register('phone')}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-base font-medium min-h-touch bg-stone-50/50 focus:bg-white transition-colors ${
                    errors.phone
                      ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                      : 'border-stone-300 focus:ring-agri-600 focus:border-agri-600'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password-input"
                className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
              >
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t('auth.passwordPlaceholder')}
                  {...register('password')}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-base font-medium min-h-touch bg-stone-50/50 focus:bg-white transition-colors ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                      : 'border-stone-300 focus:ring-agri-600 focus:border-agri-600'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl text-white bg-agri-700 hover:bg-agri-800 active:bg-agri-900 font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 min-h-touch disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              <span>{isSubmitting ? t('auth.loggingIn') : t('auth.loginButton')}</span>
            </button>
          </form>

          {/* Quick Fill Test Accounts */}
          <div className="mt-6 pt-5 border-t border-stone-100">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{i18n.language === 'ta' ? 'பயிற்சிக்கு விரைவு உள்நுழைவு:' : 'Test Accounts:'}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => quickFill('9000000001', 'samplePass123')}
                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-agri-50 hover:bg-agri-100 text-agri-800 font-medium border border-agri-200 transition-colors"
              >
                🌾 விவசாயி (Murugan)
              </button>
              <button
                type="button"
                onClick={() => quickFill('9000000002', 'samplePass123')}
                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-agri-50 hover:bg-agri-100 text-agri-800 font-medium border border-agri-200 transition-colors"
              >
                🌾 விவசாயி (Kalaiselvi)
              </button>
              <button
                type="button"
                onClick={() => quickFill('9000000101', 'farmerPass123')}
                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-agri-50 hover:bg-agri-100 text-agri-800 font-medium border border-agri-200 transition-colors"
              >
                🌾 விவசாயி (Muthu)
              </button>
              <button
                type="button"
                onClick={() => quickFill('9999999999', 'adminPass123')}
                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-medium border border-amber-200 transition-colors"
              >
                🛡️ நிர்வாகி (Admin)
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-stone-600">
            {t('auth.noAccount')}{' '}
            <Link
              to="/register"
              className="text-agri-700 hover:text-agri-800 font-semibold underline underline-offset-4"
            >
              {t('auth.registerButton')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
