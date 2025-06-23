import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, CreditCard } from 'lucide-react';
import { EMI } from '../types';

// --- Transaction Types ---
type TransactionType = 'emi' | 'prepayment' | 'fee' | 'other' | 'ratechange';

interface Transaction {
  id: string;
  date: string; // ISO date string
  amount: number;
  type: TransactionType;
  note?: string;
  newRate?: number; // Only for ratechange
}

// --- Extend EMI type locally to include transactions ---
interface EMIWithTransactions extends EMI {
  transactions?: Transaction[];
}

interface EMIManagerProps {
  emis: EMIWithTransactions[];
  setEMIs: React.Dispatch<React.SetStateAction<EMIWithTransactions[]>>;
}

const EMIManager: React.FC<EMIManagerProps> = ({ emis, setEMIs }) => {
  const [showEMIForm, setShowEMIForm] = useState(false);
  const [editingEMI, setEditingEMI] = useState<EMIWithTransactions | null>(null);

  const [emiForm, setEMIForm] = useState({
    loanName: '',
    loanAmount: '',
    interestRate: '',
    tenure: '',
    startDate: '',
    loanType: 'personal' as 'home' | 'car' | 'personal' | 'education' | 'other',
  });

  // Transaction modal state
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [txnEMIId, setTxnEMIId] = useState<string | null>(null);
  const [txnForm, setTxnForm] = useState({
    date: '',
    amount: '',
    type: 'emi' as TransactionType,
    note: '',
    newRate: '' as string | number,
  });
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);

  // Prepayment impact modal state
  const [showPrepayImpact, setShowPrepayImpact] = useState(false);
  const [prepayOption, setPrepayOption] = useState<'emi' | 'tenure'>('emi');
  const [pendingPrepay, setPendingPrepay] = useState<{ emiId: string; txn: Transaction } | null>(null);

  // --- Calculation helpers ---
  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    if (!principal || !rate || !tenure) return 0;
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1);
    return emi;
  };

  // Helper to get the interest rate at a given EMI payment index
  const getInterestRateForEMI = (emi: EMIWithTransactions, emiIndex: number) => {
    if (!emi.transactions) return emi.interestRate;
    const sortedTxns = [...emi.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentRate = emi.interestRate;
    let emiCount = 0;
    for (const txn of sortedTxns) {
      if (txn.type === 'ratechange' && typeof txn.newRate === 'number') {
        if (emiCount > emiIndex) break;
        currentRate = txn.newRate;
      }
      if (txn.type === 'emi') {
        emiCount++;
      }
    }
    return currentRate;
  };

  // Updated calculateInterestDetails to support rate changes
  const calculateInterestDetails = (
    principal: number,
    defaultRate: number,
    tenure: number,
    paidEMIs: number,
    transactions?: Transaction[]
  ) => {
    let emiAmount = calculateEMI(principal, defaultRate, tenure);
    let totalAmount = emiAmount * tenure;
    let totalInterest = totalAmount - principal;

    let paidInterest = 0;
    let remainingPrincipal = principal;
    let emiIndex = 0;
    let currentRate = defaultRate;
    let txns = transactions ? [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
    let txnPtr = 0;

    for (let i = 0; i < paidEMIs; i++) {
      // Apply any rate change before this EMI
      while (
        txnPtr < txns.length &&
        txns[txnPtr].type === 'ratechange' &&
        new Date(txns[txnPtr].date) <= new Date()
      ) {
        if (typeof txns[txnPtr].newRate === 'number') {
          currentRate = txns[txnPtr].newRate ?? currentRate;
          emiAmount = calculateEMI(remainingPrincipal, currentRate, tenure - i);
        }
        txnPtr++;
      }
      const monthlyRate = currentRate / (12 * 100);
      const interestPortion = remainingPrincipal * monthlyRate;
      const principalPortion = emiAmount - interestPortion;
      paidInterest += interestPortion;
      remainingPrincipal -= principalPortion;
      emiIndex++;
    }

    // Remaining interest is for the rest of the tenure at the latest rate
    const remainingEMIs = tenure - paidEMIs;
    let remainingInterest = 0;
    for (let i = 0; i < remainingEMIs; i++) {
      // Apply any rate change before this EMI
      while (
        txnPtr < txns.length &&
        txns[txnPtr].type === 'ratechange' &&
        new Date(txns[txnPtr].date) <= new Date()
      ) {
        if (typeof txns[txnPtr].newRate === 'number') {
          currentRate = txns[txnPtr].newRate ?? currentRate;
          emiAmount = calculateEMI(remainingPrincipal, currentRate, remainingEMIs - i);
        }
        txnPtr++;
      }
      const monthlyRate = currentRate / (12 * 100);
      const interestPortion = remainingPrincipal * monthlyRate;
      const principalPortion = emiAmount - interestPortion;
      remainingInterest += interestPortion;
      remainingPrincipal -= principalPortion;
    }

    totalInterest = paidInterest + remainingInterest;

    return {
      emiAmount,
      totalInterest,
      paidInterest,
      remainingInterest,
    };
  };

  // Helper to calculate remaining principal (after paid EMIs and prepayments)
  const getRemainingPrincipal = (emi: EMIWithTransactions) => {
    let paidEMIs = 0;
    let prepayments = 0;
    if (emi.transactions) {
      emi.transactions.forEach(t => {
        if (t.type === 'emi') paidEMIs++;
        if (t.type === 'prepayment') prepayments += t.amount;
      });
    }
    let remainingPrincipal = emi.loanAmount - prepayments;
    const monthlyRate = emi.interestRate / (12 * 100);
    const emiAmount = emi.emiAmount;
    for (let i = 0; i < paidEMIs; i++) {
      const interestPortion = remainingPrincipal * monthlyRate;
      const principalPortion = emiAmount - interestPortion;
      remainingPrincipal -= principalPortion;
    }
    return Math.max(0, Math.round(remainingPrincipal));
  };

  // --- EMI CRUD ---
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

    const emi: EMIWithTransactions = {
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
      transactions: editingEMI?.transactions || [],
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

  const editEMI = (emi: EMIWithTransactions) => {
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

  // --- Transaction Handler with edit/delete and prepayment impact ---
  const addOrEditTransaction = (emiId: string, txn: Transaction, prepayMode?: 'emi' | 'tenure') => {
    setEMIs(emis.map(emi => {
      if (emi.id === emiId) {
        let txns = emi.transactions ? [...emi.transactions] : [];
        let updatedEMI = { ...emi };

        // If editing, replace; else add
        if (editingTxn) {
          txns = txns.map(t => (t.id === txn.id ? txn : t));
        } else {
          txns.push(txn);
        }

        // Restrictions
        if (txn.type === 'prepayment') {
          if (txn.amount > updatedEMI.loanAmount) {
            alert('Prepayment cannot exceed remaining loan amount.');
            return emi;
          }
        }

        // Apply transaction effects
        if (txn.type === 'emi' || txn.type === 'ratechange') {
          // For EMI or ratechange, recalculate using all transactions
          const paidEMIs = txns.filter(t => t.type === 'emi').length;
          const prepayments = txns.filter(t => t.type === 'prepayment').reduce((sum, t) => sum + t.amount, 0);
          const principal = emi.loanAmount - prepayments;
          const { emiAmount, totalInterest, paidInterest, remainingInterest } =
            calculateInterestDetails(
              principal,
              emi.interestRate,
              emi.tenure,
              paidEMIs,
              txns
            );
          updatedEMI = {
            ...updatedEMI,
            paidEMIs,
            remainingEMIs: emi.tenure - paidEMIs,
            emiAmount,
            totalInterest,
            paidInterest,
            remainingInterest,
          };
        } else if (txn.type === 'prepayment') {
          // Prepayment impact: ask user if they want to reduce EMI or tenure
          let newLoanAmount = updatedEMI.loanAmount - txn.amount;
          let newTenure = updatedEMI.tenure;
          let newEMIAmount = updatedEMI.emiAmount;
          if (prepayMode === 'emi') {
            // Reduce EMI, keep tenure
            newEMIAmount = calculateEMI(newLoanAmount, updatedEMI.interestRate, updatedEMI.tenure);
          } else if (prepayMode === 'tenure') {
            // Reduce tenure, keep EMI
            let tempPrincipal = newLoanAmount;
            let months = 0;
            while (tempPrincipal > 0 && months < 1000) {
              const interest = tempPrincipal * (updatedEMI.interestRate / (12 * 100));
              const principalPaid = updatedEMI.emiAmount - interest;
              tempPrincipal -= principalPaid;
              months++;
            }
            newTenure = months;
          }
          const { totalInterest, paidInterest, remainingInterest } =
            calculateInterestDetails(newLoanAmount, updatedEMI.interestRate, newTenure, updatedEMI.paidEMIs, txns);

          updatedEMI = {
            ...updatedEMI,
            loanAmount: newLoanAmount,
            emiAmount: newEMIAmount,
            tenure: newTenure,
            totalInterest,
            paidInterest,
            remainingInterest,
            remainingEMIs: newTenure - updatedEMI.paidEMIs,
          };
        }
        // For 'fee' and 'other', just record the transaction

        updatedEMI.transactions = txns;
        return updatedEMI;
      }
      return emi;
    }));
    setShowTxnModal(false);
    setTxnEMIId(null);
    setTxnForm({ date: '', amount: '', type: 'emi', note: '', newRate: '' });
    setEditingTxn(null);
    setShowPrepayImpact(false);
    setPendingPrepay(null);
    setPrepayOption('emi');
  };

  const handleTxnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnEMIId) return;
    const txn: Transaction = {
      id: editingTxn?.id || Date.now().toString(),
      date: txnForm.date,
      amount: txnForm.type === 'ratechange' ? 0 : parseFloat(txnForm.amount as string),
      type: txnForm.type,
      note: txnForm.note,
      newRate: txnForm.type === 'ratechange' ? parseFloat(txnForm.newRate as string) : undefined,
    };
    if (txn.type === 'prepayment') {
      setShowTxnModal(false);
      setShowPrepayImpact(true);
      setPendingPrepay({ emiId: txnEMIId, txn });
    } else {
      addOrEditTransaction(txnEMIId, txn);
    }
  };

  const handlePrepayImpact = () => {
    if (pendingPrepay) {
      addOrEditTransaction(pendingPrepay.emiId, pendingPrepay.txn, prepayOption);
    }
  };

  const editTransaction = (emiId: string, txn: Transaction) => {
    setTxnEMIId(emiId);
    setTxnForm({
      date: txn.date,
      amount: txn.amount.toString(),
      type: txn.type,
      note: txn.note || '',
      newRate: txn.newRate?.toString() || '',
    });
    setEditingTxn(txn);
    setShowTxnModal(true);
  };

  const deleteTransaction = (emiId: string, txnId: string) => {
    setEMIs(emis.map(emi => {
      if (emi.id === emiId) {
        const txns = (emi.transactions || []).filter(t => t.id !== txnId);

        // Recalculate paidEMIs and prepayments from remaining transactions
        let paidEMIs = 0;
        let prepayments = 0;
        txns.forEach(t => {
          if (t.type === 'emi') paidEMIs++;
          if (t.type === 'prepayment') prepayments += t.amount;
        });

        // Always use the original loanAmount and tenure for recalculation
        const originalLoanAmount = editingEMI && editingEMI.id === emiId ? editingEMI.loanAmount : emi.loanAmount;
        const originalTenure = editingEMI && editingEMI.id === emiId ? editingEMI.tenure : emi.tenure;

        const loanAmount = originalLoanAmount - prepayments;
        const { emiAmount, totalInterest, paidInterest, remainingInterest } =
          calculateInterestDetails(loanAmount, emi.interestRate, originalTenure, paidEMIs, txns);

        return {
          ...emi,
          transactions: txns,
          paidEMIs,
          remainingEMIs: originalTenure - paidEMIs,
          loanAmount: originalLoanAmount,
          emiAmount,
          totalInterest,
          paidInterest,
          remainingInterest,
        };
      }
      return emi;
    }));
  };

  const markEMIPaid = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    addOrEditTransaction(id, {
      id: Date.now().toString(),
      date: today,
      amount: emis.find(e => e.id === id)?.emiAmount || 0,
      type: 'emi',
      note: 'EMI paid',
    });
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
          const remainingPrincipal = getRemainingPrincipal(emi);

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

              {/* Add Transaction Button */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => {
                    setTxnEMIId(emi.id);
                    setShowTxnModal(true);
                    setEditingTxn(null);
                    setTxnForm({ date: '', amount: '', type: 'emi', note: '', newRate: '' });
                  }}
                  className="p-1 text-slate-400 hover:text-blue-600 transition-colors text-xs flex items-center"
                  title="Add Transaction"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Txn
                </button>
              </div>
              {/* Transaction List */}
              {emi.transactions && emi.transactions.length > 0 && (
                <div className="mb-4 text-xs">
                  <div className="font-semibold mb-1">Transactions:</div>
                  <ul className="space-y-1">
                    {emi.transactions.map(txn => (
                      <li key={txn.id} className="flex items-center justify-between">
                        <span>
                          <span className="font-medium">{txn.type.toUpperCase()}</span> | {txn.date}
                          {txn.type !== 'ratechange' && <> | ₹{txn.amount}</>}
                          {txn.type === 'ratechange' && txn.newRate !== undefined && (
                            <> | New Rate: {txn.newRate}%</>
                          )}
                          {txn.note && <span className="ml-2 text-slate-500">({txn.note})</span>}
                        </span>
                        <span>
                          <button
                            className="text-blue-500 hover:underline mr-2"
                            onClick={() => editTransaction(emi.id, txn)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-500 hover:underline"
                            onClick={() => deleteTransaction(emi.id, txn.id)}
                          >
                            Delete
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                <div>
                  <p className="text-slate-600">Principal Remaining</p>
                  <p className="font-medium text-blue-600">₹{remainingPrincipal.toLocaleString()}</p>
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

      {/* Transaction Modal */}
      {showTxnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editingTxn ? 'Edit Transaction' : 'Add Transaction'}</h3>
            <form onSubmit={handleTxnSubmit}>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={txnForm.date}
                  onChange={e => setTxnForm({ ...txnForm, date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              {/* Show Amount only if not ratechange */}
              {txnForm.type !== 'ratechange' && (
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input
                    type="number"
                    value={txnForm.amount}
                    onChange={e => setTxnForm({ ...txnForm, amount: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              )}
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={txnForm.type}
                  onChange={e => setTxnForm({ ...txnForm, type: e.target.value as TransactionType })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="emi">EMI Payment</option>
                  <option value="prepayment">Pre-payment</option>
                  <option value="fee">Fee</option>
                  <option value="other">Other</option>
                  <option value="ratechange">Interest Rate Change</option>
                </select>
              </div>
              {/* Show new rate input if type is ratechange */}
              {txnForm.type === 'ratechange' && (
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">New Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={txnForm.newRate}
                    onChange={e => setTxnForm({ ...txnForm, newRate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              )}
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Note</label>
                <input
                  type="text"
                  value={txnForm.note}
                  onChange={e => setTxnForm({ ...txnForm, note: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTxnModal(false);
                    setEditingTxn(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingTxn ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prepayment Impact Modal */}
      {showPrepayImpact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Prepayment Impact</h3>
            <p className="mb-4">How do you want to apply the prepayment?</p>
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={prepayOption === 'emi'}
                  onChange={() => setPrepayOption('emi')}
                  className="mr-2"
                />
                Reduce EMI (keep tenure same)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={prepayOption === 'tenure'}
                  onChange={() => setPrepayOption('tenure')}
                  className="mr-2"
                />
                Reduce Tenure (keep EMI same)
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowPrepayImpact(false);
                  setPendingPrepay(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePrepayImpact}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
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