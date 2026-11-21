const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Gemini configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAHcbXx4dV5tkRPsLohN-dd1iWEl7HzrrY';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Use gemini-2.0-flash (latest and most reliable)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Middleware
app.use(cors());
app.use(express.json());

// Format currency for Nigerian Naira
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0
    }).format(amount);
};

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', model: 'gemini-2.0-flash' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { query, context } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const prompt = `You are a friendly Nigerian financial assistant helping a user manage their money. 
The currency is Nigerian Naira (₦). Be concise, helpful, and give practical advice.

USER'S FINANCIAL SUMMARY (Last 30 days):
- Total Income: ${formatCurrency(context?.totalIncome || 0)}
- Total Expenses: ${formatCurrency(context?.totalExpense || 0)}
- Balance: ${formatCurrency(context?.balance || 0)}
- Savings Rate: ${context?.savingsRate || 0}%
- Number of Transactions: ${context?.transactionCount || 0}
- Active Budgets: ${context?.budgetCount || 0}
- Savings Goals: ${context?.goalCount || 0}
- Top Spending Categories: ${context?.topCategories?.map(([cat, amt]) => `${cat}: ${formatCurrency(amt)}`).join(', ') || 'None yet'}

USER'S QUESTION: ${query}

Provide a helpful, personalized response based on their actual financial data. Keep it conversational and under 150 words.`;

        console.log('Calling Gemini API for chat...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('Gemini response received successfully');
        res.json({ response: text });
    } catch (error) {
        console.error('Gemini API error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Insights endpoint
app.post('/api/insights', async (req, res) => {
    try {
        const { context } = req.body;

        if (!context || context.transactionCount === 0) {
            return res.json({ insights: [] });
        }

        const prompt = `You are a Nigerian financial advisor analyzing spending data. Generate exactly 2-3 brief financial insights.

FINANCIAL DATA (Last 30 days):
- Income: ${formatCurrency(context.totalIncome || 0)}
- Expenses: ${formatCurrency(context.totalExpense || 0)}
- Savings Rate: ${context.savingsRate || 0}%
- Top Categories: ${context.topCategories?.map(([cat, amt]) => `${cat}: ${formatCurrency(amt)}`).join(', ') || 'None'}
- Budgets Set: ${context.budgetCount || 0}

Return a JSON array with this EXACT format (no markdown, just raw JSON):
[{"type": "spending|savings|alert|tip", "title": "Short Title", "message": "Brief advice (max 30 words)"}]

Focus on actionable insights about their spending patterns, savings opportunities, or budget tips.`;

        console.log('Calling Gemini API for insights...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON from response
        try {
            const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const insights = JSON.parse(jsonText);
            if (Array.isArray(insights) && insights.length > 0) {
                console.log('Insights generated successfully');
                return res.json({ insights: insights.slice(0, 3) });
            }
        } catch (parseError) {
            console.warn('Failed to parse insights JSON:', parseError.message);
        }

        res.status(500).json({ error: 'Failed to parse AI response' });
    } catch (error) {
        console.error('Gemini API error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 SmartSpendAI Backend running on http://localhost:${PORT}`);
    console.log(`📊 Using Gemini model: gemini-2.0-flash`);
});
