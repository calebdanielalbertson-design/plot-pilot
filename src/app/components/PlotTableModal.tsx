import React from 'react';

interface PlotTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    plots: any[];
    title: string;
    onPlotClick?: (plot: any) => void;
}

export default function PlotTableModal({ isOpen, onClose, plots, title, onPlotClick }: PlotTableModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[80vh] rounded-xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                        <span className="text-2xl">📋</span> {title}
                        <span className="text-sm font-normal text-slate-400 ml-2 bg-slate-800 px-2 py-1 rounded-full border border-slate-700">
                            {plots.length} records
                        </span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto p-6">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="px-4 py-3 font-semibold rounded-tl-lg">ID</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">Name</th>
                                <th className="px-4 py-3 font-semibold">Details</th>
                                <th className="px-4 py-3 font-semibold rounded-tr-lg">Section</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {plots.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                        No plots found for this category.
                                    </td>
                                </tr>
                            ) : (
                                plots.map((plot) => {
                                    const props = plot.properties;
                                    const id = props.id || props.OBJECTID;

                                    // Determine status
                                    let status = props.status;
                                    if (!status) {
                                        if (props.LOTSTATUS === "Has Burial") status = "Occupied";
                                        else if (props.LOTSTATUS === "Reserved") status = "Reserved";
                                        else status = "Available";
                                    }

                                    // Determine Name
                                    let name = props.name || "-";
                                    if (name === "-" && (props.F_NAME || props.L_NAME)) {
                                        name = `${props.F_NAME || ''} ${props.L_NAME || ''}`.trim();
                                    }
                                    if (name === "-" && (props["Other Occupant First Name"] || props["Other Occupant Last Name"])) {
                                        name = `${props["Other Occupant First Name"] || ''} ${props["Other Occupant Last Name"] || ''}`.trim();
                                    }

                                    // Determine Dates
                                    const deathDateRaw = props["Burial Date"] || props.deathDate;
                                    const deathDate = deathDateRaw ? new Date(deathDateRaw).toLocaleDateString() : "";
                                    const dates = deathDate ? `Buried: ${deathDate}` : "-";

                                    const section = props.Section || props.section || "Unknown";

                                    return (
                                        <tr
                                            key={id}
                                            className="hover:bg-slate-800/50 transition-colors group cursor-pointer border-b border-slate-800/50 last:border-0"
                                            onClick={() => {
                                                if (onPlotClick) onPlotClick(plot);
                                                onClose();
                                            }}
                                        >
                                            <td className="px-4 py-3 font-mono text-slate-300 group-hover:text-white">{id}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'Occupied'
                                                    ? 'bg-red-500/10 text-red-400/90 border border-red-500/20'
                                                    : 'bg-green-500/10 text-green-400/90 border border-green-500/20'
                                                    }`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 font-medium group-hover:text-white">{name}</td>
                                            <td className="px-4 py-3 text-slate-400 group-hover:text-slate-300">{dates}</td>
                                            <td className="px-4 py-3 text-slate-400 group-hover:text-slate-300">{section}</td>
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
                        Click a row to locate on map
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
