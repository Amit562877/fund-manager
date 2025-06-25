import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import React from 'react';
import DashboardPage from './pages/DashboardPage';
import BudgetPlanningPage from './pages/BudgetPlanningPage';
import EMIManagerPage from './pages/EMIManagerPage';
import InterestTrackerPage from './pages/InterestTrackerPage';
import KhataBookPage from './pages/KhataBookPage';
import Header from './components/Header';
import Footer from './components/Footer';
import ChecklistManager from './components/ChecklistManager';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import EMICalculator from './components/EMICalculator';
import PublicHeader from './components/PublicHeader';
import { useAuthStore } from './store/authStore';
import ProfilePage from './components/ProfilePage';

// Private layout with header/footer
function PrivateLayout() {
  return (
    <>
      <Header />
      <main className="px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-6 bg-gray-50 min-h-[calc(100vh-120px)]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

// Layout for public (auth) routes
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// PrivateRoute wrapper for protecting private routes
function PrivateRoute() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (user === undefined) {
    // Still loading auth state
    return null;
  }

  if (!user) {
    // Not logged in, redirect to login with return url
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      </Route>

      {/* Private routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<PrivateLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/budget" element={<BudgetPlanningPage />} />
          <Route path="/emi" element={<EMIManagerPage />} />
          <Route path="/interest" element={<InterestTrackerPage />} />
          <Route path="/khatabook" element={<KhataBookPage />} />
          <Route path="/checklist" element={<ChecklistManager />} />
          <Route path="/emi-calculator" element={<EMICalculator />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}