export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type WorkOrderStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type IssueStatus = 'New' | 'Investigating' | 'Resolved';
export type BurialStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface WorkOrder {
    id: string;
    plotId?: string; // Linked to a specific plot if applicable
    title: string;
    description: string;
    status: WorkOrderStatus;
    priority: Priority;
    assignedTo?: string; // Could be "Grounds Crew A", "External Contractor"
    createdAt: string; // ISO Date
    updatedAt: string; // ISO Date
    dueDate?: string; // ISO Date
}

export interface IssueReport {
    id: string;
    location: {
        lat: number;
        lng: number;
    };
    description: string;
    photoUrl?: string; // Base64 data string for local storage
    reportedBy?: string;
    status: IssueStatus;
    reportedAt: string; // ISO Date
}

export interface BurialEvent {
    id: string;
    plotId: string;
    deceasedName: string;
    scheduledDate: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    funeralHome?: string;
    contactName?: string;
    contactPhone?: string;
    notes?: string;
    status: BurialStatus;
}
