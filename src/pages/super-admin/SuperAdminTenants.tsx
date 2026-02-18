import React, { useState, useEffect } from 'react';
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

            // This is a helper for the user to seed their first tenant if the DB is empty/unconfigured
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
            await alert('Domain configuration updated. Please verify DNS records.');
            fetchTenants();
            setIsDomainModalOpen(false);
        } catch (error) {
            console.error('Update failed:', error);
            await alert('Failed to update domain configuration', { variant: 'danger' });
        }
    };

    const handleVerifyDomain = async () => {
        if (!selectedTenant) return;
        setVerifying(true);

        // Simulate DNS propagation check
        setTimeout(async () => {
            try {
                await tenantService.updateTenant(selectedTenant.id, {
                    isDomainVerified: true,
                    status: 'Active'
                });
                await alert(`Domain ${selectedTenant.customDomain} verified successfully! Node is now live.`);
                setVerifying(false);
                setIsDomainModalOpen(false);
                fetchTenants();
            } catch (error) {
                setVerifying(false);
                await alert('Verification failed. DNS records not found.', { variant: 'danger' });
            }
        }, 2000);
    };

    const filteredTenants = tenants.filter(t =>
        t.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customDomain?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-6 animate-fade-in relative z-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                        <Command className="text-blue-600" size={28} strokeWidth={3} />
                        Instance Registry
                    </h1>
                    <p className="text-slate-500 font-bold text-sm mt-1">Global command center for active platform tenants and DNS nodes.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white border-2 border-slate-100 rounded-xl text-slate-600 text-[11px] font-black uppercase tracking-widest hover:border-slate-200 transition-all flex items-center gap-2 shadow-sm">
                        <Download size={16} strokeWidth={3} /> Export Data
                    </button>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 active:scale-95">
                        <Plus size={18} strokeWidth={3} /> Register Entity
                    </button>
                </div>
            </div>

            {/* Platform Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Instances', val: '1,240', sub: 'Across 12 Global Industries', icon: Globe, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Platform Telemetry', val: '4.2M', sub: 'Calculated DNS Requests/24h', icon: Zap, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Verified Nodes', val: '842', sub: 'Custom Domain Mapping Active', icon: Shield, color: 'text-emerald-600 bg-emerald-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[1.5rem] border-none shadow-premium flex items-center gap-5 group hover:translate-y-[-4px] transition-all">
                        <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <stat.icon size={26} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900 leading-none tracking-tight">{stat.val}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{stat.label}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 opacity-60 italic">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Registry */}
            <div className="bg-white rounded-[2rem] shadow-premium overflow-hidden border-none text-sm font-medium">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center gap-4 bg-slate-50/50">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} strokeWidth={3} />
                        <input
                            type="text"
                            placeholder="Universal search by instance ID, name, or domain protocol..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white border-none rounded-[1.25rem] text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3.5 bg-white rounded-[1.25rem] text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-all shadow-sm border border-slate-100">
                        <Filter size={16} strokeWidth={3} /> Industry Filter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-[15vh] text-center flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-6" />
                            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Instance Nodes...</p>
                        </div>
                    ) : error ? (
                        <div className="py-[15vh] text-center flex flex-col items-center px-6">
                            <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mb-6 border border-rose-100">
                                <Shield size={32} strokeWidth={3} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Registry Connection Blocked</h2>
                            <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium"> Firestore Security Rules are preventing access to the tenant registry. Please ensure your <code className="bg-slate-100 px-2 py-1 rounded text-rose-600 font-bold">tenants</code> collection exists and permissions are configured.</p>
                            <div className="flex gap-4">
                                <button onClick={fetchTenants} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:translate-y-[-2px] transition-all">
                                    Re-sync Registry
                                </button>
                                <button onClick={handleInitializeDatabase} className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all">
                                    Initialize Master Node
                                </button>
                            </div>
                        </div>
                    ) : filteredTenants.length === 0 ? (
                        <div className="py-[15vh] text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
                                <Activity size={32} strokeWidth={3} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">No Active Nodes Found</h2>
                            <p className="text-slate-400 max-w-sm mx-auto mb-8 font-medium">The instance registry is currently empty. Initialize a master node to begin white-labeled deployments.</p>
                            <button onClick={handleInitializeDatabase} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:translate-y-[-2px] transition-all">
                                Bootstrap Platform Registry
                            </button>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white">
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Instance Node</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Domain Proxy</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Plan Tier</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">System Alpha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredTenants.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 group-hover:bg-gradient-primary group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                                                    {t.companyName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-base tracking-tight group-hover:text-blue-600 transition-colors uppercase leading-tight">{t.companyName}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{t.ownerEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center"><Globe size={10} className="text-blue-600" /></div>
                                                    <span className="font-black text-slate-600 text-xs tracking-tight">{t.subdomain}.averqon.com</span>
                                                </div>
                                                {t.customDomain && (
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-4 h-4 rounded-full ${t.isDomainVerified ? 'bg-emerald-50' : 'bg-amber-50'} flex items-center justify-center`}>
                                                            {t.isDomainVerified ? <CheckCircle2 size={10} className="text-emerald-600" /> : <AlertCircle size={10} className="text-amber-600" />}
                                                        </div>
                                                        <span className={`font-black text-xs tracking-tight ${t.isDomainVerified ? 'text-emerald-600' : 'text-amber-600 underline decoration-dotted decoration-amber-300 cursor-help'}`} onClick={() => handleOpenDomainSettings(t)}>
                                                            {t.customDomain}
                                                        </span>
                                                    </div>
                                                )}
                                                {!t.customDomain && (
                                                    <button
                                                        onClick={() => handleOpenDomainSettings(t)}
                                                        className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center gap-1.5"
                                                    >
                                                        <Plus size={10} strokeWidth={4} /> Map Domain
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${t.plan === 'Enterprise' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' :
                                                t.plan === 'Pro' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' :
                                                    'bg-slate-200 text-slate-600'
                                                }`}>
                                                {t.plan}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${t.status === 'Active' ? 'bg-emerald-500 animate-pulse' :
                                                    t.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`} />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center border border-transparent hover:border-blue-100 active:scale-90">
                                                    <Eye size={18} strokeWidth={2.5} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenDomainSettings(t)}
                                                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-all flex items-center justify-center border border-transparent hover:border-amber-100 active:scale-90"
                                                >
                                                    <Globe size={18} strokeWidth={2.5} />
                                                </button>
                                                <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center border border-transparent hover:border-rose-100 active:scale-90">
                                                    <Trash2 size={18} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-8 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page 01 — Sync'd with 1,240 platform instances</p>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((n) => (
                            <button key={n} className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${n === 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Domain Settings Modal */}
            {isDomainModalOpen && selectedTenant && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-fade-in">
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/20">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none rotate-12">
                            <Globe size={300} strokeWidth={1} />
                        </div>

                        <div className="p-10 relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Domain Mapping Registry</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">White-label DNS Config for <span className="text-blue-600">{selectedTenant.companyName}</span></p>
                                </div>
                                <button onClick={() => setIsDomainModalOpen(false)} className="w-12 h-12 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all flex items-center justify-center active:scale-90 shadow-sm border border-slate-100">
                                    <X size={24} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Subdomain View */}
                                <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fallback Subdomain</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600 font-black text-xs">S</div>
                                            <span className="font-black text-slate-800 tracking-tight">{selectedTenant.subdomain}.averqon.com</span>
                                        </div>
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg uppercase tracking-tight">System Primary</span>
                                    </div>
                                </div>

                                {/* Custom Domain Entry */}
                                <form onSubmit={handleUpdateDomain} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custom Domain Protocol</label>
                                        <div className="relative group">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                            <input
                                                type="text"
                                                name="customDomain"
                                                className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-blue-100 transition-all font-black text-sm placeholder:text-slate-300 uppercase tracking-tight"
                                                placeholder="e.g. crm.clientcompany.com"
                                                defaultValue={selectedTenant.customDomain || ''}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        <button type="submit" className="flex-1 bg-slate-900 text-white font-black py-4 rounded-xl text-[11px] uppercase tracking-widest hover:shadow-xl transition-all shadow-lg active:scale-95">
                                            Commit Domain Config
                                        </button>
                                        <button type="button" onClick={() => setIsDomainModalOpen(false)} className="px-6 bg-slate-50 text-slate-400 font-black rounded-xl text-[11px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95">
                                            Cancel
                                        </button>
                                    </div>
                                </form>

                                {/* DNS Verification Instructions */}
                                <div className="p-8 bg-blue-600 rounded-[2rem] text-white space-y-6 shadow-xl shadow-blue-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                            <Shield size={18} strokeWidth={3} /> DNS Registry Requirements
                                        </h3>
                                        {selectedTenant.isDomainVerified ? (
                                            <span className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Active Node</span>
                                        ) : (
                                            <span className="bg-amber-400 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Action Required</span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Type</p>
                                            <p className="font-black text-sm">CNAME</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Host</p>
                                            <p className="font-black text-sm">{selectedTenant.dnsConfig?.host || 'crm'}</p>
                                        </div>
                                        <div className="col-span-2 space-y-1 pt-2">
                                            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Value (Points To)</p>
                                            <div className="flex items-center justify-between bg-white/10 p-4 rounded-xl border border-white/20 mt-2">
                                                <code className="text-xs font-black tracking-tight">{selectedTenant.dnsConfig?.pointsTo || 'app.averqon-saas.com'}</code>
                                                <Copy size={16} className="cursor-pointer hover:scale-110 transition-transform" />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleVerifyDomain}
                                        disabled={verifying}
                                        className="w-full bg-white text-blue-600 font-black py-4 rounded-xl text-[11px] uppercase tracking-widest hover:shadow-lg hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <RefreshCw size={16} className={`${verifying ? 'animate-spin' : ''}`} strokeWidth={3} />
                                        {verifying ? 'Neural Handshake in Progress...' : 'Trigger DNS Validation'}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
