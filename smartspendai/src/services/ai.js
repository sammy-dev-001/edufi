import { GEMINI_API_KEY, GEMINI_MODEL } from '../config/gemini';

// Backend API URL (for production, update this)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Format currency for Nigerian Naira
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper to prepare financial context for API
function prepareFinancialContext(transactions, budgets = [], goals = []) {
  const now = new Date();
  const last30Days = transactions.filter(t => {
    const date = new Date(t.date);
    const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30;
  });

  const expenses = last30Days.filter(t => t.amount < 0);
  const income = last30Days.filter(t => t.amount >= 0);

  const totalExpense = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Category breakdown
  const categoryMap = new Map();
  expenses.forEach(t => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + Math.abs(t.amount));
  });
  const topCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    totalIncome,
    totalExpense,
    balance,
    topCategories,
    transactionCount: last30Days.length,
    budgetCount: budgets.length,
    goalCount: goals.length,
    savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0
  };
}

// Simple rule-based category classification (fast fallback)
export async function classifyCategory(note, categories) {
  const n = (note || '').toLowerCase();
  const map = [
    { k: ['food', 'restaurant', 'kfc', 'eat', 'lunch', 'dinner', 'breakfast'], c: 'Food' },
    { k: ['data', 'mtn', 'airtel', 'glo', 'bundle', 'internet', 'wifi'], c: 'Data' },
    { k: ['uber', 'bolt', 'bus', 'taxi', 'transport', 'fuel', 'gas'], c: 'Transport' },
    { k: ['bill', 'electric', 'power', 'water', 'rent', 'dstv', 'utility'], c: 'Bills' },
    { k: ['shop', 'market', 'jumia', 'mall', 'clothes', 'shoe'], c: 'Shopping' },
    { k: ['health', 'drug', 'pharmacy', 'hospital', 'clinic', 'doctor'], c: 'Health' },
    { k: ['movie', 'cinema', 'music', 'netflix', 'game', 'spotify'], c: 'Entertainment' },
  ];
  for (const r of map) if (r.k.some(w => n.includes(w)) && categories.includes(r.c)) return r.c;
  return categories.includes('Other') ? 'Other' : categories[0] || 'Other';
}

// Quick summary of period (no AI needed)
export function summarizePeriod(transactions, period) {
  const now = new Date();
  const ms = 24 * 60 * 60 * 1000;
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
  const start = now.getTime() - days * ms;
  let income = 0, expense = 0;
  const byCat = new Map();
  for (const t of transactions) {
    const time = new Date(t.date).getTime();
    if (!Number.isFinite(time) || time < start || time > now.getTime()) continue;
    if (t.amount >= 0) income += t.amount; else expense += Math.abs(t.amount);
    if (t.amount < 0) byCat.set(t.category, (byCat.get(t.category) || 0) + Math.abs(t.amount));
  }
  const top = Array.from(byCat.entries()).sort((a, b) => b[1] - a[1])[0];
  const parts = [];
  parts.push(`Income ${formatCurrency(income)}`);
  parts.push(`Expenses ${formatCurrency(expense)}`);
  if (top) parts.push(`Top: ${top[0]} ${formatCurrency(top[1])}`);
  return parts.join(' • ');
}

