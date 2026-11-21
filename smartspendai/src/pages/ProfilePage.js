import React, { useRef, useState } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import AddSpendModal from '../components/AddSpendModal';
import { useSpending } from '../state/SpendingContext';

export default function ProfilePage() {
  const [showAdd, setShowAdd] = useState(false);
  const { transactions, clearAll, replaceTransactions } = useSpending();
  const fileRef = useRef(null);

  function doExport() {
    const data = JSON.stringify({ transactions }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartspend-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function onImportClick() {
    fileRef.current?.click();
  }

  function onImportChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed.transactions) ? parsed.transactions : [];
        replaceTransactions(list);
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = '';
  }
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <Header />
      <main className="flex-1 px-4 pb-28">
        <h2 className="text-slate-900 dark:text-white text-[28px] font-bold leading-tight pt-5">Profile</h2>
        <p className="text-slate-600 dark:text-slate-400 text-base pb-3 pt-1">Account and preferences.</p>
        <div className="mt-4 grid gap-4">
          <div className="rounded-xl p-4 bg-white dark:bg-background-dark/50 border border-slate-200 dark:border-slate-800">
            <div className="text-sm text-slate-600 dark:text-slate-400">Coming soon: budgets, currency, export, and AI settings.</div>
          </div>
          <div className="rounded-xl p-4 bg-white dark:bg-background-dark/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">Data tools</div>
              <div className="flex gap-2">
                <button onClick={doExport} className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">Export JSON</button>
                <button onClick={onImportClick} className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">Import JSON</button>
                <button onClick={clearAll} className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-500 text-sm">Clear Data</button>
              </div>
            </div>
            <input ref={fileRef} onChange={onImportChange} type="file" accept="application/json" className="hidden" />
          </div>
        </div>
      </main>
      <BottomNavigation onAdd={() => setShowAdd(true)} />
      <AddSpendModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
