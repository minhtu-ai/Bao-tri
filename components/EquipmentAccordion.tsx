import React, { useState, useRef, useEffect, createRef } from 'react';
import { Workshop as WorkshopType, Equipment as EquipmentType, MaintenanceTask, IntervalUnit, HistoryEntry } from '../types';
import MaintenanceTaskItem from './MaintenanceTaskItem';
import AddTaskModal from './AddTaskModal';
import CompleteMaintenanceModal from './CompleteMaintenanceModal';
import EditTaskModal from './EditTaskModal';
import TaskHistoryModal from './TaskHistoryModal';
import { PlusIcon, TrashIcon, PencilSquareIcon, CheckIcon, ChevronDownIcon } from './Icons';

interface EquipmentAccordionProps {
    workshop: WorkshopType;
    equipment: EquipmentType;
    history: HistoryEntry[];
    onUpdateEquipment: (equipment: EquipmentType) => void;
    onDeleteEquipment: () => void;
    onCompleteMaintenance: (workshopId: string, equipmentId: string, taskId: string, completionDate: string, notes: string) => void;
    highlightedItem: { workshopId: string; equipmentId: string; taskId: string } | null;
    onHighlightHandled: () => void;
    userRole: 'editor' | 'viewer';
}

const EquipmentAccordion: React.FC<EquipmentAccordionProps> = ({ 
    workshop, equipment, history, onUpdateEquipment, onDeleteEquipment, onCompleteMaintenance, highlightedItem, onHighlightHandled, userRole
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);
    const [isCompleteModalOpen, setCompleteModalOpen] = useState<MaintenanceTask | null>(null);
    const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
    const [viewingTask, setViewingTask] = useState<MaintenanceTask | null>(null);

    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(equipment.name);
    const inputRef = useRef<HTMLInputElement>(null);

    const taskRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
    taskRefs.current = equipment.tasks.map((_, i) => taskRefs.current[i] ?? createRef());

    useEffect(() => {
        if (highlightedItem && highlightedItem.equipmentId === equipment.id) {
            setIsExpanded(true);
            const taskIndex = equipment.tasks.findIndex(t => t.id === highlightedItem.taskId);
            if (taskIndex !== -1) {
                setTimeout(() => {
                    taskRefs.current[taskIndex]?.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                    onHighlightHandled();
                }, 300); // Delay to allow for expansion animation
            }
        }
    }, [highlightedItem, equipment.id, equipment.tasks, onHighlightHandled]);

    useEffect(() => {
        if (isEditingName && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditingName]);

    const handleSaveName = () => {
        if (editedName.trim() && editedName.trim() !== equipment.name) {
            onUpdateEquipment({ ...equipment, name: editedName.trim() });
        }
        setIsEditingName(false);
    };

    const addTask = (name: string, maintenanceInterval: number, intervalUnit: IntervalUnit, lastMaintenanceDate: string) => {
        const newTask: MaintenanceTask = { id: Date.now().toString(), name, maintenanceInterval, intervalUnit, lastMaintenanceDate };
        onUpdateEquipment({ ...equipment, tasks: [...equipment.tasks, newTask] });
    };

    const handleSaveTask = (updatedTask: MaintenanceTask) => {
        if (!editingTask) return;
        onUpdateEquipment({ ...equipment, tasks: equipment.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) });
        setEditingTask(null);
    };
    
    const handleComplete = (completionDate: string, notes: string) => {
        if (isCompleteModalOpen) {
            onCompleteMaintenance(workshop.id, equipment.id, isCompleteModalOpen.id, completionDate, notes);
            setCompleteModalOpen(null);
        }
    };
    
    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/20">
            <div 
                className="flex justify-between items-center p-3 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center flex-grow">
                    {isEditingName && userRole === 'editor' ? (
                        <div className="flex items-center space-x-2" onClick={stopPropagation}>
                           <input
                            ref={inputRef}
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onBlur={handleSaveName}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveName}
                            className="text-base font-semibold bg-white dark:bg-slate-700 border border-sky-500 rounded-md px-2 py-1 -my-1"
                            />
                             <button onClick={handleSaveName} className="text-green-500"><CheckIcon /></button>
                        </div>
                    ) : (
                        <div className="flex items-center group">
                            <h3 className="text-base font-semibold text-sky-700 dark:text-sky-400">{equipment.name}</h3>
                             {userRole === 'editor' && <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setIsEditingName(true); 
                                }} 
                                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-sky-600 dark:text-sky-400"
                                aria-label={`Sửa tên thiết bị ${equipment.name}`}
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
                            onClick={() => setAddTaskModalOpen(true)}
                            className="flex items-center bg-cyan-500 text-white px-2 py-1 text-xs rounded-md shadow hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition"
                        >
                            <PlusIcon className="w-4 h-4" /> <span className="ml-1 hidden sm:inline">Thêm hạng mục</span>
                        </button>
                        <button
                            onClick={onDeleteEquipment}
                            className="p-2 rounded-full text-slate-500 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition"
                            aria-label="Xóa thiết bị"
                        >
                            <TrashIcon />
                        </button>
                    </>
                    )}
                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isExpanded && (
                <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                    {equipment.tasks.length === 0 ? (
                        <p className="text-sm text-center text-slate-400 py-4">Chưa có hạng mục bảo trì nào cho thiết bị này.</p>
                    ) : (
                        <div className="space-y-4">
                            {equipment.tasks.map((task, index) => (
                                <MaintenanceTaskItem 
                                    ref={taskRefs.current[index]}
                                    key={task.id} 
                                    task={task} 
                                    isHighlighted={highlightedItem?.taskId === task.id}
                                    onComplete={() => setCompleteModalOpen(task)} 
                                    onEdit={() => setEditingTask(task)}
                                    onViewDetails={() => setViewingTask(task)}
                                    userRole={userRole}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {userRole === 'editor' && isAddTaskModalOpen && (
                <AddTaskModal
                onClose={() => setAddTaskModalOpen(false)}
                onAdd={addTask}
                />
            )}
            {userRole === 'editor' && isCompleteModalOpen && (
                <CompleteMaintenanceModal
                    task={isCompleteModalOpen}
                    onClose={() => setCompleteModalOpen(null)}
                    onConfirm={handleComplete}
                />
            )}
            {userRole === 'editor' && editingTask && (
                <EditTaskModal
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                    onSave={handleSaveTask}
                />
            )}
            {viewingTask && (
                <TaskHistoryModal
                    workshop={workshop}
                    equipment={equipment}
                    task={viewingTask}
                    history={history}
                    onClose={() => setViewingTask(null)}
                />
            )}
        </div>
    );
};

export default EquipmentAccordion;
