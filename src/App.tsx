import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import BudgetPlanningPage from './pages/BudgetPlanningPage';
import EMIManagerPage from './pages/EMIManagerPage';
import InterestTrackerPage from './pages/InterestTrackerPage';
import KhataBookPage from './pages/KhataBookPage';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthForm from './components/AuthForm';
import ChecklistManager from './components/ChecklistManager';


export default function App() {
  return (
    <><Header />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/budget" element={<BudgetPlanningPage />} />
        <Route path="/emi" element={<EMIManagerPage />} />
        <Route path="/interest" element={<InterestTrackerPage />} />
        <Route path="/khatabook" element={<KhataBookPage />} />
        <Route path="/checklist" element={<ChecklistManager />} />
        <Route path="/login" element={<AuthForm />} />
      </Routes>
      <Footer /></>
  );
}
