export interface Budget {
  id: string;
  name: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  period: 'monthly' | 'yearly';
  color: string;
  createdAt: string;
}

export interface EMI {
  id: string;
  loanName: string;
  loanAmount: number;
  interestRate: number;
  tenure: number; // in months
  emiAmount: number;
  startDate: string;
  nextPaymentDate: string;
  paidEMIs: number;
  remainingEMIs: number;
  totalInterest: number;
  paidInterest: number;
  remainingInterest: number;
  loanType: 'home' | 'car' | 'personal' | 'education' | 'other';
}

export interface Transaction {
  id: string;
  budgetId: string;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
}

export interface NotificationItem {
  id: string;
  type: 'emi' | 'budget' | 'goal';
  title: string;
  message: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export interface KhataEntry {
  id: string;
  personName: string;
  phoneNumber?: string;
  type: 'gave' | 'got'; // gave = you gave money (they owe you), got = you got money (you owe them)
  amount: number;
  description: string;
  date: string;
  dueDate?: string;
  status: 'pending' | 'settled' | 'partial';
  paidAmount: number;
  remainingAmount: number;
  category: 'personal' | 'business' | 'family' | 'friend' | 'other';
  reminderEnabled: boolean;
  reminderDate?: string;
  createdAt: string;
  settledAt?: string;
  notes?: string;
}

export interface KhataPayment {
  id: string;
  khataEntryId: string;
  amount: number;
  date: string;
  description: string;
  type: 'payment' | 'received';
}
export * from './checklist';