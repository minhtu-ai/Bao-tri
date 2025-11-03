import React, { useState, useRef, useEffect } from 'react';
// FIX: The type 'ProductionLine' was renamed to 'Workshop'. Using an alias to fix it locally.
import { Workshop as ProductionLineType, Equipment as EquipmentType, MaintenanceTask, IntervalUnit, HistoryEntry } from '../types';
import AddEquipmentModal from './AddEquipmentModal';
import EquipmentAccordion from './EquipmentAccordion';
import { PlusIcon, TrashIcon, PencilSquareIcon, ChevronDownIcon, CheckIcon } from './Icons';

interface ProductionLineProps {
  line: ProductionLineType;
  history: HistoryEntry[];
  onUpdate: (line: ProductionLineType) => void;
  onDelete: (lineId: string) => void;
  onCompleteMaintenance: (lineId: string, equipmentId: string, taskId: string, completionDate: string) => void;
  highlightedItem: { lineId: string; equipmentId: string; taskId: string } | null;
  onHighlightHandled: () => void;
}

const ProductionLine: React.FC<ProductionLineProps> = ({ line, history, onUpdate, onDelete, onCompleteMaintenance, highlightedItem, onHighlightHandled }) => {
  const [isAddEquipmentModalOpen, setAddEquipmentModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [isEditingLineName, setIsEditingLineName] = useState(false);
  const [editedLineName, setEditedLineName] = useState(line.name);
  const lineInputRef = useRef<HTMLInputElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightedItem && highlightedItem.lineId === line.id) {
        setIsExpanded(true);
        // Scroll line into view if it's not already visible
        setTimeout(() => {
            lineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100); // Small delay to allow parent to render
    }
  }, [highlightedItem, line.id]);

  useEffect(() => {
    if (isEditingLineName && lineInputRef.current) {
        lineInputRef.current.focus();
    }
  }, [isEditingLineName]);

  const handleSaveLineName = () => {
    if (editedLineName.trim() && editedLineName.trim() !== line.name) {
        onUpdate({ ...line, name: editedLineName.trim() });
    }
    setIsEditingLineName(false);
  };
  
  const addEquipment = (name: string) => {
    const newEquipment: EquipmentType = { id: Date.now().toString(), name, tasks: [] };
    onUpdate({ ...line, equipment: [...line.equipment, newEquipment] });
  };
  
  const handleDeleteLine = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc chắn muốn xóa dây chuyền "${line.name}" không?`)) {
        onDelete(line.id);
    }
  };
  
  const handleUpdateEquipment = (updatedEquipment: EquipmentType) => {
    onUpdate({ ...line, equipment: line.equipment.map(e => e.id === updatedEquipment.id ? updatedEquipment : e) });
  };

  const handleDeleteEquipment = (equipmentId: string) => {
     if (window.confirm(`Bạn có chắc muốn xóa thiết bị này và tất cả các hạng mục bảo trì của nó không?`)) {
        const updatedEquipment = line.equipment.filter(e => e.id !== equipmentId);
        onUpdate({ ...line, equipment: updatedEquipment });
    }
  };

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div ref={lineRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
      <div 
        className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-700/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center flex-grow">
            {isEditingLineName ? (
                <div className="flex items-center space-x-2" onClick={stopPropagation}>
                    <input
                        ref={lineInputRef}
                        type="text"
                        value={editedLineName}
                        onChange={(e) => setEditedLineName(e.target.value)}
                        onBlur={handleSaveLineName}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveLineName()}
                        className="text-xl font-bold bg-white dark:bg-slate-600 border border-sky-500 rounded-md px-2 py-1 -my-1"
                    />
                    <button onClick={handleSaveLineName} className="text-green-500"><CheckIcon /></button>
                </div>
            ) : (
                <div className="flex items-center group flex-grow">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{line.name}</h2>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingLineName(true);
                        }} 
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-sky-600 dark:text-sky-400"
                        aria-label={`Sửa tên dây chuyền ${line.name}`}
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
        <div className="flex items-center space-x-2" onClick={stopPropagation}>
           <button
             onClick={() => setAddEquipmentModalOpen(true)}
             className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-transform transform hover:scale-105"
            >
             <PlusIcon className="w-6 h-6" />
             <span className="hidden sm:inline ml-2">Thêm thiết bị</span>
           </button>
           <button
             onClick={handleDeleteLine}
             className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition"
             aria-label="Xóa dây chuyền"
           >
             <TrashIcon />
           </button>
           <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 md:p-6">
            {line.equipment.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">Chưa có thiết bị nào trong dây chuyền này.</p>
            ) : (
            <div className="space-y-4">
                {line.equipment.map(equip => (
                    <EquipmentAccordion
                        key={equip.id}
                        // FIX: Pass 'line' as 'workshop' prop and transform highlightedItem to match expected prop types.
                        workshop={line}
                        equipment={equip}
                        history={history}
                        onUpdateEquipment={handleUpdateEquipment}
                        onDeleteEquipment={() => handleDeleteEquipment(equip.id)}
                        onCompleteMaintenance={onCompleteMaintenance}
                        highlightedItem={highlightedItem ? { workshopId: highlightedItem.lineId, equipmentId: highlightedItem.equipmentId, taskId: highlightedItem.taskId } : null}
                        onHighlightHandled={onHighlightHandled}
                    />
                ))}
            </div>
            )}
        </div>
      )}

      {isAddEquipmentModalOpen && <AddEquipmentModal onClose={() => setAddEquipmentModalOpen(false)} onAdd={addEquipment}/>}
    </div>
  );
};

export default ProductionLine;