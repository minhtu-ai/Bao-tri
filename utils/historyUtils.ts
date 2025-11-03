import { Workshop, HistoryEntry, MaintenanceTask, IntervalUnit, HistoryEntryWithStatus } from '../types';

// Helper to calculate the next due date from a given start date
const calculateNextDueDate = (startDate: string, interval: number, unit: IntervalUnit): Date => {
    const lastDate = new Date(startDate);
    const lastDateUTC = new Date(lastDate.valueOf() + lastDate.getTimezoneOffset() * 60 * 1000);
    switch (unit) {
        case IntervalUnit.Days: return new Date(lastDateUTC.setDate(lastDateUTC.getDate() + interval));
        case IntervalUnit.Weeks: return new Date(lastDateUTC.setDate(lastDateUTC.getDate() + interval * 7));
        case IntervalUnit.Months: return new Date(lastDateUTC.setMonth(lastDateUTC.getMonth() + interval));
        default: return lastDateUTC;
    }
};

// Helper to calculate the difference in days between two dates, ignoring time.
const diffInDays = (date1: Date, date2: Date): number => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return Math.ceil((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
};


export const calculateHistoryTimeliness = (history: HistoryEntry[], workshops: Workshop[]): HistoryEntryWithStatus[] => {
    if (!history.length || !workshops.length) return history.map(h => ({...h, status: 'Đúng hạn', overdueDays: 0}));

    const tasksMap = new Map<string, MaintenanceTask>();
    workshops.forEach(workshop => {
        workshop.equipment.forEach(equip => {
            equip.tasks.forEach(task => {
                tasksMap.set(task.id, task);
            });
        });
    });

    const historyByTask: { [taskId: string]: HistoryEntry[] } = {};
    history.forEach(entry => {
        if (!historyByTask[entry.taskId]) {
            historyByTask[entry.taskId] = [];
        }
        historyByTask[entry.taskId].push(entry);
    });

    const processedEntries: HistoryEntryWithStatus[] = [];

    Object.values(historyByTask).forEach(taskEntries => {
        // Sort entries for a specific task by completion date, oldest first
        const sortedEntries = [...taskEntries].sort((a, b) => new Date(a.maintenanceDate).getTime() - new Date(b.maintenanceDate).getTime());

        for (let i = 0; i < sortedEntries.length; i++) {
            const currentEntry = sortedEntries[i];
            const taskDetails = tasksMap.get(currentEntry.taskId);

            if (i === 0 || !taskDetails) {
                // First entry for a task is always on time, or if task details are missing
                processedEntries.push({ ...currentEntry, status: 'Đúng hạn', overdueDays: 0 });
                continue;
            }

            const previousEntry = sortedEntries[i - 1];
            const dueDate = calculateNextDueDate(previousEntry.maintenanceDate, taskDetails.maintenanceInterval, taskDetails.intervalUnit);
            const completionDate = new Date(currentEntry.maintenanceDate);

            const overdueDays = diffInDays(completionDate, dueDate);

            if (overdueDays > 0) {
                processedEntries.push({ ...currentEntry, status: 'Quá hạn', overdueDays });
            } else {
                processedEntries.push({ ...currentEntry, status: 'Đúng hạn', overdueDays: 0 });
            }
        }
    });

    return processedEntries;
};
