import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, AlertCircle, CreditCard } from 'lucide-react';
import { EMI } from '../types';

interface EMIManagerProps {
  emis: EMI[];
  setEMIs: React.Dispatch<React.SetStateAction<EMI[]>>;
}

const EMIManager: React.FC<EMIManagerProps> = ({ emis, setEMIs }) => {
  const [showEMIForm, setShowEMIForm] = useState(false);
  const [editingEMI, setEditingEMI] = useState<EMI | null>(null);

  const [emiForm, setEMIForm] = useState({
    loanName: '',
    loanAmount: '',
    interestRate: '',
    tenure: '',
    startDate: '',
    loanType: 'personal' as 'home' | 'car' | 'personal' | 'education' | 'other',
  });

  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                 (Math.pow(1 + monthlyRate, tenure) - 1);
    return emi;
  };

  const calculateInterestDetails = (principal: number, rate: number, tenure: number, paidEMIs: number) => {
    const emiAmount = calculateEMI(principal, rate, tenure);
    const totalAmount = emiAmount * tenure;
    const totalInterest = totalAmount - principal;
    
    let paidInterest = 0;
    let remainingPrincipal = principal;
    const monthlyRate = rate / (12 * 100);
    
    for (let i = 0; i < paidEMIs; i++) {
      const interestPortion = remainingPrincipal * monthlyRate;
      const principalPortion = emiAmount - interestPortion;
      paidInterest += interestPortion;
      remainingPrincipal -= principalPortion;
    }
    
    const remainingInterest = totalInterest - paidInterest;
    
    return {
      emiAmount,
      totalInterest,
      paidInterest,
      remainingInterest,
    };
  };

  const handleEMISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const principal = parseFloat(emiForm.loanAmount);
    const rate = parseFloat(emiForm.interestRate);
    const tenure = parseInt(emiForm.tenure);
    const startDate = new Date(emiForm.startDate);
    
    const { emiAmount, totalInterest, paidInterest, remainingInterest } = 
      calculateInterestDetails(principal, rate, tenure, editingEMI?.paidEMIs || 0);
    
    // Calculate next payment date
    const nextPaymentDate = new Date(startDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + (editingEMI?.paidEMIs || 0) + 1);
    
    const emi: EMI = {
      id: editingEMI?.id || Date.now().toString(),
      loanName: emiForm.loanName,
      loanAmount: principal,
      interestRate: rate,
      tenure,
      emiAmount,
      startDate: emiForm.startDate,
      nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
      paidEMIs: editingEMI?.paidEMIs || 0,
      remainingEMIs: tenure - (editingEMI?.paidEMIs || 0),
      totalInterest,
      paidInterest,
      remainingInterest,
      loanType: emiForm.loanType,
    };

    if (editingEMI) {
      setEMIs(emis.map(e => e.id === editingEMI.id ? emi : e));
    } else {
      setEMIs([...emis, emi]);
    }

    setEMIForm({
      loanName: '',
      loanAmount: '',
      interestRate: '',
      tenure: '',
      startDate: '',
      loanType: 'personal',
    });
    setShowEMIForm(false);
    setEditingEMI(null);
  };

  const deleteEMI = (id: string) => {
    setEMIs(emis.filter(e => e.id !== id));
  };

  const editEMI = (emi: EMI) => {
    setEditingEMI(emi);
    setEMIForm({
      loanName: emi.loanName,
      loanAmount: emi.loanAmount.toString(),
      interestRate: emi.interestRate.toString(),
      tenure: emi.tenure.toString(),
      startDate: emi.startDate,
      loanType: emi.loanType,
    });
    setShowEMIForm(true);
  };

  const markEMIPaid = (id: string) => {
    setEMIs(emis.map(emi => {
      if (emi.id === id && emi.remainingEMIs > 0) {
        const newPaidEMIs = emi.paidEMIs + 1;
        const { paidInterest, remainingInterest } = 
          calculateInterestDetails(emi.loanAmount, emi.interestRate, emi.tenure, newPaidEMIs);
        
        const nextPaymentDate = new Date(emi.nextPaymentDate);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        
        return {
          ...emi,
          paidEMIs: newPaidEMIs,
          remainingEMIs: emi.remainingEMIs - 1,
          paidInterest,
          remainingInterest,
          nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
        };
      }
      return emi;
    }));
  };

  const getLoanTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return '🏠';
      case 'car': return '🚗';
      case 'education': return '🎓';
      case 'personal': return '👤';
      default: return '💰';
    }
  };

  const getDaysUntilDue = (nextPaymentDate: string) => {
    const today = new Date();
    const dueDate = new Date(nextPaymentDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">EMI Manager</h2>
          <p className="text-slate-600 mt-1">Track and manage your loan EMIs</p>
        </div>
        <button
          onClick={() => setShowEMIForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add EMI
        </button>
      </div>

      {/* EMI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {emis.map((emi) => {
          const daysUntilDue = getDaysUntilDue(emi.nextPaymentDate);
          const isOverdue = daysUntilDue < 0;
          const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;
          const progress = (emi.paidEMIs / emi.tenure) * 100;
          
          return (
            <div key={emi.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getLoanTypeIcon(emi.loanType)}</span>
                  <div>
                    <h3 className="font-semibold text-slate-900">{emi.loanName}</h3>
                    <p className="text-sm text-slate-500 capitalize">{emi.loanType} Loan</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => editEMI(emi)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteEMI(emi.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* EMI Amount */}
              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Monthly EMI</span>
                  <span className="text-2xl font-bold text-slate-900">₹{emi.emiAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Next Payment Alert */}
              {emi.remainingEMIs > 0 && (
                <div className={`p-3 rounded-lg mb-4 ${
                  isOverdue ? 'bg-red-50 border border-red-200' : 
                  isDueSoon ? 'bg-yellow-50 border border-yellow-200' : 
                  'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center">
                    <Calendar className={`w-4 h-4 mr-2 ${
                      isOverdue ? 'text-red-600' : 
                      isDueSoon ? 'text-yellow-600' : 
                      'text-green-600'
                    }`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        isOverdue ? 'text-red-800' : 
                        isDueSoon ? 'text-yellow-800' : 
                        'text-green-800'
                      }`}>
                        {isOverdue ? `Overdue by ${Math.abs(daysUntilDue)} days` :
                         isDueSoon ? `Due in ${daysUntilDue} days` :
                         `Next payment in ${daysUntilDue} days`}
                      </p>
                      <p className={`text-xs ${
                        isOverdue ? 'text-red-600' : 
                        isDueSoon ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        Due: {new Date(emi.nextPaymentDate).toLocaleDateString()}
                      </p>
                    </div>
                    {emi.remainingEMIs > 0 && (
                      <button
                        onClick={() => markEMIPaid(emi.id)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                          isOverdue ? 'bg-red-600 text-white hover:bg-red-700' :
                          isDueSoon ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                          'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Progress */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="h-2 bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{emi.paidEMIs} paid</span>
                  <span>{emi.remainingEMIs} remaining</span>
                </div>
              </div>

              {/* Loan Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Loan Amount</p>
                  <p className="font-medium">₹{emi.loanAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-600">Interest Rate</p>
                  <p className="font-medium">{emi.interestRate}%</p>
                </div>
                <div>
                  <p className="text-slate-600">Paid Interest</p>
                  <p className="font-medium text-red-600">₹{emi.paidInterest.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-600">Remaining Interest</p>
                  <p className="font-medium text-orange-600">₹{emi.remainingInterest.toLocaleString()}</p>
                </div>
              </div>

              {emi.remainingEMIs === 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">🎉 Loan Completed!</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {emis.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No EMIs yet</h3>
          <p className="text-slate-500 mb-4">Add your first loan to start tracking EMIs</p>
          <button
            onClick={() => setShowEMIForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add EMI
          </button>
        </div>
      )}

      {/* EMI Form Modal */}
      {showEMIForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingEMI ? 'Edit EMI' : 'Add New EMI'}
            </h3>
            <form onSubmit={handleEMISubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loan Name</label>
                <input
                  type="text"
                  value={emiForm.loanName}
                  onChange={(e) => setEMIForm({ ...emiForm, loanName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loan Type</label>
                <select
                  value={emiForm.loanType}
                  onChange={(e) => setEMIForm({ ...emiForm, loanType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="personal">Personal Loan</option>
                  <option value="home">Home Loan</option>
                  <option value="car">Car Loan</option>
                  <option value="education">Education Loan</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loan Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={emiForm.loanAmount}
                  onChange={(e) => setEMIForm({ ...emiForm, loanAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={emiForm.interestRate}
                  onChange={(e) => setEMIForm({ ...emiForm, interestRate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tenure (Months)</label>
                <input
                  type="number"
                  value={emiForm.tenure}
                  onChange={(e) => setEMIForm({ ...emiForm, tenure: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={emiForm.startDate}
                  onChange={(e) => setEMIForm({ ...emiForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              {/* EMI Preview */}
              {emiForm.loanAmount && emiForm.interestRate && emiForm.tenure && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">EMI Preview</p>
                  <p className="text-lg font-bold text-blue-900">
                    ₹{calculateEMI(
                      parseFloat(emiForm.loanAmount) || 0,
                      parseFloat(emiForm.interestRate) || 0,
                      parseInt(emiForm.tenure) || 0
                    ).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEMIForm(false);
                    setEditingEMI(null);
                    setEMIForm({
                      loanName: '',
                      loanAmount: '',
                      interestRate: '',
                      tenure: '',
                      startDate: '',
                      loanType: 'personal',
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingEMI ? 'Update' : 'Add'} EMI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EMIManager;