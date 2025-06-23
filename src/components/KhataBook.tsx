import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Calendar, 
  Bell, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Search,
  Filter,
  DollarSign
} from 'lucide-react';
import { KhataEntry, KhataPayment } from '../types';

interface KhataBookProps {
  khataEntries: KhataEntry[];
  setKhataEntries: React.Dispatch<React.SetStateAction<KhataEntry[]>>;
  khataPayments: KhataPayment[];
  setKhataPayments: React.Dispatch<React.SetStateAction<KhataPayment[]>>;
}

const KhataBook: React.FC<KhataBookProps> = ({ 
  khataEntries, 
  setKhataEntries, 
  khataPayments, 
  setKhataPayments 
}) => {
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KhataEntry | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<KhataEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'gave' | 'got' | 'pending' | 'settled'>('all');

  const [entryForm, setEntryForm] = useState({
    personName: '',
    phoneNumber: '',
    type: 'gave' as 'gave' | 'got',
    amount: '',
    description: '',
    dueDate: '',
    category: 'personal' as 'personal' | 'business' | 'family' | 'friend' | 'other',
    reminderEnabled: true,
    reminderDate: '',
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    description: '',
    type: 'payment' as 'payment' | 'received',
  });

  const categories = ['personal', 'business', 'family', 'friend', 'other'];

  // Calculate totals
  const totalGave = khataEntries
    .filter(entry => entry.type === 'gave')
    .reduce((sum, entry) => sum + entry.remainingAmount, 0);
  
  const totalGot = khataEntries
    .filter(entry => entry.type === 'got')
    .reduce((sum, entry) => sum + entry.remainingAmount, 0);

  const netBalance = totalGave - totalGot;

  // Filter entries
  const filteredEntries = khataEntries.filter(entry => {
    const matchesSearch = entry.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'gave' && entry.type === 'gave') ||
                         (filterType === 'got' && entry.type === 'got') ||
                         (filterType === 'pending' && entry.status === 'pending') ||
                         (filterType === 'settled' && entry.status === 'settled');
    
    return matchesSearch && matchesFilter;
  });

  // Get overdue entries
  const overdueEntries = khataEntries.filter(entry => {
    if (!entry.dueDate || entry.status === 'settled') return false;
    const today = new Date();
    const dueDate = new Date(entry.dueDate);
    return dueDate < today;
  });

  // Get upcoming reminders
  const upcomingReminders = khataEntries.filter(entry => {
    if (!entry.reminderEnabled || !entry.reminderDate || entry.status === 'settled') return false;
    const today = new Date();
    const reminderDate = new Date(entry.reminderDate);
    const diffTime = reminderDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  });

  const handleEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry: KhataEntry = {
      id: editingEntry?.id || Date.now().toString(),
      personName: entryForm.personName,
      phoneNumber: entryForm.phoneNumber || undefined,
      type: entryForm.type,
      amount: parseFloat(entryForm.amount),
      description: entryForm.description,
      date: new Date().toISOString().split('T')[0],
      dueDate: entryForm.dueDate || undefined,
      status: 'pending',
      paidAmount: editingEntry?.paidAmount || 0,
      remainingAmount: parseFloat(entryForm.amount) - (editingEntry?.paidAmount || 0),
      category: entryForm.category,
      reminderEnabled: entryForm.reminderEnabled,
      reminderDate: entryForm.reminderDate || undefined,
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      notes: entryForm.notes || undefined,
    };

    if (editingEntry) {
      setKhataEntries(khataEntries.map(e => e.id === editingEntry.id ? entry : e));
    } else {
      setKhataEntries([...khataEntries, entry]);
    }

    resetEntryForm();
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEntry) return;

    const payment: KhataPayment = {
      id: Date.now().toString(),
      khataEntryId: selectedEntry.id,
      amount: parseFloat(paymentForm.amount),
      date: new Date().toISOString().split('T')[0],
      description: paymentForm.description,
      type: paymentForm.type,
    };

    setKhataPayments([...khataPayments, payment]);

    // Update the khata entry
    const updatedPaidAmount = selectedEntry.paidAmount + parseFloat(paymentForm.amount);
    const updatedRemainingAmount = selectedEntry.amount - updatedPaidAmount;
    const newStatus = updatedRemainingAmount <= 0 ? 'settled' : 
                     updatedPaidAmount > 0 ? 'partial' : 'pending';

    setKhataEntries(khataEntries.map(entry => 
      entry.id === selectedEntry.id 
        ? { 
            ...entry, 
            paidAmount: updatedPaidAmount,
            remainingAmount: Math.max(0, updatedRemainingAmount),
            status: newStatus,
            settledAt: newStatus === 'settled' ? new Date().toISOString() : entry.settledAt
          }
        : entry
    ));

    setPaymentForm({ amount: '', description: '', type: 'payment' });
    setShowPaymentForm(false);
    setSelectedEntry(null);
  };

  const resetEntryForm = () => {
    setEntryForm({
      personName: '',
      phoneNumber: '',
      type: 'gave',
      amount: '',
      description: '',
      dueDate: '',
      category: 'personal',
      reminderEnabled: true,
      reminderDate: '',
      notes: '',
    });
    setShowEntryForm(false);
    setEditingEntry(null);
  };

  const deleteEntry = (id: string) => {
    setKhataEntries(khataEntries.filter(e => e.id !== id));
    setKhataPayments(khataPayments.filter(p => p.khataEntryId !== id));
  };

  const editEntry = (entry: KhataEntry) => {
    setEditingEntry(entry);
    setEntryForm({
      personName: entry.personName,
      phoneNumber: entry.phoneNumber || '',
      type: entry.type,
      amount: entry.amount.toString(),
      description: entry.description,
      dueDate: entry.dueDate || '',
      category: entry.category,
      reminderEnabled: entry.reminderEnabled,
      reminderDate: entry.reminderDate || '',
      notes: entry.notes || '',
    });
    setShowEntryForm(true);
  };

  const getEntryPayments = (entryId: string) => {
    return khataPayments.filter(p => p.khataEntryId === entryId);
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }: any) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Khata Book</h2>
          <p className="text-slate-600 mt-1">Track your lending and borrowing transactions</p>
        </div>
        <button
          onClick={() => setShowEntryForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="You'll Get"
          value={`₹${totalGave.toLocaleString()}`}
          icon={TrendingUp}
          color="green"
          subtitle="Money lent to others"
        />
        <StatCard
          title="You'll Give"
          value={`₹${totalGot.toLocaleString()}`}
          icon={TrendingDown}
          color="red"
          subtitle="Money borrowed from others"
        />
        <StatCard
          title="Net Balance"
          value={`₹${Math.abs(netBalance).toLocaleString()}`}
          icon={DollarSign}
          color={netBalance >= 0 ? 'green' : 'red'}
          subtitle={netBalance >= 0 ? `You'll get more` : `You'll give more`}
        />
        <StatCard
          title="Overdue"
          value={overdueEntries.length}
          icon={AlertCircle}
          color="orange"
          subtitle="Past due date"
        />
      </div>

      {/* Alerts */}
      {(overdueEntries.length > 0 || upcomingReminders.length > 0) && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Alerts & Reminders</h3>
          <div className="space-y-3">
            {overdueEntries.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Overdue Transactions</p>
                    <p className="text-xs text-red-600">{overdueEntries.length} transaction(s) past due date</p>
                  </div>
                </div>
              </div>
            )}
            
            {upcomingReminders.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Upcoming Reminders</p>
                    <p className="text-xs text-yellow-600">{upcomingReminders.length} reminder(s) in next 3 days</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="gave">You Gave</option>
              <option value="got">You Got</option>
              <option value="pending">Pending</option>
              <option value="settled">Settled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Khata Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEntries.map((entry) => {
          const payments = getEntryPayments(entry.id);
          const isOverdue = entry.dueDate && new Date(entry.dueDate) < new Date() && entry.status !== 'settled';
          const progress = entry.amount > 0 ? (entry.paidAmount / entry.amount) * 100 : 0;
          
          return (
            <div key={entry.id} className={`bg-white p-6 rounded-xl shadow-sm border transition-shadow hover:shadow-md ${
              isOverdue ? 'border-red-200 bg-red-50' : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    entry.type === 'gave' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <User className={`w-6 h-6 ${
                      entry.type === 'gave' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{entry.personName}</h3>
                    <p className="text-sm text-slate-500 capitalize">{entry.category}</p>
                    {entry.phoneNumber && (
                      <p className="text-xs text-slate-400 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {entry.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => editEntry(entry)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Amount Info */}
              <div className={`p-4 rounded-lg mb-4 ${
                entry.type === 'gave' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    {entry.type === 'gave' ? 'You Gave' : 'You Got'}
                  </span>
                  <span className={`text-xl font-bold ${
                    entry.type === 'gave' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₹{entry.amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{entry.description}</p>
              </div>

              {/* Payment Progress */}
              {entry.paidAmount > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Payment Progress</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm mt-1 text-slate-600">
                    <span>Paid: ₹{entry.paidAmount.toLocaleString()}</span>
                    <span>Remaining: ₹{entry.remainingAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Status and Dates */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    entry.status === 'settled' ? 'bg-green-100 text-green-800' :
                    entry.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {entry.status === 'settled' ? 'Settled' : 
                     entry.status === 'partial' ? 'Partial' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Date</span>
                  <span className="text-sm font-medium">{new Date(entry.date).toLocaleDateString()}</span>
                </div>
                
                {entry.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Due Date</span>
                    <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                      {new Date(entry.dueDate).toLocaleDateString()}
                      {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {entry.status !== 'settled' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedEntry(entry);
                      setPaymentForm({
                        amount: entry.remainingAmount.toString(),
                        description: `Payment for ${entry.description}`,
                        type: entry.type === 'gave' ? 'received' : 'payment',
                      });
                      setShowPaymentForm(true);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {entry.type === 'gave' ? 'Received Payment' : 'Make Payment'}
                  </button>
                  
                  {entry.reminderEnabled && entry.reminderDate && (
                    <button className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm">
                      <Bell className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Payment History */}
              {payments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Payment History</h4>
                  <div className="space-y-2">
                    {payments.slice(-3).map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">{payment.description}</span>
                        <div className="text-right">
                          <span className="font-medium">₹{payment.amount.toLocaleString()}</span>
                          <p className="text-xs text-slate-400">{new Date(payment.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {searchTerm || filterType !== 'all' ? 'No matching entries' : 'No khata entries yet'}
          </h3>
          <p className="text-slate-500 mb-4">
            {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter' : 'Start tracking your lending and borrowing'}
          </p>
          {!searchTerm && filterType === 'all' && (
            <button
              onClick={() => setShowEntryForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Entry
            </button>
          )}
        </div>
      )}

      {/* Entry Form Modal */}
      {showEntryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingEntry ? 'Edit Entry' : 'Add New Entry'}
            </h3>
            <form onSubmit={handleEntrySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Person Name</label>
                <input
                  type="text"
                  value={entryForm.personName}
                  onChange={(e) => setEntryForm({ ...entryForm, personName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={entryForm.phoneNumber}
                  onChange={(e) => setEntryForm({ ...entryForm, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
                <select
                  value={entryForm.type}
                  onChange={(e) => setEntryForm({ ...entryForm, type: e.target.value as 'gave' | 'got' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="gave">I Gave Money (They owe me)</option>
                  <option value="got">I Got Money (I owe them)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={entryForm.amount}
                  onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={entryForm.description}
                  onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={entryForm.category}
                  onChange={(e) => setEntryForm({ ...entryForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="capitalize">{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date (Optional)</label>
                <input
                  type="date"
                  value={entryForm.dueDate}
                  onChange={(e) => setEntryForm({ ...entryForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="reminderEnabled"
                  checked={entryForm.reminderEnabled}
                  onChange={(e) => setEntryForm({ ...entryForm, reminderEnabled: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="reminderEnabled" className="text-sm font-medium text-slate-700">
                  Enable Reminder
                </label>
              </div>

              {entryForm.reminderEnabled && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reminder Date</label>
                  <input
                    type="date"
                    value={entryForm.reminderDate}
                    onChange={(e) => setEntryForm({ ...entryForm, reminderDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={entryForm.notes}
                  onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetEntryForm}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingEntry ? 'Update' : 'Add'} Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selectedEntry.type === 'gave' ? 'Record Payment Received' : 'Record Payment Made'}
            </h3>
            <div className="mb-4 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Transaction with</p>
              <p className="font-semibold">{selectedEntry.personName}</p>
              <p className="text-sm text-slate-600">Remaining: ₹{selectedEntry.remainingAmount.toLocaleString()}</p>
            </div>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  max={selectedEntry.remainingAmount}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setSelectedEntry(null);
                    setPaymentForm({ amount: '', description: '', type: 'payment' });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KhataBook;