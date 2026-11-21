import React, { useState } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import AddSpendModal from '../components/AddSpendModal';
import SavingsGoalCard from '../components/SavingsGoalCard';
import EmptyState from '../components/EmptyState';
import { useSpending } from '../state/SpendingContext';

export default function GoalsPage() {
    const { savingsGoals, addGoal, updateGoal, deleteGoal } = useSpending();
    const [showAdd, setShowAdd] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [contributingGoal, setContributingGoal] = useState(null);

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setShowGoalModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            deleteGoal(id);
        }
    };

    const handleContribute = (goal) => {
        setContributingGoal(goal);
        setShowContributeModal(true);
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
            <Header />
            <main className="flex-1 px-4 pb-28">
                <div className="flex items-center justify-between pt-5 pb-3">
                    <div>
                        <h2 className="text-slate-900 dark:text-white text-[28px] font-bold leading-tight">
                            Savings Goals
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-base pt-1">
                            Track your progress towards financial goals
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingGoal(null);
                            setShowGoalModal(true);
                        }}
                        className="px-4 py-2 rounded-lg gradient-primary text-white font-medium hover:shadow-glow transition-shadow flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Add Goal
                    </button>
                </div>

                {savingsGoals.length === 0 ? (
                    <EmptyState
                        icon="savings"
                        title="No savings goals yet"
                        message="Set savings goals to track your progress and achieve your financial dreams."
                        action={
                            <button
                                onClick={() => setShowGoalModal(true)}
                                className="px-6 py-3 rounded-lg gradient-primary text-white font-medium hover:shadow-glow transition-shadow"
                            >
                                Create Your First Goal
                            </button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {savingsGoals.map((goal) => (
                            <SavingsGoalCard
                                key={goal.id}
                                goal={goal}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onContribute={handleContribute}
                            />
                        ))}
                    </div>
                )}
            </main>
            <BottomNavigation onAdd={() => setShowAdd(true)} />
            <AddSpendModal open={showAdd} onClose={() => setShowAdd(false)} />
            <GoalModal
                open={showGoalModal}
                onClose={() => {
                    setShowGoalModal(false);
                    setEditingGoal(null);
                }}
                goal={editingGoal}
                onSave={(data) => {
                    if (editingGoal) {
                        updateGoal({ ...editingGoal, ...data });
                    } else {
                        addGoal(data);
                    }
                    setShowGoalModal(false);
                    setEditingGoal(null);
                }}
            />
            <ContributeModal
                open={showContributeModal}
                onClose={() => {
                    setShowContributeModal(false);
                    setContributingGoal(null);
                }}
                goal={contributingGoal}
                onSave={(amount) => {
                    if (contributingGoal) {
                        const newAmount = contributingGoal.currentAmount + amount;
                        updateGoal({ ...contributingGoal, currentAmount: newAmount });
                    }
                    setShowContributeModal(false);
                    setContributingGoal(null);
                }}
            />
        </div>
    );
}

function GoalModal({ open, onClose, goal, onSave }) {
    const [name, setName] = useState(goal?.name || '');
    const [targetAmount, setTargetAmount] = useState(goal?.targetAmount || '');
    const [currentAmount, setCurrentAmount] = useState(goal?.currentAmount || '0');
    const [targetDate, setTargetDate] = useState(
        goal?.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : ''
    );
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (open) {
            setName(goal?.name || '');
            setTargetAmount(goal?.targetAmount || '');
            setCurrentAmount(goal?.currentAmount || '0');
            setTargetDate(goal?.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : '');
            setError('');
        }
    }, [open, goal]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const numTarget = Number(targetAmount);
        const numCurrent = Number(currentAmount);
        if (!name.trim()) {
            setError('Please enter a goal name');
            return;
        }
        if (!numTarget || numTarget <= 0) {
            setError('Please enter a valid target amount');
            return;
        }
        if (!targetDate) {
            setError('Please select a target date');
            return;
        }
        onSave({ name, targetAmount: numTarget, currentAmount: numCurrent, targetDate });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full sm:max-w-md sm:rounded-xl bg-white dark:bg-background-dark p-4 sm:p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-slide-up">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {goal ? 'Edit Goal' : 'Create Savings Goal'}
                </h3>
                {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Goal Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Emergency Fund, New Car"
                            className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Target Amount
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                placeholder="100000"
                                className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Current Amount
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={currentAmount}
                                onChange={(e) => setCurrentAmount(e.target.value)}
                                placeholder="0"
                                className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Target Date
                        </label>
                        <input
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
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
                            {goal ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ContributeModal({ open, onClose, goal, onSave }) {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (open) {
            setAmount('');
            setError('');
        }
    }, [open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        onSave(numAmount);
    };

    if (!open || !goal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full sm:max-w-md sm:rounded-xl bg-white dark:bg-background-dark p-4 sm:p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-slide-up">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Add Contribution
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Contributing to: <span className="font-medium">{goal.name}</span>
                </p>
                {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Contribution Amount
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="5000"
                            autoFocus
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
                            className="px-4 py-2 rounded-md gradient-success text-white hover:shadow-glow transition-shadow"
                        >
                            Add Contribution
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
