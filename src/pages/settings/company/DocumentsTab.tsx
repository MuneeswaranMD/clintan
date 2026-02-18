import React, { useState } from 'react';
import { FileText, Upload, Trash2, Download, Eye, FileCheck, Shield, Save, Loader2, AlertCircle } from 'lucide-react';
import { Tenant } from '../../../types';

interface DocumentsTabProps {
    tenant: Tenant;
    onUpdate: (updates: Partial<Tenant>) => Promise<void>;
    saving: boolean;
    canEdit: boolean;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ tenant, onUpdate, saving, canEdit }) => {
    const [documents, setDocuments] = useState(tenant.config?.documents || []);
    const [isUploading, setIsUploading] = useState(false);
    const [newDoc, setNewDoc] = useState({ name: '', url: '', type: 'GST Certificate' });

    const handleAddDoc = () => {
        if (!newDoc.name || !newDoc.url) return;
        const doc = {
            ...newDoc,
            uploadedAt: new Date().toISOString()
        };
        const updated = [...documents, doc];
        setDocuments(updated);
        setNewDoc({ name: '', url: '', type: 'GST Certificate' });
        setIsUploading(false);
    };

    const handleRemoveDoc = (index: number) => {
        const updated = [...documents];
        updated.splice(index, 1);
        setDocuments(updated);
    };

    const handleSync = async () => {
        await onUpdate({
            config: {
                ...tenant.config,
                documents
            }
        });
    };

    const docTypes = [
        'GST Certificate',
        'Trade License',
        'Company PAN',
        'Registration Certificate',
        'Incorporate Certificate',
        'Import Export Code',
        'Other'
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <FileCheck size={16} className="text-blue-600" /> Compliance Vault
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Secure storage for legal certificates & business licenses.</p>
                </div>

                {canEdit && (
                    <button
                        onClick={() => setIsUploading(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wide text-[10px] shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        <Upload size={14} /> Upload Document
                    </button>
                )}
            </div>

            {isUploading && (
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-6 animate-slide-in">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Inbound Document Protocol</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Document Name</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all font-sans"
                                placeholder="e.g. GST_Cert_2026"
                                value={newDoc.name}
                                onChange={e => setNewDoc({ ...newDoc, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Document Classification</label>
                            <select
                                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
                                value={newDoc.type}
                                onChange={e => setNewDoc({ ...newDoc, type: e.target.value })}
                            >
                                {docTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Public URL / Link (Storage bridge pending)</label>
                            <div className="relative">
                                <Upload size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all"
                                    placeholder="https://..."
                                    value={newDoc.url}
                                    onChange={e => setNewDoc({ ...newDoc, url: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setIsUploading(false)}
                            className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wide text-slate-500 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddDoc}
                            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wide shadow-lg hover:bg-black transition-all"
                        >
                            Register Document
                        </button>
                    </div>
                </div>
            )}

            {/* Document Registry Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Document</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Classification</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Uploaded</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {documents.length > 0 ? (
                            documents.map((doc, index) => (
                                <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                <FileText size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Security: encrypted</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md text-[9px] font-bold uppercase tracking-wide border border-slate-200">
                                            {doc.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-bold text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-1">
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                                            >
                                                <Eye size={16} />
                                            </a>
                                            {canEdit && (
                                                <button
                                                    onClick={() => handleRemoveDoc(index)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Shield size={40} className="text-slate-100" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Registry Empty</p>
                                            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wide">Verified credentials will appear here.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start gap-4">
                <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
                <div>
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wide leading-none">KYC Warning</p>
                    <p className="text-[10px] text-amber-600 font-bold mt-2 leading-relaxed">
                        Ensure all documents are clear and valid. Expired documents may temporarily suspend automated billing and payment processing nodes.
                    </p>
                </div>
            </div>

            {canEdit && (
                <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={handleSync}
                        disabled={saving}
                        className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wide text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                        Synchronize Compliance Registry
                    </button>
                </div>
            )}
        </div>
    );
};
