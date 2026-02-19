import React, { useState } from 'react';
import { GitBranch, MapPin, Phone, User, Hash, Plus, Trash2, Edit2, Shield, Save, Loader2, Search } from 'lucide-react';
import { Tenant, Branch } from '../../../types';
import { useDialog } from '../../../context/DialogContext';

interface BranchManagementTabProps {
    tenant: Tenant;
    onUpdate: (updates: Partial<Tenant>) => Promise<void>;
    saving: boolean;
    canEdit: boolean;
}

export const BranchManagementTab: React.FC<BranchManagementTabProps> = ({ tenant, onUpdate, saving, canEdit }) => {
    const dialog = useDialog();
    const [branches, setBranches] = useState<Branch[]>(tenant.config?.branches || []);
    const [isAdding, setIsAdding] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const [currentBranch, setCurrentBranch] = useState<Partial<Branch>>({
        name: '',
        address: '',
        phone: '',
        gstin: '',
        managerName: '',
        invoicePrefix: '',
        isActive: true,
    });

    const handleSaveBranch = () => {
        if (!currentBranch.name) return;

        let updatedBranches = [...branches];
        if (editingIndex !== null) {
            updatedBranches[editingIndex] = { ...updatedBranches[editingIndex], ...currentBranch } as Branch;
        } else {
            const newBranch = {
                ...currentBranch,
                id: Math.random().toString(36).substr(2, 9),
            } as Branch;
            updatedBranches.push(newBranch);
        }

        setBranches(updatedBranches);
        setIsAdding(false);
        setEditingIndex(null);
        setCurrentBranch({
            name: '',
            address: '',
            phone: '',
            gstin: '',
            managerName: '',
            invoicePrefix: '',
            isActive: true,
        });
    };

    const handleSync = async () => {
        await onUpdate({
            config: {
                ...tenant.config,
                branches
            }
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <GitBranch size={16} className="text-blue-600" /> Multi-Branch Infrastructure
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Global entity nodes management & operations.</p>
                </div>

                {canEdit && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wide text-[10px] shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={14} /> Establish New Branch
                    </button>
                )}
            </div>

            {(isAdding || editingIndex !== null) && (
                <div className="bg-slate-50 p-8 rounded-3xl border border-blue-100 space-y-6 animate-slide-in">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wide">{editingIndex !== null ? 'Modify' : 'Establish'} Node Details</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Branch Name</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
                                placeholder="e.g. Mumbai HQ, Dubai Regional"
                                value={currentBranch.name}
                                onChange={e => setCurrentBranch({ ...currentBranch, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Branch Manager</label>
                            <div className="relative">
                                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
                                    value={currentBranch.managerName}
                                    onChange={e => setCurrentBranch({ ...currentBranch, managerName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Physical Address</label>
                            <div className="relative">
                                <MapPin size={14} className="absolute left-4 top-3 text-slate-300" />
                                <textarea
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 transition-all min-h-[80px]"
                                    value={currentBranch.address}
                                    onChange={e => setCurrentBranch({ ...currentBranch, address: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Contact Number</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
                                        value={currentBranch.phone}
                                        onChange={e => setCurrentBranch({ ...currentBranch, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Branch GSTIN (If Different)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all uppercase"
                                    value={currentBranch.gstin}
                                    onChange={e => setCurrentBranch({ ...currentBranch, gstin: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Unique Invoice Prefix</label>
                            <div className="relative">
                                <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all font-mono uppercase"
                                    placeholder="MUM-"
                                    value={currentBranch.invoicePrefix}
                                    onChange={e => setCurrentBranch({ ...currentBranch, invoicePrefix: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => { setIsAdding(false); setEditingIndex(null); }}
                            className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wide text-slate-500 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveBranch}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wide shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                        >
                            Save Node Logic
                        </button>
                    </div>
                </div>
            )}

            {/* Branch List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {branches.length > 0 ? (
                    branches.map((branch, index) => (
                        <div key={branch.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
                            <div className={`absolute top-0 right-0 w-2 h-full ${branch.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <GitBranch size={18} />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{branch.name}</h5>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">ID: {branch.invoicePrefix || 'STD'}</span>
                                            <div className={`w-1 h-1 rounded-full bg-slate-200`}></div>
                                            <span className={`text-[9px] font-bold uppercase tracking-wide ${branch.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                {branch.isActive ? 'Active Node' : 'Suspended'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {canEdit && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={async () => {
                                                const confirmed = await dialog.confirm('Are you sure you want to terminate this branch node? All associated operations will be affected.', {
                                                    title: 'Terminate Branch',
                                                    confirmText: 'Terminate',
                                                    variant: 'danger'
                                                });
                                                if (confirmed) {
                                                    const updated = [...branches];
                                                    updated.splice(index, 1);
                                                    setBranches(updated);
                                                }
                                            }}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => { setEditingIndex(index); setCurrentBranch(branch); }}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 pt-3 border-t border-slate-50">
                                <div className="flex items-start gap-2 text-[11px] font-medium text-slate-500">
                                    <MapPin size={12} className="text-slate-300 mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-2">{branch.address}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                        <User size={12} className="text-slate-300" /> {branch.managerName || 'No Manager'}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                        <Phone size={12} className="text-slate-300" /> {branch.phone}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="md:col-span-2 py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-200">
                            <Search size={32} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">No Active Branch Nodes</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 max-w-xs mx-auto">Establish multiple operational centers for granular logistics and tax reporting.</p>
                        </div>
                    </div>
                )}
            </div>

            {canEdit && (
                <div className="pt-10 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={handleSync}
                        disabled={saving || branches.length === 0}
                        className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wide text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                        Synchronize Global Branches
                    </button>
                </div>
            )}
        </div>
    );
};
