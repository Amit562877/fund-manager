import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  AlertTriangle,
  Calendar,
  Target,
  PieChart,
  BookOpen,
  Users
} from 'lucide-react';
import { Budget, EMI, Transaction, KhataEntry } from '../types';

interface DashboardProps {
  budgets: Budget[];
  emis: EMI[];
  transactions: Transaction[];
  khataEntries: KhataEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ budgets, emis, transactions, khataEntries }) => {
  // Calculate total budget metrics
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.budgetAmount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spentAmount, 0);
  const budgetUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  // Calculate EMI metrics
  const totalEMIAmount = emis.reduce((sum, emi) => sum + emi.emiAmount, 0);
  const totalRemainingEMIs = emis.reduce((sum, emi) => sum + emi.remainingEMIs, 0);
  const totalInterestPaid = emis.reduce((sum, emi) => sum + emi.paidInterest, 0);
  const totalRemainingInterest = emis.reduce((sum, emi) => sum + emi.remainingInterest, 0);

  // Calculate Khata metrics
  const totalToReceive = khataEntries
    .filter(entry => entry.type === 'gave')
    .reduce((sum, entry) => sum + entry.remainingAmount, 0);
  
  const totalToPay = khataEntries
    .filter(entry => entry.type === 'got')
    .reduce((sum, entry) => sum + entry.remainingAmount, 0);

  const khataNetBalance = totalToReceive - totalToPay;

  // Get upcoming EMIs (due within 7 days)
  const upcomingEMIs = emis.filter(emi => {
    const nextDue = new Date(emi.nextPaymentDate);
    const today = new Date();
    const diffTime = nextDue.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  });

  // Over-budget categories
  const overBudgetCategories = budgets.filter(budget => budget.spentAmount > budget.budgetAmount);

  // Overdue khata entries
  const overdueKhataEntries = khataEntries.filter(entry => {
    if (!entry.dueDate || entry.status === 'settled') return false;
    const today = new Date();
    const dueDate = new Date(entry.dueDate);
    return dueDate < today;
  });

  // Upcoming khata reminders
  const upcomingKhataReminders = khataEntries.filter(entry => {
    if (!entry.reminderEnabled || !entry.reminderDate || entry.status === 'settled') return false;
    const today = new Date();
    const reminderDate = new Date(entry.reminderDate);
    const diffTime = reminderDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  });

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }: any) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Welcome to FundFlow</h2>
        <p className="text-blue-100 text-lg">Your comprehensive financial management dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Budget"
          value={`₹${totalBudgeted.toLocaleString()}`}
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Monthly EMIs"
          value={`₹${totalEMIAmount.toLocaleString()}`}
          icon={CreditCard}
          color="orange"
        />
        <StatCard
          title="You'll Receive"
          value={`₹${totalToReceive.toLocaleString()}`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="You'll Pay"
          value={`₹${totalToPay.toLocaleString()}`}
          icon={TrendingDown}
          color="red"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Spent"
          value={`₹${totalSpent.toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Interest Paid"
          value={`₹${totalInterestPaid.toLocaleString()}`}
          icon={PieChart}
          color="purple"
        />
        <StatCard
          title="Khata Net Balance"
          value={`₹${Math.abs(khataNetBalance).toLocaleString()}`}
          icon={BookOpen}
          color={khataNetBalance >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Budget Overview & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Budget Utilization */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Budget Utilization</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Overall Usage</span>
              <span className="text-sm font-medium">{budgetUtilization.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  budgetUtilization > 100 ? 'bg-red-500' : budgetUtilization > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              ></div>
            </div>
            {budgets.slice(0, 3).map((budget) => {
              const usage = budget.budgetAmount > 0 ? (budget.spentAmount / budget.budgetAmount) * 100 : 0;
              return (
                <div key={budget.id} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{budget.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${usage > 100 ? 'bg-red-500' : usage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(usage, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-slate-500">{usage.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Alerts & Reminders</h3>
          <div className="space-y-3">
            {upcomingEMIs.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Upcoming EMIs</p>
                    <p className="text-xs text-yellow-600">{upcomingEMIs.length} EMI(s) due within 7 days</p>
                  </div>
                </div>
              </div>
            )}
            
            {overBudgetCategories.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Over Budget</p>
                    <p className="text-xs text-red-600">{overBudgetCategories.length} category(s) exceeded budget</p>
                  </div>
                </div>
              </div>
            )}

            {overdueKhataEntries.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Overdue Khata</p>
                    <p className="text-xs text-red-600">{overdueKhataEntries.length} transaction(s) past due</p>
                  </div>
                </div>
              </div>
            )}

            {upcomingKhataReminders.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Khata Reminders</p>
                    <p className="text-xs text-blue-600">{upcomingKhataReminders.length} reminder(s) in next 3 days</p>
                  </div>
                </div>
              </div>
            )}

            {upcomingEMIs.length === 0 && overBudgetCategories.length === 0 && 
             overdueKhataEntries.length === 0 && upcomingKhataReminders.length === 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">All Good!</p>
                    <p className="text-xs text-green-600">No urgent alerts at the moment</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity & Khata Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h3>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(-5).reverse().map((transaction) => {
                const budget = budgets.find(b => b.id === transaction.budgetId);
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{transaction.description}</p>
                        <p className="text-xs text-slate-500">{budget?.name} • {new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No transactions yet. Start by adding your first budget!</p>
            </div>
          )}
        </div>

        {/* Khata Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Khata Summary</h3>
          {khataEntries.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600">You'll Receive</p>
                  <p className="text-lg font-bold text-green-600">₹{totalToReceive.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600">You'll Pay</p>
                  <p className="text-lg font-bold text-red-600">₹{totalToPay.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {khataEntries.filter(entry => entry.status !== 'settled').slice(0, 4).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${entry.type === 'gave' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm font-medium text-slate-900">{entry.personName}</span>
                    </div>
                    <span className={`text-sm font-medium ${entry.type === 'gave' ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{entry.remainingAmount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No khata entries yet. Start tracking your lending and borrowing!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;