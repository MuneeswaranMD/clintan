import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Plus,
    Edit2,
    Trash2,
    Check,
    Zap,
    Sparkles,
    ChevronRight,
    MoreHorizontal,
    Download,
    X,
    Save,
    LayoutDashboard,
    Package,
    Users,
    Settings,
    ShieldCheck,
    Globe,
    MessageSquare,
    DollarSign,
    ZapOff,
    Search
} from 'lucide-react';
import { planService } from '../../services/firebaseService';
import { SubscriptionPlan, FeatureToggles } from '../../types';
import { useDialog } from '../../context/DialogContext';

export const SuperAdminPlans: React.FC = () => {
    const { alert, confirm } = useDialog();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

    const initialFeatures: FeatureToggles = {
        enableDashboard: true,
        enableOrders: true,
        enableInvoices: true,
        enablePayments: true,
        enableCustomers: true,
        enableAnalytics: true,
        enableExpenses: true,
        enableSettings: true,
        enableEstimates: false,
        enableInventory: false,
        enableProducts: false,
        enableSuppliers: false,
        enablePurchaseManagement: false,
        enableDispatch: false,
        enableAutomation: false,
        enableEmployees: false,
        enableManufacturing: false,
        enableRecurringBilling: false,
        enableLoyaltyPoints: false,
        enableAdvancedAnalytics: false,
        enableMultiBranch: false,
        enableWhatsAppIntegration: false,
        enablePaymentGateway: false,
        enableProjectManagement: false,
        enableServiceManagement: false
    };

    const [formData, setFormData] = useState<Omit<SubscriptionPlan, 'id'>>({
        name: '',
        price: 0,
        billingCycle: 'MONTHLY',
        description: '',
        status: 'ACTIVE',
        isPopular: false,
        features: initialFeatures,
        limits: {
            users: 5,
            branches: 1,
            invoicesPerMonth: 100,
            storageGB: 1,
            extraDomains: 0
        }
    });

    useEffect(() => {
        document.title = 'Super Admin | Subscription Plans';
        const unsubscribe = planService.subscribeToPlans((fetchedPlans) => {
            setPlans(fetchedPlans);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleOpenCreate = () => {
        setEditingPlan(null);
        setFormData({
            name: '',
            price: 0,
            billingCycle: 'MONTHLY',
            description: '',
            status: 'ACTIVE',
            isPopular: false,
            features: initialFeatures,
            limits: {
                users: 5,
                branches: 1,
                invoicesPerMonth: 100,
                storageGB: 1,
                extraDomains: 0
            }
        });
        setShowModal(true);
    };

    const handleOpenEdit = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            price: plan.price,
            billingCycle: plan.billingCycle,
            description: plan.description,
            status: plan.status,
            isPopular: plan.isPopular || false,
            features: plan.features || initialFeatures,
            limits: plan.limits || {
                users: 5,
                branches: 1,
                invoicesPerMonth: 100,
                storageGB: 1,
                extraDomains: 0
            }
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if (editingPlan) {
                await planService.updatePlan(editingPlan.id, formData);
                await alert('Plan updated successfully!');
            } else {
                await planService.createPlan(formData);
                await alert('Plan created successfully!');
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving plan:', error);
            await alert('Failed to save plan', { variant: 'danger' });
        }
    };

    const handleDelete = async (id: string) => {
        if (await confirm('Are you sure you want to delete this plan? This will affect all tenants on this plan.', { variant: 'danger' })) {
            try {
                await planService.deletePlan(id);
                await alert('Plan deleted successfully!');
            } catch (error) {
                await alert('Failed to delete plan', { variant: 'danger' });
            }
        }
    };

    const toggleFeature = (key: keyof FeatureToggles) => {
        setFormData(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [key]: !prev.features[key]
            }
        }));
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading plans...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        Subscription Plans
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage subscription tiers, pricing, and feature access.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    <Plus size={18} />
                    Create Plan
                </button>
            </div>

            {/* Plans List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative bg-white rounded-lg border p-6 transition-all ${plan.isPopular ? 'border-blue-600 shadow-sm' : 'border-slate-200'}`}
                    >
                        {plan.isPopular && (
                            <div className="absolute -top-3 left-6 bg-blue-600 text-white px-3 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                Recommended
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">ID: {plan.id.slice(0, 8)}</p>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleOpenEdit(plan)}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-3xl font-bold text-slate-900">₹{plan.price}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase">/{plan.billingCycle === 'MONTHLY' ? 'Mo' : 'Yr'}</span>
                        </div>

                        <p className="text-xs font-medium text-slate-500 mb-6 line-clamp-2">
                            {plan.description || 'No description provided.'}
                        </p>

                        <div className="space-y-4 mb-6">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Users</p>
                                    <p className="text-sm font-bold text-slate-800">{plan.limits.users}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Branches</p>
                                    <p className="text-sm font-bold text-slate-800">{plan.limits.branches}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4 mt-auto">
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(plan.features)
                                    .filter(([_, val]) => val === true)
                                    .slice(0, 3)
                                    .map(([key]) => (
                                        <span key={key} className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 rounded uppercase">
                                            {key.replace('enable', '')}
                                        </span>
                                    ))}
                                {Object.values(plan.features).filter(v => v).length > 3 && (
                                    <span className="px-2 py-0.5 bg-blue-50 text-[9px] font-bold text-blue-600 rounded uppercase">
                                        +{Object.values(plan.features).filter(v => v).length - 3} More
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40">
                    <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 uppercase">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Billing Cycle</label>
                                        <div className="flex gap-2">
                                            {['MONTHLY', 'YEARLY'].map(cycle => (
                                                <button
                                                    key={cycle}
                                                    onClick={() => setFormData({ ...formData, billingCycle: cycle as any })}
                                                    className={`flex-1 py-1.5 rounded border text-[10px] font-bold uppercase transition-all ${formData.billingCycle === cycle ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                                >
                                                    {cycle}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={2}
                                            className="w-full px-4 py-2 border border-slate-200 rounded text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer p-4 border border-slate-200 rounded bg-slate-50">
                                        <input
                                            type="checkbox"
                                            checked={formData.isPopular}
                                            onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-xs font-bold text-slate-700 uppercase">Recommended Plan</span>
                                    </label>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Limits */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usage Limits</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {[
                                        { label: 'Max Users', key: 'users' },
                                        { label: 'Branches', key: 'branches' },
                                        { label: 'Invoices/Mo', key: 'invoicesPerMonth' },
                                        { label: 'Storage (GB)', key: 'storageGB' },
                                        { label: 'Domains', key: 'extraDomains' }
                                    ].map((limit) => (
                                        <div key={limit.key} className="p-3 bg-slate-50 rounded border border-slate-100 flex flex-col items-center">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase mb-2">{limit.label}</label>
                                            <input
                                                type="number"
                                                value={formData.limits[limit.key as keyof typeof formData.limits]}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    limits: { ...formData.limits, [limit.key]: Number(e.target.value) }
                                                })}
                                                className="w-full bg-transparent text-center text-sm font-bold text-slate-900 outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Feature Matrix */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Features Access</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {Object.keys(formData.features).map((feature: any) => {
                                        const isEnabled = formData.features[feature as keyof FeatureToggles];
                                        return (
                                            <button
                                                key={feature}
                                                onClick={() => toggleFeature(feature)}
                                                className={`p-2.5 rounded border text-left flex items-center gap-3 transition-all ${isEnabled ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isEnabled ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                                    {isEnabled && <Check size={10} className="text-white" strokeWidth={4} />}
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase ${isEnabled ? 'text-blue-900' : 'text-slate-500'}`}>
                                                    {feature.replace('enable', '').replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-slate-500 font-bold text-xs uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-slate-900 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-black transition-all"
                            >
                                {editingPlan ? 'Save Changes' : 'Create Plan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
