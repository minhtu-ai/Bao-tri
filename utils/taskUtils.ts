import { MaintenanceTask, IntervalUnit, Equipment } from '../types';

export const getTaskStatus = (task: MaintenanceTask) => {
  const getNextMaintenanceDate = (): Date => {
    const lastDate = new Date(task.lastMaintenanceDate);
    // IMPORTANT: Dates from input type="date" are treated as UTC midnight.
    // We need to account for the timezone offset to prevent off-by-one-day errors.
    const lastDateUTC = new Date(lastDate.valueOf() + lastDate.getTimezoneOffset() * 60 * 1000);
    switch (task.intervalUnit) {
      case IntervalUnit.Days:
        return new Date(lastDateUTC.setDate(lastDateUTC.getDate() + task.maintenanceInterval));
      case IntervalUnit.Weeks:
        return new Date(lastDateUTC.setDate(lastDateUTC.getDate() + task.maintenanceInterval * 7));
      case IntervalUnit.Months:
        return new Date(lastDateUTC.setMonth(lastDateUTC.getMonth() + task.maintenanceInterval));
      default:
        return lastDateUTC;
    }
  };

  const nextMaintenanceDate = getNextMaintenanceDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastMaintenanceDate = new Date(task.lastMaintenanceDate);
  const lastMaintenanceDateUTC = new Date(lastMaintenanceDate.valueOf() + lastMaintenanceDate.getTimezoneOffset() * 60 * 1000);
  lastMaintenanceDateUTC.setHours(0,0,0,0);


  const totalDuration = nextMaintenanceDate.getTime() - lastMaintenanceDateUTC.getTime();
  const remainingTime = nextMaintenanceDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
  
  const progressPercentage = totalDuration > 0 ? Math.max(0, 100 - (remainingTime / totalDuration) * 100) : 100;
  const notificationThreshold = totalDuration * 0.10;

  let status: 'ok' | 'upcoming' | 'overdue' = 'ok';
  let statusText = `Còn ${daysRemaining} ngày`;
  let statusColor = 'bg-green-500';
  let textColor = 'text-green-800 dark:text-green-200';
  let bgColor = 'bg-white dark:bg-slate-800';

  if (daysRemaining <= 0) {
    status = 'overdue';
    statusText = `Quá hạn ${Math.abs(daysRemaining)} ngày`;
    statusColor = 'bg-red-500';
    textColor = 'text-red-800 dark:text-red-200';
    bgColor = 'bg-red-100/80 dark:bg-red-900/50';
  } else if (remainingTime <= notificationThreshold && totalDuration > 0) {
    status = 'upcoming';
    statusText = `Sắp tới hạn (còn ${daysRemaining} ngày)`;
    statusColor = 'bg-yellow-500';
    textColor = 'text-yellow-800 dark:text-yellow-200';
    bgColor = 'bg-yellow-100/80 dark:bg-yellow-900/50';
  }

  return {
    nextMaintenanceDate,
    daysRemaining,
    progressPercentage,
    status,
    statusText,
    statusColor,
    textColor,
    bgColor,
  };
};

export const getEquipmentNextDueDate = (equipment: Equipment): Date | null => {
  if (!equipment.tasks || equipment.tasks.length === 0) {
    return null;
  }

  const dueDates = equipment.tasks.map(task => getTaskStatus(task).nextMaintenanceDate);
  
  // Find the earliest date
  const earliestDate = new Date(Math.min.apply(null, dueDates.map(d => d.getTime())));
  
  return earliestDate;
};