import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
    view: 'grid' | 'list';
    onViewChange: (view: 'grid' | 'list') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
    return (
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button
                onClick={() => onViewChange('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'grid'
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
            >
                <LayoutGrid size={16} />
                Grid
            </button>
            <button
                onClick={() => onViewChange('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'list'
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
            >
                <List size={16} />
                List
            </button>
        </div>
    );
};
