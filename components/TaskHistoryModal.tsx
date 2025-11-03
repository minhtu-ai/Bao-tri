import React, { useMemo } from 'react';
import { MaintenanceTask, Equipment, Workshop, HistoryEntry, IntervalUnit } from '../types';
import { XMarkIcon, CalendarDaysIcon, ClockIcon, WrenchScrewdriverIcon } from './Icons';

interface TaskHistoryModalProps {
  workshop: Workshop;
  equipment: Equipment;
  task: MaintenanceTask;
  history: HistoryEntry[];
  onClose: () => void;
}

const TaskHistoryModal: React.FC<TaskHistoryModalProps> = ({ workshop, equipment, task, history, onClose }) => {
  const taskHistory = useMemo(() => {
    return history
      .filter(entry => entry.taskId === task.id && entry.equipmentId === equipment.id && entry.workshopId === workshop.id)
      .sort((a, b) => new Date(b.maintenanceDate).getTime() - new Date(a.maintenanceDate).getTime());
  }, [history, task.id, equipment.id, workshop.id]);

  const getNextMaintenanceDate = (): Date => {
    const lastDate = new Date(task.lastMaintenanceDate);
    const lastDateUTC = new Date(lastDate.valueOf() + lastDate.getTimezoneOffset() * 60 * 1000);
    switch (task.intervalUnit) {
      case IntervalUnit.Days: return new Date(lastDateUTC.setDate(lastDateUTC.getDate() + task.maintenanceInterval));
      case IntervalUnit.Weeks: return new Date(lastDateUTC.setDate(lastDateUTC.getDate() + task.maintenanceInterval * 7));
      case IntervalUnit.Months: return new Date(lastDateUTC.setMonth(lastDateUTC.getMonth() + task.maintenanceInterval));
      default: return lastDateUTC;
    }
  };
  const nextMaintenanceDate = getNextMaintenanceDate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl h-[90vh] flex flex-col transform transition-all">
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-xl font-bold">Chi tiết hạng mục</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <XMarkIcon />
          </button>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-6">
              <div className="flex items-start mb-4">
                <WrenchScrewdriverIcon className="w-8 h-8 text-sky-500 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{task.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400">{equipment.name} / {workshop.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-md">
                      <p className="font-semibold text-slate-600 dark:text-slate-300">Định kỳ bảo trì</p>
                      <p>{task.maintenanceInterval} {task.intervalUnit === 'days' ? 'Ngày' : task.intervalUnit === 'weeks' ? 'Tuần' : 'Tháng'}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-md flex items-center">
                      <CalendarDaysIcon className="w-5 h-5 mr-3 text-blue-500"/>
                      <div>
                          <p className="font-semibold text-slate-600 dark:text-slate-300">Bảo trì gần nhất</p>
                          <p>{new Date(task.lastMaintenanceDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                  </div>
                   <div className="bg-white dark:bg-slate-800 p-3 rounded-md flex items-center">
                      <ClockIcon className="w-5 h-5 mr-3 text-green-500"/>
                      <div>
                          <p className="font-semibold text-slate-600 dark:text-slate-300">Đến hạn tiếp theo</p>
                          <p>{nextMaintenanceDate.toLocaleDateString('vi-VN')}</p>
                      </div>
                  </div>
              </div>
          </div>
          
          <h4 className="text-lg font-semibold mb-3">Lịch sử hoạt động</h4>
          {taskHistory.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">Chưa có hoạt động nào được ghi nhận cho hạng mục này.</p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Ngày hoàn thành</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Ngày ghi nhận</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {taskHistory.map(entry => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{new Date(entry.maintenanceDate).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{new Date(entry.originalCompletionDate).toLocaleString('vi-VN')}</td>
                      <td className="px-6 py-4 whitespace-normal text-sm text-slate-500 dark:text-slate-300 break-words">{entry.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end sticky bottom-0">
          <button
            type="button" onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskHistoryModal;