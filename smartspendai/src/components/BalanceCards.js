import React from 'react';
import { useSpending } from '../state/SpendingContext';

const BalanceCards = () => {
  const { transactions } = useSpending();
  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const balance = income - expenses;
  const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
      <div className="flex flex-col gap-2 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-all animate-fade-in">
        <div className="flex items-center justify-between">
          <p className="text-blue-700 dark:text-blue-300 text-base font-medium leading-normal">Total balance</p>
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">account_balance_wallet</span>
        </div>
        <p className="text-slate-900 dark:text-white tracking-light text-3xl font-bold leading-tight">{fmt(balance)}</p>
      </div>
      <div className="flex flex-col gap-2 rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 shadow-md hover:shadow-lg transition-all animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between">
          <p className="text-green-700 dark:text-green-300 text-base font-medium leading-normal">Total income</p>
          <span className="material-symbols-outlined text-green-600 dark:text-green-400">trending_up</span>
        </div>
        <p className="text-green-600 dark:text-green-400 tracking-light text-3xl font-bold leading-tight">{fmt(income)}</p>
      </div>
      <div className="flex flex-col gap-2 rounded-xl p-6 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 shadow-md hover:shadow-lg transition-all animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between">
          <p className="text-red-700 dark:text-red-300 text-base font-medium leading-normal">Total expenses</p>
          <span className="material-symbols-outlined text-red-600 dark:text-red-400">trending_down</span>
        </div>
        <p className="text-red-600 dark:text-red-400 tracking-light text-3xl font-bold leading-tight">{fmt(expenses)}</p>
      </div>
    </div>
  );
};

export default BalanceCards;
