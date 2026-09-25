import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { RoleGuard } from './layouts/RoleGuard';
import { GuestGuard } from './layouts/GuestGuard';
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { FarmerDashboardPage } from './pages/farmer/FarmerDashboardPage';
import { FarmerProfilePage } from './pages/farmer/FarmerProfilePage';
import { FarmerTimelinePage } from './pages/farmer/FarmerTimelinePage';
import { FarmerVerificationPage } from './pages/farmer/FarmerVerificationPage';
import { PestDetectionPage } from './pages/farmer/PestDetectionPage';
import { FarmerProducePage } from './pages/farmer/FarmerProducePage';
import { FarmerClustersPage } from './pages/farmer/FarmerClustersPage';
import { PublicMarketplacePage } from './pages/marketplace/PublicMarketplacePage';
import { PublicFarmerProfilePage } from './pages/farmer/PublicFarmerProfilePage';
import { KnowledgePage } from './pages/knowledge/KnowledgePage';
import { ArticleDetailPage } from './pages/knowledge/ArticleDetailPage';
import { BuyerInquiriesPage } from './pages/buyer/BuyerInquiriesPage';
import { BuyerProfilePage } from './pages/buyer/BuyerProfilePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { SchemesPage } from './pages/schemes/SchemesPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        {/* Public Routes */}
        <Route index element={<LandingPage />} />
        <Route path="schemes" element={<SchemesPage />} />
        <Route path="produce" element={<PublicMarketplacePage />} />
        <Route path="marketplace" element={<PublicMarketplacePage />} />
        <Route path="farmers/:id/public" element={<PublicFarmerProfilePage />} />
        <Route path="articles" element={<KnowledgePage />} />
        <Route path="articles/:slug" element={<ArticleDetailPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="knowledge/:slug" element={<ArticleDetailPage />} />

        {/* Guest Only Auth Routes */}
        <Route element={<GuestGuard />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Farmer Routes */}
        <Route path="farmer" element={<RoleGuard allowedRoles={['farmer']} />}>
          <Route index element={<FarmerDashboardPage />} />
          <Route path="profile" element={<FarmerProfilePage />} />
          <Route path="timeline" element={<FarmerTimelinePage />} />
          <Route path="verification" element={<FarmerVerificationPage />} />
          <Route path="pests" element={<PestDetectionPage />} />
          <Route path="produce" element={<FarmerProducePage />} />
          <Route path="clusters" element={<FarmerClustersPage />} />
        </Route>

        {/* Buyer Routes */}
        <Route path="buyer" element={<RoleGuard allowedRoles={['buyer']} />}>
          <Route index element={<BuyerInquiriesPage />} />
          <Route path="inquiries" element={<BuyerInquiriesPage />} />
          <Route path="profile" element={<BuyerProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="admin" element={<RoleGuard allowedRoles={['admin']} />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="flagged-logs" element={<AdminDashboardPage />} />
          <Route path="certifications" element={<AdminDashboardPage />} />
          <Route path="schemes" element={<AdminDashboardPage />} />
          <Route path="pest-feedback" element={<AdminDashboardPage />} />
          <Route path="articles" element={<AdminDashboardPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
