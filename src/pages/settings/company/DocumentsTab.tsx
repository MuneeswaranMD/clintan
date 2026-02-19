import React, { useState } from 'react';
import { FileText, Upload, Trash2, Download, Eye, FileCheck, Shield, Save, Loader2, AlertCircle, CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react';
import { Tenant } from '../../../types';
import { tenantService } from '../../../services/firebaseService';

interface DocumentsTabProps {
    tenant: Tenant;
    onUpdate: (updates: Partial<Tenant>) => Promise<void>;
    saving: boolean;
    canEdit: boolean;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ tenant, onUpdate, saving, canEdit }) => {
    const [docs, setDocs] = useState(tenant.config?.documents || {});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileUpload = async (key: string, url: string) => {
        const updatedDocs = { ...docs, [key]: url };
        setDocs(updatedDocs);
        await onUpdate({
            config: {
                ...tenant.config,
                documents: updatedDocs
            }
        });
    };

    const handleRemoveDoc = async (key: string) => {
        const updatedDocs = { ...docs };
        delete (updatedDocs as any)[key];
        setDocs(updatedDocs);
        await onUpdate({
            config: {
                ...tenant.config,
                documents: updatedDocs
            }
        });
    };

    const handleSubmitForVerification = async () => {
        setIsSubmitting(true);
        try {
            await tenantService.submitForVerification(tenant.id);
            // The subscription in parent will update the UI
        } catch (error) {
            console.error('Failed to submit for verification:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const verificationStatus = tenant.config?.verification?.status || 'Active'; // Default to active if not set, or handle 'Unverified'

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Verified': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Under Review': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'Rejected': return 'text-rose-600 bg-rose-50 border-rose-100';
            default: return 'text-slate-400 bg-slate-50 border-slate-100';
        }
    };

    const requiredDocs = [
        { label: 'GST Certificate', key: 'gstCertificate', required: true },
        { label: 'PAN Card', key: 'panCard', required: true },
        { label: 'Business License', key: 'businessLicense', required: true },
        { label: 'Cancelled Cheque', key: 'cancelledCheque', required: true },
        { label: 'ID Proof (Owner)', key: 'idProof', required: true },
    ];

    return (
        <div className="space-y-8">
            {/* Status Banner */}
            <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group ${getStatusColor(verificationStatus)}`}>
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none rotate-12">
                    <ShieldCheck size={120} strokeWidth={1} />
                </div>

                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center">
                        {verificationStatus === 'Verified' ? <CheckCircle2 size={32} /> :
                            verificationStatus === 'Rejected' ? <XCircle size={32} /> :
                                <Clock size={32} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight leading-none">
                            Identity Verification: {verificationStatus}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-70">
                            {verificationStatus === 'Verified' ? 'Your account is fully verified. All premium features unlocked.' :
                                verificationStatus === 'Pending' ? 'Your profile is awaiting administrative review.' :
                                    verificationStatus === 'Rejected' ? 'Verification failed. Please review documents and resubmit.' :
                                        'Complete your profile to unlock all business capabilities.'}
                        </p>
                    </div>
                </div>

                {verificationStatus !== 'Verified' && verificationStatus !== 'Pending' && verificationStatus !== 'Under Review' && (
                    <button
                        onClick={handleSubmitForVerification}
                        disabled={isSubmitting || saving}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all disabled:opacity-50 relative z-10"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit for Compliance Review'}
                    </button>
                )}

                {verificationStatus === 'Rejected' && tenant.config?.verification?.rejectionReason && (
                    <div className="w-full mt-4 p-4 bg-white/50 rounded-2xl border border-rose-200">
                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Rejection Reason</p>
                        <p className="text-sm font-bold text-slate-700">{tenant.config.verification.rejectionReason}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {requiredDocs.map((doc) => {
                    const url = (docs as any)[doc.key];
                    return (
                        <div key={doc.key} className="bg-white p-6 rounded-[2rem] border-2 border-slate-50 hover:border-blue-100 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${url ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{doc.label}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {doc.required ? 'Required compliance node' : 'Optional document'}
                                        </p>
                                    </div>
                                </div>
                                {url && (
                                    <div className="flex gap-2">
                                        <a href={url} target="_blank" rel="noreferrer" className="w-9 h-9 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all">
                                            <Eye size={16} />
                                        </a>
                                        {canEdit && (
                                            <button onClick={() => handleRemoveDoc(doc.key)} className="w-9 h-9 bg-slate-100 hover:bg-rose-500 hover:text-white rounded-xl flex items-center justify-center transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {!url && canEdit && (
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Paste document URL or cloud bridge link..."
                                        className="w-full bg-slate-50 border-none p-4 pr-12 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-sans"
                                        onBlur={(e) => {
                                            if (e.target.value) handleFileUpload(doc.key, e.target.value);
                                        }}
                                    />
                                    <Upload size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                </div>
                            )}

                            {url && (
                                <div className="mt-2 py-2 px-4 bg-emerald-50 rounded-xl flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">Node Link Verified</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100">
                <div className="flex items-start gap-4">
                    <ShieldCheck className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Compliance Protocol</p>
                            <h4 className="text-lg font-black text-slate-800 tracking-tight mt-1">Trust & Verification Policy</h4>
                        </div>
                        <ul className="space-y-3">
                            {[
                                'Documents must be original color scans in high resolution.',
                                'GSTIN and PAN details must match the company legal name.',
                                'Verification typically takes 24-48 business hours.',
                                'Restriction: Unverified accounts cannot generate B2B GST invoices.'
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                    <div className="w-1 h-1 bg-blue-600 rounded-full" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
