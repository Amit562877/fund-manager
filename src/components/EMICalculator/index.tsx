import React, { useState } from 'react';
import { Calculator, TrendingDown } from 'lucide-react';

function calculateEMI(P: number, R: number, N: number) {
  const r = R / (12 * 100);
  return P * r * Math.pow(1 + r, N) / (Math.pow(1 + r, N) - 1);
}

function calculateTotalInterest(emi: number, N: number, P: number) {
  return emi * N - P;
}

function calculatePrepaymentSavings(
  P: number,
  R: number,
  N: number,
  prepay: number,
  prepayAfterMonths: number
) {
  const r = R / (12 * 100);
  const emi = calculateEMI(P, R, N);
  let principal = P;
  for (let i = 0; i < prepayAfterMonths; i++) {
    const interest = principal * r;
    const principalPaid = emi - interest;
    principal -= principalPaid;
  }
  principal -= prepay;
  if (principal < 0) principal = 0;
  const newN = principal > 0
    ? Math.ceil(Math.log(emi / (emi - principal * r)) / Math.log(1 + r))
    : 0;
  const newTotalInterest = emi * (prepayAfterMonths + newN) - (P - prepay);
  const oldTotalInterest = emi * N - P;
  return {
    newN: prepayAfterMonths + newN,
    newTotalInterest,
    saved: oldTotalInterest - newTotalInterest,
  };
}

const EMICalculator: React.FC = () => {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(9);
  const [tenure, setTenure] = useState(60);

  // Prepayment input mode: 'percent' or 'amount'
  const [prepayMode, setPrepayMode] = useState<'percent' | 'amount'>('percent');
  const [prepayPercent, setPrepayPercent] = useState(10);
  const [prepayAmount, setPrepayAmount] = useState(Math.round(amount * 0.1));
  const [prepayAfter, setPrepayAfter] = useState(12);

  // Update prepayAmount if percent or amount changes
  React.useEffect(() => {
    if (prepayMode === 'percent') {
      setPrepayAmount(Math.round((amount * prepayPercent) / 100));
    }
  }, [amount, prepayPercent, prepayMode]);

  React.useEffect(() => {
    if (prepayMode === 'amount') {
      setPrepayPercent(Math.round((prepayAmount / amount) * 100));
    }
  }, [prepayAmount, amount, prepayMode]);

  const emi = calculateEMI(amount, rate, tenure);
  const totalInterest = calculateTotalInterest(emi, tenure, amount);

  const prepayResult = calculatePrepaymentSavings(
    amount,
    rate,
    tenure,
    prepayAmount,
    prepayAfter
  );

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-8">
      <div className="flex items-center gap-3 mb-4">
        <Calculator className="text-blue-600" size={28} />
        <h2 className="text-2xl font-bold text-slate-900">EMI Calculator</h2>
      </div>
      <p className="text-slate-600 mb-6">
        Calculate your monthly EMI for any loan type. See how prepaying a portion of your loan can save you interest and reduce your tenure.
      </p>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Loan Amount</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={amount}
            min={10000}
            step={1000}
            onChange={e => setAmount(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Interest Rate (% per annum)</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={rate}
            min={1}
            max={50}
            step={0.1}
            onChange={e => setRate(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tenure (months)</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={tenure}
            min={6}
            max={360}
            step={1}
            onChange={e => setTenure(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Prepayment</label>
          <div className="flex gap-2">
            <select
              className="border rounded-lg px-2 py-2"
              value={prepayMode}
              onChange={e => setPrepayMode(e.target.value as 'percent' | 'amount')}
            >
              <option value="percent">Percent (%)</option>
              <option value="amount">Amount (₹)</option>
            </select>
            {prepayMode === 'percent' ? (
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                value={prepayPercent}
                min={0}
                max={100}
                step={1}
                onChange={e => setPrepayPercent(Number(e.target.value))}
              />
            ) : (
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                value={prepayAmount}
                min={0}
                max={amount}
                step={1000}
                onChange={e => setPrepayAmount(Number(e.target.value))}
              />
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Prepay After (months)
            <span className="ml-2 text-xs text-blue-500">(suggested: 12)</span>
          </label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={prepayAfter}
            min={1}
            max={tenure - 1}
            step={1}
            onChange={e => setPrepayAfter(Number(e.target.value))}
          />
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Your EMI</h3>
          <p className="text-3xl font-bold text-blue-700 mb-2">₹{emi.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-slate-600">per month for {tenure} months</p>
          <div className="mt-4">
            <p className="text-sm text-slate-500">Total Interest Payable: <span className="font-semibold text-blue-700">₹{totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></p>
            <p className="text-sm text-slate-500">Total Payment: <span className="font-semibold text-blue-700">₹{(emi * tenure).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center gap-2">
            <TrendingDown className="text-green-600" size={20} />
            Prepayment Savings
          </h3>
          <p className="text-slate-700 mb-2">
            If you prepay <span className="font-bold text-green-700">₹{prepayAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> after <span className="font-bold">{prepayAfter}</span> month(s):
          </p>
          <ul className="text-sm text-slate-600 mb-2 space-y-1">
            <li>
              <span className="font-medium text-green-700">Tenure reduces to:</span> {prepayResult.newN} months
            </li>
            <li>
              <span className="font-medium text-green-700">Interest saved:</span> ₹{prepayResult.saved.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </li>
            <li>
              <span className="font-medium text-green-700">New total interest:</span> ₹{prepayResult.newTotalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </li>
          </ul>
          <div className="bg-green-100 rounded-lg p-3 mt-3 text-green-800 text-xs">
            <b>Tip:</b> Even a small prepayment can save you a lot of interest and close your loan faster!
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMICalculator;