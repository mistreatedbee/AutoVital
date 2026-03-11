import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { PricingPage } from './pages/public/PricingPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { BlogPage } from './pages/public/BlogPage';
import { BlogArticlePage } from './pages/public/BlogArticlePage';
import { TermsPage } from './pages/public/TermsPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { FaqPage } from './pages/public/FaqPage';
import { CookiesPage } from './pages/public/CookiesPage';
import { SecurityPage } from './pages/public/SecurityPage';
import { CareersPage } from './pages/public/CareersPage';
import { ChangelogPage } from './pages/public/ChangelogPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { WelcomePage } from './pages/auth/WelcomePage';
// Onboarding
import { OnboardingFlow } from './pages/onboarding/OnboardingFlow';
// Dashboard
import { DashboardApp } from './pages/dashboard/DashboardApp';
// Admin
import { AdminApp } from './pages/admin/AdminApp';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route
          path="/"
          element={
          <PublicLayout>
              <LandingPage />
            </PublicLayout>
          } />

        <Route
          path="/features"
          element={
          <PublicLayout>
              <FeaturesPage />
            </PublicLayout>
          } />

        <Route
          path="/how-it-works"
          element={
          <PublicLayout>
              <HowItWorksPage />
            </PublicLayout>
          } />

        <Route
          path="/pricing"
          element={
          <PublicLayout>
              <PricingPage />
            </PublicLayout>
          } />

        <Route
          path="/about"
          element={
          <PublicLayout>
              <AboutPage />
            </PublicLayout>
          } />

        <Route
          path="/contact"
          element={
          <PublicLayout>
              <ContactPage />
            </PublicLayout>
          } />

        <Route
          path="/blog"
          element={
          <PublicLayout>
              <BlogPage />
            </PublicLayout>
          } />

        <Route
          path="/blog/:slug"
          element={
          <PublicLayout>
              <BlogArticlePage />
            </PublicLayout>
          } />

        <Route
          path="/terms"
          element={
          <PublicLayout>
              <TermsPage />
            </PublicLayout>
          } />

        <Route
          path="/privacy"
          element={
          <PublicLayout>
              <PrivacyPage />
            </PublicLayout>
          } />

        <Route
          path="/faq"
          element={
          <PublicLayout>
              <FaqPage />
            </PublicLayout>
          } />

        <Route
          path="/cookies"
          element={
          <PublicLayout>
              <CookiesPage />
            </PublicLayout>
          } />

        <Route
          path="/security"
          element={
          <PublicLayout>
              <SecurityPage />
            </PublicLayout>
          } />

        <Route
          path="/careers"
          element={
          <PublicLayout>
              <CareersPage />
            </PublicLayout>
          } />

        <Route
          path="/changelog"
          element={
          <PublicLayout>
              <ChangelogPage />
            </PublicLayout>
          } />


        {/* AUTH ROUTES (Standalone Layout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/welcome" element={<WelcomePage />} />

        {/* ONBOARDING */}
        <Route path="/onboarding" element={<OnboardingFlow />} />

        {/* DASHBOARD & ADMIN ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/*" element={<DashboardApp />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />}>
            <Route path="/admin/*" element={<AdminApp />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={
          <PublicLayout>
              <NotFoundPage />
            </PublicLayout>
          } />
      </Routes>
    </BrowserRouter>);

}