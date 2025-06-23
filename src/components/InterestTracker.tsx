import React, { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';
import { EMI } from '../types';

interface InterestTrackerProps {
  emis: EMI[];
}

const InterestTracker: React.FC<InterestTrackerProps> = ({ emis }) => {
  const [selectedEMI, setSelectedEMI] = useState<string>('');

  // Calculate totals
  const totalLoanAmount = emis.reduce((sum, emi) => sum + emi.loanAmount, 0);
  const totalInterestPaid = emis.reduce((sum, emi) => sum + emi.paidInterest, 0);
  const totalRemainingInterest = emis.reduce((sum, emi) => sum + emi.remainingInterest, 0);
  const totalInterest = totalInterestPaid + totalRemainingInterest;
  const totalAmount = totalLoanAmount + totalInterest;

  const selectedEMIData = emis.find(emi => emi.id === selectedEMI);

  // Helper: Calculate total interest if no prepayments were made
  const calculateInterestWithoutPrepayment = (emi: EMI) => {
    const monthlyRate = emi.interestRate / (12 * 100);
    const emiAmount = emi.emiAmount;
    let principal = emi.loanAmount;
    let totalInterest = 0;
    for (let i = 0; i < emi.tenure; i++) {
      const interestPortion = principal * monthlyRate;
      totalInterest += interestPortion;
      const principalPortion = emiAmount - interestPortion;
      principal -= principalPortion;
      if (principal <= 0) break;
    }
    return Math.round(totalInterest);
  };

  // Helper: Calculate actual interest (with prepayments)
  const calculateActualInterest = (emi: EMI) => {
    // If transactions exist, recalculate with prepayments
    if ((emi as any).transactions && Array.isArray((emi as any).transactions)) {
      const txns = ((emi as any).transactions as any[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      let principal = emi.loanAmount;
      let totalInterest = 0;
      const monthlyRate = emi.interestRate / (12 * 100);
      let txnIndex = 0;
      for (let i = 0; i < emi.tenure && principal > 0; i++) {
        // Apply all prepayments before this EMI
        while (
          txnIndex < txns.length &&
          txns[txnIndex].type === 'prepayment'
        ) {
          principal -= txns[txnIndex].amount;
          txnIndex++;
        }
        const interestPortion = principal * monthlyRate;
        totalInterest += interestPortion;
        const principalPortion = emi.emiAmount - interestPortion;
        principal -= principalPortion;
        // Move to next transaction if it's an EMI payment (skip, as we simulate all EMIs)
        while (
          txnIndex < txns.length &&
          txns[txnIndex].type === 'emi'
        ) {
          txnIndex++;
        }
      }
      return Math.round(totalInterest);
    }
    // Fallback: use stored totalInterest
    return Math.round(emi.totalInterest);
  };

  // Calculate savings for each EMI
  const emiSavings = emis.map(emi => {
    const interestWithoutPrepay = calculateInterestWithoutPrepayment(emi);
    const actualInterest = calculateActualInterest(emi);
    return {
      emiId: emi.id,
      loanName: emi.loanName,
      interestWithoutPrepay,
      actualInterest,
      saved: Math.max(0, interestWithoutPrepay - actualInterest),
    };
  });

  const totalSavedByPrepayment = emiSavings.reduce((sum, e) => sum + e.saved, 0);

  const getInterestSavings = (emi: EMI) => {
    // Calculate interest savings if paid early (6 months early example)
    const remainingMonths = emi.remainingEMIs;
    const monthlyRate = emi.interestRate / (12 * 100);
    const earlyPaymentMonths = Math.min(6, remainingMonths);
    let savings = 0;
    if (earlyPaymentMonths > 0) {
      let remainingPrincipal = emi.loanAmount - (emi.paidEMIs * (emi.emiAmount - (emi.loanAmount * monthlyRate)));
      for (let i = 0; i < earlyPaymentMonths; i++) {
        const interestPortion = remainingPrincipal * monthlyRate;
        savings += interestPortion;
        remainingPrincipal -= (emi.emiAmount - interestPortion);
      }
    }
    return savings;
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
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Interest Tracker</h2>
        <p className="text-slate-600 mt-1">Monitor interest payments, prepayment savings, and potential savings</p>
      </div>

      {emis.length === 0 ? (
        <div className="text-center py-12">
          <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No EMIs to track</h3>
          <p className="text-slate-500">Add some EMIs to see your interest breakdown</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard
              title="Total Loans"
              value={`₹${totalLoanAmount.toLocaleString()}`}
              icon={BarChart3}
              color="blue"
              subtitle={`${emis.length} active loans`}
            />
            <StatCard
              title="Interest Paid"
              value={`₹${totalInterestPaid.toLocaleString()}`}
              icon={TrendingDown}
              color="red"
              subtitle="Already paid"
            />
            <StatCard
              title="Remaining Interest"
              value={`₹${totalRemainingInterest.toLocaleString()}`}
              icon={TrendingUp}
              color="orange"
              subtitle="Yet to pay"
            />
            <StatCard
              title="Total Interest"
              value={`₹${totalInterest.toLocaleString()}`}
              icon={PieChart}
              color="purple"
              subtitle={`${((totalInterest / totalLoanAmount) * 100).toFixed(1)}% of principal`}
            />
            <StatCard
              title="Saved by Prepayment"
              value={`₹${totalSavedByPrepayment.toLocaleString()}`}
              icon={Calculator}
              color="green"
              subtitle="Interest saved"
            />
          </div>

          {/* Interest Breakdown Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Interest Breakdown by Loan</h3>
            <div className="space-y-4">
              {emis.map((emi) => {
                const totalEMIInterest = emi.paidInterest + emi.remainingInterest;
                const paidPercentage = totalEMIInterest > 0 ? (emi.paidInterest / totalEMIInterest) * 100 : 0;
                const remainingPercentage = 100 - paidPercentage;
                const emiSaved = emiSavings.find(e => e.emiId === emi.id);

                return (
                  <div key={emi.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-slate-900">{emi.loanName}</h4>
                      <span className="text-sm text-slate-600">
                        ₹{totalEMIInterest.toLocaleString()} total interest
                        {emiSaved && emiSaved.saved > 0 && (
                          <span className="ml-2 text-green-600 font-semibold">
                            (Saved ₹{emiSaved.saved.toLocaleString()})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="bg-red-500 h-full"
                        style={{ width: `${paidPercentage}%` }}
                        title={`Paid: ₹${emi.paidInterest.toLocaleString()}`}
                      ></div>
                      <div 
                        className="bg-orange-500 h-full"
                        style={{ width: `${remainingPercentage}%` }}
                        title={`Remaining: ₹${emi.remainingInterest.toLocaleString()}`}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Paid: ₹{emi.paidInterest.toLocaleString()}</span>
                      <span>Remaining: ₹{emi.remainingInterest.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* EMI Selector */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Detailed Analysis</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select EMI</label>
                <select
                  value={selectedEMI}
                  onChange={(e) => setSelectedEMI(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose an EMI...</option>
                  {emis.map(emi => (
                    <option key={emi.id} value={emi.id}>{emi.loanName}</option>
                  ))}
                </select>
              </div>

              {selectedEMIData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600">Principal Amount</p>
                      <p className="text-lg font-bold text-slate-900">₹{selectedEMIData.loanAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600">Interest Rate</p>
                      <p className="text-lg font-bold text-slate-900">{selectedEMIData.interestRate}%</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-600">Interest Paid</p>
                      <p className="text-lg font-bold text-red-600">₹{selectedEMIData.paidInterest.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-orange-600">Interest Remaining</p>
                      <p className="text-lg font-bold text-orange-600">₹{selectedEMIData.remainingInterest.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg col-span-2">
                      <p className="text-xs text-green-600">Saved by Prepayment</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹{(emiSavings.find(e => e.emiId === selectedEMI)?.saved || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Interest vs Principal Ratio</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Interest</span>
                          <span>{((selectedEMIData.totalInterest / selectedEMIData.loanAmount) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: `${(selectedEMIData.totalInterest / (selectedEMIData.loanAmount + selectedEMIData.totalInterest)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      You'll pay ₹{selectedEMIData.totalInterest.toLocaleString()} in interest over the life of this loan
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Interest Savings Calculator */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Potential Savings</h3>
              
              {selectedEMIData ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Early Payment Benefits</h4>
                    <p className="text-sm text-green-700 mb-3">
                      By paying off 6 months early, you could save:
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{getInterestSavings(selectedEMIData).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Current EMI</span>
                      <span className="font-medium">₹{selectedEMIData.emiAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Remaining EMIs</span>
                      <span className="font-medium">{selectedEMIData.remainingEMIs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Remaining Amount</span>
                      <span className="font-medium">
                        ₹{(selectedEMIData.emiAmount * selectedEMIData.remainingEMIs).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-1">💡 Pro Tip</h4>
                    <p className="text-sm text-yellow-700">
                      Consider making extra payments towards principal to reduce interest burden significantly.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Select an EMI above to see potential savings</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl">
              <h3 className="font-semibold mb-2">Interest Already Paid</h3>
              <p className="text-3xl font-bold">₹{totalInterestPaid.toLocaleString()}</p>
              <p className="text-red-100 text-sm mt-1">
                {((totalInterestPaid / totalInterest) * 100).toFixed(1)}% of total interest
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
              <h3 className="font-semibold mb-2">Interest Remaining</h3>
              <p className="text-3xl font-bold">₹{totalRemainingInterest.toLocaleString()}</p>
              <p className="text-orange-100 text-sm mt-1">
                {((totalRemainingInterest / totalInterest) * 100).toFixed(1)}% of total interest
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
              <h3 className="font-semibold mb-2">Interest Rate Impact</h3>
              <p className="text-3xl font-bold">{((totalInterest / totalLoanAmount) * 100).toFixed(1)}%</p>
              <p className="text-purple-100 text-sm mt-1">
                Total interest as % of principal
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InterestTracker;