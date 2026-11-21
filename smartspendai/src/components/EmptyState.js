import React from 'react';

export default function EmptyState({ icon, title, message, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
            {icon && (
                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">
                    {icon}
                </span>
            )}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
                {message}
            </p>
            {action}
        </div>
    );
}
