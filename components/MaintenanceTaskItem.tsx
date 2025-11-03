import React from 'react';
import { MaintenanceTask } from '../types';
import { getTaskStatus } from '../utils/taskUtils';
import { WrenchScrewdriverIcon, CheckCircleIcon, ExclamationTriangleIcon, CalendarDaysIcon, ClockIcon, PencilSquareIcon, ListBulletIcon } from './Icons';

interface MaintenanceTaskItemProps {
  task: MaintenanceTask;
  isHighlighted: boolean;
  onComplete: () => void;
  onEdit: () => void;
  onViewDetails: () => void;
  userRole: 'editor' | 'viewer';
}

const MaintenanceTaskItem = React.forwardRef<HTMLDivElement, MaintenanceTaskItemProps>(
    ({ task, isHighlighted, onComplete, onEdit, onViewDetails, userRole }, ref) => {
    
    const {
        nextMaintenanceDate,
        status,
        statusText,
        statusColor,
        textColor,
        bgColor,
        progressPercentage,
    } = getTaskStatus(task);

    const ActionButton: React.FC<{ onClick: (e: React.MouseEvent) => void; children: React.ReactNode; 'aria-label': string; className?: string; }> = ({ onClick, children, 'aria-label': ariaLabel, className = '' }) => (
        <button
        onClick={onClick}
        aria-label={ariaLabel}
        className={`p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${className}`}
        >
        {children}
        </button>
    );
    
    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div ref={ref} className={`rounded-lg p-3 transition-all duration-300 border-l-4 ${isHighlighted ? 'ring-2 ring-sky-500' : ''} ${bgColor} border-transparent`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-4 sm:mb-0 cursor-pointer flex-grow" onClick={onViewDetails}>
                <WrenchScrewdriverIcon className="w-6 h-6 text-slate-500 mr-3 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{task.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                    Định kỳ: {task.maintenanceInterval} {task.intervalUnit === 'days' ? 'ngày' : task.intervalUnit === 'weeks' ? 'tuần' : 'tháng'}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2" onClick={stopPropagation}>
                <ActionButton onClick={onViewDetails} aria-label="Xem chi tiết và lịch sử"><ListBulletIcon className="w-5 h-5" /></ActionButton>
                {userRole === 'editor' && (
                    <>
                        <ActionButton onClick={onEdit} aria-label="Sửa hạng mục"><PencilSquareIcon className="w-5 h-5" /></ActionButton>
                        <button
                            onClick={onComplete}
                            className="flex items-center bg-blue-500 text-white px-2.5 py-1.5 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-transform transform hover:scale-105 text-xs"
                        >
                            <CheckCircleIcon className="w-5 h-5" />
                            <span className="ml-2 hidden sm:inline">Hoàn thành</span>
                        </button>
                    </>
                )}
            </div>
        </div>
        <div className="mt-3 cursor-pointer" onClick={onViewDetails}>
            <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300 mb-2">
                <div className="flex items-center">
                    <CalendarDaysIcon className="w-4 h-4 mr-2" />
                    <span>Bảo trì gần nhất: {new Date(task.lastMaintenanceDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center font-semibold">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    <span>Đến hạn: {nextMaintenanceDate.toLocaleDateString('vi-VN')}</span>
                </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div className={`${statusColor} h-2.5 rounded-full`} style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <div className={`mt-2 text-sm font-semibold flex items-center ${textColor}`}>
                {status !== 'ok' && <ExclamationTriangleIcon className="w-5 h-5 mr-2" />}
                <span>{statusText}</span>
            </div>
        </div>
        </div>
    );
});

export default MaintenanceTaskItem;
