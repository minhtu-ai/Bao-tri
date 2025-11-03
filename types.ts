export enum IntervalUnit {
  Days = 'days',
  Weeks = 'weeks',
  Months = 'months',
}

export interface MaintenanceTask {
  id: string;
  name: string;
  maintenanceInterval: number;
  intervalUnit: IntervalUnit;
  lastMaintenanceDate: string;
}

export interface Equipment {
  id: string;
  name: string;
  tasks: MaintenanceTask[];
}

export interface Workshop {
  id: string;
  name: string;
  equipment: Equipment[];
}

export interface HistoryEntry {
  id: string;
  workshopId: string;
  equipmentId: string;
  taskId: string;
  equipmentName: string;
  taskName: string;
  workshopName: string;
  maintenanceDate: string; // The date of completion, editable
  originalCompletionDate: string; // When the entry was created
  editCount: number;
  notes?: string;
}

export interface HistoryEntryWithStatus extends HistoryEntry {
  status: 'Đúng hạn' | 'Quá hạn';
  overdueDays: number;
}