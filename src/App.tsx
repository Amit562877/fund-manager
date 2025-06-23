import React, { useState, useEffect } from 'react';
import { 
  PiggyBank, 
  Calculator, 
  CreditCard, 
  TrendingUp, 
  Bell, 
  Plus,
  Calendar,
  DollarSign,
  Target,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import BudgetPlanning from './components/BudgetPlanning';
import EMIManager from './components/EMIManager';
import InterestTracker from './components/InterestTracker';
import KhataBook from './components/KhataBook';
import { Budget, EMI, Transaction, KhataEntry, KhataPayment } from './types';

type TabType = 'dashboard' | 'budget' | 'emi' | 'interest' | 'khata';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [emis, setEMIs] = useState<EMI[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [khataEntries, setKhataEntries] = useState<KhataEntry[]>([]);
  const [khataPayments, setKhataPayments] = useState<KhataPayment[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedBudgets = localStorage.getItem('budgets');
    const savedEMIs = localStorage.getItem('emis');
    const savedTransactions = localStorage.getItem('transactions');
    const savedKhataEntries = localStorage.getItem('khataEntries');
    const savedKhataPayments = localStorage.getItem('khataPayments');

    if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
    if (savedEMIs) setEMIs(JSON.parse(savedEMIs));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedKhataEntries) setKhataEntries(JSON.parse(savedKhataEntries));
    if (savedKhataPayments) setKhataPayments(JSON.parse(savedKhataPayments));
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('emis', JSON.stringify(emis));
  }, [emis]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('khataEntries', JSON.stringify(khataEntries));
  }, [khataEntries]);

  useEffect(() => {
    localStorage.setItem('khataPayments', JSON.stringify(khataPayments));
  }, [khataPayments]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'budget', label: 'Budget Planning', icon: Target },
    { id: 'emi', label: 'EMI Manager', icon: CreditCard },
    { id: 'interest', label: 'Interest Tracker', icon: Calculator },
    { id: 'khata', label: 'Khata Book', icon: BookOpen },
  ];

  // Calculate notification count
  const getNotificationCount = () => {
    let count = 0;
    
    // EMI notifications
    count += emis.filter(emi => {
      const nextDue = new Date(emi.nextPaymentDate);
      const today = new Date();
      const diffTime = nextDue.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length;

    // Khata overdue notifications
    count += khataEntries.filter(entry => {
      if (!entry.dueDate || entry.status === 'settled') return false;
      const today = new Date();
      const dueDate = new Date(entry.dueDate);
      return dueDate < today;
    }).length;

    // Khata reminder notifications
    count += khataEntries.filter(entry => {
      if (!entry.reminderEnabled || !entry.reminderDate || entry.status === 'settled') return false;
      const today = new Date();
      const reminderDate = new Date(entry.reminderDate);
      const diffTime = reminderDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays >= 0;
    }).length;

    return count;
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard budgets={budgets} emis={emis} transactions={transactions} khataEntries={khataEntries} />;
      case 'budget':
        return (
          <BudgetPlanning 
            budgets={budgets} 
            setBudgets={setBudgets}
            transactions={transactions}
            setTransactions={setTransactions}
          />
        );
      case 'emi':
        return <EMIManager emis={emis} setEMIs={setEMIs} />;
      case 'interest':
        return <InterestTracker emis={emis} />;
      case 'khata':
        return (
          <KhataBook 
            khataEntries={khataEntries}
            setKhataEntries={setKhataEntries}
            khataPayments={khataPayments}
            setKhataPayments={setKhataPayments}
          />
        );
      default:
        return <Dashboard budgets={budgets} emis={emis} transactions={transactions} khataEntries={khataEntries} />;
    }
  };

  const notificationCount = getNotificationCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">FundFlow</h1>
                <p className="text-xs text-slate-500">Smart Fund Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{notificationCount}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Tab Content */}
        <div className="animate-in fade-in duration-300">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}

export default App;