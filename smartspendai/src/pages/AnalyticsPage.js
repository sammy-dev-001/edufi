import React, { useState } from 'react';
import Header from '../components/Header';
import BalanceCards from '../components/BalanceCards';
import SpendingTrend from '../components/SpendingTrend';
import TopCategories from '../components/TopCategories';
import BottomNavigation from '../components/BottomNavigation';
import AddSpendModal from '../components/AddSpendModal';

export default function AnalyticsPage() {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <Header />
      <main className="flex-1 px-4 pb-28">
        <h2 className="text-slate-900 dark:text-white text-[28px] font-bold leading-tight pt-5">Analytics</h2>
        <p className="text-slate-600 dark:text-slate-400 text-base pb-3 pt-1">Your spending trends and top categories.</p>
        <BalanceCards />
        <SpendingTrend />
        <TopCategories />
      </main>
      <BottomNavigation onAdd={() => setShowAdd(true)} />
      <AddSpendModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
