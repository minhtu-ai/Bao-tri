import React, { useState, useEffect } from 'react';
import { MaintenanceTask, IntervalUnit } from '../types';
import { XMarkIcon } from './Icons';

interface EditTaskModalProps {
  task: MaintenanceTask;
  onClose: () => void;
  onSave: (updatedTask: MaintenanceTask) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onClose, onSave }) => {
  const [name, setName] = useState(task.name);
  const [interval, setInterval] = useState(task.maintenanceInterval);
  const [unit, setUnit] = useState<IntervalUnit>(task.intervalUnit);

  useEffect(() => {
    setName(task.name);
    setInterval(task.maintenanceInterval);
    setUnit(task.intervalUnit);
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && interval > 0) {
      onSave({ ...task, name: name.trim(), maintenanceInterval: interval, intervalUnit: unit });
      onClose();
    }
  };
  
  const inputStyle = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg transform transition-all">
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold">Chỉnh sửa hạng mục bảo trì</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
             <XMarkIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="task-name-edit" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tên hạng mục
              </label>
              <input
                id="task-name-edit" type="text" value={name} onChange={(e) => setName(e.target.value)}
                className={inputStyle} placeholder="Ví dụ: Thay dầu" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Định kỳ bảo trì
              </label>
              <div className="flex space-x-2">
                <input
                  type="number" value={interval} min="1" onChange={(e) => setInterval(parseInt(e.target.value, 10))}
                  className={`${inputStyle} w-1/3`} required
                />
                <select value={unit} onChange={(e) => setUnit(e.target.value as IntervalUnit)} className={`${inputStyle} w-2/3`}>
                  <option value={IntervalUnit.Days}>Ngày</option>
                  <option value={IntervalUnit.Weeks}>Tuần</option>
                  <option value={IntervalUnit.Months}>Tháng</option>
                </select>
              </div>
            </div>
             <p className="text-sm text-slate-500 dark:text-slate-400">
                Ngày bảo trì gần nhất không thể chỉnh sửa tại đây. Để cập nhật, hãy đánh dấu hạng mục là "Hoàn thành".
            </p>
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;