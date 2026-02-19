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
        { id: 'platform', label: 'Platform Core', icon: Settings, desc: 'Global configuration' },
        { id: 'branding', label: 'Branding', icon: Palette, desc: 'Appearance and logos' },
        { id: 'security', label: 'Security', icon: Shield, desc: 'Auth and sessions' },
        { id: 'communications', label: 'Email & SMS', icon: Mail, desc: 'Gateway settings' },
        { id: 'infrastructure', label: 'Infrastructure', icon: Database, desc: 'Cloud and storage' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Configure global platform-wide settings and overrides.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
                        <RefreshCw size={14} className="mr-2 inline" /> Reset
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Navigation Sidebar */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm space-y-1">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded transition-all ${isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                                    <div className="text-left">
                                        <p className="text-[11px] font-bold uppercase tracking-wider">{section.label}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{section.desc}</p>
                                    </div>
                                    {isActive && <ChevronRight size={12} className="ml-auto" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-5 bg-slate-900 rounded-lg text-white space-y-3">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Maintenance</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">Instantly force maintenance mode for non-admin traffic.</p>
                        <button className="w-full py-2 bg-white text-slate-900 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all">
                            Lock Platform
                        </button>
                    </div>
                </div>

                {/* Settings Panels */}
                <div className="col-span-12 lg:col-span-9 bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-8">
                    {/* Platform Configuration */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-slate-100 text-slate-500">
                                <Monitor size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 uppercase">Platform Identity</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Application Name', val: 'Averqon Business Cloud', type: 'text' },
                                { label: 'Primary Domain', val: 'app.averqon.in', type: 'text' },
                                { label: 'Support Email', val: 'support@averqon.in', type: 'email' },
                                { label: 'Trial Period', val: '14', type: 'number', suffix: 'Days' },
                            ].map((field, i) => (
                                <div key={i} className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{field.label}</label>
                                    <div className="relative">
                                        <input
                                            type={field.type}
                                            defaultValue={field.val}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-blue-100"
                                        />
                                        {field.suffix && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">{field.suffix}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature Toggles */}
                    <div className="space-y-4 pt-8 border-t border-slate-100">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Controls</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                { label: 'Cloud Backups', sub: 'Automated 6h redundancy', icon: Database, enabled: true },
                                { label: 'Bot Shield', sub: 'Deep traffic protection', icon: Shield, enabled: true },
                                { label: 'Telemetry', sub: 'Performance tracking', icon: Zap, enabled: false },
                                { label: 'Broadcasts', sub: 'System-wide triggers', icon: BellRing, enabled: true },
                            ].map((toggle, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded border border-transparent hover:border-slate-200 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded ${toggle.enabled ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                            <toggle.icon size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-xs uppercase">{toggle.label}</p>
                                            <p className="text-[9px] font-semibold text-slate-400 uppercase">{toggle.sub}</p>
                                        </div>
                                    </div>
                                    <button className={`w-8 h-4 rounded-full relative transition-all ${toggle.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${toggle.enabled ? 'left-4.5' : 'left-0.5'}`}></div>
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
