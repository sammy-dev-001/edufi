import React, { useState } from 'react';
import { useSpending } from '../state/SpendingContext';
import { answerFinancialQuery } from '../services/ai';
import LoadingSpinner from './LoadingSpinner';

export default function AIChat() {
    const { transactions, budgets, savingsGoals } = useSpending();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '👋 Hi! I\'m your AI financial assistant. Ask me anything about your spending, budgets, or financial goals!'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const quickQuestions = [
        'How can I save more money?',
        'What are my top spending categories?',
        'Am I on track with my budget?',
        'Give me tips to reduce expenses',
    ];

    const handleSend = async (question = input) => {
        if (!question.trim() || loading) return;

        const userMessage = { role: 'user', content: question };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await answerFinancialQuery(question, transactions, budgets, savingsGoals);
            const assistantMessage = { role: 'assistant', content: response };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickQuestion = (question) => {
        handleSend(question);
    };

    return (
        <div className="flex flex-col h-[500px] rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                    ? 'gradient-primary text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                                }`}
                        >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3">
                            <LoadingSpinner size="sm" />
                        </div>
                    </div>
                )}
            </div>

            {/* Quick questions */}
            {messages.length === 1 && !loading && (
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                    {quickQuestions.map((q, index) => (
                        <button
                            key={index}
                            onClick={() => handleQuickQuestion(q)}
                            className="text-xs px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        disabled={loading}
                        className="flex-1 px-4 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="px-6 py-2 rounded-full gradient-primary text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow transition-shadow"
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
