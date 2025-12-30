import { useMemo, useState } from 'react';
import SectionDetailsModal from './SectionDetailsModal';

interface DashboardViewProps {
    plots: any;
    requests?: any[];
    onStatClick?: (filterType: 'All' | 'Occupied' | 'Available' | 'Reserved') => void;
    onApprove?: (request: any) => void;
    onReject?: (requestId: string) => void;
}

export default function DashboardView({ plots, requests, onStatClick, onApprove, onReject }: DashboardViewProps) {
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const stats = useMemo(() => {
        if (!plots || !plots.features) {
            return { total: 0, occupied: 0, available: 0, reserved: 0, burialTypes: {}, highOccupancySections: [], allSections: [] };
        }

        const total = plots.features.length;
        let occupied = 0;
        let reserved = 0;
        const burialTypes: Record<string, number> = {};
        const sectionCounts: Record<string, { total: number, occupied: number, displayName: string }> = {};

        const normalizeSectionName = (name: string) => {
            return name.toUpperCase().replace(/[^A-Z0-9]/g, ''); // alphanumeric only, uppercase
        };

        plots.features.forEach((feature: any) => {
            const props = feature.properties;
            let status = props.status;

            // Normalize status logic
            if (!status) {
                if (props.LOTSTATUS === "Has Burial") status = "Occupied";
                else if (props.LOTSTATUS === "Reserved") status = "Reserved";
                else status = "Available";
            }

            if (status === "Occupied") occupied++;
            else if (status === "Reserved") reserved++;

            // Burial Types
            if (status === "Occupied" && props["Burial Type"]) {
                const type = props["Burial Type"];
                burialTypes[type] = (burialTypes[type] || 0) + 1;
            }

            // Section Stats
            const rawSection = props.Section || props.SECTION || props.Sec || "Unknown";
            const normalizedSection = normalizeSectionName(rawSection);

            if (!sectionCounts[normalizedSection]) {
                sectionCounts[normalizedSection] = {
                    total: 0,
                    occupied: 0,
                    displayName: rawSection // Keep the first variation as display name for now
                };
            }

            // Optional: Prefer "St. Leo's" over "STLEOS" if we encounter it? 
            // For now, let's stick to the first one or maybe simple length check if we want "nicer" ones

            sectionCounts[normalizedSection].total++;
            if (status === "Occupied") sectionCounts[normalizedSection].occupied++;
        });

        const available = total - occupied - reserved;

        // Calculate all sections list
        const allSections = Object.values(sectionCounts)
            .map((data) => ({
                name: data.displayName,
                occupied: data.occupied,
                total: data.total,
                rate: data.total ? data.occupied / data.total : 0,
                displayName: data.displayName
            }))
            .filter(data => data.total > 0); // Keep all valid sections

        // Calculate top sections
        const highOccupancySections = allSections

            .filter(data => data.total >= 5) // Filter out tiny sections (less than 5 plots)
            .sort((a, b) => {
                if (b.rate === a.rate) {
                    return b.occupied - a.occupied; // Secondary sort by count
                }
                return b.rate - a.rate;
            })
            .slice(0, 5);

        return { total, occupied, available, reserved, burialTypes, highOccupancySections, allSections };
    }, [plots]);

    const handleCardClick = (type: 'All' | 'Occupied' | 'Available' | 'Reserved') => {
        if (onStatClick) {
            onStatClick(type);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Total Plots */}
                <div onClick={() => handleCardClick('All')} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:bg-slate-800 transition-all cursor-pointer group">
                    <label className="text-xs uppercase text-slate-400 font-bold group-hover:text-slate-300">Total Plots</label>
                    <div className="text-3xl font-mono text-white mt-1">{stats.total}</div>
                </div>

                {/* Occupied */}
                <div onClick={() => handleCardClick('Occupied')} className="bg-slate-800/50 p-4 rounded-lg border border-red-900/40 hover:bg-slate-800 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute right-2 top-2 text-2xl opacity-20">⛔</div>
                    <label className="text-xs uppercase text-red-400 font-bold">Occupied</label>
                    <div className="text-3xl font-mono text-white mt-1">{stats.occupied}</div>
                    <div className="text-xs text-slate-400 mt-1">{((stats.occupied / stats.total) * 100).toFixed(1)}%</div>
                </div>

                {/* Reserved */}
                <div onClick={() => handleCardClick('Reserved')} className="bg-slate-800/50 p-4 rounded-lg border border-yellow-900/40 hover:bg-slate-800 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute right-2 top-2 text-2xl opacity-20">✋</div>
                    <label className="text-xs uppercase text-yellow-500 font-bold">Reserved</label>
                    <div className="text-3xl font-mono text-white mt-1">{stats.reserved}</div>
                    <div className="text-xs text-slate-400 mt-1">{((stats.reserved / stats.total) * 100).toFixed(1)}%</div>
                </div>

                {/* Available */}
                <div onClick={() => handleCardClick('Available')} className="bg-slate-800/50 p-4 rounded-lg border border-green-900/40 hover:bg-slate-800 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute right-2 top-2 text-2xl opacity-20">✅</div>
                    <label className="text-xs uppercase text-green-400 font-bold">Available</label>
                    <div className="text-3xl font-mono text-white mt-1">{stats.available}</div>
                    <div className="text-xs text-slate-400 mt-1">{((stats.available / stats.total) * 100).toFixed(1)}%</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Burial Types */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                        <span>⚱️</span> Burial Types
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(stats.burialTypes).length > 0 ? (
                            Object.entries(stats.burialTypes)
                                .sort(([, a], [, b]) => b - a)
                                .map(([type, count]) => (
                                    <div key={type} className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">{type || "Unspecified"}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(count / stats.occupied) * 100}%` }} />
                                            </div>
                                            <span className="text-sm font-mono text-slate-200 w-8 text-right">{count}</span>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <p className="text-sm text-slate-500 italic">No burial type data available.</p>
                        )}
                    </div>
                </div>

                {/* High Occupancy Sections */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                            <span>📉</span> Most Occupied Sections
                        </h3>
                        <button
                            onClick={() => setIsSectionModalOpen(true)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700 transition-colors"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {stats.highOccupancySections.map((section) => (
                            <div key={section.name} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-300 font-medium">Section {section.name}</span>
                                    <span className="text-slate-400">{section.occupied}/{section.total} ({Math.round(section.rate * 100)}%)</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${section.rate > 0.9 ? 'bg-red-500' : section.rate > 0.7 ? 'bg-orange-500' : 'bg-blue-500'}`}
                                        style={{ width: `${section.rate * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pending Requests Section */}
            {requests && requests.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span>📨</span> Pending Requests
                            <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full">{requests.length}</span>
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-800/50 text-xs uppercase text-slate-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-lg">Date</th>
                                    <th className="px-6 py-4">Applicant</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Type</th>
                                    <th className="px-6 py-4">Preference</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {requests.map((req: any) => (
                                    <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(req.timestamp).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-slate-300">
                                            {req.firstName} {req.lastName}
                                            <div className="text-xs text-slate-500">{req.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded-full text-xs border ${req.requestType === 'At-Need' ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-blue-900/20 border-blue-800 text-blue-400'}`}>
                                                {req.requestType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            Section {req.preferredSection || "Any"}
                                            {req.plotId && <div className="text-xs text-slate-500">ID: {req.plotId}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-yellow-500 font-medium">Pending</td>
                                        <td className="px-6 py-4 flex gap-3">
                                            {onApprove && (
                                                <button
                                                    onClick={() => onApprove(req)}
                                                    className="p-1.5 hover:bg-green-900/30 text-green-500 rounded transition-colors"
                                                    title="Approve & Assign"
                                                >
                                                    ✅
                                                </button>
                                            )}
                                            {onReject && (
                                                <button
                                                    onClick={() => onReject(req.id)}
                                                    className="p-1.5 hover:bg-red-900/30 text-red-500 rounded transition-colors"
                                                    title="Reject"
                                                >
                                                    ❌
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-800 text-xs text-slate-500 text-center">
                Data last updated: {new Date().toLocaleDateString()}
            </div>

            {/* Section Details Modal */}
            <SectionDetailsModal
                isOpen={isSectionModalOpen}
                onClose={() => setIsSectionModalOpen(false)}
                sections={stats.allSections}
            />
        </div>
    );
}
