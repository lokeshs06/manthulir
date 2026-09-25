import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '../components/common/LanguageToggle';
import { OfflineBanner } from '../components/common/OfflineBanner';
import {
  Sprout,
  Home,
  ShoppingBag,
  FileText,
  BookOpen,
  Calendar,
  CheckCircle,
  Bug,
  Users,
  ShieldCheck,
  User,
  LogOut,
  LogIn,
  PlusCircle,
} from 'lucide-react';

export const RootLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm(t('auth.logoutConfirm'))) {
      await logout();
      navigate('/login');
    }
  };

  // Determine active nav items based on role
  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { path: '/', label: t('nav.home'), icon: Home },
        { path: '/produce', label: t('nav.marketplace'), icon: ShoppingBag },
        { path: '/schemes', label: t('nav.schemes'), icon: FileText },
        { path: '/articles', label: t('nav.knowledge'), icon: BookOpen },
      ];
    }

    if (user.role === 'farmer') {
      return [
        { path: '/farmer', label: t('nav.home'), icon: Home },
        { path: '/farmer/timeline', label: t('nav.timeline'), icon: Calendar },
        { path: '/farmer/verification', label: t('nav.verification'), icon: CheckCircle },
        { path: '/farmer/pests', label: t('nav.pests'), icon: Bug },
        { path: '/farmer/produce', label: t('nav.myProduce'), icon: ShoppingBag },
        { path: '/farmer/clusters', label: t('nav.clusters'), icon: Users },
        { path: '/schemes', label: t('nav.schemes'), icon: FileText },
      ];
    }

    if (user.role === 'buyer') {
      return [
        { path: '/buyer', label: t('nav.home'), icon: Home },
        { path: '/produce', label: t('nav.marketplace'), icon: ShoppingBag },
        { path: '/buyer/inquiries', label: t('nav.inquiries'), icon: FileText },
        { path: '/buyer/profile', label: t('nav.profile'), icon: User },
      ];
    }

    if (user.role === 'admin') {
      return [
        { path: '/admin', label: t('nav.admin'), icon: ShieldCheck },
        { path: '/admin/flagged-logs', label: t('nav.verification'), icon: CheckCircle },
        { path: '/admin/certifications', label: t('roles.certified'), icon: ShieldCheck },
        { path: '/admin/schemes', label: t('nav.schemes'), icon: FileText },
        { path: '/admin/articles', label: t('nav.knowledge'), icon: BookOpen },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  // Highlight bottom bar items: max 5 items on mobile
  const mobileNavItems = navItems.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-earth-50 pb-20 md:pb-0">
      <OfflineBanner />

      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group min-h-touch">
              <div className="w-10 h-10 rounded-xl bg-agri-700 flex items-center justify-center text-white shadow-xs group-hover:bg-agri-800 transition-colors">
                <Sprout className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-agri-950 text-base md:text-lg leading-tight">
                  {t('app.name')}
                </span>
                <span className="text-xs text-stone-500 hidden sm:inline-block leading-none">
                  {t('app.tagline')}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-touch ${
                      isActive
                        ? 'bg-agri-100 text-agri-900 font-semibold'
                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Action Bar (Lang toggle, Auth info) */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageToggle />

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={user.role === 'farmer' ? '/farmer/profile' : user.role === 'buyer' ? '/buyer/profile' : '/admin'}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-800 transition-colors min-h-touch"
                    title={user.name}
                  >
                    <User className="w-4 h-4 text-agri-700" />
                    <span className="max-w-[100px] truncate hidden sm:inline">{user.name}</span>
                    <span className="bg-agri-200 text-agri-900 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      {t(`roles.${user.role}`)}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-stone-500 hover:text-red-700 hover:bg-red-50 transition-colors min-h-touch min-w-touch flex items-center justify-center"
                    title={t('nav.logout')}
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-agri-800 hover:text-agri-950 min-h-touch"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{t('nav.login')}</span>
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1 px-3.5 py-2 text-sm font-semibold text-white bg-agri-700 hover:bg-agri-800 rounded-lg shadow-xs transition-colors min-h-touch"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{t('nav.register')}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar (Farmers low-end mobile first) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-40 safe-bottom shadow-lg"
      >
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center min-h-touch py-1 transition-colors ${
                  isActive ? 'text-agri-700 font-bold' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] truncate max-w-[64px] mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-6 text-xs text-center border-t border-stone-800 mt-auto hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium text-stone-300 mb-1">
            {t('app.name')} — {t('app.tagline')}
          </p>
          <p>© {new Date().getFullYear()} Manthulir. Dedicated to sustainable natural farming.</p>
        </div>
      </footer>
    </div>
  );
};
