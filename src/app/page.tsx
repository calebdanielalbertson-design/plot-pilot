"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import DashboardView from "./components/DashboardView";
import Link from "next/link";
import { usePlotData } from "../hooks/usePlotData";

// Dynamically import map to avoid SSR issues with Leaflet
const CemeteryMap = dynamic(() => import("./components/CemeteryMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-500">
      Loading Map...
    </div>
  ),
});

export default function Home() {
  const { plots, sections, blocks, loading, updatePlotProperties } = usePlotData();
  // ... imports
  import { Menu, X } from "lucide-react"; // Assuming lucide-react is available, or use SVG directly if not.
  // Wait, I don't know if lucide-react is installed. I should use simple SVGs to be safe as I did for markers.

  // ... inside component
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ... inside return
  return (
    <main className="flex h-screen w-full flex-row overflow-hidden bg-slate-950 relative">

      {/* Mobile Menu Button */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden absolute top-4 left-4 z-30 bg-white p-2 rounded-md shadow-lg text-slate-800 border border-slate-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
        </button>
      )}

      {/* Sidebar Overlay (Mobile Only) */}
      {isSidebarOpen && (
        <div
          className="md:hidden absolute inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-50 h-full shrink-0 flex flex-col border-r border-slate-800 bg-slate-900 text-slate-100 shadow-2xl transition-transform duration-300 ease-in-out
        w-[85vw] max-w-[400px] md:w-[400px]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 12" /></svg>
        </button>

        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <span className="text-3xl">🪦</span> PlotPilot
          </h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-medium">Cemetery Management</p>
        </div>

        {/* ... Rest of Sidebar content ... */}
        {/* Navigation Bar */}
        <div className="flex border-b border-slate-800 bg-slate-900 p-2 gap-2">
          <button
            className="flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 border-blue-500 text-white bg-slate-800/50 rounded-t"
          >
            Map View
          </button>
          <Link
            href="/dashboard"
            className="flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 text-center rounded-t"
          >
            Dashboard
          </Link>
          <Link
            href="/maintenance"
            className="flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 text-center rounded-t"
          >
            Operations
          </Link>
        </div>

        {/* Search & Results */}
        <div className="p-4 border-b border-slate-800 bg-slate-800/50">
          <input
            type="text"
            placeholder="Search by ID, Name, Purchaser..."
            className="w-full bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
              {searchResults.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-2">No results found</div>
              ) : (
                <div className="grid gap-1">
                  {searchResults.map((res: any) => {
                    const props = res.properties;
                    const id = props.OBJECTID;
                    const name = props.FULL_NAME || `${props.F_NAME || ''} ${props.L_NAME || ''}` || "Available";
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          handlePlotSelect(res);
                          setIsSidebarOpen(true); // Keep open on mobile selection to show details
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-700 flex justify-between items-center group transition-colors"
                      >
                        <span className="font-medium text-slate-200">{id}</span>
                        <span className="text-slate-400 group-hover:text-white truncate max-w-[120px]">{name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {sidebarData ? (
            // Single Plot View
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

              {/* Request Purchase Action */}
              {(sidebarData.status === 'Available' || sidebarData.status === 'available') && (
                <Link
                  href={`/request?section=${encodeURIComponent(sidebarData.section || '')}&block=${encodeURIComponent(sidebarData.block || '')}&lot=${encodeURIComponent(sidebarData.lot || '')}&id=${sidebarData.id}`}
                  className="block w-full bg-green-600 hover:bg-green-500 text-white text-center font-bold py-3 rounded-lg shadow-lg shadow-green-900/20 transition-all active:scale-[0.98] uppercase tracking-wide text-xs mb-4"
                >
                  Request Purchase
                </Link>
              )}

              {/* Header Info */}
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Plot ID</label>
                  <div className="text-2xl font-mono text-white leading-none">{sidebarData.id}</div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${sidebarData.status === 'Occupied'
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : 'bg-green-500/10 text-green-400 border-green-500/20'
                    }`}>
                    {sidebarData.status}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-800/30 p-2 rounded border border-slate-800">
                  <label className="text-[9px] uppercase text-slate-500 font-bold block">Section</label>
                  <span className="text-slate-200 font-medium">{sidebarData.section}</span>
                </div>
                <div className="bg-slate-800/30 p-2 rounded border border-slate-800">
                  <label className="text-[9px] uppercase text-slate-500 font-bold block">Block</label>
                  <span className="text-slate-200 font-medium">{sidebarData.block}</span>
                </div>
                <div className="bg-slate-800/30 p-2 rounded border border-slate-800">
                  <label className="text-[9px] uppercase text-slate-500 font-bold block">Lot</label>
                  <span className="text-slate-200 font-medium">{sidebarData.lot}</span>
                </div>
              </div>

              {/* Occupant Details */}
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 block border-b border-slate-800 pb-1">Occupant Details</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] uppercase text-slate-600 font-semibold mb-1 block">First Name</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      value={sidebarData.firstName || ""}
                      onChange={(e) => handleUpdateData({ firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-slate-600 font-semibold mb-1 block">Last Name</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      value={sidebarData.lastName || ""}
                      onChange={(e) => handleUpdateData({ lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] uppercase text-slate-600 font-semibold mb-1 block">Death Date (DOD)</label>
                    <input
                      type="text"
                      placeholder="MM/DD/YYYY"
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                      value={sidebarData.dod || ""}
                      onChange={(e) => handleUpdateData({ DOD: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-slate-600 font-semibold mb-1 block">Age</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                      value={sidebarData.age || ""}
                      onChange={(e) => handleUpdateData({ AGE: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase text-slate-600 font-semibold mb-1 block">Burial Date</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                      value={sidebarData.burialDate || ""}
                      onChange={(e) => handleUpdateData({ BURIALDATE: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-slate-600 font-semibold mb-1 block">Burial Type / FH</label>
                    <div className="flex gap-1">
                      <input type="text" className="w-1/2 bg-slate-950 border border-slate-700 rounded px-1 py-1 text-xs text-white"
                        value={sidebarData.burialType || ""} placeholder="Type" onChange={(e) => handleUpdateData({ BURIAL_TYP: e.target.value })} />
                      <input type="text" className="w-1/2 bg-slate-950 border border-slate-700 rounded px-1 py-1 text-xs text-white"
                        value={sidebarData.funeralHome || ""} placeholder="FH" onChange={(e) => handleUpdateData({ FUNRL_HOME: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchaser & Records */}
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 block border-b border-slate-800 pb-1">Ownership & Records</label>
                <div className="mb-3">
                  <label className="text-[10px] uppercase text-slate-600 font-semibold mb-1 block">Purchaser</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                    value={sidebarData.purchaser || ""}
                    onChange={(e) => handleUpdateData({ PURCHASERS: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase text-slate-600 font-semibold mb-1 block">Reserved For</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                      value={sidebarData.reservedFor || ""}
                      onChange={(e) => handleUpdateData({ RESERVEDFOR: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div>
                      <label className="text-[10px] uppercase text-slate-600 font-semibold mb-1 block">Book</label>
                      <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" value={sidebarData.book || ""} onChange={(e) => handleUpdateData({ BOOK: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-slate-600 font-semibold mb-1 block">Page</label>
                      <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" value={sidebarData.page || ""} onChange={(e) => handleUpdateData({ PAGE: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 block border-b border-slate-800 pb-1">Remarks</label>
                <textarea
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-2 text-white text-xs h-20 focus:outline-none focus:border-blue-500"
                  value={sidebarData.remarks || ""}
                  onChange={(e) => handleUpdateData({ REMARKS: e.target.value })}
                />
                <div className="mt-2 text-[10px] text-slate-500">
                  <strong>Plot Remarks:</strong> {sidebarData.pRemarks}
                </div>
              </div>


              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 block">Quick Actions</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateData({
                      status: sidebarData.status === 'Occupied' ? 'Available' : 'Occupied'
                    })}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded text-xs font-semibold transition-colors border border-slate-700"
                  >
                    Toggle Status
                  </button>
                  {/* Add more actions if needed */}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center space-y-4">
              <div className="text-4xl opacity-20">🗺️</div>
              <p className="text-sm max-w-[200px]">Select a plot using the map or search to view details.</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900 text-center">
          <button onClick={handleResetData} className="text-xs text-slate-600 hover:text-red-400 transition-colors">
            Reset All Data
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-slate-950">
        <CemeteryMap
          plots={plots}
          sections={sections}
          blocks={blocks}
          selectedPlot={selectedPlot}
          onPlotSelect={(plot) => {
            handlePlotSelect(plot);
            setIsSidebarOpen(true); // Open sidebar on mobile when plot selected
          }}
        />
      </div>
    </main>
  );
}
