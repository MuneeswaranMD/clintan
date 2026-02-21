import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Search,
    Filter,
    Eye,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Download,
    FileText,
    ExternalLink,
    ChevronRight,
    Building2,
    Mail,
    X,
    ClipboardCheck,
    Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tenant } from '../../types';
import { tenantService } from '../../services/firebaseService';
import { useDialog } from '../../context/DialogContext';

export const SuperAdminVerification: React.FC = () => {
    const { alert, confirm } = useDialog();
    const navigate = useNavigate();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        document.title = 'Super Admin | Verifications';
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const data = await tenantService.getAllTenants();
            // Sort to show pending first
            const sorted = data.sort((a, b) => {
                const statusA = a.config?.verification?.status || 'Active';
                const statusB = b.config?.verification?.status || 'Active';
                if (statusA === 'Pending' && statusB !== 'Pending') return -1;
                if (statusA !== 'Pending' && statusB === 'Pending') return 1;
                return 0;
            });
            setTenants(sorted);
        } catch (error) {
            console.error('Failed to fetch verification requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'Verified' | 'Rejected' | 'Under Review', reason?: string) => {
        setProcessing(true);
        try {
            await tenantService.updateVerificationStatus(id, status, reason, 'Super Admin');
            await alert(`Status updated to ${status} successfully!`);
            setShowDetailModal(false);
            setShowRejectModal(false);
            setRejectionReason('');
            fetchTenants();
        } catch (error: any) {
            await alert('Failed to update status: ' + error.message, { variant: 'danger' });
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'Verified': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Under Review': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'Rejected': return 'text-rose-600 bg-rose-50 border-rose-100';
            default: return 'text-slate-400 bg-slate-50 border-slate-100';
        }
    };

    const filteredTenants = tenants.filter(t => {
        if (!t) return false;
        const search = String(searchTerm || '').toLowerCase();
        const matchesSearch = String(t.companyName || '').toLowerCase().includes(search) ||
            String(t.ownerEmail || '').toLowerCase().includes(search);
        const status = t.config?.verification?.status || 'Pending';
        const matchesFilter = filterStatus === 'All' || status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const openDetails = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setShowDetailModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Verifications</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Review and manage tenant compliance documents.
                    </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    {['All', 'Pending', 'Verified', 'Rejected'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase transition-all ${filterStatus === s
                                ? 'bg-white text-blue-600 shadow-sm rounded'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total', val: tenants.length, icon: ClipboardCheck },
                    { label: 'Pending', val: tenants.filter(t => (t.config?.verification?.status || 'Pending') === 'Pending').length, icon: Clock },
                    { label: 'Verified', val: tenants.filter(t => t.config?.verification?.status === 'Verified').length, icon: CheckCircle2 },
                    { label: 'Rejected', val: tenants.filter(t => t.config?.verification?.status === 'Rejected').length, icon: XCircle },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-2 rounded bg-slate-50 text-slate-400">
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-900 leading-none">{stat.val}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                <Search size={18} className="text-slate-400 ml-2" />
                <input
                    type="text"
                    placeholder="Search company or email..."
                    className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold uppercase text-slate-800 placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="py-20 text-center bg-white rounded-lg border border-slate-200">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Loading requests...</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Company</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Industry</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tax ID</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTenants.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-400 text-xs text-center border border-slate-200 uppercase">
                                                    {String(t.companyName || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm uppercase tracking-wider">{t.companyName}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{t.ownerEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase">
                                                {t.industry}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[10px] font-bold text-slate-600 font-mono">
                                                {t.config?.taxConfig?.gstin || t.config?.taxConfig?.taxType || 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${getStatusColor(t.config?.verification?.status)}`}>
                                                {t.config?.verification?.status || 'Pending'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openDetails(t)}
                                                className="px-3 py-1.5 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all"
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredTenants.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No requests found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedTenant && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40">
                    <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Verification</h2>
                            <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-50">Profile</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-slate-50 rounded border border-slate-100">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Legal Name</p>
                                            <p className="text-[10px] font-bold text-slate-800 uppercase">{selectedTenant.config?.companyLegalName || selectedTenant.companyName}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded border border-slate-100">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Type</p>
                                            <p className="text-[10px] font-bold text-slate-800 uppercase">{selectedTenant.config?.businessType || 'Standard'}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded border border-slate-100">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Tax ID</p>
                                            <p className="text-[10px] font-bold text-slate-800 font-mono uppercase">{selectedTenant.config?.taxConfig?.gstin || 'N/A'}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded border border-slate-100">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Registry</p>
                                            <p className="text-[10px] font-bold text-slate-800 uppercase">{selectedTenant.config?.cin || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 pb-2 border-b border-slate-50">Banking</h3>
                                    <div className="p-4 bg-slate-50 rounded border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-800 uppercase">
                                            {selectedTenant.config?.bankDetails?.bankName} — {selectedTenant.config?.bankDetails?.accountNumber}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">IFSC: {selectedTenant.config?.bankDetails?.ifscCode}</p>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-50">Documents</h3>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'GST Certificate', key: 'gstCertificate' },
                                            { label: 'PAN Card', key: 'panCard' },
                                            { label: 'License', key: 'businessLicense' },
                                            { label: 'Cancelled Cheque', key: 'cancelledCheque' }
                                        ].map((doc, i) => {
                                            const url = (selectedTenant.config?.documents as any)?.[doc.key];
                                            return (
                                                <div key={i} className="p-3 bg-white border border-slate-200 rounded flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-800 uppercase">{doc.label}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{url ? 'Uploaded' : 'Missing'}</p>
                                                    </div>
                                                    {url && (
                                                        <div className="flex gap-2">
                                                            <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 p-1 bg-blue-50 rounded transition-colors">
                                                                <ExternalLink size={14} />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                            <button
                                onClick={() => handleUpdateStatus(selectedTenant.id, 'Under Review')}
                                className="px-4 py-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest"
                            >
                                Reviewing
                            </button>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                className="px-4 py-2 text-red-600 font-bold text-[10px] uppercase tracking-widest"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(selectedTenant.id, 'Verified')}
                                className="px-6 py-2 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-black shadow-sm"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedTenant && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40">
                    <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden border border-slate-200">
                        <div className="p-6 space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Confirm Rejection</h2>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Provide a reason for rejection.</p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full h-32 bg-slate-50 border border-slate-200 p-3 rounded outline-none focus:bg-white focus:border-red-400 text-[10px] font-bold uppercase tracking-widest"
                                placeholder="..."
                            />
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">Cancel</button>
                                <button onClick={() => handleUpdateStatus(selectedTenant.id, 'Rejected', rejectionReason)} className="flex-1 py-2 bg-red-600 text-white rounded font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 shadow-sm">Reject</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
