import React, { useState } from 'react';
import { Plus, Edit, Trash2, Target, TrendingUp, DollarSign } from 'lucide-react';
import { Budget, Transaction } from '../types';

interface BudgetPlanningProps {
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const BudgetPlanning: React.FC<BudgetPlanningProps> = ({ budgets, setBudgets, transactions, setTransactions }) => {
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [budgetForm, setBudgetForm] = useState({
    name: '',
    category: '',
    budgetAmount: '',
    period: 'monthly' as 'monthly' | 'yearly',
  });

  const [transactionForm, setTransactionForm] = useState({
    budgetId: '',
    amount: '',
    description: '',
    type: 'expense' as 'income' | 'expense',
  });

  const categories = [
    'Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Bills & Utilities',
    'Healthcare', 'Education', 'Travel', 'Investment', 'Savings', 'Others'
  ];

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
  ];

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budget: Budget = {
      id: editingBudget?.id || Date.now().toString(),
      name: budgetForm.name,
      category: budgetForm.category,
      budgetAmount: parseFloat(budgetForm.budgetAmount),
      spentAmount: editingBudget?.spentAmount || 0,
      period: budgetForm.period,
      color: colors[Math.floor(Math.random() * colors.length)],
      createdAt: editingBudget?.createdAt || new Date().toISOString(),
    };

    if (editingBudget) {
      setBudgets(budgets.map(b => b.id === editingBudget.id ? budget : b));
    } else {
      setBudgets([...budgets, budget]);
    }

