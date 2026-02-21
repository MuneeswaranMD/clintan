import React from 'react';
import { Lock, Zap, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionLockProps {
    isExpired: boolean;
    planName: string;
}

export const SubscriptionLock: React.FC<SubscriptionLockProps> = ({ isExpired, planName }) => {
    const navigate = useNavigate();

    if (!isExpired) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white max-w-lg w-full rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 opacity-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-rose-100 transition-colors"></div>

                <div className="relative z-10 text-center space-y-6">
                    <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner mb-2 animate-bounce">
                        <Lock size={40} />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Instance Locked</h2>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Subscription Expired: {planName}</p>
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex items-center gap-4 text-left">
                        <AlertCircle className="text-amber-500 shrink-0" size={24} />
                        <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-wide">
                            Your platform node access has been restricted due to an expired subscription. All data remains safe, but active operations are suspended.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/settings/company')}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Zap size={18} className="text-yellow-400 fill-yellow-400" />
                            Renew Subscription / Upgrade
                        </button>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Need help? Contact support@averqon.com
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
