import React, { useState, useEffect } from 'react';
import { useSpending } from '../state/SpendingContext';
import { generateFinancialInsights } from '../services/ai';
import LoadingSpinner from './LoadingSpinner';

const AIInsight = () => {
  const { transactions, budgets } = useSpending();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchInsights() {
      setLoading(true);
      try {
        const result = await generateFinancialInsights(transactions, budgets);
        if (mounted) {
          setInsights(result);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (transactions.length > 0) {
      fetchInsights();
    } else {
      setLoading(false);
    }

    return () => { mounted = false; };
  }, [transactions, budgets]);

  if (loading) {
    return (
      <div className="mt-8 rounded-xl p-8 bg-white dark:bg-background-dark/50 border border-slate-200 dark:border-slate-800">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  const getIconForType = (type) => {
    switch (type) {
      case 'spending': return 'trending_up';
      case 'savings': return 'savings';
      case 'alert': return 'warning';
      case 'tip': return 'lightbulb';
      default: return 'smart_toy';
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case 'spending': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'savings': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'alert': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'tip': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      default: return 'text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 border-primary/20 dark:border-primary/30';
    }
  };

  return (
    <div className="mt-8 space-y-4">
      {insights.map((insight, index) => (
        <div
          key={index}
          className={`flex items-start gap-4 rounded-xl p-4 border animate-fade-in ${getColorForType(insight.type)}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <span className="material-symbols-outlined text-2xl mt-1">
            {getIconForType(insight.type)}
          </span>
          <div className="flex-1">
            <p className="font-bold text-sm mb-1">{insight.title}</p>
            <p className="text-sm leading-relaxed opacity-90">
              {insight.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AIInsight;
