import React from 'react';

const Header = () => {
  return (
    <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10">
      <div className="flex size-12 shrink-0 items-center justify-start">
        <span className="material-symbols-outlined text-3xl text-primary">
          account_balance_wallet
        </span>
      </div>
      <h1 className="text-primary dark:text-white/90 text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
        SmartSpendAI
      </h1>
      <div className="flex w-12 items-center justify-end">
        <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-slate-800 dark:text-slate-200 gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined text-slate-800 dark:text-slate-200">
            settings
          </span>
        </button>
      </div>
    </div>
  );
};

export default Header;
