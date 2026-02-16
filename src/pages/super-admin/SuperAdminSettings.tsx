import React, { useState, useEffect } from 'react';
import {
    Settings,
    Shield,
    Palette,
    Globe,
    Mail,
    MessageSquare,
    Database,
    Lock,
    Monitor,
    Zap,
    Save,
    RefreshCw,
    ExternalLink,
    Wrench,
    BellRing,
    ChevronRight,
    Search,
    User,
    Check
} from 'lucide-react';

export const SuperAdminSettings: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | System Settings'; }, []);

    const [activeSection, setActiveSection] = useState('platform');

    const sections = [
        { id: 'platform', label: 'Platform Core', icon: Settings, desc: 'Central identity and global presets' },
        { id: 'branding', label: 'White-labeling', icon: Palette, desc: 'Custom CSS and brand management' },
        { id: 'security', label: 'Security & Auth', icon: Shield, desc: 'MFA, sessions and encryption' },
        { id: 'communications', label: 'SMTP & SMS', icon: Mail, desc: 'Email gateways and API keys' },
        { id: 'infrastructure', label: 'Cloud & DB', icon: Database, desc: 'Bucket storage and shard logic' },
        { id: 'integrations', label: 'Ecosystem', icon: ExternalLink, desc: 'Webhooks and partner sync' },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
                    <p className="text-slate-500 font-semibold mt-1">Global platform configuration and system-wide overrides.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <RefreshCw size={18} /> Revert
                    </button>
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-300 flex items-center gap-3 active:scale-95">
                        <Save size={20} strokeWidth={3} />
                        Synchronize
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 pb-12">
                {/* Navigation Sidebar */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-[3rem] p-6 shadow-sm space-y-2">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${isActive
                                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30'
                                            : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <div className="text-left">
                                        <p className={`text-xs font-black uppercase tracking-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>{section.label}</p>
                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>{section.desc}</p>
                                    </div>
                                    {isActive && <ChevronRight size={16} className="ml-auto" strokeWidth={3} />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-10 bg-orange-600 rounded-[3rem] text-white space-y-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform rotate-12">
                            <Wrench size={120} strokeWidth={1} />
                        </div>
                        <h3 className="text-2xl font-black leading-tight relative z-10">Emergency <br /> Platform Lock</h3>
                        <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest relative z-10 leading-relaxed">Instantly force a maintenance state across all global nodes for non-admin traffic.</p>
                        <button className="w-full py-4 bg-white text-orange-600 rounded-2xl font-black uppercase tracking-widest text-[10px] relative z-10 hover:bg-orange-50 transition-all shadow-xl shadow-orange-700/20 active:scale-95">
                            Activate Lockdown
                        </button>
                    </div>
                </div>

                {/* Settings Panels */}
                <div className="col-span-12 lg:col-span-9 bg-white border border-slate-100 rounded-[3.5rem] shadow-sm p-12 space-y-12">
                    {/* Platform Configuration */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <Monitor size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Platform Identity</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configure global white-label identifiers</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { label: 'Application Name', val: 'Averqon Business Cloud', type: 'text' },
                                { label: 'Primary Domain', val: 'app.averqon.in', type: 'text' },
                                { label: 'Support Node Email', val: 'nexus@averqon.in', type: 'email' },
                                { label: 'Global Trial Window', val: '14', type: 'number', suffix: 'Days' },
                            ].map((field, i) => (
                                <div key={i} className="space-y-2 group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 group-focus-within:text-blue-600 transition-colors">{field.label}</label>
                                    <div className="relative">
                                        <input
                                            type={field.type}
                                            defaultValue={field.val}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                                        />
                                        {field.suffix && (
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.suffix}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Operational Toggles */}
                    <div className="space-y-8 pt-12 border-t border-slate-50">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Logic Overrides</h4>
                            <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Active Scanning</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'Cloud Snapshots', sub: 'Redundant backups every 6h', icon: Database, enabled: true },
                                { label: 'Quantum Shield', sub: 'Deep malware & bot protection', icon: Shield, enabled: true },
                                { label: 'Telemetry Forge', sub: 'Anonymized performance metrics', icon: Zap, enabled: false },
                                { label: 'System Broadcast', sub: 'Platform-wide event triggers', icon: BellRing, enabled: true },
                            ].map((toggle, i) => (
                                <div key={i} className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 group hover:border-blue-300 transition-all cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${toggle.enabled ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-200 text-slate-400'}`}>
                                            <toggle.icon size={22} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{toggle.label}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{toggle.sub}</p>
                                        </div>
                                    </div>
                                    <button className={`w-12 h-7 rounded-full relative transition-all duration-300 ${toggle.enabled ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${toggle.enabled ? 'left-6' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