    setBudgetForm({ name: '', category: '', budgetAmount: '', period: 'monthly' });
    setShowBudgetForm(false);
    setEditingBudget(null);
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
      // Edit existing transaction
      setTransactions(transactions.map(t =>
        t.id === editingTransaction.id
          ? {
              ...t,
              budgetId: transactionForm.budgetId,
              amount: parseFloat(transactionForm.amount),
              description: transactionForm.description,
              type: transactionForm.type,
              category: budgets.find(b => b.id === transactionForm.budgetId)?.category || '',
            }
          : t
      ));
      // Update spentAmount for budgets
      setBudgets(budgets.map(budget => {
        if (budget.id === editingTransaction.budgetId) {
          // Remove old amount if expense
          return {
            ...budget,
            spentAmount:
              budget.spentAmount -
              (editingTransaction.type === 'expense' ? editingTransaction.amount : 0),
          };
        }
        if (budget.id === transactionForm.budgetId && transactionForm.type === 'expense') {
          // Add new amount if expense
          return {
            ...budget,
            spentAmount: budget.spentAmount + parseFloat(transactionForm.amount),
          };
        }
        return budget;
      }));
    } else {
      // Add new transaction
      const transaction: Transaction = {
        id: Date.now().toString(),
        budgetId: transactionForm.budgetId,
        amount: parseFloat(transactionForm.amount),
        description: transactionForm.description,
        date: new Date().toISOString(),
        type: transactionForm.type,
        category: budgets.find(b => b.id === transactionForm.budgetId)?.category || '',
      };

      setTransactions([...transactions, transaction]);

      // Update budget spent amount
      if (transactionForm.type === 'expense') {
        setBudgets(budgets.map(budget =>
          budget.id === transactionForm.budgetId
            ? { ...budget, spentAmount: budget.spentAmount + parseFloat(transactionForm.amount) }
            : budget
        ));
      }
    }

    setTransactionForm({ budgetId: '', amount: '', description: '', type: 'expense' });
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
    setTransactions(transactions.filter(t => t.budgetId !== id));
  };

  const editBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      name: budget.name,
      category: budget.category,
      budgetAmount: budget.budgetAmount.toString(),
      period: budget.period,
    });
    setShowBudgetForm(true);
  };

  const getBudgetTransactions = (budgetId: string) => {
    return transactions.filter(t => t.budgetId === budgetId);
  };

  const editTransaction = (txn: Transaction) => {
    setEditingTransaction(txn);
    setTransactionForm({
      budgetId: txn.budgetId,
      amount: txn.amount.toString(),
      description: txn.description,
      type: txn.type,
    });
    setShowTransactionForm(true);
  };

  const deleteTransaction = (txn: Transaction) => {
    setTransactions(transactions.filter(t => t.id !== txn.id));
    // Update spentAmount for budgets if expense
    if (txn.type === 'expense') {
      setBudgets(budgets.map(budget =>
        budget.id === txn.budgetId
          ? { ...budget, spentAmount: budget.spentAmount - txn.amount }
          : budget
      ));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Budget Planning</h2>
          <p className="text-slate-600 mt-1">Plan and track your spending across categories</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => {
              setShowTransactionForm(true);
              setEditingTransaction(null);
              setTransactionForm({ budgetId: '', amount: '', description: '', type: 'expense' });
            }}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </button>
          <button
            onClick={() => setShowBudgetForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Budget
          </button>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const usage = budget.budgetAmount > 0 ? (budget.spentAmount / budget.budgetAmount) * 100 : 0;
          const isOverBudget = usage > 100;
          const budgetTransactions = getBudgetTransactions(budget.id);

          return (
            <div key={budget.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${budget.color}`}></div>
                  <h3 className="font-semibold text-slate-900">{budget.name}</h3>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => editBudget(budget)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBudget(budget.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Budget</span>
                  <span className="font-medium">₹{budget.budgetAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Spent</span>
                  <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-slate-900'}`}>
                    ₹{budget.spentAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Remaining</span>
                  <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{(budget.budgetAmount - budget.spentAmount).toLocaleString()}
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-3 mt-4">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isOverBudget ? 'bg-red-500' : usage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">{usage.toFixed(1)}% used</span>
                  <span className="text-xs text-slate-500">{budgetTransactions.length} transactions</span>
                </div>
              </div>

              {/* Transaction List */}
              {budgetTransactions.length > 0 && (
                <div className="mt-4 text-xs">
                  <div className="font-semibold mb-1">Transactions:</div>
                  <ul className="space-y-1">
                    {budgetTransactions.map(txn => (
                      <li key={txn.id} className="flex items-center justify-between">
                        <span>
                          <span className="font-medium">{txn.type.toUpperCase()}</span> | {txn.date.slice(0, 10)} | ₹{txn.amount}
                          {txn.description && <span className="ml-2 text-slate-500">({txn.description})</span>}
                        </span>
                        <span>
                          <button
                            className="text-blue-500 hover:underline mr-2"
                            onClick={() => editTransaction(txn)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-500 hover:underline"
                            onClick={() => deleteTransaction(txn)}
                          >
                            Delete
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No budgets yet</h3>
          <p className="text-slate-500 mb-4">Create your first budget to start tracking your expenses</p>
          <button
            onClick={() => setShowBudgetForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Budget
          </button>
        </div>
      )}

      {/* Budget Form Modal */}
      {showBudgetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingBudget ? 'Edit Budget' : 'Create New Budget'}
            </h3>
            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Budget Name</label>
                <input
                  type="text"
                  value={budgetForm.name}
                  onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Budget Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={budgetForm.budgetAmount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, budgetAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Period</label>
                <select
                  value={budgetForm.period}
                  onChange={(e) => setBudgetForm({ ...budgetForm, period: e.target.value as 'monthly' | 'yearly' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBudgetForm(false);
                    setEditingBudget(null);
                    setBudgetForm({ name: '', category: '', budgetAmount: '', period: 'monthly' });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingBudget ? 'Update' : 'Create'} Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Budget</label>
                <select
                  value={transactionForm.budgetId}
                  onChange={(e) => setTransactionForm({ ...transactionForm, budgetId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select budget</option>
                  {budgets.map(budget => (
                    <option key={budget.id} value={budget.id}>{budget.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={transactionForm.type}
                  onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as 'income' | 'expense' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTransactionForm(false);
                    setEditingTransaction(null);
                    setTransactionForm({ budgetId: '', amount: '', description: '', type: 'expense' });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPlanning;