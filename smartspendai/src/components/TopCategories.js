import React from 'react';
import { useSpending } from '../state/SpendingContext';

const palette = {
  Food: { avatarBg: 'bg-orange-100 dark:bg-orange-900/50', avatarText: 'text-orange-500 dark:text-orange-400', bar: 'bg-orange-500', icon: 'restaurant' },
  Data: { avatarBg: 'bg-blue-100 dark:bg-blue-900/50', avatarText: 'text-blue-500 dark:text-blue-400', bar: 'bg-blue-500', icon: 'wifi' },
  Transport: { avatarBg: 'bg-purple-100 dark:bg-purple-900/50', avatarText: 'text-purple-500 dark:text-purple-400', bar: 'bg-purple-500', icon: 'commute' },
  Bills: { avatarBg: 'bg-indigo-100 dark:bg-indigo-900/50', avatarText: 'text-indigo-500 dark:text-indigo-400', bar: 'bg-indigo-500', icon: 'receipt_long' },
  Shopping: { avatarBg: 'bg-pink-100 dark:bg-pink-900/50', avatarText: 'text-pink-500 dark:text-pink-400', bar: 'bg-pink-500', icon: 'shopping_bag' },
  Health: { avatarBg: 'bg-emerald-100 dark:bg-emerald-900/50', avatarText: 'text-emerald-500 dark:text-emerald-400', bar: 'bg-emerald-500', icon: 'health_and_safety' },
  Entertainment: { avatarBg: 'bg-violet-100 dark:bg-violet-900/50', avatarText: 'text-violet-500 dark:text-violet-400', bar: 'bg-violet-500', icon: 'music_note' },
  Other: { avatarBg: 'bg-slate-200 dark:bg-slate-800', avatarText: 'text-slate-600 dark:text-slate-300', bar: 'bg-slate-500', icon: 'category' },
};

const TopCategories = () => {
  const { transactions, categories } = useSpending();
  const expenses = transactions.filter(t => t.amount < 0);
  const totals = new Map();
  for (const c of categories) totals.set(c, 0);
  for (const t of expenses) totals.set(t.category, (totals.get(t.category) || 0) + Math.abs(t.amount));
  const rows = Array.from(totals.entries()).map(([name, amount]) => ({ name, amount }));
  rows.sort((a, b) => b.amount - a.amount);
  const nonZero = rows.filter(r => r.amount > 0);
  const totalAmount = nonZero.reduce((s, r) => s + r.amount, 0);
  const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="pt-8">
      <h3 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">
        Top Categories
      </h3>
      {nonZero.length === 0 ? (
        <div className="rounded-xl p-4 bg-white dark:bg-background-dark/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">No expenses yet.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {nonZero.map((category) => {
            const p = palette[category.name] || palette.Other;
            const percent = totalAmount > 0 ? Math.round((category.amount / totalAmount) * 100) : 0;
            return (
              <div
                key={category.name}
                className="flex items-center gap-4 rounded-xl p-4 bg-white dark:bg-background-dark/50 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${p.avatarBg}`}>
                  <span className={`material-symbols-outlined ${p.avatarText}`}>{p.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-slate-800 dark:text-slate-200 font-semibold">{category.name}</p>
                    <p className="text-slate-900 dark:text-white font-bold">{fmt(category.amount)}</p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className={`h-2 rounded-full ${p.bar}`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopCategories;
