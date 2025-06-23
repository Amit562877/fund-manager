'use client';

import React from 'react';
import BudgetPlanning from '../components/BudgetPlanning';
import { useAppStore } from '../store/useAppStore';

const BudgetPlanningPage = () => {
  const budgets = useAppStore((s) => s.budgets);
  const setBudgets = useAppStore((s) => s.setBudgets);
  const transactions = useAppStore((s) => s.transactions);
  const setTransactions = useAppStore((s) => s.setTransactions);

  return (
    <div className="p-6">
      <BudgetPlanning
        budgets={budgets}
        setBudgets={(value) =>
          typeof value === 'function'
            ? setBudgets((value as (prev: typeof budgets) => typeof budgets)(budgets))
            : setBudgets(value)
        }
        transactions={transactions}
        setTransactions={(value) =>
          typeof value === 'function'
            ? setTransactions((value as (prev: typeof transactions) => typeof transactions)(transactions))
            : setTransactions(value)
        }
      />
    </div>
  );
};

export default BudgetPlanningPage;
