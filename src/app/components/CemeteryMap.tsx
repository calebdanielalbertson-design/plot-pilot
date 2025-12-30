"use client";

import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState, useRef } from "react";
import { useMaintenanceData } from '../hooks/useMaintenanceData';
import { useAdmin } from '../context/AdminContext';
import AdminLoginModal from './AdminLoginModal';

// Fix for default marker icon in Next.js (Leaflet 1.7.1)
// We only run this on client, technically L depends on window
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";

// Define custom icons
let occupiedIcon: L.Icon;
let availableIcon: L.Icon;

if (typeof window !== 'undefined') {
    occupiedIcon = new L.Icon({
        iconUrl: '/marker-occupied.svg',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [24, 36],
        iconAnchor: [12, 36],
        popupAnchor: [1, -34],
        shadowSize: [36, 36]
    });

    availableIcon = new L.Icon({
        iconUrl: '/marker-available.svg',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [24, 36],
        iconAnchor: [12, 36],
        popupAnchor: [1, -34],
        shadowSize: [36, 36]
    });
}

interface CemeteryMapProps {
    plots: any;
    sections: any;
    blocks: any;
    onPlotSelect: (plot: any) => void;
    selectedPlot: any;
    updatePlotProperties?: (id: string | number, data: any) => void;
}

// Internal Edit Modal Component
function EditPlotModal({ plot, onClose, onSave }: { plot: any, onClose: () => void, onSave: (id: string | number, data: any) => void }) {
    const [formData, setFormData] = useState({
        status: plot.properties.status || (plot.properties.LOTSTATUS === "Has Burial" ? "Occupied" : "Available"),
        firstName: plot.properties.F_NAME || "",
        lastName: plot.properties.L_NAME || "",
        burialDate: plot.properties.BURIALDATE || ""
    });

    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = () => {
        const updates: any = {
            status: formData.status,
            F_NAME: formData.firstName,
            L_NAME: formData.lastName,
            BURIALDATE: formData.burialDate
        };
        // Update LOTSTATUS to match for consistency if possible, or just rely on 'status' overrides
        if (formData.status === 'Occupied') updates.LOTSTATUS = "Has Burial";
        else if (formData.status === 'Reserved') updates.LOTSTATUS = "Reserved";
        else updates.LOTSTATUS = "Available";

        onSave(plot.properties.OBJECTID, updates);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
        >
            <div className="bg-white rounded-lg shadow-2xl p-6 w-96 max-w-full animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 text-slate-800">Edit Plot {plot.properties.OBJECTID}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full border rounded px-2 py-1 text-sm bg-white"
                        >
                            <option value="Available">Available</option>
                            <option value="Occupied">Occupied</option>
                            <option value="Reserved">Reserved</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">First Name</label>
                        <input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full border rounded px-2 py-1 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Last Name</label>
                        <input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full border rounded px-2 py-1 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Burial Date</label>
                        <input
                            name="burialDate"
                            value={formData.burialDate}
                            onChange={handleChange}
                            placeholder="YYYY or MM/DD/YYYY"
                            className="w-full border rounded px-2 py-1 text-sm"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded text-sm">Cancel</button>
                    <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm font-medium">Save Changes</button>
                </div>
            </div>
        </div>
    );
}

