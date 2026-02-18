import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Save, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useDynamicMenu, Module } from '../../hooks/useDynamicMenu';
import * as IconLibrary from 'lucide-react';

// Sortable Item Component
const SortableItem = ({ module, onToggle }: { module: Module; onToggle: (key: string, enabled: boolean) => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: module.key });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1
    };

    // Resolve Icon
    // @ts-ignore
    const Icon = IconLibrary[module.icon] || IconLibrary.HelpCircle;

    // Since enabled status is not explicitly present in the module object returned by API (it returns only visible modules or merges it),
    // we might need to handle 'enabled' status better. 
    // However, the get /api/menu returns sorted/filtered modules. 
    // To manage ALL modules (even disabled ones), the API endpoint might need to return all allowed modules with an 'enabled' flag.
    // The current GET /api/menu returns filtered modules. 
    // For this page, we probably want to see ALL modules available modules for the role, even if disabled by tenant config.
    // But let's assume the hook returns what we see. 

    // NOTE: This logic assumes 'module' has an 'enabled' property or similar if we want to toggle. 
    // The backend currently filters out disabled modules in GET /api/menu logic: "return override ? override.enabled : true".
    // So likely we won't see disabled modules here unless we update the fetch logic or use a different endpoint.
    // We'll stick to reordering visible modules for now, and maybe toggling logic requires fetching all potential modules.

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm
        ${isDragging ? 'shadow-lg ring-2 ring-blue-500/20' : 'hover:border-blue-300 transition-colors'}
      `}
        >
            <div {...attributes} {...listeners} className="cursor-grab hover:text-blue-600 text-slate-400">
                <GripVertical size={20} />
            </div>

            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600">
                <Icon size={20} />
            </div>

            <div className="flex-1">
                <h3 className="font-bold text-slate-800">{module.name}</h3>
                <p className="text-xs text-slate-500 capitalize">{module.category} • {module.type}</p>
            </div>

            {/* 
      <button 
        onClick={() => onToggle(module.key, !module.enabled)}
        className={`p-2 rounded-lg transition-colors ${module.enabled ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-100'}`}
      >
        {module.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
      </button> 
      */}
            <div className="px-3 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">
                Key: {module.key}
            </div>
        </div>
    );
};

export const MenuCustomization = () => {
    const { menuItems, loading, error } = useDynamicMenu();
    const [items, setItems] = useState<Module[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (menuItems.length > 0) {
            setItems(menuItems);
        }
    }, [menuItems]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((i) => i.key === active.id);
                const newIndex = items.findIndex((i) => i.key === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken();
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            // Construct payload
            const modulesPayload = items.map((item, index) => ({
                key: item.key,
                order: index,
                enabled: true // Assuming kept enabled for now
            }));

            await axios.put(
                `${API_URL}/menu/tenant/reorder`,
                { modules: modulesPayload },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            alert('Menu order saved successfully! Refresh the page to see changes in sidebar.');
        } catch (err: any) {
            console.error(err);
            alert('Failed to save changes: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Customize Menu</h1>
                    <p className="text-slate-500 mt-1">Drag and drop to reorder menu items for your organization.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map(i => i.key)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {items.map((module) => (
                            <SortableItem
                                key={module.key}
                                module={module}
                                onToggle={() => { }}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};
