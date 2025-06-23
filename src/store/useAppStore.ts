// src/store/useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Budget, EMI, Transaction, KhataEntry, KhataPayment } from '../types';

type AppState = {
    budgets: Budget[];
    setBudgets: (budgets: Budget[]) => void;

    emis: EMI[];
    setEMIs: (emis: EMI[]) => void;

    transactions: Transaction[];
    setTransactions: (txns: Transaction[]) => void;

    khataEntries: KhataEntry[];
    setKhataEntries: (entries: KhataEntry[]) => void;

    khataPayments: KhataPayment[];
    setKhataPayments: (payments: KhataPayment[]) => void;
};

interface AppStoreSetters {
    setBudgets: (budgets: Budget[]) => void;
    setEMIs: (emis: EMI[]) => void;
    setTransactions: (txns: Transaction[]) => void;
    setKhataEntries: (entries: KhataEntry[]) => void;
    setKhataPayments: (payments: KhataPayment[]) => void;
}

interface AppStoreState {
    budgets: Budget[];
    emis: EMI[];
    transactions: Transaction[];
    khataEntries: KhataEntry[];
    khataPayments: KhataPayment[];
}

type AppStore = AppStoreState & AppStoreSetters;

export const useAppStore = create<AppStore>()(
    persist(
        (set, get, store): AppStore => ({
            budgets: [],
            setBudgets: (budgets: Budget[]) => set({ budgets }),

            emis: [],
            setEMIs: (value) =>
                set((state) => ({
                    emis: typeof value === 'function' ? (value as (prev: EMI[]) => EMI[])(state.emis) : value,
                })),
            transactions: [],
            setTransactions: (transactions: Transaction[]) => set({ transactions }),

            khataEntries: [],
            setKhataEntries: (entries: KhataEntry[]) => set({ khataEntries: entries }),

            khataPayments: [],
            setKhataPayments: (payments: KhataPayment[]) => set({ khataPayments: payments }),
        }),
        {
            name: 'fund-manager-store', // key in localStorage
        }
    )
);
