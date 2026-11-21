import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const STORAGE_KEY = 'smartspend_state_v2';

const defaultCategories = [
  'Food',
  'Transport',
  'Data',
  'Bills',
  'Shopping',
  'Health',
  'Entertainment',
  'Other',
];

const initialState = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        categories: parsed.categories || defaultCategories,
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
        savingsGoals: Array.isArray(parsed.savingsGoals) ? parsed.savingsGoals : [],
        recurringTransactions: Array.isArray(parsed.recurringTransactions) ? parsed.recurringTransactions : [],
      };
    }
  } catch { }
  return {
    categories: defaultCategories,
    transactions: [],
    budgets: [],
    savingsGoals: [],
    recurringTransactions: [],
  };
})();

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TRANSACTION': {
      const tx = action.payload;
      const transactions = [tx, ...state.transactions].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      return { ...state, transactions };
    }
    case 'REMOVE_TRANSACTION': {
      const id = action.payload;
      return { ...state, transactions: state.transactions.filter(t => t.id !== id) };
    }
    case 'CLEAR_ALL': {
      return { ...state, transactions: [] };
    }
    case 'SET_TRANSACTIONS': {
      const list = Array.isArray(action.payload) ? action.payload : [];
      const transactions = list
        .filter(t => t && typeof t === 'object')
        .map(t => ({
          id: String(t.id || `${Date.now()}-${Math.floor(Math.random() * 1e6)}`),
          type: t.type === 'income' ? 'income' : 'expense',
          amount: Number(t.amount),
          category: String(t.category || 'Other'),
          date: new Date(t.date || Date.now()).toISOString(),
          note: String(t.note || ''),
        }))
        .filter(t => Number.isFinite(t.amount) && t.amount !== 0)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      return { ...state, transactions };
    }
    case 'UPDATE_TRANSACTION': {
      const next = state.transactions.map((t) =>
        t.id === action.payload.id ? { ...t, ...action.payload } : t
      ).sort((a, b) => new Date(b.date) - new Date(a.date));
      return { ...state, transactions: next };
    }
    case 'ADD_BUDGET': {
      const budget = action.payload;
      return { ...state, budgets: [...state.budgets, budget] };
    }
    case 'UPDATE_BUDGET': {
      const updated = state.budgets.map(b =>
        b.id === action.payload.id ? { ...b, ...action.payload } : b
      );
      return { ...state, budgets: updated };
    }
    case 'DELETE_BUDGET': {
      return { ...state, budgets: state.budgets.filter(b => b.id !== action.payload) };
    }
    case 'ADD_GOAL': {
      const goal = action.payload;
      return { ...state, savingsGoals: [...state.savingsGoals, goal] };
    }
    case 'UPDATE_GOAL': {
      const updated = state.savingsGoals.map(g =>
        g.id === action.payload.id ? { ...g, ...action.payload } : g
      );
      return { ...state, savingsGoals: updated };
    }
    case 'DELETE_GOAL': {
      return { ...state, savingsGoals: state.savingsGoals.filter(g => g.id !== action.payload) };
    }
    case 'ADD_RECURRING': {
      const recurring = action.payload;
      return { ...state, recurringTransactions: [...state.recurringTransactions, recurring] };
    }
    case 'UPDATE_RECURRING': {
      const updated = state.recurringTransactions.map(r =>
        r.id === action.payload.id ? { ...r, ...action.payload } : r
      );
      return { ...state, recurringTransactions: updated };
    }
    case 'DELETE_RECURRING': {
      return { ...state, recurringTransactions: state.recurringTransactions.filter(r => r.id !== action.payload) };
    }
    default:
      return state;
  }
}

const SpendingContext = createContext(null);

export function SpendingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { }
  }, [state]);

  const actions = useMemo(() => ({
    addTransaction: ({ type = 'expense', amount, category, date, note }) => {
      const id = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      const normalizedAmount = Number(amount);
      if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) return;
      const value = type === 'income' ? Math.abs(normalizedAmount) : -Math.abs(normalizedAmount);
      const tx = {
        id,
        type,
        amount: value,
        category,
        date: new Date(date || Date.now()).toISOString(),
        note: note || '',
      };
      dispatch({ type: 'ADD_TRANSACTION', payload: tx });
    },
    removeTransaction: (id) => dispatch({ type: 'REMOVE_TRANSACTION', payload: id }),
    clearAll: () => dispatch({ type: 'CLEAR_ALL' }),
    replaceTransactions: (list) => dispatch({ type: 'SET_TRANSACTIONS', payload: list }),
    updateTransaction: (tx) => dispatch({ type: 'UPDATE_TRANSACTION', payload: tx }),

    // Budget actions
    addBudget: ({ category, amount, period = 'monthly' }) => {
      const id = `budget-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      dispatch({ type: 'ADD_BUDGET', payload: { id, category, amount: Number(amount), period } });
    },
    updateBudget: (budget) => dispatch({ type: 'UPDATE_BUDGET', payload: budget }),
    deleteBudget: (id) => dispatch({ type: 'DELETE_BUDGET', payload: id }),

    // Savings goal actions
    addGoal: ({ name, targetAmount, currentAmount = 0, targetDate, category = 'Savings' }) => {
      const id = `goal-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      dispatch({
        type: 'ADD_GOAL',
        payload: {
          id,
          name,
          targetAmount: Number(targetAmount),
          currentAmount: Number(currentAmount),
          targetDate: new Date(targetDate).toISOString(),
          category,
          createdAt: new Date().toISOString()
        }
      });
    },
    updateGoal: (goal) => dispatch({ type: 'UPDATE_GOAL', payload: goal }),
    deleteGoal: (id) => dispatch({ type: 'DELETE_GOAL', payload: id }),

    // Recurring transaction actions
    addRecurring: ({ type = 'expense', amount, category, note, frequency = 'monthly', startDate, endDate = null }) => {
      const id = `recurring-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      dispatch({
        type: 'ADD_RECURRING',
        payload: {
          id,
          type,
          amount: Number(amount),
          category,
          note,
          frequency,
          startDate: new Date(startDate).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : null,
          lastProcessed: null
        }
      });
    },
    updateRecurring: (recurring) => dispatch({ type: 'UPDATE_RECURRING', payload: recurring }),
    deleteRecurring: (id) => dispatch({ type: 'DELETE_RECURRING', payload: id }),
  }), []);

  const value = useMemo(() => ({
    categories: state.categories,
    transactions: state.transactions,
    budgets: state.budgets,
    savingsGoals: state.savingsGoals,
    recurringTransactions: state.recurringTransactions,
    ...actions,
  }), [state, actions]);

  return (
    <SpendingContext.Provider value={value}>{children}</SpendingContext.Provider>
  );
}

export function useSpending() {
  const ctx = useContext(SpendingContext);
  if (!ctx) throw new Error('useSpending must be used within SpendingProvider');
  return ctx;
}
