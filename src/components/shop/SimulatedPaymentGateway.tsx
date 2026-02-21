import React, { useState, useEffect } from 'react';
import {
    X, CreditCard, Smartphone, Landmark, CheckCircle2,
    Loader2, ShieldCheck, ChevronRight, Lock, ArrowLeft
} from 'lucide-react';

interface SimulatedPaymentGatewayProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (paymentDetails: any) => void;
    amount: number;
    currency?: string;
    companyName?: string;
    customerName?: string;
}

export const SimulatedPaymentGateway: React.FC<SimulatedPaymentGatewayProps> = ({
    isOpen,
    onClose,
    onSuccess,
    amount,
    currency = '₹',
    companyName = 'Averqon Bills',
    customerName = 'Valued Customer'
}) => {
    const [step, setStep] = useState<'methods' | 'processing' | 'success'>('methods');
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setStep('methods');
            setSelectedMethod(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePayment = (method: string) => {
        setSelectedMethod(method);
        setStep('processing');

        // Simulate processing time
        setTimeout(() => {
            setStep('success');
            // Simulate success callback after showing success screen
            setTimeout(() => {
                onSuccess({
                    method: method,
                    transactionId: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
                    status: 'Success',
                    amount: amount
                });
            }, 2000);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative">

                {/* Header */}
                <div className="bg-slate-900 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">
                            {companyName[0]}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm uppercase tracking-wider">{companyName}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure Checkout</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Amount to Pay</p>
                            <h2 className="text-3xl font-black">{currency}{amount.toLocaleString()}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Customer</p>
                            <p className="text-xs font-bold">{customerName}</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 bg-slate-50 min-h-[300px]">
                    {step === 'methods' && (
                        <div className="space-y-4 animate-slide-up">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Payment Method</p>

                            {[
                                { id: 'card', name: 'Cards', sub: 'Visa, Mastercard, RuPay', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { id: 'upi', name: 'UPI', sub: 'Google Pay, PhonePe, Paytm', icon: Smartphone, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { id: 'netbanking', name: 'Netbanking', sub: 'All Indian Banks', icon: Landmark, color: 'text-orange-600', bg: 'bg-orange-50' }
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => handlePayment(method.name)}
                                    className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-400 hover:shadow-lg transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${method.bg} ${method.color} rounded-xl flex items-center justify-center shadow-sm`}>
                                            <method.icon size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-tight">{method.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{method.sub}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
                            <div className="relative">
                                <Loader2 size={64} className="text-blue-600 animate-spin" strokeWidth={1.5} />
                                <Lock size={20} className="absolute inset-0 m-auto text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Processing Securely</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">Please do not refresh this page</p>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-scale-in">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner border border-emerald-100">
                                <CheckCircle2 size={48} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Payment Successful</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">Transacton Verified & Registered</p>
                            </div>
                            <div className="w-full bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                                <div className="flex justify-between text-[10px] text-emerald-700 font-bold uppercase tracking-widest">
                                    <span>Receipt Status</span>
                                    <span>Confirmed</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 text-center flex items-center justify-center gap-2 opacity-50">
                    <ShieldCheck size={14} className="text-slate-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PCI-DSS Compliant 256-bit Encrypted</span>
                </div>
            </div>
        </div>
    );
};
