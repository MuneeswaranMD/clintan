import React, { useState, useEffect } from 'react';
import {
    Tag,
    Plus,
    Save,
    X,
    Check,
    Package,
    Sparkles,
    Search,
    Filter,
    Edit3,
    MoreHorizontal,
    ChevronRight,
    ArrowRight,
    Trash2,
    Building2,
    LayoutGrid,
    Settings2,
    Zap
} from 'lucide-react';
import { getAvailableIndustries, getIndustryPreset, getEnabledModules } from '../../config/industryPresets';
import { useDialog } from '../../context/DialogContext';
import { industryService } from '../../services/firebaseService';

interface ModuleOption {
    key: string;
    label: string;
    description: string;
    category: 'core' | 'conditional' | 'advanced' | 'features';
}

export const SuperAdminIndustries: React.FC = () => {
    const { alert, confirm } = useDialog();
    const [industries, setIndustries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingIndustry, setEditingIndustry] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        key: '',
        description: '',
        icon: '🏢',
        modules: [] as string[]
    });

    useEffect(() => {
        document.title = 'Super Admin | Industries';
        const unsubscribe = industryService.subscribeToIndustries((data) => {
            setIndustries(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSyncWithPresets = async () => {
        if (industries.length > 0) {
            const confirmed = await confirm('Industries already exist. This will add missing presets. Continue?');
            if (!confirmed) return;
        }

        const presets = getAvailableIndustries().map(ind => {
            const preset = getIndustryPreset(ind.key);
            return {
                ...ind,
                modules: getEnabledModules(preset.features as any)
            };
        });

        for (const preset of presets) {
            const existing = industries.find(i => i.key === preset.key);
            if (existing) {
                // Update existing if modules differ or format is old
                await industryService.updateIndustry(existing.id, {
                    ...preset,
                    modules: preset.modules // Forces update to technical keys
                });
            } else {
                await industryService.createIndustry(preset);
            }
        }
        await alert('All industry presets synchronized and updated with technical keys!');
    };

    const availableModules: ModuleOption[] = [
        { key: 'dashboard', label: 'Dashboard', description: 'Business overview & analytics', category: 'core' },
        { key: 'orders', label: 'Orders', description: 'Order management system', category: 'core' },
        { key: 'invoices', label: 'Invoices', description: 'Invoice generation & tracking', category: 'core' },
        { key: 'payments', label: 'Payments', description: 'Payment processing & tracking', category: 'core' },
        { key: 'customers', label: 'Customers', description: 'Customer relationship management', category: 'core' },
        { key: 'analytics', label: 'Analytics', description: 'Business analytics & reports', category: 'core' },
        { key: 'expenses', label: 'Expenses', description: 'Expense tracking & management', category: 'core' },
        { key: 'settings', label: 'Settings', description: 'System configuration', category: 'core' },
        { key: 'estimates', label: 'Estimates', description: 'Quotations & proposals', category: 'conditional' },
        { key: 'products', label: 'Products', description: 'Stock management & tracking', category: 'conditional' },
        { key: 'inventory', label: 'Inventory Display', description: 'Internal inventory view', category: 'conditional' },
        { key: 'suppliers', label: 'Suppliers', description: 'Vendor management', category: 'conditional' },
        { key: 'purchase-orders', label: 'Purchase Orders', description: 'Procurement & purchasing', category: 'conditional' },
        { key: 'dispatch', label: 'Dispatch', description: 'Logistics & delivery', category: 'conditional' },
        { key: 'automation', label: 'Automation', description: 'Workflows & automation', category: 'advanced' },
        { key: 'employees', label: 'Employees', description: 'Team & role management', category: 'advanced' },
        { key: 'production', label: 'Manufacturing', description: 'BOM & production tracking', category: 'advanced' },
        { key: 'recurring', label: 'Recurring Billing', description: 'Subscription management', category: 'advanced' },
        { key: 'advanced-analytics', label: 'Business Intelligence', description: 'Advanced analytics & forecasting', category: 'advanced' },
        { key: 'loyalty', label: 'Loyalty Points', description: 'Customer loyalty program', category: 'features' },
        { key: 'branches', label: 'Multi-Branch', description: 'Multiple location support', category: 'features' },
        { key: 'whatsapp', label: 'WhatsApp', description: 'WhatsApp integration', category: 'features' },
        { key: 'checkouts', label: 'Payment Gateway', description: 'Online payment links', category: 'features' }
    ];

    const toggleModule = (moduleKey: string) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.includes(moduleKey)
                ? prev.modules.filter(m => m !== moduleKey)
                : [...prev.modules, moduleKey]
        }));
    };

    const handleOpenCreate = () => {
        setEditingIndustry(null);
        setFormData({
            name: '',
            key: '',
            description: '',
            icon: '🏢',
            modules: []
        });
        setShowModal(true);
    };

    const handleOpenEdit = (industry: any) => {
        setEditingIndustry(industry);
        setFormData({
            name: industry.name,
            key: industry.key,
            description: industry.description,
            icon: industry.icon || '🏢',
            modules: industry.modules || []
        });
        setShowModal(true);
    };

    const handleDelete = async (industry: any) => {
        const confirmed = await confirm('Are you sure you want to delete this industry?', {
            title: 'Delete Industry',
            confirmLabel: 'Delete',
            variant: 'danger'
        });
        if (confirmed) {
            await industryService.deleteIndustry(industry.id);
            await alert('Industry deleted successfully!');
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.key) {
            await alert('Please fill in required fields (Name and Key).', { variant: 'danger' });
            return;
        }

        try {
            if (editingIndustry) {
                await industryService.updateIndustry(editingIndustry.id, formData);
                await alert('Industry updated successfully!');
            } else {
                if (industries.some(i => i.key === formData.key)) {
                    await alert('An industry with this key already exists.', { variant: 'danger' });
                    return;
                }
                await industryService.createIndustry(formData);
                await alert('Industry created successfully!');
            }
            setShowModal(false);
        } catch (error: any) {
            await alert('Failed to save: ' + error.message, { variant: 'danger' });
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'core': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'conditional': return 'text-purple-600 bg-purple-50 border-purple-100';
            case 'advanced': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'features': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    const filteredIndustries = industries.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="text-blue-600" size={24} />
                        Industries
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Configure module presets for different business types.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={handleSyncWithPresets}
                        className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 shadow-sm flex items-center justify-center gap-2"
                    >
                        <Zap size={18} className="text-amber-500" />
                        Sync Presets
                    </button>
                    <button
                        onClick={handleOpenCreate}
                        className="flex-1 md:flex-none px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-black shadow-sm flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        New Industry
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-slate-50 p-1 rounded-lg border border-slate-100 flex items-center gap-3">
                    <Search size={18} className="text-slate-400 ml-2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold uppercase text-slate-800 placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    {['All', 'Services', 'Retail', 'Tech'].map(f => (
                        <button key={f} className="px-3 py-1.5 rounded bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50">
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="py-20 text-center">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">Loading Industries...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredIndustries.map((industry) => (
                        <div
                            key={industry.key}
                            className="group bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:border-blue-400 transition-all flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl">
                                    {industry.icon || '🏢'}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleOpenEdit(industry)}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(industry)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                                    {industry.name}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed mt-2 line-clamp-2">
                                    {industry.description}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 space-y-4">
                                <div className="flex flex-wrap gap-1">
                                    {industry.modules?.slice(0, 3).map((modKey: string, idx: number) => {
                                        const label = availableModules.find(m => m.key === modKey)?.label || modKey;
                                        return (
                                            <span key={idx} className="px-1.5 py-0.5 bg-slate-50 text-[8px] font-bold text-slate-500 rounded border border-slate-100 uppercase">
                                                {label}
                                            </span>
                                        );
                                    })}
                                    {(industry.modules?.length || 0) > 3 && (
                                        <span className="px-1.5 py-0.5 bg-blue-50 text-[8px] font-bold text-blue-500 rounded border border-blue-100 uppercase">
                                            +{(industry.modules?.length || 0) - 3} more
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleOpenEdit(industry)}
                                    className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded transition-all"
                                >
                                    Setup <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredIndustries.length === 0 && (
                <div className="py-20 text-center bg-white rounded-lg border border-slate-200">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No industries found.</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 animate-fade-in">
                    <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">{editingIndustry ? 'Edit' : 'Create'} Industry</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure module stack</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold uppercase outline-none focus:bg-white focus:border-blue-400 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Key</label>
                                        <input
                                            type="text"
                                            value={formData.key}
                                            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold outline-none focus:bg-white focus:border-blue-400 transition-all uppercase"
                                            disabled={!!editingIndustry}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Icon</label>
                                        <input
                                            type="text"
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            className="w-20 px-4 py-2 bg-slate-50 border border-slate-200 rounded text-xl text-center outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Description</label>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold uppercase outline-none focus:bg-white focus:border-blue-400 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Modules</h3>
                                    <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-widest">
                                        {formData.modules.length} Enabled
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {['core', 'conditional', 'advanced', 'features'].map((category) => (
                                        <div key={category} className="space-y-4">
                                            <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 border-l-2 border-slate-200 pl-2">
                                                {category}
                                            </h4>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {availableModules
                                                    .filter(m => m.category === category)
                                                    .map((module) => {
                                                        const isSelected = formData.modules.includes(module.key);
                                                        return (
                                                            <button
                                                                key={module.key}
                                                                onClick={() => toggleModule(module.key)}
                                                                className={`p-4 rounded border text-left flex items-start gap-3 transition-all ${isSelected
                                                                    ? 'bg-blue-50 border-blue-200'
                                                                    : 'bg-white border-slate-100 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${isSelected
                                                                    ? 'bg-blue-600 border-blue-600'
                                                                    : 'border-slate-200 bg-white'
                                                                    }`}>
                                                                    {isSelected && <Check size={10} className="text-white" strokeWidth={4} />}
                                                                </div>
                                                                <div>
                                                                    <p className={`font-bold text-[10px] uppercase tracking-wide ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                                                                        {module.label}
                                                                    </p>
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 leading-tight">
                                                                        {module.description}
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-slate-900 text-white rounded font-bold uppercase text-[10px] tracking-widest hover:bg-black"
                            >
                                {editingIndustry ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
