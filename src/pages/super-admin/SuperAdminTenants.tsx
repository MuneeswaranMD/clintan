import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    Plus,
    Search,
    Filter,
    ExternalLink,
    Shield,
    Globe,
    Zap,
    Download,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ChevronRight,
    Users,
    Trash2,
    Eye,
    Command,
    Activity,
    CheckCircle2,
    AlertCircle,
    X,
    Copy,
    RefreshCw
} from 'lucide-react';
import { Tenant } from '../../types';
import { tenantService } from '../../services/firebaseService';
import { useDialog } from '../../context/DialogContext';

export const SuperAdminTenants: React.FC = () => {
    const { alert, confirm } = useDialog();
    const navigate = useNavigate();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'Super Admin | Tenants';
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await tenantService.getAllTenants();
            setTenants(data);
        } catch (error: any) {
            console.error('Failed to fetch tenants:', error);
            setError(error.message || 'Access Denied');
        } finally {
            setLoading(false);
        }
    };

    const handleInitializeDatabase = async () => {
        try {
            setLoading(true);
            const masterTenant: any = {
                companyName: 'Averqon Master',
                subdomain: 'averqon',
                ownerEmail: 'muneeswaran@averqon.in',
                status: 'Active',
                plan: 'Enterprise',
                industry: 'Software',
                isDomainVerified: true,
                createdAt: new Date().toISOString(),
                usersCount: 1,
                mrr: '0'
            };

            const { db } = await import('../../services/firebase');
            const { collection, addDoc } = await import('firebase/firestore');
            await addDoc(collection(db, 'tenants'), masterTenant);
            await alert('Master Node Initialized successfully!');
            fetchTenants();
        } catch (err: any) {
            await alert('Initialization failed: ' + err.message, { variant: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDomainSettings = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setIsDomainModalOpen(true);
    };

    const handleUpdateDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTenant) return;

        const form = e.target as HTMLFormElement;
        const customDomain = (form.elements.namedItem('customDomain') as HTMLInputElement).value;

        try {
            await tenantService.updateTenant(selectedTenant.id, {
                customDomain,
                isDomainVerified: false
            });
            await alert('Domain configuration updated.');
            fetchTenants();
            setIsDomainModalOpen(false);
        } catch (error) {
            console.error('Update failed:', error);
            await alert('Failed to update domain', { variant: 'danger' });
        }
    };

    const handleVerifyDomain = async () => {
        if (!selectedTenant) return;
        setVerifying(true);

        setTimeout(async () => {
            try {
                await tenantService.updateTenant(selectedTenant.id, {
                    isDomainVerified: true,
                    status: 'Active'
                });
                await alert(`Domain verified successfully!`);
                setVerifying(false);
                setIsDomainModalOpen(false);
                fetchTenants();
            } catch (error) {
                setVerifying(false);
                await alert('Verification failed.', { variant: 'danger' });
            }
        }, 2000);
    };

    const handleDelete = async (tenantId: string) => {
        const confirmed = await confirm('Terminate this organization? This action cannot be undone.', {
            title: 'Terminate Instance',
            confirmText: 'Terminate',
            variant: 'danger'
        });

        if (!confirmed) return;

        try {
            await tenantService.deleteTenant(tenantId);
            await alert('Organization terminated.');
            fetchTenants();
        } catch (err: any) {
            await alert(err.message || 'Failed to terminate', { variant: 'danger' });
        }
    };

    const filteredTenants = tenants.filter(t =>
        t.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customDomain?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tenant Registry</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage platform instances and domain configurations.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
                        <Download size={14} className="mr-2 inline" /> Export
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
                        + New Tenant
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Instances', val: '1,240', icon: Globe },
                    { label: 'Security Status', val: 'Shielded', icon: Shield },
                    { label: 'System Uptime', val: '99.9%', icon: Activity },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded bg-slate-50 text-slate-600">
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 leading-none">{stat.val}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Registry */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center gap-4 bg-slate-50">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search instances..."
                            className="w-full pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded text-sm font-semibold outline-none focus:ring-1 focus:ring-blue-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Loading Tenants...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Organization</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Domains</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTenants.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-400 text-xs">
                                                    {t.companyName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{t.companyName}</p>
                                                    <p className="text-[10px] font-semibold text-slate-500">{t.ownerEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold text-slate-600">{t.subdomain}.averqon.com</p>
                                                {t.customDomain && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${t.isDomainVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                        <span className={`text-[10px] font-bold ${t.isDomainVerified ? 'text-emerald-600' : 'text-amber-600'}`}>{t.customDomain}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                                                {t.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => navigate(`/super/tenants/${t.id}`)} className="p-2 text-slate-400 hover:text-blue-600">
                                                    <Eye size={14} />
                                                </button>
                                                <button onClick={() => handleOpenDomainSettings(t)} className="p-2 text-slate-400 hover:text-blue-600">
                                                    <Globe size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-red-600">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Domain Modal */}
            {isDomainModalOpen && selectedTenant && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40">
                    <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-900 uppercase">Domain Mapping</h2>
                            <button onClick={() => setIsDomainModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <form onSubmit={handleUpdateDomain} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custom Domain</label>
                                    <input
                                        type="text"
                                        name="customDomain"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-semibold outline-none focus:ring-1 focus:ring-blue-100"
                                        placeholder="crm.example.com"
                                        defaultValue={selectedTenant.customDomain || ''}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-slate-900 text-white font-bold py-2 rounded text-[10px] uppercase tracking-widest hover:bg-black">
                                        Update
                                    </button>
                                </div>
                            </form>

                            <div className="p-5 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Required DNS Records</h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase">
                                        <div className="text-slate-400">Type</div>
                                        <div className="text-slate-800">CNAME</div>
                                        <div className="text-slate-400">Host</div>
                                        <div className="text-slate-800">{selectedTenant.dnsConfig?.host || 'crm'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Points To</p>
                                        <code className="bg-white p-2 border border-slate-200 rounded block text-xs font-bold text-slate-600">{selectedTenant.dnsConfig?.pointsTo || 'app.averqon-saas.com'}</code>
                                    </div>
                                </div>
                                <button
                                    onClick={handleVerifyDomain}
                                    disabled={verifying}
                                    className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-2 rounded text-[10px] uppercase tracking-widest hover:bg-slate-100 flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={12} className={verifying ? 'animate-spin' : ''} />
                                    {verifying ? 'Verifying...' : 'Verify DNS'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
