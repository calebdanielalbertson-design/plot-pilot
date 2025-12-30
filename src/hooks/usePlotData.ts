import { useState, useEffect, useCallback } from "react";

export function usePlotData() {
    const [plots, setPlots] = useState<any>(null);
    const [sections, setSections] = useState<any>(null);
    const [blocks, setBlocks] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<any[]>([]);

    // Initial load
    useEffect(() => {
        async function loadData() {
            try {
                const plotsRes = await fetch("/Lots.geojson");
                const plotsData = await plotsRes.json();

                const sectionsRes = await fetch("/Cemetery_Sections.geojson");
                const sectionsData = await sectionsRes.json();

                const blocksRes = await fetch("/Cemetery_Blocks.geojson");
                const blocksData = await blocksRes.json();

                // Load custom data from localStorage
                const storedData = localStorage.getItem("plotPilotData");
                if (storedData) {
                    try {
                        const parsed = JSON.parse(storedData);
                        plotsData.features = plotsData.features.map((f: any) => {
                            const id = f.properties.OBJECTID;
                            const saved = parsed[id];
                            if (saved) {
                                return {
                                    ...f,
                                    properties: { ...f.properties, ...saved }
                                };
                            }
                            return f;
                        });
                    } catch (e) {
                        console.error("Failed to parse localStorage data", e);
                    }
                }

                // Load requests
                const storedRequests = localStorage.getItem("plotRequests");
                if (storedRequests) {
                    try {
                        setRequests(JSON.parse(storedRequests));
                    } catch (e) {
                        console.error("Failed to parse requests", e);
                    }
                }

                setPlots(plotsData);
                setSections(sectionsData);
                setBlocks(blocksData);
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Helper to update a specific plot's data
    const updatePlotProperties = useCallback((id: string | number, newProperties: any) => {
        setPlots((prevPlots: any) => {
            if (!prevPlots) return prevPlots;
            const updatedFeatures = prevPlots.features.map((f: any) => {
                // Ensure we match on the correct ID field from the new data (OBJECTID)
                const fId = f.properties.OBJECTID;
                if (fId === id) {
                    return {
                        ...f,
                        properties: { ...f.properties, ...newProperties }
                    };
                }
                return f;
            });
            return { ...prevPlots, features: updatedFeatures };
        });

        // Persist to localStorage
        const storedDataStr = localStorage.getItem("plotPilotData");
        let storedData = storedDataStr ? JSON.parse(storedDataStr) : {};
        storedData[id] = { ...storedData[id], ...newProperties };
        localStorage.setItem("plotPilotData", JSON.stringify(storedData));
    }, []);

    // Helper to approve a request (Update plot status + Remove request)
    const approveRequest = useCallback((req: any) => {
        // 1. Update Plot Status
        if (req.plotId) {
            // Determine new status based on request type/logic, default to Occupied or Reserved
            // If "At-Need" -> "Occupied", if "Pre-Need" -> "Reserved"
            const newStatus = req.requestType === 'At-Need' ? 'Occupied' : 'Reserved';

            const updateData: any = { status: newStatus };

            // If At-Need, can also update occupant name if provided
            if (req.requestType === 'At-Need' && req.deceasedName) {
                // Try to split name for F_NAME/L_NAME or just use Full Name if schema allows
                const parts = req.deceasedName.split(' ');
                if (parts.length > 1) {
                    updateData.F_NAME = parts[0];
                    updateData.L_NAME = parts.slice(1).join(' ');
                } else {
                    updateData.F_NAME = req.deceasedName;
                }
                if (req.deathDate) updateData.DOD = req.deathDate;
            }

            // Update the plot
            updatePlotProperties(parseInt(req.plotId) || req.plotId, updateData);
        }

        // 2. Remove Request
        setRequests(prev => {
            const updated = prev.filter(r => r.id !== req.id);
            localStorage.setItem("plotRequests", JSON.stringify(updated));
            return updated;
        });

    }, [updatePlotProperties]);

    // Helper to reject/delete a request
    const rejectRequest = useCallback((requestId: string) => {
        setRequests(prev => {
            const updated = prev.filter(r => r.id !== requestId);
            localStorage.setItem("plotRequests", JSON.stringify(updated));
            return updated;
        });
    }, []);

    return { plots, sections, blocks, loading, updatePlotProperties, requests, approveRequest, rejectRequest };
}