function MapContent({ plots, sections, blocks, onPlotSelect, selectedPlot, updatePlotProperties }: CemeteryMapProps) {
    const map = useMap();
    const [viewMode, setViewMode] = useState<'standard' | 'availability' | 'blocks' | 'timeline' | 'maintenance'>('standard');
    const { workOrders, issues } = useMaintenanceData();
    const { isAuthenticated } = useAdmin(); // Use context

    // Admin Mode State
    const [isAdminMode, setIsAdminMode] = useState(false);
    const isAdminModeRef = useRef(false);
    const [editingPlot, setEditingPlot] = useState<any>(null);
    const [showLogin, setShowLogin] = useState(false); // Local login modal state

    // Sync ref
    useEffect(() => { isAdminModeRef.current = isAdminMode; }, [isAdminMode]);

    // Handle Admin Toggle
    const handleAdminToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        if (checked) {
            if (isAuthenticated) {
                setIsAdminMode(true);
            } else {
                setShowLogin(true);
            }
        } else {
            setIsAdminMode(false);
        }
    };

    // Timeline State
    const [minYear, setMinYear] = useState<number>(1900);
    const [maxYear, setMaxYear] = useState<number>(new Date().getFullYear());
    const [filterRange, setFilterRange] = useState<[number, number]>([1900, new Date().getFullYear()]);

    const geoJsonRef = useRef<L.GeoJSON | null>(null);
    const layerMap = useRef<Map<string | number, L.Layer>>(new Map());

    // Helper to get burial year from various properties
    const getBurialYear = (props: any): number | null => {
        const dateStr = props.BURIALDATE || props.DOD || props.DateOfDeath;
        if (dateStr) {
            const match = dateStr.toString().match(/\d{4}/);
            if (match) {
                return parseInt(match[0], 10);
            }
        }
        return null;
    };

    // Calculate Min/Max years from data
    useEffect(() => {
        if (plots && plots.features) {
            let min = new Date().getFullYear();
            let max = 1800;
            let hasDates = false;

            plots.features.forEach((f: any) => {
                const year = getBurialYear(f.properties);
                if (year) {
                    if (year > 1800 && year <= new Date().getFullYear()) {
                        if (year < min) min = year;
                        if (year > max) max = year;
                        hasDates = true;
                    }
                }
            });

            if (hasDates) {
                setMinYear(min);
                setMaxYear(max);
                // Initialize range to full
                setFilterRange([min, max]);
            }
        }
    }, [plots]);

    // Auto-fit bounds when data loads
    useEffect(() => {
        if (!map) return;

        const layers: L.Layer[] = [];

        if (sections && sections.features) {
            const sectionLayer = L.geoJSON(sections);
            layers.push(sectionLayer);
        }

        if (blocks && blocks.features) {
            const blockLayer = L.geoJSON(blocks);
            layers.push(blockLayer);
        }

        if (plots && plots.features) {
            const plotLayer = L.geoJSON(plots);
            layers.push(plotLayer);
        }

        if (layers.length > 0) {
            const group = L.featureGroup(layers);
            if (group.getLayers().length > 0) {
                try {
                    map.fitBounds(group.getBounds(), { padding: [50, 50] });
                } catch (e) {
                    console.error("Could not fit bounds", e);
                }
            }
        }
    }, [map, plots, sections, blocks]);

    // Fly to selected plot
    useEffect(() => {
        if (!map || !selectedPlot) return;

        let center: L.LatLngExpression | null = null;
        try {
            const geoJsonLayer = L.geoJSON(selectedPlot);
            const bounds = geoJsonLayer.getBounds();
            if (bounds.isValid()) {
                center = bounds.getCenter();
            } else {
                const geometry = selectedPlot.geometry;
                if (geometry.type === 'Point') {
                    const coords = geometry.coordinates;
                    center = [coords[1], coords[0]];
                }
            }
        } catch (e) { console.error("Error calculating center for flyTo", e); }

        if (center) map.flyTo(center, map.getMaxZoom(), { animate: true, duration: 1.5 });
    }, [map, selectedPlot]);

    // Helper to style sections
    const onEachSection = (feature: any, layer: L.Layer) => {
        const name = feature.properties.Section || feature.properties.name || `Section ${feature.properties.OBJECTID}`;
        if (name) layer.bindTooltip(`Section ${name}`, { permanent: true, direction: "center", className: "section-label" });
    };

    const sectionStyle = { color: "#3b82f6", weight: 2, fillOpacity: 0.1 };
    const blockStyle = { color: "#a855f7", weight: 1, fillOpacity: 0.05, dashArray: "5, 5" };

    // Helper to determine style based on feature and viewMode
    const getPlotStyle = (feature: any) => {
        let status = feature.properties.status;
        if (!status) {
            if (feature.properties.LOTSTATUS === "Has Burial") status = "Occupied";
            else if (feature.properties.LOTSTATUS === "Reserved") status = "Reserved";
            else status = "Available";
        }

        let color = "#22c55e"; // Default Green
        let fillOpacity = 0.8;
        let weight = 0.5;
        let strokeColor = "#000";

        if (viewMode === 'availability') {
            if (status === 'Available') {
                color = "#4ade80"; // Bright Green
                fillOpacity = 0.9;
                weight = 1;
            } else {
                color = "#9ca3af"; // Gray/Dimmed
                fillOpacity = 0.3;
                weight = 0.5;
            }
        } else if (viewMode === 'timeline') {
            const year = getBurialYear(feature.properties);

            // Show only if it has a burial year within range
            if (status === 'Occupied' && year && year >= filterRange[0] && year <= filterRange[1]) {
                color = "#ef4444"; // Red (Active Burial in Range)
                fillOpacity = 0.9;
                weight = 1;
            } else {
                color = "#eee"; // Very Light Gray
                fillOpacity = 0.1;
                weight = 0;
            }

        } else if (viewMode === 'blocks') {
            // Hide plots in blocks view (handled by conditional rendering, but good to have style fallback)
            fillOpacity = 0;
            weight = 0;
        } else if (viewMode === 'maintenance') {
            const hasWorkOrder = workOrders.some(w => w.plotId === feature.properties.id || w.plotId === feature.properties.OBJECTID);
            if (hasWorkOrder) {
                color = "#eab308"; // Yellow
                fillOpacity = 0.8;
                weight = 2;
            } else {
                color = "#94a3b8"; // Slate 400
                fillOpacity = 0.1;
                weight = 0.5;
            }
        } else {
            // Standard Mode
            if (status === 'Occupied') color = "#ef4444"; // Red
            else if (status === 'Reserved') color = "#eab308"; // Yellow
            else color = "#22c55e"; // Green
        }

        return {
            fillColor: color,
            color: strokeColor,
            weight: weight,
            fillOpacity: fillOpacity,
            opacity: 1
        };
    };

    // Update style reactively when selectedPlot or viewMode changes
    useEffect(() => {
        layerMap.current.forEach((layer, id) => {
            // Handle both CircleMarkers (Points) and Polygons (L.Path)
            if (layer instanceof L.Path) {
                // @ts-ignore
                const feature = layer.feature;
                if (!feature) return;

                const style = getPlotStyle(feature);

                // Highlight selected plot
                const isSelected = selectedPlot && (selectedPlot.properties.id === id || selectedPlot.properties.OBJECTID === id);
                if (isSelected) {
                    layer.setStyle({ ...style, weight: 3, color: '#fff', fillOpacity: 1 });
                    if (layer instanceof L.CircleMarker) {
                        layer.bringToFront();
                    }
                } else {
                    layer.setStyle(style);
                }
            }
        });
    }, [selectedPlot, viewMode, filterRange]);



    return (
        <>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                maxNativeZoom={19}
                maxZoom={22}
            />

            {sections && <GeoJSON data={sections} style={sectionStyle} onEachFeature={onEachSection} />}

            {blocks && <GeoJSON data={blocks} style={blockStyle} />}

            {viewMode === 'maintenance' && issues.map((issue) => (
                <Marker
                    key={issue.id}
                    position={[issue.location.lat, issue.location.lng]}
                >
                    <Popup>
                        <div className="text-sm">
                            <strong className="text-orange-600 block mb-1">⚠️ Issue Reported</strong>
                            <p>{issue.description}</p>
                            <div className="text-xs text-slate-500 mt-1">{new Date(issue.reportedAt).toLocaleDateString()}</div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Render Plots - Always Render in standard, availability, and timeline. Conditional only for Blocks */}
            {plots && viewMode !== 'blocks' && (
                <GeoJSON
                    ref={geoJsonRef}
                    data={plots}
                    style={getPlotStyle} // Apply style to Polygons
                    pointToLayer={(feature, latlng) => {
                        // Hide circle markers in Timeline mode if they don't match
                        const style = getPlotStyle(feature);
                        const isHidden = style.fillOpacity === 0 || style.fillOpacity === 0.1; // Check if dimmed/hidden

                        if (viewMode === 'timeline' && isHidden) {
                            return L.circleMarker(latlng, { radius: 0, opacity: 0, fillOpacity: 0 });
                        }

                        return L.circleMarker(latlng, {
                            radius: viewMode === 'availability' && style.fillColor === "#4ade80" ? 4 : 3,
                            ...style
                        });
                    }}
                    onEachFeature={(feature, layer) => {
                        const id = feature.properties.id || feature.properties.OBJECTID;
                        layerMap.current.set(id, layer);

                        layer.on({
                            click: (e) => {
                                if (isAdminModeRef.current) {
                                    L.DomEvent.stopPropagation(e);
                                    setEditingPlot(feature);
                                } else {
                                    onPlotSelect(feature);
                                }
                            }
                        });

                        // Tooltip logic
                        let name = feature.properties.name;
                        if (!name) {
                            if (feature.properties.F_NAME && feature.properties.L_NAME) {
                                name = `${feature.properties.F_NAME} ${feature.properties.L_NAME}`;
                            } else {
                                const status = feature.properties.status || (feature.properties.LOTSTATUS === "Has Burial" ? "Occupied" : "Available");
                                name = status;
                            }
                        }

                        layer.bindTooltip(
                            `${name} (${id})`,
                            { direction: "top", opacity: 0.9 }
                        );
                    }}
                />
            )}

            {/* View Mode Toggle Control */}
            <div className="leaflet-top leaflet-right">
                <div className="leaflet-control leaflet-bar flex flex-col items-end gap-2" style={{ marginTop: '80px', marginRight: '10px', backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}>

                    {/* View Mode Selector */}
                    <div className="bg-white p-1 rounded shadow-md border border-slate-300">
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value as any)}
                            style={{ padding: '4px', fontSize: '12px', cursor: 'pointer', border: 'none', outline: 'none' }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onDoubleClick={(e) => e.stopPropagation()}
                        >
                            <option value="standard">Standard View</option>
                            <option value="availability">Availability View</option>
                            <option value="blocks">Blocks View</option>
                            <option value="timeline">Burial Timeline</option>
                            <option value="maintenance">Maintenance Mode</option>
                        </select>
                    </div>

                    {/* Timeline Controls */}
                    {viewMode === 'timeline' && (
                        <div className="bg-white p-3 rounded shadow-lg border border-slate-300 w-64 animate-in slide-in-from-right-2 fade-in duration-200"
                            onMouseDown={(e) => e.stopPropagation()}
                            onDoubleClick={(e) => e.stopPropagation()}
                            onWheel={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-700">Burial Timeline</span>
                                <span className="text-[10px] text-slate-500">{filterRange[0]} - {filterRange[1]}</span>
                            </div>

                            {/* Simple Dual Inputs for MVP */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={minYear}
                                    max={filterRange[1]}
                                    value={filterRange[0]}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (val >= minYear && val <= filterRange[1]) setFilterRange([val, filterRange[1]]);
                                    }}
                                    className="w-16 text-xs border rounded px-1 py-0.5"
                                />
                                <span className="text-slate-400">-</span>
                                <input
                                    type="number"
                                    min={filterRange[0]}
                                    max={maxYear}
                                    value={filterRange[1]}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (val >= filterRange[0] && val <= maxYear) setFilterRange([filterRange[0], val]);
                                    }}
                                    className="w-16 text-xs border rounded px-1 py-0.5"
                                />
                            </div>

                            {/* Range Slider Visualization (Mock/Simple) */}
                            <input
                                type="range"
                                min={minYear}
                                max={maxYear}
                                value={filterRange[1]} // Controls max for now, dual slider is harder with input[type=range] without custom css/lib.
                                onChange={(e) => {
                                    // Just control the end year for simple "Timeline progress" feel
                                    const val = parseInt(e.target.value);
                                    setFilterRange([minYear, val]);
                                }}
                                className="w-full mt-2 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="text-[9px] text-slate-400 mt-1 text-center">Drag to adjust end year</div>
                        </div>
                    )}

                    {/* Admin Mode Toggle */}
                    <div className="bg-white p-2 rounded shadow-md border border-slate-300 pointer-events-auto"
                        onMouseDown={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
                    >
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAdminMode}
                                onChange={handleAdminToggle}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-xs font-bold text-slate-700">Admin Mode</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingPlot && (
                <EditPlotModal
                    plot={editingPlot}
                    onClose={() => setEditingPlot(null)}
                    onSave={(id, data) => {
                        if (updatePlotProperties) updatePlotProperties(id, data);
                    }}
                />
            )}

            {/* Login Modal */}
            {showLogin && (
                <AdminLoginModal
                    onClose={() => setShowLogin(false)}
                    onSuccess={() => setIsAdminMode(true)}
                />
            )}
        </>
    );
}

export default function CemeteryMap(props: CemeteryMapProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return (
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100%", width: "100%" }} maxZoom={22}>
            <MapContent {...props} />
        </MapContainer>
    );
}
