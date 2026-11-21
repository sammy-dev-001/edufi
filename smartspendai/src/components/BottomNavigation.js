import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNavigation = ({ onAdd }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="flex h-20 items-center justify-around px-2 max-w-screen-xl mx-auto">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive('/') ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light'}`}
        >
          <span className="material-symbols-outlined">{isActive('/') ? 'home' : 'home'}</span>
          <span className={`text-xs ${isActive('/') ? 'font-semibold' : 'font-medium'}`}>Home</span>
        </Link>
        <Link
          to="/budgets"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive('/budgets') ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light'}`}
        >
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className={`text-xs ${isActive('/budgets') ? 'font-semibold' : 'font-medium'}`}>Budgets</span>
        </Link>
        <div className="relative -top-6">
          <button onClick={onAdd} className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-white shadow-lg shadow-primary/30 hover:shadow-glow transition-all">
            <span className="material-symbols-outlined text-4xl">add</span>
          </button>
        </div>
        <Link
          to="/goals"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive('/goals') ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light'}`}
        >
          <span className="material-symbols-outlined">savings</span>
          <span className={`text-xs ${isActive('/goals') ? 'font-semibold' : 'font-medium'}`}>Goals</span>
        </Link>
        <Link
          to="/ai"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive('/ai') ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light'}`}
        >
          <span className="material-symbols-outlined">smart_toy</span>
          <span className={`text-xs ${isActive('/ai') ? 'font-semibold' : 'font-medium'}`}>AI</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavigation;
