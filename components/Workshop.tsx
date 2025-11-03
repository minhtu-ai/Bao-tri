import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Workshop as WorkshopType, Equipment as EquipmentType, HistoryEntry } from '../types';
import AddEquipmentModal from './AddEquipmentModal';
import EquipmentAccordion from './EquipmentAccordion';
import { PlusIcon, TrashIcon, PencilSquareIcon, ChevronDownIcon, CheckIcon } from './Icons';
import { getEquipmentNextDueDate } from '../utils/taskUtils';

interface WorkshopProps {
  workshop: WorkshopType;
  history: HistoryEntry[];
  onUpdate: (workshop: WorkshopType) => void;
  onDelete: (workshopId: string) => void;
  onCompleteMaintenance: (workshopId: string, equipmentId: string, taskId: string, completionDate: string, notes: string) => void;
  highlightedItem: { workshopId: string; equipmentId: string; taskId: string } | null;
  onHighlightHandled: () => void;
  userRole: 'editor' | 'viewer';
}

type SortKey = 'name' | 'date';

const Workshop: React.FC<WorkshopProps> = ({ workshop, history, onUpdate, onDelete, onCompleteMaintenance, highlightedItem, onHighlightHandled, userRole }) => {
  const [isAddEquipmentModalOpen, setAddEquipmentModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [isEditingWorkshopName, setIsEditingWorkshopName] = useState(false);
  const [editedWorkshopName, setEditedWorkshopName] = useState(workshop.name);
  const workshopInputRef = useRef<HTMLInputElement>(null);
  const workshopRef = useRef<HTMLDivElement>(null);
  const [sortKey, setSortKey] = useState<SortKey>('date');

  useEffect(() => {
    if (highlightedItem && highlightedItem.workshopId === workshop.id) {
        setIsExpanded(true);
        // Scroll workshop into view if it's not already visible
        setTimeout(() => {
            workshopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100); // Small delay to allow parent to render
    }
  }, [highlightedItem, workshop.id]);

  useEffect(() => {
    if (isEditingWorkshopName && workshopInputRef.current) {
        workshopInputRef.current.focus();
    }
  }, [isEditingWorkshopName]);

  const sortedEquipment = useMemo(() => {
    const equipmentToSort = [...workshop.equipment];
    equipmentToSort.sort((a, b) => {
        if (sortKey === 'name') {
            return a.name.localeCompare(b.name);
        }
        if (sortKey === 'date') {
            const dateA = getEquipmentNextDueDate(a);
            const dateB = getEquipmentNextDueDate(b);

            if (dateA === null && dateB !== null) return 1;
            if (dateA !== null && dateB === null) return -1;
            if (dateA === null && dateB === null) return 0;
            
            return dateA!.getTime() - dateB!.getTime();
        }
        return 0;
    });
    return equipmentToSort;
  }, [workshop.equipment, sortKey]);

  const handleSaveWorkshopName = () => {
    if (editedWorkshopName.trim() && editedWorkshopName.trim() !== workshop.name) {
        onUpdate({ ...workshop, name: editedWorkshopName.trim() });
    }
    setIsEditingWorkshopName(false);
  };
  
  const addEquipment = (name: string) => {
    const newEquipment: EquipmentType = { id: Date.now().toString(), name, tasks: [] };
    onUpdate({ ...workshop, equipment: [...workshop.equipment, newEquipment] });
  };
  
  const handleDeleteWorkshop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc chắn muốn xóa xưởng "${workshop.name}" không?`)) {
        onDelete(workshop.id);
    }
  };
  
  const handleUpdateEquipment = (updatedEquipment: EquipmentType) => {
    onUpdate({ ...workshop, equipment: workshop.equipment.map(e => e.id === updatedEquipment.id ? updatedEquipment : e) });
  };

  const handleDeleteEquipment = (equipmentId: string) => {
     if (window.confirm(`Bạn có chắc muốn xóa thiết bị này và tất cả các hạng mục bảo trì của nó không?`)) {
        const updatedEquipment = workshop.equipment.filter(e => e.id !== equipmentId);
        onUpdate({ ...workshop, equipment: updatedEquipment });
    }
  };

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div ref={workshopRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
      <div 
        className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-700/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center flex-grow">
            {isEditingWorkshopName && userRole === 'editor' ? (
                <div className="flex items-center space-x-2" onClick={stopPropagation}>
                    <input
                        ref={workshopInputRef}
                        type="text"
                        value={editedWorkshopName}
                        onChange={(e) => setEditedWorkshopName(e.target.value)}
                        onBlur={handleSaveWorkshopName}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveWorkshopName()}
                        className="text-xl font-bold bg-white dark:bg-slate-600 border border-sky-500 rounded-md px-2 py-1 -my-1"
                    />
                    <button onClick={handleSaveWorkshopName} className="text-green-500"><CheckIcon /></button>
                </div>
            ) : (
                <div className="flex items-center group flex-grow">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{workshop.name}</h2>
                    {userRole === 'editor' && <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingWorkshopName(true);
                        }} 
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-sky-600 dark:text-sky-400"
                        aria-label={`Sửa tên xưởng ${workshop.name}`}
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>}
                </div>
            )}
        </div>
        <div className="flex items-center space-x-2" onClick={stopPropagation}>
           {userRole === 'editor' && (
            <>
                <button
                    onClick={() => setAddEquipmentModalOpen(true)}
                    className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-transform transform hover:scale-105"
                >
                    <PlusIcon className="w-6 h-6" />
                    <span className="hidden sm:inline ml-2">Thêm thiết bị</span>
                </button>
                <button
                    onClick={handleDeleteWorkshop}
                    className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition"
                    aria-label="Xóa xưởng"
                >
                    <TrashIcon />
                </button>
            </>
           )}
           <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 md:p-6">
            {workshop.equipment.length > 1 && (
                 <div className="flex justify-end items-center mb-4 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400 mr-2">Sắp xếp theo:</span>
                    <button 
                        onClick={() => setSortKey('date')}
                        className={`px-3 py-1 rounded-md transition ${sortKey === 'date' ? 'bg-sky-600 text-white shadow' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                    >
                        Ngày đến hạn
                    </button>
                    <button 
                        onClick={() => setSortKey('name')}
                        className={`ml-2 px-3 py-1 rounded-md transition ${sortKey === 'name' ? 'bg-sky-600 text-white shadow' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                    >
                        Tên thiết bị
                    </button>
                </div>
            )}
            {workshop.equipment.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">Chưa có thiết bị nào trong xưởng này.</p>
            ) : (
            <div className="space-y-4">
                {sortedEquipment.map(equip => (
                    <EquipmentAccordion
                        key={equip.id}
                        workshop={workshop}
                        equipment={equip}
                        history={history}
                        onUpdateEquipment={handleUpdateEquipment}
                        onDeleteEquipment={() => handleDeleteEquipment(equip.id)}
                        onCompleteMaintenance={onCompleteMaintenance}
                        highlightedItem={highlightedItem}
                        onHighlightHandled={onHighlightHandled}
                        userRole={userRole}
                    />
                ))}
            </div>
            )}
        </div>
      )}

      {userRole === 'editor' && isAddEquipmentModalOpen && <AddEquipmentModal onClose={() => setAddEquipmentModalOpen(false)} onAdd={addEquipment}/>}
    </div>
  );
};

export default Workshop;
