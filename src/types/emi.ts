interface EMIWithTransactions {
  id: string;
  loanName: string;
  loanAmount: number;
  interestRate: number;
  tenure: number;
  emiAmount: number;
  startDate: string;
  nextPaymentDate: string;
  paidEMIs: number;
  remainingEMIs: number;
  totalInterest: number;
  paidInterest: number;
  remainingInterest: number;
  loanType: 'home' | 'car' | 'personal' | 'education' | 'other';
  transactions?: Transaction[];
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'emi' | 'ratechange' | 'prepayment';
  note?: string;
  newRate?: number;
}

interface EMIForm {
  loanName: string;
  loanAmount: string;
  interestRate: string;
  tenure: string;
  startDate: string;
  loanType: 'home' | 'car' | 'personal' | 'education' | 'other';
}