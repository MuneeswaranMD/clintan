import React from 'react';
import { Briefcase, Plus, Search, Filter, Calendar, Clock, CheckCircle2 } from 'lucide-react';

export const Projects: React.FC = () => {
    const projects = [
        { id: 'PRJ-001', name: 'Office Interior Design', client: 'TechCorp Solutions', status: 'In Progress', progress: 65, deadline: '2024-03-25' },
        { id: 'PRJ-002', name: 'Website Redesign', client: 'Green Valley Organics', status: 'Planning', progress: 15, deadline: '2024-04-10' },
        { id: 'PRJ-003', name: 'Mobile App Development', client: 'Skyline Ventures', status: 'In Progress', progress: 40, deadline: '2024-05-15' },
    ];

    return (
        <div className="space-y-6 relative z-10 animate-fade-in">
            {/* Header section (designed to sit under the blue hero) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Project Management</h1>
                    <p className="text-white/80 text-sm">Track and manage your business projects and milestones</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary rounded-xl hover:bg-slate-50 transition-all shadow-lg font-bold text-sm">
                    <Plus size={18} strokeWidth={3} />
                    <span>New Project</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-premium group flex flex-col justify-between h-full border-none transition-all hover:translate-y-[-2px]">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 leading-none">Active Projects</p>
                            <h4 className="text-xl font-bold text-slate-800 tracking-tight leading-none group-hover:text-primary transition-colors">12</h4>
                        </div>
                        <div className="w-11 h-11 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
                            <Briefcase size={18} className="text-white" strokeWidth={3} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[70%]" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-premium group flex flex-col justify-between h-full border-none transition-all hover:translate-y-[-2px]">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 leading-none">Completed</p>
                            <h4 className="text-xl font-bold text-slate-800 tracking-tight leading-none group-hover:text-success transition-colors">48</h4>
                        </div>
                        <div className="w-11 h-11 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
                            <CheckCircle2 size={18} className="text-white" strokeWidth={3} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-success w-[90%]" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-premium group flex flex-col justify-between h-full border-none transition-all hover:translate-y-[-2px]">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 leading-none">Deadlines</p>
                            <h4 className="text-xl font-bold text-slate-800 tracking-tight leading-none group-hover:text-warning transition-colors">5</h4>
                        </div>
                        <div className="w-11 h-11 rounded-lg bg-gradient-warning flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
                            <Clock size={18} className="text-white" strokeWidth={3} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-warning w-[30%]" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-premium overflow-hidden border-none mt-8">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-base font-bold text-slate-800">Projects Table</h3>
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Type here..."
                            className="w-full pl-11 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Project Name</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Client</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Progress</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Deadline</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {projects.map((project) => (
                                <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-700 group-hover:text-primary transition-colors text-sm">{project.name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{project.id}</div>
                                    </td>
                                    <td className="px-6 py-4 text-[13px] font-bold text-slate-600">{project.client}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${project.status === 'In Progress' ? 'text-primary' : 'text-slate-400'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-bold text-slate-600 w-8">{project.progress}%</span>
                                            <div className="flex-1 h-1 bg-slate-100 rounded-full max-w-[120px]">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-1000"
                                                    style={{ width: `${project.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
                                            <Calendar size={13} className="text-slate-300" />
                                            {project.deadline}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
