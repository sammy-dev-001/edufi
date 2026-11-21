import React, { useMemo, useState } from 'react';
import Header from '../components/Header';
import AIInsight from '../components/AIInsight';
import AIChat from '../components/AIChat';
import BottomNavigation from '../components/BottomNavigation';
import AddSpendModal from '../components/AddSpendModal';
import { useSpending } from '../state/SpendingContext';
import { summarizePeriod, predictFutureSpending } from '../services/ai';

export default function AIPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [period, setPeriod] = useState('week');
  const { transactions } = useSpending();
  const summary = useMemo(() => summarizePeriod(transactions, period), [transactions, period]);

  const prediction = useMemo(() => {
    return predictFutureSpending(transactions, null, 1);
  }, [transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <Header />
      <main className="flex-1 px-4 pb-28">
        <h2 className="text-slate-900 dark:text-white text-[28px] font-bold leading-tight pt-5">AI Assistant</h2>
        <p className="text-slate-600 dark:text-slate-400 text-base pb-3 pt-1">Get personalized financial insights and advice</p>

        {/* Summary Section */}
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Summary</h3>
          <div className="flex items-center gap-1 rounded-full bg-slate-200 dark:bg-slate-800 p-1 text-sm">
            <button onClick={() => setPeriod('week')} className={`px-3 py-1 rounded-full transition-all ${period === 'week' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 font-medium'}`}>Week</button>
            <button onClick={() => setPeriod('month')} className={`px-3 py-1 rounded-full transition-all ${period === 'month' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 font-medium'}`}>Month</button>
            <button onClick={() => setPeriod('year')} className={`px-3 py-1 rounded-full transition-all ${period === 'year' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 font-medium'}`}>Year</button>
          </div>
        </div>
        <div className="rounded-xl p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 mb-4 animate-fade-in">
          {summary}
        </div>

        {/* Prediction Card */}
        {prediction.predicted > 0 && (
          <div className="rounded-xl p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 shadow-sm mb-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">
                insights
              </span>
              <div className="flex-1">
                <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-1">Next Month Prediction</h4>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  Based on your spending patterns, you're likely to spend around <span className="font-bold">{formatCurrency(prediction.predicted)}</span> next month.
                  {prediction.trend !== 'stable' && (
                    <span className="ml-1">
                      Your spending is <span className="font-semibold">{prediction.trend}</span>.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights */}
        <AIInsight />

        {/* AI Chat */}
        <div className="mt-8">
          <h3 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">
            Ask AI Anything
          </h3>
          <AIChat />
        </div>
      </main>
      <BottomNavigation onAdd={() => setShowAdd(true)} />
      <AddSpendModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
