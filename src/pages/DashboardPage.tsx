import { useAppStore } from '../store/useAppStore';
import { useEffect } from 'react';
import Dashboard from '../components/Dashboard';

const DashboardPage = () => {
  const setBudgets = useAppStore((s) => s.setBudgets);
  const setEMIs = useAppStore((s) => s.setEMIs);
  const setTransactions = useAppStore((s) => s.setTransactions);
  const setKhataEntries = useAppStore((s) => s.setKhataEntries);
  const setKhataPayments = useAppStore((s) => s.setKhataPayments);

  useEffect(() => {
    // Fake example; replace with actual fetch
    const fetchData = async () => {
      const res = await fetch('/api/dashboard');
      const data = await res.json();

      setBudgets(data.budgets);
      setEMIs(data.emis);
      setTransactions(data.transactions);
      setKhataEntries(data.khataEntries);
      setKhataPayments(data.khataPayments);
    };

    fetchData();
  }, []);

  const budgets = useAppStore((s) => s.budgets);
  const emis = useAppStore((s) => s.emis);
  const transactions = useAppStore((s) => s.transactions);
  const khataEntries = useAppStore((s) => s.khataEntries);

  return (
    <Dashboard
      budgets={budgets}
      emis={emis}
      transactions={transactions}
      khataEntries={khataEntries}
    />
  );
};

export default DashboardPage;
