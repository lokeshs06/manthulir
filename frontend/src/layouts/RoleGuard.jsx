import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const RoleGuard = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-earth-50">
        <Loader2 className="w-10 h-10 text-agri-700 animate-spin mb-3" />
        <p className="text-stone-600 font-medium">{t('app.loading')}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Role mismatch: redirect to their own dashboard
    if (user.role === 'farmer') return <Navigate to="/farmer" replace />;
    if (user.role === 'buyer') return <Navigate to="/buyer" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
