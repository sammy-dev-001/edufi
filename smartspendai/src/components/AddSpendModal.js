import React, { useEffect, useState } from 'react';
import { useSpending } from '../state/SpendingContext';
import { classifyCategory } from '../services/ai';

export default function AddSpendModal({ open, onClose }) {
  const { categories, addTransaction } = useSpending();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Other');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [suggested, setSuggested] = useState('');
  const [categoryTouched, setCategoryTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setType('expense');
      setAmount('');
      setCategory(categories[0] || 'Other');
      setDate(new Date().toISOString().slice(0, 10));
      setNote('');
      setError('');
      setSuggested('');
      setCategoryTouched(false);
    }
  }, [open, categories]);

  useEffect(() => {
    let mounted = true;
    if (!open) return;
    classifyCategory(note, categories).then((c) => {
      if (!mounted) return;
      setSuggested(c || '');
      if (!categoryTouched && c && c !== category) setCategory(c);
    });
    return () => { mounted = false; };
  }, [note, categories, open, categoryTouched]);

  if (!open) return null;

  function onSubmit(e) {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!category) {
      setError('Pick a category');
      return;
    }
    addTransaction({ type, amount: n, category, date, note });
    onClose?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md sm:rounded-xl bg-white dark:bg-background-dark p-4 sm:p-6 shadow-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add transaction</h3>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        <form className="mt-4 grid grid-cols-1 gap-4" onSubmit={onSubmit}>
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 w-fit">
            <button type="button" onClick={() => setType('expense')} className={`px-3 py-1 rounded-md text-sm ${type==='expense' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-700 dark:text-slate-300'}`}>Expense</button>
            <button type="button" onClick={() => setType('income')} className={`px-3 py-1 rounded-md text-sm ${type==='income' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-700 dark:text-slate-300'}`}>Income</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={(e)=>setAmount(e.target.value)} className="mt-1 w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-primary focus:border-primary" placeholder="0.00" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
            <select value={category} onChange={(e)=>{ setCategory(e.target.value); setCategoryTouched(true); }} className="mt-1 w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-primary focus:border-primary">
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {suggested && suggested !== category && (
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Suggested: <button type="button" onClick={() => { setCategory(suggested); setCategoryTouched(true); }} className="underline text-primary">{suggested}</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
              <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="mt-1 w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Note</label>
              <input type="text" value={note} onChange={(e)=>setNote(e.target.value)} className="mt-1 w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-primary focus:border-primary" placeholder="e.g. Lunch" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
