import React from 'react';
import { MaintenanceTask, IntervalUnit } from '../types';
import { BellIcon, ExclamationTriangleIcon } from './Icons';

export interface UpcomingTask extends MaintenanceTask {
    workshopId: string;
    equipmentId: string;
    taskId: string;
    workshopName: string;
    equipmentName: string;
    taskName: string;
    status: 'ok' | 'upcoming' | 'overdue';
    daysRemaining: number;
}


interface NotificationsPanelProps {
  tasks: UpcomingTask[];
  onTaskClick: (ids: { workshopId: string, equipmentId: string, taskId: string }) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ tasks, onTaskClick }) => {

  const getStatusInfo = (task: UpcomingTask) => {
    if (task.status === 'overdue') {
      return {
        text: `Quá hạn ${Math.abs(task.daysRemaining)} ngày`,
        color: 'text-red-500 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/50',
      };
    }
    return {
      text: `Còn ${task.daysRemaining} ngày`,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
    };
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center">
        <BellIcon className="w-6 h-6 text-sky-500 mr-3"/>
        <h2 className="text-lg font-bold">Thông báo sắp đến hạn</h2>
      </div>
      <div className="flex-grow overflow-y-auto p-2">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 dark:text-slate-400">Không có thông báo nào.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.map(task => {
                const statusInfo = getStatusInfo(task);
                return (
                    <li 
                        key={task.id} 
                        onClick={() => onTaskClick({ workshopId: task.workshopId, equipmentId: task.equipmentId, taskId: task.taskId })}
                        className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 ${statusInfo.bgColor}`}
                    >
                        <p className="font-bold text-slate-800 dark:text-slate-100">{task.taskName}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{task.equipmentName} / {task.workshopName}</p>
                        <div className={`mt-1 text-sm font-semibold flex items-center ${statusInfo.color}`}>
                            <ExclamationTriangleIcon className="w-4 h-4 mr-1.5" />
                            <span>{statusInfo.text}</span>
                        </div>
                    </li>
                )
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;