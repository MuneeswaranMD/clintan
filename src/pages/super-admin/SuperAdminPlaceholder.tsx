import React from 'react';
import { Shield, Sparkles, ChevronRight } from 'lucide-react';

interface PlaceholderProps {
    title: string;
    description: string;
}

export const SuperAdminPlaceholder: React.FC<PlaceholderProps> = ({ title, description }) => {
    return (
        <div className="flex items-center justify-center p-8 bg-slate-50 min-h-[calc(100vh-100px)] rounded-[3rem]">
            <div className="text-center space-y-10 max-w-lg">
                <div className="relative mx-auto w-32 h-32">
                    <div className="absolute inset-0 bg-blue-600/20 rounded-[3rem] blur-2xl animate-pulse"></div>
                    <div className="relative w-32 h-32 bg-white border border-slate-100 rounded-[3rem] flex items-center justify-center text-blue-600 shadow-xl shadow-blue-500/10 active:scale-95 transition-transform">
                        <Shield size={64} strokeWidth={2.5} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center justify-center gap-3 uppercase">
                        {title}
                        <Sparkles size={28} className="text-blue-500" />
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-tight leading-relaxed max-w-sm mx-auto">
                        {description}
                    </p>
                </div>

                <div className="p-10 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocol Development Status</p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                <div className="h-full w-[65%] bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
                            </div>
                            <span className="text-sm font-black text-slate-900">65%</span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Architecting sub-module telemetry layers.</p>
                    </div>
                </div>

                <button className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] hover:text-slate-900 transition-all flex items-center gap-3 mx-auto">
                    Contact Prime Admin <ChevronRight size={14} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};
