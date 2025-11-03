import React, { useState } from 'react';
import { HistoryEntry } from '../types';
import { XMarkIcon } from './Icons';

interface EditHistoryModalProps {
  entry: HistoryEntry;
  onClose: () => void;
  onSave: (historyId: string, newDate: string) => void;
}

const EditHistoryModal: React.FC<EditHistoryModalProps> = ({ entry, onClose, onSave }) => {
  const [newDate, setNewDate] = useState(new Date(entry.maintenanceDate).toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(entry.id, newDate);
    onClose();
  };

  const editsRemaining = 2 - entry.editCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold">Chỉnh sửa lịch sử bảo trì</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
             <XMarkIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="mb-4 space-y-1 text-sm">
                <p><span className="font-semibold text-slate-600 dark:text-slate-300">Thiết bị:</span> {entry.equipmentName}</p>
                <p><span className="font-semibold text-slate-600 dark:text-slate-300">Hạng mục:</span> {entry.taskName}</p>
                <p><span className="font-semibold text-slate-600 dark:text-slate-300">Xưởng:</span> {entry.workshopName}</p>
            </div>
            <label htmlFor="maintenance-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Ngày bảo trì
            </label>
            <input
              id="maintenance-date"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              required
            />
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                Số lần sửa còn lại: {editsRemaining}
            </p>
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
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

export default EditHistoryModal;