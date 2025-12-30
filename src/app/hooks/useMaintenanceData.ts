import { useState, useEffect } from 'react';
import { WorkOrder, IssueReport, BurialEvent } from '../types/maintenance';

const STORAGE_KEYS = {
    WORK_ORDERS: 'plot_pilot_work_orders',
    ISSUES: 'plot_pilot_issues',
    BURIALS: 'plot_pilot_burials'
};

export function useMaintenanceData() {
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [issues, setIssues] = useState<IssueReport[]>([]);
    const [burials, setBurials] = useState<BurialEvent[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadData = () => {
            try {
                const loadedOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORK_ORDERS) || '[]');
                const loadedIssues = JSON.parse(localStorage.getItem(STORAGE_KEYS.ISSUES) || '[]');
                const loadedBurials = JSON.parse(localStorage.getItem(STORAGE_KEYS.BURIALS) || '[]');

                setWorkOrders(loadedOrders);
                setIssues(loadedIssues);
                setBurials(loadedBurials);
                setIsLoaded(true);
            } catch (e) {
                console.error("Failed to load maintenance data", e);
            }
        };

        loadData();
    }, []);

    const saveToStorage = (key: string, data: any) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    // Work Order Actions
    const addWorkOrder = (order: WorkOrder) => {
        const updated = [order, ...workOrders];
        setWorkOrders(updated);
        saveToStorage(STORAGE_KEYS.WORK_ORDERS, updated);
    };

    const updateWorkOrder = (updatedOrder: WorkOrder) => {
        const updated = workOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        setWorkOrders(updated);
        saveToStorage(STORAGE_KEYS.WORK_ORDERS, updated);
    };

    // Issue Reporting Actions
    const reportIssue = (issue: IssueReport) => {
        const updated = [issue, ...issues];
        setIssues(updated);
        saveToStorage(STORAGE_KEYS.ISSUES, updated);
    };

    const resolveIssue = (issueId: string) => {
        const updated = issues.map(i => i.id === issueId ? { ...i, status: 'Resolved' as const } : i);
        setIssues(updated);
        saveToStorage(STORAGE_KEYS.ISSUES, updated);
    };

    // Burial Actions
    const scheduleBurial = (event: BurialEvent) => {
        const updated = [event, ...burials].sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
        setBurials(updated);
        saveToStorage(STORAGE_KEYS.BURIALS, updated);
    };

    return {
        workOrders,
        issues,
        burials,
        isLoaded,
        addWorkOrder,
        updateWorkOrder,
        reportIssue,
        resolveIssue,
        scheduleBurial
    };
}
