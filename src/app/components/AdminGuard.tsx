"use client";

import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import AdminLoginModal from './AdminLoginModal';
import Link from 'next/link';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAdmin();
    // We can show a 'Check Access' state if we were checking async storage, 
    // but for now synchronous state is fine.

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
            <div className="max-w-md w-full p-6 text-center">
                <h1 className="text-3xl font-bold text-white mb-4">Restricted Area</h1>
                <p className="text-slate-400 mb-8">You need administrator privileges to view this page.</p>

                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 mb-6">
                    <AdminLoginModal onClose={() => { }} />
                    {/* The Modal is designed to be full screen, but we can reuse it or just let it render on top. 
                        Actually, let's just render the Modal's CONTENTS or just trigger the modal. */
                    }
                </div>
                {/* Since Modal is fixed inset-0, let's just render it. It will overlay everything. */}
            </div>
            {/* Cleaner approach: Just render the modal overlay for the whole page if not authenticated */}
            <AdminLoginModal />
            <div className="fixed bottom-8 left-0 right-0 text-center z-[10000]">
                <Link href="/" className="text-slate-500 hover:text-white underline text-sm">Return to Map</Link>
            </div>
        </div>
    );
}
