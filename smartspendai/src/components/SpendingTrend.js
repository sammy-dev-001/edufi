import React, { useMemo, useState } from 'react';
import { useSpending } from '../state/SpendingContext';

const SpendingTrend = () => {
  const [activeTab, setActiveTab] = useState('week');
  const { transactions } = useSpending();

  const heights = useMemo(() => {
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const rangeDays = activeTab === 'week' ? 7 : activeTab === 'month' ? 30 : 365;
    const buckets = 7;
    const bucketMs = (rangeDays * dayMs) / buckets;
    const start = now.getTime() - rangeDays * dayMs;
    const sums = new Array(buckets).fill(0);
    for (const t of transactions) {
      if (t.amount >= 0) continue;
      const time = new Date(t.date).getTime();
      if (!Number.isFinite(time)) continue;
      if (time < start || time > now.getTime()) continue;
      const idx = Math.min(buckets - 1, Math.floor((time - start) / bucketMs));
      sums[idx] += Math.abs(t.amount);
    }
    const max = Math.max(0, ...sums);
    if (max <= 0) return new Array(buckets).fill(10);
    return sums.map((v) => Math.max(10, Math.round((v / max) * 100)));
  }, [transactions, activeTab]);

  return (
    <div className="pt-8">
      <div className="flex justify-between items-center pb-3">
        <h3 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
          Spending Trend
        </h3>
        <div className="flex items-center gap-1 rounded-full bg-slate-200 dark:bg-slate-800 p-1 text-sm">
          <button 
            onClick={() => setActiveTab('week')}
            className={`px-3 py-1 rounded-full ${activeTab === 'week' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 font-medium'}`}
          >
            Week
          </button>
          <button 
            onClick={() => setActiveTab('month')}
            className={`px-3 py-1 rounded-full ${activeTab === 'month' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 font-medium'}`}
          >
            Month
          </button>
          <button 
            onClick={() => setActiveTab('year')}
            className={`px-3 py-1 rounded-full ${activeTab === 'year' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 font-medium'}`}
          >
            Year
          </button>
        </div>
      </div>
      <div className="h-48 w-full rounded-xl bg-white dark:bg-background-dark/50 border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-end justify-around">
        {heights.map((height, index) => (
          <div
            key={index}
            className={`w-4 rounded-t-lg ${index === heights.length - 1 ? 'bg-primary' : 'bg-primary/20'}`}
            style={{ height: `${height}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default SpendingTrend;
