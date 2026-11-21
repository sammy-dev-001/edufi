import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import BalanceCards from './components/BalanceCards';
import SpendingTrend from './components/SpendingTrend';
import TopCategories from './components/TopCategories';
import AIInsight from './components/AIInsight';
import BottomNavigation from './components/BottomNavigation';
import AddSpendModal from './components/AddSpendModal';
import TransactionsList from './components/TransactionsList';
import AnalyticsPage from './pages/AnalyticsPage';
import AIPage from './pages/AIPage';
import ProfilePage from './pages/ProfilePage';
import BudgetsPage from './pages/BudgetsPage';
import GoalsPage from './pages/GoalsPage';

function Home() {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
      <Header />
      <main className="flex-1 px-4 pb-28">
        <h2 className="text-slate-900 dark:text-white tracking-light text-[28px] font-bold leading-tight pt-5">
          Hey Samuel 👋
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-normal pb-3 pt-1">
          Here's your spending summary.
        </p>
        <BalanceCards />
        <SpendingTrend />
        <TopCategories />
        <AIInsight />
        <TransactionsList />
      </main>
      <BottomNavigation onAdd={() => setShowAdd(true)} />
      <AddSpendModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/ai" element={<AIPage />} />
      <Route path="/budgets" element={<BudgetsPage />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;
