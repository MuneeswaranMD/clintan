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
        <div className="p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Global platform configuration and system-wide overrides.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <RefreshCw size={16} /> Revert
                    </button>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-sm flex items-center gap-2 active:scale-95">
                        <Save size={16} strokeWidth={2.5} />
                        Synchronize
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 pb-12">
                {/* Navigation Sidebar */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                                    <div className="text-left">
                                        <p className={`text-xs font-bold uppercase tracking-wide ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>{section.label}</p>
                                        <p className={`text-[10px] font-medium uppercase tracking-wide ${isActive ? 'text-blue-500' : 'text-slate-400'}`}>{section.desc}</p>
                                    </div>
                                    {isActive && <ChevronRight size={14} className="ml-auto text-blue-500" strokeWidth={2.5} />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-6 bg-orange-600 rounded-xl text-white space-y-4 relative overflow-hidden group shadow-lg shadow-orange-600/20">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform rotate-12">
                            <Wrench size={80} strokeWidth={1} />
                        </div>
                        <h3 className="text-lg font-bold leading-tight relative z-10">Emergency <br /> Platform Lock</h3>
                        <p className="text-orange-100 text-xs font-medium relative z-10 leading-relaxed">Instantly force a maintenance state across all global nodes for non-admin traffic.</p>
                        <button className="w-full py-2.5 bg-white text-orange-600 rounded-lg font-bold uppercase tracking-wide text-[10px] relative z-10 hover:bg-orange-50 transition-all shadow-sm active:scale-95">
                            Activate Lockdown
                        </button>
                    </div>
                </div>

                {/* Settings Panels */}
                <div className="col-span-12 lg:col-span-9 bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-8">
                    {/* Platform Configuration */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                                <Monitor size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Platform Identity</h3>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Configure global white-label identifiers</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'Application Name', val: 'Averqon Business Cloud', type: 'text' },
                                { label: 'Primary Domain', val: 'app.averqon.in', type: 'text' },
                                { label: 'Support Node Email', val: 'nexus@averqon.in', type: 'email' },
                                { label: 'Global Trial Window', val: '14', type: 'number', suffix: 'Days' },
                            ].map((field, i) => (
                                <div key={i} className="space-y-1.5 group">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 group-focus-within:text-blue-600 transition-colors">{field.label}</label>
                                    <div className="relative">
                                        <input
                                            type={field.type}
                                            defaultValue={field.val}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all focus:ring-2 focus:ring-blue-50"
                                        />
                                        {field.suffix && (
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-wide">{field.suffix}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Operational Toggles */}
                    <div className="space-y-6 pt-8 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Operational Logic Overrides</h4>
                            <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border border-emerald-100">Active Scanning</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Cloud Snapshots', sub: 'Redundant backups every 6h', icon: Database, enabled: true },
                                { label: 'Quantum Shield', sub: 'Deep malware & bot protection', icon: Shield, enabled: true },
                                { label: 'Telemetry Forge', sub: 'Anonymized performance metrics', icon: Zap, enabled: false },
                                { label: 'System Broadcast', sub: 'Platform-wide event triggers', icon: BellRing, enabled: true },
                            ].map((toggle, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all group cursor-pointer hover:bg-white hover:shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${toggle.enabled ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-400'}`}>
                                            <toggle.icon size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{toggle.label}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">{toggle.sub}</p>
                                        </div>
                                    </div>
                                    <button className={`w-10 h-6 rounded-full relative transition-all duration-300 ${toggle.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${toggle.enabled ? 'left-5' : 'left-1'}`}></div>
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
