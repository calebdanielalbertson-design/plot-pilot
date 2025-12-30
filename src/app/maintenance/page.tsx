'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMaintenanceData } from '../hooks/useMaintenanceData';
import { WorkOrder, IssueReport } from '../types/maintenance';

// Simple Modal UI Components
function CreateWorkOrderModal({ onClose, onSave }: { onClose: () => void, onSave: (data: Partial<WorkOrder>) => void }) {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [priority, setPriority] = useState<WorkOrder['priority']>('Medium');
    const [plotId, setPlotId] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                <h3 className="text-xl font-bold text-white mb-4">New Work Order</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Title</label>
                        <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                            value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Level Headstone" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
                        <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white h-20"
                            value={desc} onChange={e => setDesc(e.target.value)} placeholder="Details..." />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-400 mb-1">Priority</label>
                            <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                                value={priority} onChange={e => setPriority(e.target.value as any)}>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-400 mb-1">Plot ID (Optional)</label>
                            <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                                value={plotId} onChange={e => setPlotId(e.target.value)} placeholder="e.g. 1045" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                    <button onClick={() => {
                        onSave({ title, description: desc, priority, plotId, status: 'Open', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), id: crypto.randomUUID() });
                        onClose();
                    }} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">Create Order</button>
                </div>
            </div>
        </div>
    );
}

function ReportIssueModal({ onClose, onSave }: { onClose: () => void, onSave: (data: Partial<IssueReport>) => void }) {
    const [desc, setDesc] = useState('');

    // Simulate current location for now
    const location = { lat: 51.505, lng: -0.09 };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                <h3 className="text-xl font-bold text-white mb-4">⚠️ Report Field Issue</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
                        <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white h-24"
                            value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the issue (e.g. Broken fence, sinkhole)..." />
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded border border-slate-700 flex items-center gap-3">
                        <div className="text-2xl">📸</div>
                        <div className="text-sm text-slate-400">
                            Upload Photo <span className="text-xs opacity-50">(Simulated)</span>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 text-center">
                        Location will be tagged at: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                    <button onClick={() => {
                        onSave({ description: desc, location, status: 'New', reportedAt: new Date().toISOString(), id: crypto.randomUUID() });
                        onClose();
                    }} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium">Submit Report</button>
                </div>
            </div>
        </div>
    );
}

import AdminGuard from "../components/AdminGuard";

export default function MaintenancePage() {
    const { workOrders, issues, burials, isLoaded, addWorkOrder, reportIssue } = useMaintenanceData();
    const [activeTab, setActiveTab] = useState<'orders' | 'issues'>('orders');
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

    // Fix hydration mismatch by generating UI only on client
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isLoaded) return <div className="p-8 text-white">Loading data...</div>;

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-950 text-slate-200 p-4 lg:p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">🛠️ Operations Log</h1>
                        <p className="text-slate-400">Manage work orders, field reports, and burials.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/"
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                        >
                            View Map
                        </Link>
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                        >
                            Dashboard
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Tabs / Controls */}
                        <div className="flex gap-4 border-b border-slate-800 pb-2">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`pb-2 px-2 font-medium transition-colors ${activeTab === 'orders' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Work Orders ({workOrders.filter(w => w.status !== 'Closed').length})
                            </button>
                            <button
                                onClick={() => setActiveTab('issues')}
                                className={`pb-2 px-2 font-medium transition-colors ${activeTab === 'issues' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Field Issues ({issues.filter(i => i.status !== 'Resolved').length})
                            </button>
                        </div>

                        {/* Work Orders List */}
                        {activeTab === 'orders' && (
                            <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 min-h-[400px]">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        📋 Active Work Orders
                                    </h2>
                                    <button
                                        onClick={() => setIsOrderModalOpen(true)}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                                    >
                                        + New Order
                                    </button>
                                </div>

                                {workOrders.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <p>No active work orders.</p>
                                        <p className="text-xs mt-2">Create one or click a plot on the map.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {workOrders.map(order => (
                                            <div key={order.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-start">
                                                <div>
                                                    <div className="font-semibold text-slate-200">{order.title}</div>
                                                    <div className="text-sm text-slate-400 mt-1">{order.description}</div>
                                                    {order.plotId && <div className="text-xs text-blue-400 mt-2 font-mono">ID: {order.plotId}</div>}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${order.priority === 'High' ? 'bg-red-900/20 text-red-400 border-red-900' :
                                                        order.priority === 'Medium' ? 'bg-yellow-900/20 text-yellow-500 border-yellow-900' :
                                                            'bg-blue-900/20 text-blue-400 border-blue-900'
                                                        }`}>
                                                        {order.priority}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{order.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Issues List */}
                        {activeTab === 'issues' && (
                            <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 min-h-[400px]">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        ⚠️ Field Reports
                                    </h2>
                                    <button
                                        onClick={() => setIsIssueModalOpen(true)}
                                        className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Report Issue
                                    </button>
                                </div>

                                {issues.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <p>No issues reported.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {issues.map(issue => (
                                            <div key={issue.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                                <div className="flex justify-between">
                                                    <span className="text-orange-400 font-medium text-sm">New Report</span>
                                                    <span className="text-xs text-slate-500">{new Date(issue.reportedAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="mt-2 text-slate-300">{issue.description}</div>
                                                <div className="mt-2 text-xs text-slate-500 font-mono">
                                                    Loc: {issue.location.lat.toFixed(6)}, {issue.location.lng.toFixed(6)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Sidebar Column: Burial Schedule */}
                    <div className="space-y-6">
                        <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    ⚰️ Schedule

                                </h2>
                                <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700">
                                    + Add
                                </button>
                            </div>

                            <div className="space-y-4">
                                {burials.length === 0 ? (
                                    <div className="text-center py-4 text-slate-600 text-sm">
                                        No upcoming burials.
                                    </div>
                                ) : (
                                    burials.map(burial => (
                                        <div key={burial.id} className="p-3 bg-slate-800/50 rounded-lg border-l-4 border-blue-500 hover:bg-slate-800 transition-colors">
                                            <div className="text-sm text-slate-400 flex justify-between">
                                                <span>{new Date(burial.scheduledDate).toLocaleDateString()}</span>
                                                <span>{burial.startTime}</span>
                                            </div>
                                            <div className="font-bold text-white mt-1">{burial.deceasedName}</div>
                                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                                <span>🪦 {burial.plotId}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Modals */}
                {isOrderModalOpen && <CreateWorkOrderModal onClose={() => setIsOrderModalOpen(false)} onSave={(data) => addWorkOrder(data as WorkOrder)} />}
                {isIssueModalOpen && <ReportIssueModal onClose={() => setIsIssueModalOpen(false)} onSave={(data) => reportIssue(data as IssueReport)} />}
            </div>
        </AdminGuard>
    );
}
