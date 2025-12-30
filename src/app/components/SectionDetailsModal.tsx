import React, { useState, useMemo } from 'react';

interface SectionData {
    name: string;
    total: number;
    occupied: number;
    displayName: string;
}

interface SectionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    sections: SectionData[];
}

export default function SectionDetailsModal({ isOpen, onClose, sections }: SectionDetailsModalProps) {
    const [sortField, setSortField] = useState<'name' | 'total' | 'occupied' | 'rate'>('rate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [searchTerm, setSearchTerm] = useState('');

    const sortedSections = useMemo(() => {
        let filtered = sections;
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = sections.filter(s => s.displayName.toLowerCase().includes(lowerTerm));
        }

        return [...filtered].sort((a, b) => {
            let valA: any = a[sortField as keyof SectionData];
            let valB: any = b[sortField as keyof SectionData];

            if (sortField === 'rate') {
                valA = a.total ? a.occupied / a.total : 0;
                valB = b.total ? b.occupied / b.total : 0;
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [sections, sortField, sortDirection, searchTerm]);

    const handleSort = (field: 'name' | 'total' | 'occupied' | 'rate') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl h-[80vh] rounded-xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                            <span className="text-2xl">📉</span> All Section Statistics
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Detailed occupancy report by section</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Controls */}
                <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <svg className="w-4 h-4 absolute left-3 top-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search sections..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th
                                    className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-200 transition-colors"
                                    onClick={() => handleSort('name')}
                                >
                                    Section {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-200 transition-colors"
                                    onClick={() => handleSort('occupied')}
                                >
                                    Occupied {sortField === 'occupied' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-200 transition-colors"
                                    onClick={() => handleSort('total')}
                                >
                                    Total {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-4 font-semibold w-1/3 cursor-pointer hover:text-slate-200 transition-colors"
                                    onClick={() => handleSort('rate')}
                                >
                                    Capacity {sortField === 'rate' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {sortedSections.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        No sections found matching "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                sortedSections.map((section) => {
                                    const rate = section.total ? section.occupied / section.total : 0;
                                    const percentage = Math.round(rate * 100);

                                    let color = 'bg-blue-500';
                                    if (rate > 0.9) color = 'bg-red-500';
                                    else if (rate > 0.7) color = 'bg-orange-500';

                                    return (
                                        <tr key={section.name} className="hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-slate-200">
                                                Section {section.displayName}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {section.occupied}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {section.total}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${color}`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-mono text-slate-400 w-12 text-right">{percentage}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-800/30 rounded-b-xl flex justify-between items-center text-xs text-slate-500">
                    <div>
                        Showing {sortedSections.length} sections
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
