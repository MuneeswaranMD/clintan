import React from 'react';
import { useHealthMonitor } from '../hooks/useHealthMonitor';
import { Activity } from 'lucide-react';

export const HealthBadge: React.FC = () => {
    const { status, responseTime, uptimePercentage } = useHealthMonitor();

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full hover:shadow-sm transition-all group overflow-hidden relative">
            {/* Animated background pulse for status */}
            {status === "online" && (
                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
            )}

            <div className={`w-2 h-2 rounded-full relative ${status === "online" ? "bg-emerald-500" :
                    status === "slow" ? "bg-amber-500" :
                        status === "offline" ? "bg-rose-500" : "bg-slate-300"
                }`}>
                {status === "online" && (
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                )}
            </div>

            <div className="flex items-center gap-2 divide-x divide-slate-200">
                <div className="flex items-center gap-1.5 pr-2">
                    <Activity size={10} className={`${status === "online" ? "text-emerald-600" : "text-slate-400"
                        }`} />
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                        {status === "checking" ? "Verifying..." : (
                            <>
                                {responseTime ? `${responseTime.toFixed(0)}ms` : '---'}
                            </>
                        )}
                    </span>
                </div>

                <div className="pl-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">
                        {uptimePercentage}% <span className="text-[8px] font-bold text-slate-400">UPTIME</span>
                    </span>
                </div>
            </div>
        </div>
    );
};
