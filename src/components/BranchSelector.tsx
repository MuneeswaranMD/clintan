import React, { useState } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { Branch } from '../types';

interface BranchSelectorProps {
    branches: Branch[];
    currentBranchId?: string;
    onBranchChange: (branchId: string) => void;
}

/**
 * BranchSelector - Multi-branch switcher for Company Admins
 * 
 * Usage:
 * <BranchSelector 
 *   branches={user.allowedBranches}
 *   currentBranchId={currentBranch}
 *   onBranchChange={handleBranchChange}
 * />
 */
export const BranchSelector: React.FC<BranchSelectorProps> = ({
    branches,
    currentBranchId,
    onBranchChange
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const currentBranch = branches.find(b => b.id === currentBranchId) || branches[0];
    const activeBranches = branches.filter(b => b.isActive);

    if (activeBranches.length <= 1) {
        // Don't show selector if only one branch
        return null;
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
                <Building2 size={16} className="text-blue-600" />
                <span className="text-sm font-bold text-slate-700">
                    {currentBranch?.name || 'Select Branch'}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                        <div className="p-2 border-b border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1">
                                Switch Branch
                            </p>
                        </div>

                        <div className="max-h-64 overflow-y-auto">
                            {activeBranches.map((branch) => (
                                <button
                                    key={branch.id}
                                    onClick={() => {
                                        onBranchChange(branch.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors ${branch.id === currentBranchId ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${branch.id === currentBranchId
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {branch.id === currentBranchId ? (
                                            <Check size={16} />
                                        ) : (
                                            <Building2 size={16} />
                                        )}
                                    </div>

                                    <div className="flex-1 text-left">
                                        <p className={`text-sm font-bold ${branch.id === currentBranchId ? 'text-blue-600' : 'text-slate-700'
                                            }`}>
                                            {branch.name}
                                        </p>
                                        {branch.address && (
                                            <p className="text-xs text-slate-400 truncate">
                                                {branch.address}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="p-2 border-t border-slate-100 bg-slate-50">
                            <p className="text-[10px] text-slate-400 px-3 py-1">
                                {activeBranches.length} branch{activeBranches.length !== 1 ? 'es' : ''} available
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

/**
 * Branch Context Hook (to be implemented)
 * 
 * Usage:
 * const { currentBranch, switchBranch } = useBranch();
 */
export const useBranch = () => {
    // TODO: Implement BranchContext
    const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);

    const switchBranch = (branchId: string) => {
        setCurrentBranchId(branchId);
        // TODO: Update API headers
        // TODO: Refresh data for new branch
    };

    return {
        currentBranchId,
        switchBranch
    };
};
