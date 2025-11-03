import React, { useState, useMemo } from 'react';
import { HistoryEntry, Workshop, HistoryEntryWithStatus } from '../types';
import { exportToExcel } from '../services/excelExport';
import EditHistoryModal from './EditHistoryModal';
import { calculateHistoryTimeliness } from '../utils/historyUtils';
import { XMarkIcon, DocumentArrowDownIcon, PencilIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';

interface HistoryModalProps {
  onClose: () => void;
  history: HistoryEntry[];
  workshops: Workshop[];
  onUpdateHistory: (historyId: string, newDate: string) => void;
  userRole: 'editor' | 'viewer';
}

type SortKey = 'workshopName' | 'equipmentName' | 'taskName' | 'maintenanceDate' | 'status';
type SortDirection = 'asc' | 'desc';

const HistoryModal: React.FC<HistoryModalProps> = ({ onClose, history, workshops, onUpdateHistory, userRole }) => {
  const [editingEntry, setEditingEntry] = useState<HistoryEntry | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('maintenanceDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedWorkshop, setSelectedWorkshop] = useState('all');

  const processedHistory = useMemo(() => {
    return calculateHistoryTimeliness(history, workshops);
  }, [history, workshops]);

  const filteredHistory = useMemo(() => {
    return processedHistory.filter(entry => {
        // Workshop filter
        if (selectedWorkshop !== 'all' && entry.workshopId !== selectedWorkshop) {
            return false;
        }

        if (startDate || endDate) {
            const entryDate = new Date(entry.maintenanceDate);
            
            // Start date filter
            if (startDate) {
                const start = new Date(startDate);
                if (entryDate < start) {
                    return false;
                }
            }

            // End date filter
            if (endDate) {
                const end = new Date(endDate);
                if (entryDate > end) {
                    return false;
                }
            }
        }
        
        return true;
    });
  }, [processedHistory, selectedWorkshop, startDate, endDate]);

  const sortedHistory = useMemo(() => {
    const sortable = [...filteredHistory];
    sortable.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (sortKey === 'maintenanceDate') {
            return new Date(valA as string).getTime() - new Date(valB as string).getTime();
        }
        
        if (sortKey === 'status') {
            // Overdue items come first when sorting by status
            if (a.status === 'Quá hạn' && b.status !== 'Quá hạn') return -1;
            if (a.status !== 'Quá hạn' && b.status === 'Quá hạn') return 1;
            // If both are overdue, sort by how many days
            if (a.status === 'Quá hạn' && b.status === 'Quá hạn') return b.overdueDays - a.overdueDays;
            return 0;
        }

        if (valA < valB) return -1;
        if (valA > valB) return 1;
        return 0;
    });

    if (sortDirection === 'desc') {
        sortable.reverse();
    }
    return sortable;
  }, [filteredHistory, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
        setSortKey(key);
        setSortDirection('asc');
    }
  };

  const handleSaveEdit = (historyId: string, newDate: string) => {
      onUpdateHistory(historyId, newDate);
      setEditingEntry(null);
  };

  const SortableHeader: React.FC<{sortKeyName: SortKey, children: React.ReactNode}> = ({ sortKeyName, children }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
        <button onClick={() => handleSort(sortKeyName)} className="flex items-center space-x-1 group">
            <span>{children}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                {sortKey === sortKeyName ? (sortDirection === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />) : <ChevronDownIcon className="text-slate-400"/>}
            </span>
        </button>
    </th>
  )

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col transform transition-all">
          <div className="flex justify-between items-center p-4 border-b dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
            <h2 className="text-xl font-bold">Lịch sử bảo trì</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportToExcel(sortedHistory)}
                className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-white dark:focus:ring-offset-slate-800 disabled:opacity-50"
                disabled={sortedHistory.length === 0}
              >
                <DocumentArrowDownIcon />
                <span className="ml-2 hidden sm:inline">Xuất Excel</span>
              </button>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                <XMarkIcon />
              </button>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <div>
                <label htmlFor="workshop-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Xưởng</label>
                <select 
                    id="workshop-filter"
                    value={selectedWorkshop}
                    onChange={e => setSelectedWorkshop(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                    <option value="all">Tất cả xưởng</option>
                    {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="start-date-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Từ ngày</label>
                <input 
                    id="start-date-filter"
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
            </div>
            <div>
                <label htmlFor="end-date-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Đến ngày</label>
                <input 
                    id="end-date-filter"
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
            </div>
            <div>
                <button
                    onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setSelectedWorkshop('all');
                    }}
                    className="w-full px-4 py-2 bg-slate-500 text-white rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:bg-slate-600 dark:hover:bg-slate-500 dark:focus:ring-offset-slate-800"
                >
                    Xóa bộ lọc
                </button>
            </div>
          </div>
          <div className="p-6 flex-grow overflow-y-auto">
            {sortedHistory.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400">Không có lịch sử nào khớp với bộ lọc.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                      <SortableHeader sortKeyName="workshopName">Xưởng</SortableHeader>
                      <SortableHeader sortKeyName="equipmentName">Tên thiết bị</SortableHeader>
                      <SortableHeader sortKeyName="taskName">Hạng mục</SortableHeader>
                      <SortableHeader sortKeyName="maintenanceDate">Ngày bảo trì</SortableHeader>
                      <SortableHeader sortKeyName="status">Tình trạng</SortableHeader>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Ghi chú</th>
                      {userRole === 'editor' && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {sortedHistory.map(entry => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{entry.workshopName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{entry.equipmentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{entry.taskName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{new Date(entry.maintenanceDate).toLocaleDateString('vi-VN')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {entry.status === 'Quá hạn' ? (
                                <span className="font-semibold text-red-600 dark:text-red-400">
                                    Quá hạn {entry.overdueDays} ngày
                                </span>
                            ) : (
                                <span className="font-semibold text-green-600 dark:text-green-400">
                                    Đúng hạn
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-slate-500 dark:text-slate-300 break-words max-w-xs">{entry.notes || ''}</td>
                        {userRole === 'editor' && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                                onClick={() => setEditingEntry(entry)}
                                disabled={entry.editCount >= 2}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={entry.editCount >= 2 ? "Đã hết lượt chỉnh sửa" : `Sửa (còn ${2 - entry.editCount} lượt)`}
                            >
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            </td>
                        )}
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
      {editingEntry && userRole === 'editor' && (
        <EditHistoryModal 
            entry={editingEntry}
            onClose={() => setEditingEntry(null)}
            onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

export default HistoryModal;
