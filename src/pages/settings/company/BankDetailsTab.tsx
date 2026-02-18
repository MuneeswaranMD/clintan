import React, { useState } from 'react';
import { CreditCard, Landmark, User, Hash, Zap, QrCode, Shield, Save, ExternalLink } from 'lucide-react';
import { Tenant, BankDetails } from '../../../types';

interface BankDetailsTabProps {
    tenant: Tenant;
    onUpdate: (updates: Partial<Tenant>) => Promise<void>;
    saving: boolean;
    canEdit: boolean;
}

export const BankDetailsTab: React.FC<BankDetailsTabProps> = ({ tenant, onUpdate, saving, canEdit }) => {
    const [bankDetails, setBankDetails] = useState<BankDetails>(tenant.config?.bankDetails || {
        bankName: '',
        accountHolder: '',
        accountNumber: '',
        ifscCode: '',
        swiftCode: '',
        upiId: '',
        qrCodeUrl: '',
        razorpayKey: '',
        stripeKey: '',
        enablePaymentLink: true,
        enablePartialPayments: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdate({
            config: {
                ...tenant.config,
                bankDetails
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Core Bank Details */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Landmark size={16} className="text-blue-600" /> Banking Infrastructure
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Bank Name</label>
                            <div className="relative">
                                <Landmark size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                                    placeholder="e.g. HDFC Bank, Silicon Valley Bank"
                                    value={bankDetails.bankName}
                                    onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Account Holder Name</label>
                            <div className="relative">
                                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                                    placeholder="e.g. Acme Corporation Pvt Ltd"
                                    value={bankDetails.accountHolder}
                                    onChange={e => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Account Number</label>
                                <div className="relative">
                                    <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                                        value={bankDetails.accountNumber}
                                        onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">IFSC / Routing Code</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all uppercase"
                                    placeholder="HDFC0001234"
                                    value={bankDetails.ifscCode}
                                    onChange={e => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">SWIFT / BIC Code (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all uppercase"
                                    value={bankDetails.swiftCode}
                                    onChange={e => setBankDetails({ ...bankDetails, swiftCode: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">UPI ID (India)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                                    placeholder="company@bank"
                                    value={bankDetails.upiId}
                                    onChange={e => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Digital Payment Integration */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Zap size={16} className="text-blue-600" /> Digital Gateways
                    </h3>

                    <div className="space-y-4">
                        <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4 shadow-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CreditCard size={20} className="text-blue-400" />
                                    <span className="text-sm font-bold tracking-wide uppercase">Razorpay / Stripe</span>
                                </div>
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-[9px] font-bold uppercase tracking-wide">Connected</span>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Production API Key</label>
                                <input
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-sm font-mono outline-none focus:bg-white/10 focus:border-blue-500 transition-all"
                                    placeholder="rzp_live_..."
                                    value={bankDetails.razorpayKey}
                                    onChange={e => setBankDetails({ ...bankDetails, razorpayKey: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-[10px] text-white/40 font-bold uppercase">Settlement: T+2 Days</span>
                                <button type="button" className="text-[10px] text-blue-400 font-bold uppercase tracking-wide flex items-center gap-1 hover:text-blue-300">
                                    Gateway Dashboard <ExternalLink size={10} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Payment QR Code URL</label>
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                                    {bankDetails.qrCodeUrl ? (
                                        <img src={bankDetails.qrCodeUrl} alt="QR" className="w-full h-full object-cover" />
                                    ) : (
                                        <QrCode size={24} className="text-slate-300" />
                                    )}
                                </div>
                                <input
                                    type="text"
                                    className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                                    placeholder="https://..."
                                    value={bankDetails.qrCodeUrl}
                                    onChange={e => setBankDetails({ ...bankDetails, qrCodeUrl: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Preferences */}
            <div className="bg-slate-50 p-8 rounded-3xl space-y-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Shield size={16} className="text-indigo-600" /> Transaction Controls
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 cursor-pointer group hover:border-indigo-300 transition-all">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={bankDetails.enablePaymentLink}
                                onChange={e => setBankDetails({ ...bankDetails, enablePaymentLink: e.target.checked })}
                            />
                            <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-none">Auto-generate Payment Links</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1">Include Razorpay/Stripe checkout URL on every invoice PDF.</p>
                        </div>
                    </label>

                    <label className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 cursor-pointer group hover:border-indigo-300 transition-all">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={bankDetails.enablePartialPayments}
                                onChange={e => setBankDetails({ ...bankDetails, enablePartialPayments: e.target.checked })}
                            />
                            <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-none">Enable Partial Payments</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1">Allow customers to pay a specific amount of the total invoice.</p>
                        </div>
                    </label>
                </div>
            </div>

            {canEdit && (
                <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wide text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                        Synchronize Financial Infrastructure
                    </button>
                </div>
            )}
        </form>
    );
};

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
