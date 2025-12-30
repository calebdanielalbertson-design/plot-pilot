"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardView from "../components/DashboardView";
import PlotTableModal from "../components/PlotTableModal";
import { usePlotData } from "../../hooks/usePlotData";

import AdminGuard from "../components/AdminGuard";

export default function DashboardPage() {
    const { plots, loading, requests, approveRequest, rejectRequest } = usePlotData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalFilterType, setModalFilterType] = useState<'All' | 'Occupied' | 'Available' | 'Reserved'>('All');

    // Derived state for modal
    const filteredPlots = plots ? plots.features.filter((f: any) => {
        let status = f.properties.status;
        if (!status) {
            if (f.properties.LOTSTATUS === "Has Burial") status = "Occupied";
            else if (f.properties.LOTSTATUS === "Reserved") status = "Reserved";
            else status = "Available";
        }

        if (modalFilterType === 'All') return true;
        return status === modalFilterType;
    }) : [];

    const handleStatClick = (type: 'All' | 'Occupied' | 'Available' | 'Reserved') => {
        setModalFilterType(type);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-500">
                Loading Dashboard...
            </div>
        );
    }

    return (
        <AdminGuard>
            <main className="min-h-screen bg-slate-950 text-slate-100 font-sans">
                {/* Header */}
                <header className="fixed top-0 w-full z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🪦</span>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">PlotPilot Dashboard</h1>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Analytics & Overview</p>
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium border border-slate-700"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                        </svg>
                        Back to Map
                    </Link>
                </header>

                {/* Main Content */}
                <div className="pt-24 px-6 max-w-7xl mx-auto pb-12">
                    <div className="space-y-8">
                        {/* Welcome / Context */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
                            <h2 className="text-2xl font-bold mb-4 text-white">System Overview</h2>
                            <p className="text-slate-400 leading-relaxed max-w-3xl">
                                Welcome to the PlotPilot analytics dashboard. Here you can view high-level statistics about cemetery occupancy, verify available plots, and manage records.
                                <br /><br />
                                Click on any statistic card to view a detailed report of plots in that category.
                            </p>
                        </div>

                        {/* Stats */}
                        <DashboardView
                            plots={plots}
                            requests={requests}
                            onStatClick={handleStatClick}
                            onApprove={approveRequest}
                            onReject={rejectRequest}
                        />
                    </div>
                </div>

                {/* Modal */}
                <PlotTableModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    plots={filteredPlots}
                    title={modalFilterType === 'All' ? 'All Plots' : `${modalFilterType} Plots`}
                    onPlotClick={() => {
                        // In full dashboard, maybe we don't navigate to map on click, 
                        // or we could link to /?select=id. For now, we just close.
                    }}
                />
            </main>
        </AdminGuard>
    );
}
