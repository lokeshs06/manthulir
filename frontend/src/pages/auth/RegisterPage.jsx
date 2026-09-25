import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { getApiErrorMessage } from '../../lib/errorHandler';
import { Sprout, ShoppingBag, Phone, Lock, User, PlusCircle, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation schema
  const registerSchema = z.object({
    name: z.string().min(2, t('auth.nameRequired')),
    phone: z.string().regex(/^[6-9]\d{9}$/, t('auth.phoneInvalid')),
    password: z.string().min(6, t('auth.passwordMin')),
    role: z.enum(['farmer', 'buyer'], {
      errorMap: () => ({ message: t('auth.roleRequired') }),
    }),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phone: '',
      password: '',
      role: 'farmer',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      const user = await registerUser({
        ...data,
        preferredLanguage: i18n.language || 'ta',
      });
      const targetPath = user.role === 'farmer' ? '/farmer' : '/buyer';
      navigate(targetPath, { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-agri-800 to-agri-700 text-white p-6 sm:p-8 text-center">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
            <PlusCircle className="w-7 h-7 text-agri-300" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {t('auth.registerTitle')}
          </h1>
          <p className="text-agri-100 text-xs sm:text-sm mt-1">
            {t('auth.registerSubtitle')}
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
            {/* Role Selection (Visual Cards) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                {t('auth.role')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('role', 'farmer')}
                  className={`p-3.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center min-h-touch ${
                    selectedRole === 'farmer'
                      ? 'border-agri-600 bg-agri-50 text-agri-950 font-bold shadow-xs'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <Sprout
                    className={`w-6 h-6 ${
                      selectedRole === 'farmer' ? 'text-agri-700' : 'text-stone-400'
                    }`}
                  />
                  <span className="text-xs sm:text-sm">{t('auth.roleFarmer')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('role', 'buyer')}
                  className={`p-3.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center min-h-touch ${
                    selectedRole === 'buyer'
                      ? 'border-agri-600 bg-agri-50 text-agri-950 font-bold shadow-xs'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <ShoppingBag
                    className={`w-6 h-6 ${
                      selectedRole === 'buyer' ? 'text-agri-700' : 'text-stone-400'
                    }`}
                  />
                  <span className="text-xs sm:text-sm">{t('auth.roleBuyer')}</span>
                </button>
              </div>
              {errors.role && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.role.message}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
              >
                {t('auth.name')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  placeholder={t('auth.namePlaceholder')}
                  {...register('name')}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-base font-medium min-h-touch bg-stone-50/50 focus:bg-white transition-colors ${
                    errors.name
                      ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                      : 'border-stone-300 focus:ring-agri-600 focus:border-agri-600'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="register-phone"
                className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
              >
                {t('auth.phone')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  id="register-phone"
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
                htmlFor="register-password"
                className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
              >
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
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
              <PlusCircle className="w-5 h-5" />
              <span>{isSubmitting ? t('auth.registering') : t('auth.registerButton')}</span>
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-stone-600">
            {t('auth.haveAccount')}{' '}
            <Link
              to="/login"
              className="text-agri-700 hover:text-agri-800 font-semibold underline underline-offset-4"
            >
              {t('auth.loginButton')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
