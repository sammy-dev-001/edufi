import React, { useState } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import AddSpendModal from '../components/AddSpendModal';
import BudgetCard from '../components/BudgetCard';
import EmptyState from '../components/EmptyState';
import { useSpending } from '../state/SpendingContext';

export default function BudgetsPage() {
    const { budgets, categories, addBudget, updateBudget, deleteBudget } = useSpending();
    const [showAdd, setShowAdd] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const handleEdit = (budget) => {
        setEditingBudget(budget);
        setShowBudgetModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            deleteBudget(id);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
            <Header />
            <main className="flex-1 px-4 pb-28">
                <div className="flex items-center justify-between pt-5 pb-3">
                    <div>
                        <h2 className="text-slate-900 dark:text-white text-[28px] font-bold leading-tight">
                            Budgets
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-base pt-1">
                            Track and manage your spending limits
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingBudget(null);
                            setShowBudgetModal(true);
                        }}
                        className="px-4 py-2 rounded-lg gradient-primary text-white font-medium hover:shadow-glow transition-shadow flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Add Budget
                    </button>
                </div>

                {budgets.length === 0 ? (
                    <EmptyState
                        icon="account_balance_wallet"
                        title="No budgets yet"
                        message="Create budgets to track your spending and stay on top of your finances."
                        action={
                            <button
                                onClick={() => setShowBudgetModal(true)}
                                className="px-6 py-3 rounded-lg gradient-primary text-white font-medium hover:shadow-glow transition-shadow"
                            >
                                Create Your First Budget
                            </button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {budgets.map((budget) => (
                            <BudgetCard
                                key={budget.id}
                                budget={budget}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </main>
            <BottomNavigation onAdd={() => setShowAdd(true)} />
            <AddSpendModal open={showAdd} onClose={() => setShowAdd(false)} />
            <BudgetModal
                open={showBudgetModal}
                onClose={() => {
                    setShowBudgetModal(false);
                    setEditingBudget(null);
                }}
                budget={editingBudget}
                categories={categories}
                onSave={(data) => {
                    if (editingBudget) {
                        updateBudget({ ...editingBudget, ...data });
                    } else {
                        addBudget(data);
                    }
                    setShowBudgetModal(false);
                    setEditingBudget(null);
                }}
            />
        </div>
    );
}

function BudgetModal({ open, onClose, budget, categories, onSave }) {
    const [category, setCategory] = useState(budget?.category || categories[0] || '');
    const [amount, setAmount] = useState(budget?.amount || '');
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (open) {
            setCategory(budget?.category || categories[0] || '');
            setAmount(budget?.amount || '');
            setError('');
        }
    }, [open, budget, categories]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        onSave({ category, amount: numAmount });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full sm:max-w-md sm:rounded-xl bg-white dark:bg-background-dark p-4 sm:p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-slide-up">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {budget ? 'Edit Budget' : 'Create Budget'}
                </h3>
                {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Monthly Budget Amount
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="50000"
                            className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-md gradient-primary text-white hover:shadow-glow transition-shadow"
                        >
                            {budget ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