// Intelligent fallback responses when API is unavailable
function generateFallbackResponse(query, transactions, budgets, goals) {
  const totalExpense = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalIncome = transactions
    .filter(t => t.amount >= 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Calculate category breakdown
  const categoryMap = new Map();
  transactions.filter(t => t.amount < 0).forEach(t => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + Math.abs(t.amount));
  });
  const topCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const queryLower = query.toLowerCase();

  // Pattern matching for common questions
  if (queryLower.includes('save') || queryLower.includes('saving')) {
    if (balance > 0) {
      return `Great news! You have a positive balance of ${formatCurrency(balance)}. Consider setting up a savings goal to track your progress. ${topCategories.length > 0 ? `You could also reduce spending on ${topCategories[0][0]} (${formatCurrency(topCategories[0][1])}) to save more.` : ''}`;
    } else {
      return `Your expenses (${formatCurrency(totalExpense)}) exceed your income (${formatCurrency(totalIncome)}). Focus on reducing spending in your top categories${topCategories.length > 0 ? ` like ${topCategories[0][0]}` : ''} to start saving.`;
    }
  }

  if (queryLower.includes('spend') || queryLower.includes('expense')) {
    if (topCategories.length > 0) {
      return `Your top spending categories are: ${topCategories.map(([cat, amt]) => `${cat} (${formatCurrency(amt)})`).join(', ')}. ${topCategories[0][1] > totalExpense * 0.3 ? `Consider setting a budget for ${topCategories[0][0]} as it's a significant portion of your expenses.` : ''}`;
    } else {
      return `You have ${formatCurrency(totalExpense)} in total expenses. Start tracking your spending by category to identify areas for improvement.`;
    }
  }

  if (queryLower.includes('budget')) {
    if (budgets.length > 0) {
      return `You have ${budgets.length} active budget${budgets.length > 1 ? 's' : ''}. Check the Budgets page to see your progress and make adjustments as needed.`;
    } else {
      return `You haven't set any budgets yet. Based on your spending of ${formatCurrency(totalExpense)}, consider creating budgets for your top categories${topCategories.length > 0 ? ` like ${topCategories[0][0]}` : ''}.`;
    }
  }

  if (queryLower.includes('goal')) {
    if (goals.length > 0) {
      return `You have ${goals.length} savings goal${goals.length > 1 ? 's' : ''} set up. Keep contributing regularly to reach your targets!`;
    } else {
      return `Setting savings goals can help you stay motivated. With a balance of ${formatCurrency(balance)}, consider creating a goal for emergency funds or a specific purchase.`;
    }
  }

  if (queryLower.includes('income')) {
    return `Your total income is ${formatCurrency(totalIncome)} and expenses are ${formatCurrency(totalExpense)}, leaving you with ${balance >= 0 ? 'a surplus' : 'a deficit'} of ${formatCurrency(Math.abs(balance))}.`;
  }

  if (queryLower.includes('reduce') || queryLower.includes('cut') || queryLower.includes('lower')) {
    if (topCategories.length > 0) {
      return `To reduce expenses, focus on ${topCategories[0][0]} (${formatCurrency(topCategories[0][1])}), your highest spending category. Look for alternatives or set a strict budget to limit overspending.`;
    } else {
      return `Track your expenses by category to identify where you can cut back. Setting budgets for each category will help you stay accountable.`;
    }
  }

  // Default response
  return `Based on your finances: Income ${formatCurrency(totalIncome)}, Expenses ${formatCurrency(totalExpense)}, Balance ${formatCurrency(balance)}. ${topCategories.length > 0 ? `Your top spending is on ${topCategories[0][0]}. ` : ''}${budgets.length > 0 ? `You have ${budgets.length} budget${budgets.length > 1 ? 's' : ''} active. ` : 'Consider setting budgets to track your spending. '}${goals.length > 0 ? `Keep working towards your ${goals.length} goal${goals.length > 1 ? 's' : ''}!` : 'Set savings goals to stay motivated!'}`;
}

// Generate fallback insights
function generateFallbackInsights(transactions, budgets) {
  const insights = [];
  const now = new Date();
  const last30Days = transactions.filter(t => {
    const date = new Date(t.date);
    const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30;
  });

  const expenses = last30Days.filter(t => t.amount < 0);
  const income = last30Days.filter(t => t.amount >= 0);

  const totalExpense = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown
  const categoryMap = new Map();
  expenses.forEach(t => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + Math.abs(t.amount));
  });
  const topCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Insight 1: Spending vs Income
  if (totalIncome > 0) {
    const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
    if (savingsRate > 20) {
      insights.push({
        type: 'savings',
        title: 'Great Savings Rate!',
        message: `You're saving ${savingsRate.toFixed(0)}% of your income. Keep it up! Consider increasing your savings goals.`
      });
    } else if (savingsRate > 0) {
      insights.push({
        type: 'tip',
        title: 'Room for Improvement',
        message: `You're saving ${savingsRate.toFixed(0)}% of your income. Try to reach 20% by reducing non-essential expenses.`
      });
    } else {
      insights.push({
        type: 'alert',
        title: 'Spending Alert',
        message: `Your expenses exceed your income by ${formatCurrency(totalExpense - totalIncome)}. Review your spending and create a budget.`
      });
    }
  }

  // Insight 2: Top spending category
  if (topCategories.length > 0) {
    const topPct = (topCategories[0][1] / totalExpense) * 100;
    if (topPct > 40) {
      insights.push({
        type: 'spending',
        title: 'High Category Spending',
        message: `${topCategories[0][0]} accounts for ${topPct.toFixed(0)}% of your expenses (${formatCurrency(topCategories[0][1])}). Consider setting a budget to control this.`
      });
    }
  }

  // Insight 3: Budget status
  if (budgets.length > 0) {
    insights.push({
      type: 'tip',
      title: 'Budget Tracking',
      message: `You have ${budgets.length} active budget${budgets.length > 1 ? 's' : ''}. Check your progress regularly to stay on track!`
    });
  } else if (topCategories.length > 0) {
    insights.push({
      type: 'tip',
      title: 'Set Up Budgets',
      message: `Create budgets for your top spending categories: ${topCategories.slice(0, 2).map(c => c[0]).join(' and ')}. This will help you control your expenses.`
    });
  }

  return insights.slice(0, 3);
}

