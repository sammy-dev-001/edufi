import React from 'react';
import { format } from 'date-fns';

export default function SavingsGoalCard({ goal, onEdit, onDelete, onContribute }) {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    const remaining = goal.targetAmount - goal.currentAmount;
    const isCompleted = goal.currentAmount >= goal.targetAmount;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const daysRemaining = () => {
        const target = new Date(goal.targetDate);
        const today = new Date();
        const diff = target - today;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const days = daysRemaining();

    return (
        <div className={`rounded-xl p-5 border shadow-sm hover:shadow-md transition-all animate-fade-in ${isCompleted
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{goal.name}</h3>
                        {isCompleted && (
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">
                                check_circle
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Target: {formatCurrency(goal.targetAmount)} by {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(goal)}
                        className="p-1 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light"
                    >
                        <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button
                        onClick={() => onDelete(goal.id)}
                        className="p-1 text-slate-600 dark:text-slate-400 hover:text-red-500"
                    >
                        <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                </div>
            </div>

            {/* Progress circle or bar */}
            <div className="relative mb-4">
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-700 ${isCompleted ? 'gradient-success' : 'gradient-primary'
                            }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(goal.currentAmount)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {isCompleted ? 'Goal achieved! 🎉' : `${formatCurrency(remaining)} to go`}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-primary dark:text-primary-light">
                        {percentage.toFixed(0)}%
                    </p>
                    {!isCompleted && days > 0 && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            {days} days left
                        </p>
                    )}
                    {!isCompleted && days <= 0 && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                            Overdue
                        </p>
                    )}
                </div>
            </div>

            {!isCompleted && (
                <button
                    onClick={() => onContribute(goal)}
                    className="w-full py-2 px-4 rounded-lg gradient-primary text-white font-medium hover:shadow-glow transition-shadow"
                >
                    Add Contribution
                </button>
            )}

            {isCompleted && (
                <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-center">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        🎊 Congratulations! You've reached your goal!
                    </p>
                </div>
            )}
        </div>
    );
}
