import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
      <main className="flex-1 flex items-center justify-center px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32">
        <Outlet />
      </main>
    </div>
  );
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
      <Route element={<PrivateLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/budget" element={<BudgetPlanningPage />} />
        <Route path="/emi" element={<EMIManagerPage />} />
        <Route path="/interest" element={<InterestTrackerPage />} />
        <Route path="/khatabook" element={<KhataBookPage />} />
        <Route path="/checklist" element={<ChecklistManager />} />
      </Route>
    </Routes>
  );
}