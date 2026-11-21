import React from 'react';
import { useSpending } from '../state/SpendingContext';
import EmptyState from './EmptyState';

function formatDate(d) {
  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function groupByDate(transactions) {
  const groups = new Map();
  for (const t of transactions) {
    const key = new Date(t.date).toISOString().slice(0, 10);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }
  return Array.from(groups.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

const categoryIcons = {
  'Food': 'restaurant',
  'Transport': 'directions_car',
  'Data': 'wifi',
  'Bills': 'receipt_long',
  'Shopping': 'shopping_bag',
  'Health': 'health_and_safety',
  'Entertainment': 'movie',
  'Other': 'category',
};

export default function TransactionsList() {
  const { transactions, removeTransaction } = useSpending();
  const sections = groupByDate(transactions);
  const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Math.abs(n));

  if (transactions.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState
          icon="receipt_long"
          title="No transactions yet"
          message="Start tracking your finances by adding your first transaction."
        />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight">Recent Transactions</h3>
      {sections.map(([day, items], sectionIndex) => (
        <div key={day} className="animate-fade-in" style={{ animationDelay: `${sectionIndex * 50}ms` }}>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{formatDate(day)}</div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm">
            {items.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${t.amount < 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'} shadow-sm`}>
                    <span className="material-symbols-outlined text-lg">{categoryIcons[t.category] || 'category'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{t.category}</div>
                    {t.note && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.note}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-sm font-semibold ${t.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {t.amount < 0 ? '-' : '+'}{fmt(t.amount)}
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this transaction?')) {
                        removeTransaction(t.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
