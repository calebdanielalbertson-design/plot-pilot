"use client";

import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

export default function AdminLoginModal({ onClose, onSuccess }: { onClose?: () => void, onSuccess?: () => void }) {
    const { login } = useAdmin();
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            setError(false);
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } else {
            setError(true);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🔒</div>
                    <h2 className="text-xl font-bold text-white">Admin Access</h2>
                    <p className="text-sm text-slate-400">Enter password to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            autoFocus
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(false); }}
                            placeholder="Password"
                            className={`w-full bg-slate-950 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                        />
                        {error && <p className="text-red-500 text-xs mt-2 pl-1">Incorrect password. Please try again.</p>}
                    </div>

                    <div className="flex gap-3">
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
                        >
                            Unlock
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
