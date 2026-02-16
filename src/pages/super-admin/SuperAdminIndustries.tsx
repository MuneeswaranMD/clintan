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
    ArrowRight
} from 'lucide-react';
import { getAvailableIndustries } from '../../config/industryPresets';

interface ModuleOption {
    key: string;
    label: string;
    description: string;
    category: 'core' | 'conditional' | 'advanced' | 'features';
}

export const SuperAdminIndustries: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Industry Builder'; }, []);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '🏢',
        defaultPlan: 'Pro',
        modules: [] as string[]
    });

    const existingIndustries = getAvailableIndustries();

    const availableModules: ModuleOption[] = [
        { key: 'enableDashboard', label: 'Dashboard', description: 'Business overview & analytics', category: 'core' },
        { key: 'enableOrders', label: 'Orders', description: 'Order management system', category: 'core' },
        { key: 'enableInvoices', label: 'Invoices', description: 'Invoice generation & tracking', category: 'core' },
        { key: 'enablePayments', label: 'Payments', description: 'Payment processing & tracking', category: 'core' },
        { key: 'enableCustomers', label: 'Customers', description: 'Customer relationship management', category: 'core' },
        { key: 'enableAnalytics', label: 'Analytics', description: 'Business analytics & reports', category: 'core' },
        { key: 'enableExpenses', label: 'Expenses', description: 'Expense tracking & management', category: 'core' },
        { key: 'enableSettings', label: 'Settings', description: 'System configuration', category: 'core' },
        { key: 'enableEstimates', label: 'Estimates', description: 'Quotations & proposals', category: 'conditional' },
        { key: 'enableInventory', label: 'Inventory', description: 'Stock management & tracking', category: 'conditional' },
        { key: 'enableSuppliers', label: 'Suppliers', description: 'Vendor management', category: 'conditional' },
        { key: 'enablePurchaseManagement', label: 'Purchase Orders', description: 'Procurement & purchasing', category: 'conditional' },
        { key: 'enableDispatch', label: 'Dispatch', description: 'Logistics & delivery', category: 'conditional' },
        { key: 'enableAutomation', label: 'Automation', description: 'Workflows & automation', category: 'advanced' },
        { key: 'enableEmployees', label: 'Employees', description: 'Team & role management', category: 'advanced' },
        { key: 'enableManufacturing', label: 'Manufacturing', description: 'BOM & production tracking', category: 'advanced' },
        { key: 'enableRecurringBilling', label: 'Recurring Billing', description: 'Subscription management', category: 'advanced' },
        { key: 'enableAdvancedAnalytics', label: 'Business Intelligence', description: 'Advanced analytics & forecasting', category: 'advanced' },
        { key: 'enableLoyaltyPoints', label: 'Loyalty Points', description: 'Customer loyalty program', category: 'features' },
        { key: 'enableMultiBranch', label: 'Multi-Branch', description: 'Multiple location support', category: 'features' },
        { key: 'enableWhatsAppIntegration', label: 'WhatsApp', description: 'WhatsApp integration', category: 'features' },
        { key: 'enablePaymentGateway', label: 'Payment Gateway', description: 'Online payment links', category: 'features' }
    ];

    const toggleModule = (moduleKey: string) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.includes(moduleKey)
                ? prev.modules.filter(m => m !== moduleKey)
                : [...prev.modules, moduleKey]
        }));
    };

    const handleSave = () => {
        alert('Industry Builder: Save functionality coming soon!');
        setShowCreateForm(false);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'core': return 'blue';
            case 'conditional': return 'purple';
            case 'advanced': return 'rose';
            case 'features': return 'emerald';
            default: return 'slate';
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Industry Builder</h1>
                    <p className="text-slate-500 font-semibold mt-1">Configure preset modules and logic for specific business sectors.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Create Preset
                    </button>
                </div>
            </div>

            {/* Existing Industries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {existingIndustries.map((industry) => (
                    <div
                        key={industry.key}
                        className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all space-y-6"
                    >
                        <div className="flex items-start justify-between">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                                {industry.key === 'Freelancer' ? '🧑‍💼' :
                                    industry.key === 'Retail' ? '🛍️' :
                                        industry.key === 'Manufacturing' ? '🏭' :
                                            industry.key === 'Tours' ? '🧳' :
                                                industry.key === 'Service' ? '🧑‍🔧' :
                                                    industry.key === 'Wholesale' ? '🏢' :
                                                        industry.key === 'Construction' ? '🏗️' :
                                                            industry.key === 'Clinic' ? '🏥' : '🏢'}
                            </div>
                            <div className="flex gap-1">
                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                                    <Edit3 size={18} />
                                </button>
                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                {industry.name}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 mt-2 line-clamp-2">
                                {industry.description}
                            </p>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between group-hover:border-slate-100 transition-colors">
                            <div className="flex items-center gap-2">
                                <Package size={14} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Modules: Full Stack</span>
                            </div>
                            <button className="text-blue-600 hover:text-blue-700 transition-colors">
                                <ArrowRight size={18} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Industry Form Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCreateForm(false)}></div>

                    <div className="bg-white w-full max-w-6xl max-h-full overflow-y-auto rounded-[3.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-10 py-8 border-b border-slate-100 flex items-center justify-between z-20">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Industry Node</h2>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Configure global module mapping</p>
                            </div>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all"
                            >
                                <X size={24} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div className="p-10 space-y-10">
                            {/* Basic Configurations */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Node Identifier</label>
                                    <input
                                        type="text"
                                        placeholder="Full Business Sector Name"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Visual Indicator</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={formData.icon}
                                            className="w-20 px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-2xl text-center outline-none"
                                        />
                                        <div className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-slate-400 font-bold text-sm">
                                            Pick from registry
                                            <Sparkles size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Module Selector */}
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Module Registry</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Toggle core and advanced logic gates</p>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    {['core', 'conditional', 'advanced', 'features'].map((category) => (
                                        <div key={category} className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-6 rounded-full bg-${getCategoryColor(category)}-500 shadow-lg shadow-${getCategoryColor(category)}-500/20`}></div>
                                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                                    {category === 'core' ? 'System Core' :
                                                        category === 'conditional' ? 'Variable Logic' :
                                                            category === 'advanced' ? 'High-Performance' : 'Interaction Features'}
                                                </h4>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {availableModules
                                                    .filter(m => m.category === category)
                                                    .map((module) => {
                                                        const isSelected = formData.modules.includes(module.key);
                                                        return (
                                                            <button
                                                                key={module.key}
                                                                onClick={() => toggleModule(module.key)}
                                                                className={`p-6 rounded-[1.75rem] border transition-all text-left ${isSelected
                                                                        ? `bg-blue-50 border-blue-200 shadow-sm`
                                                                        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <p className={`font-black text-xs uppercase tracking-tight ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>
                                                                        {module.label}
                                                                    </p>
                                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected
                                                                            ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/30'
                                                                            : 'border-slate-200'
                                                                        }`}>
                                                                        {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                                                    </div>
                                                                </div>
                                                                <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500">
                                                                    {module.description}
                                                                </p>
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
                        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-8 flex items-center justify-between z-20">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm">
                                    {formData.modules.length}
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Gates selected</span>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-8 py-4 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 flex items-center gap-2 active:scale-95"
                                >
                                    <Save size={18} />
                                    Synchronize Preset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
