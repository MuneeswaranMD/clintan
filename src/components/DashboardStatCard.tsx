import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconBg: string; // e.g., 'bg-gradient-primary'
    percentage: string | number;
    trend: string;
}

export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({ title, value, icon: Icon, iconBg, percentage, trend }) => {
    const isPositive = typeof percentage === 'string' ? percentage.startsWith('+') : percentage >= 0;
    const formattedPercentage = typeof percentage === 'number' ? `${percentage >= 0 ? '+' : ''}${percentage}%` : percentage;

    return (
        <div className="bg-white p-5 rounded-2xl shadow-premium hover:translate-y-[-2px] transition-all group flex flex-col justify-between h-full border-none">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">{title}</p>
                    <h4 className="text-xl font-bold text-slate-800 tracking-tight leading-none group-hover:text-primary transition-colors">{value}</h4>
                </div>
                <div className={`w-11 h-11 rounded-lg ${iconBg} flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform`}>
                    <Icon size={18} className="text-white" strokeWidth={3} />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
                <span className={`text-xs font-bold ${isPositive ? 'text-success' : 'text-error'}`}>{formattedPercentage}</span>
                <span className="text-[11px] font-bold text-slate-400 lowercase">{trend}</span>
            </div>
        </div>
    );
};
