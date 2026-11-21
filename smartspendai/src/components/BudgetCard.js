import React, { useMemo } from 'react';
import { useSpending } from '../state/SpendingContext';

export default function BudgetCard({ budget, onEdit, onDelete }) {
    const { transactions } = useSpending();

    const spent = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.category === budget.category &&
                    t.amount < 0 &&
                    date >= startOfMonth;
            })
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }, [transactions, budget.category]);

    const percentage = (spent / budget.amount) * 100;
    const remaining = budget.amount - spent;
    const isOverBudget = spent > budget.amount;
    const isNearLimit = percentage >= 80 && !isOverBudget;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getProgressColor = () => {
        if (isOverBudget) return 'bg-red-500';
        if (isNearLimit) return 'bg-amber-500';
        return 'bg-green-500';
    };

    return (
        <div className="rounded-xl p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{budget.category}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formatCurrency(spent)} of {formatCurrency(budget.amount)}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(budget)}
                        className="p-1 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light"
                    >
                        <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button
                        onClick={() => onDelete(budget.id)}
                        className="p-1 text-slate-600 dark:text-slate-400 hover:text-red-500"
                    >
                        <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                    className={`h-full ${getProgressColor()} transition-all duration-500`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${isOverBudget ? 'text-red-600 dark:text-red-400' : isNearLimit ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                    {isOverBudget ? `Over by ${formatCurrency(Math.abs(remaining))}` : `${formatCurrency(remaining)} left`}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                    {percentage.toFixed(0)}%
                </span>
            </div>

            {isOverBudget && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-xs text-red-700 dark:text-red-300">
                        ⚠️ You've exceeded your budget for this category
                    </p>
                </div>
            )}

            {isNearLimit && !isOverBudget && (
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                        ⚡ You're approaching your budget limit
                    </p>
                </div>
            )}
        </div>
    );
}
