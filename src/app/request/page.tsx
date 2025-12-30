'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function RequestForm() {
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        requestType: 'Pre-Need', // 'Pre-Need' or 'At-Need'
        deceasedName: '',
        deathDate: '',
        notes: '',
        // Hidden fields for linking to specific plot
        plotId: '',
        block: '',
        lot: ''
    });

    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    // Initial Pre-fill from URL
    useEffect(() => {
        const blockParam = searchParams.get('block');
        const lotParam = searchParams.get('lot');
        const idParam = searchParams.get('id');

        if (blockParam || lotParam || idParam) {
            let note = "Interested in specific plot:\n";
            if (idParam) note += `Plot ID: ${idParam}\n`;
            if (blockParam) note += `Block: ${blockParam}\n`;
            if (lotParam) note += `Lot: ${lotParam}`;

            setFormData(prev => ({
                ...prev,
                notes: note,
                plotId: idParam || '',
                block: blockParam || '',
                lot: lotParam || ''
            }));
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Save to localStorage
        const newRequest = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            status: 'Pending',
            ...formData
        };

        const existingStr = localStorage.getItem('plotRequests');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        localStorage.setItem('plotRequests', JSON.stringify([newRequest, ...existing]));

        setStatus('success');
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">✅</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Request Received</h2>
                    <p className="text-slate-400 mb-8">
                        Thank you for your inquiry. A cemetery administrator has been notified and will contact you regarding plot availability.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => setStatus('idle')}
                            className="text-slate-300 hover:text-white underline text-sm"
                        >
                            Submit another request
                        </button>
                        <br />
                        <Link href="/" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                            Return to Map
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 pt-12">
            <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

                {/* Applicant Info */}
                <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-white mb-4 border-b border-slate-800 pb-2">Applicant Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">First Name</label>
                            <input
                                required
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                type="text"
                                className="w-full bg-slate-800 border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Jane"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Last Name</label>
                            <input
                                required
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                type="text"
                                className="w-full bg-slate-800 border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                            <input
                                required
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                                className="w-full bg-slate-800 border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="jane@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
                            <input
                                required
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                type="tel"
                                className="w-full bg-slate-800 border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="(555) 123-4567"
                            />
                        </div>
                    </div>
                </section>

                {/* Request Details */}
                <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-white mb-4 border-b border-slate-800 pb-2">Plot Requirements</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Request Type</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 w-full hover:bg-slate-750">
                                    <input
                                        type="radio"
                                        name="requestType"
                                        value="Pre-Need"
                                        checked={formData.requestType === 'Pre-Need'}
                                        onChange={handleChange}
                                        className="text-blue-500"
                                    />
                                    <span className="text-sm">Pre-Need (Future Planning)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 w-full hover:bg-slate-750">
                                    <input
                                        type="radio"
                                        name="requestType"
                                        value="At-Need"
                                        checked={formData.requestType === 'At-Need'}
                                        onChange={handleChange}
                                        className="text-blue-500"
                                    />
                                    <span className="text-sm">At-Need (Immediate)</span>
                                </label>
                            </div>
                        </div>

                        {formData.requestType === 'At-Need' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Deceased Name</label>
                                    <input
                                        name="deceasedName"
                                        value={formData.deceasedName}
                                        onChange={handleChange}
                                        type="text"
                                        className="w-full bg-slate-800 border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Date of Death</label>
                                    <input
                                        name="deathDate"
                                        value={formData.deathDate}
                                        onChange={handleChange}
                                        type="date"
                                        className="w-full bg-slate-800 border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Additional Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-slate-800 border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Specific location requests, family plots, etc."
                            />
                        </div>
                    </div>
                </section>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {status === 'submitting' ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>

            </form>
        </div>
    );
}

export default function RequestPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
            <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🗳️</span>
                    <h1 className="text-xl font-bold text-white tracking-tight">Plot Purchase Request</h1>
                </div>
                <Link href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                    ← Back to Map
                </Link>
            </header>
            <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading form...</div>}>
                <RequestForm />
            </Suspense>
        </div>
    );
}