// Call backend API for chat
async function callBackendChat(query, context) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, context }),
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}

// Call backend API for insights
async function callBackendInsights(context) {
  const response = await fetch(`${API_BASE_URL}/api/insights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ context }),
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  const data = await response.json();
  return data.insights;
}

// Generate AI-powered financial insights (with fallback)
export async function generateFinancialInsights(transactions, budgets = []) {
  // Check if we have transactions to analyze
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const context = prepareFinancialContext(transactions, budgets);

  try {
    console.log('Calling backend AI for insights...');
    const insights = await callBackendInsights(context);
    console.log('AI insights generated successfully');
    return insights;
  } catch (error) {
    console.warn('Backend API unavailable, using intelligent fallback:', error.message);
    return generateFallbackInsights(transactions, budgets);
  }
}

// Generate budget recommendations
export async function generateBudgetRecommendations(transactions) {
  const last90Days = transactions.filter(t => {
    const date = new Date(t.date);
    const daysDiff = (new Date() - date) / (1000 * 60 * 60 * 24);
    return daysDiff <= 90 && t.amount < 0;
  });

  const categoryMap = new Map();
  last90Days.forEach(t => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + Math.abs(t.amount));
  });

  const avgMonthly = new Map();
  categoryMap.forEach((total, cat) => {
    avgMonthly.set(cat, total / 3); // 90 days = ~3 months
  });

  // Use averages with 15% buffer
  return Array.from(avgMonthly.entries()).map(([category, avg]) => ({
    category,
    recommended: Math.round(avg * 1.15),
    reasoning: 'Based on your 3-month average with 15% buffer'
  }));
}

// Predict future spending
export async function predictFutureSpending(transactions, category = null, months = 1) {
  try {
    const last6Months = transactions.filter(t => {
      const date = new Date(t.date);
      const daysDiff = (new Date() - date) / (1000 * 60 * 60 * 24);
      return daysDiff <= 180 && t.amount < 0;
    });

    const filtered = category
      ? last6Months.filter(t => t.category === category)
      : last6Months;

    const monthlyTotals = [];
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthTotal = filtered
        .filter(t => {
          const d = new Date(t.date);
          return d >= monthStart && d < monthEnd;
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      monthlyTotals.push(monthTotal);
    }

    const avg = monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length;
    const trend = monthlyTotals.length >= 2
      ? (monthlyTotals[0] - monthlyTotals[monthlyTotals.length - 1]) / monthlyTotals.length
      : 0;

    return {
      predicted: Math.round(avg + (trend * months)),
      average: Math.round(avg),
      trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'
    };
  } catch (error) {
    console.error('Error predicting spending:', error);
    return { predicted: 0, average: 0, trend: 'stable' };
  }
}

// Answer financial questions - tries backend API first, falls back to intelligent responses
export async function answerFinancialQuery(query, transactions, budgets = [], goals = []) {
  const context = prepareFinancialContext(transactions, budgets, goals);

  try {
    console.log('Calling backend AI for response...');
    const response = await callBackendChat(query, context);
    console.log('AI responded successfully');
    return response;
  } catch (error) {
    console.warn('Backend API unavailable, using intelligent fallback:', error.message);
    return generateFallbackResponse(query, transactions, budgets, goals);
  }
}
