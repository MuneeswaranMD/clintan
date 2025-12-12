import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';
import { DataService } from '../services/data';
import { GeminiService } from '../services/gemini';
import { Invoice, InvoiceStatus } from '../types';

export const Dashboard: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dateRange, setDateRange] = useState<'all' | '30' | '90'>('all');

  useEffect(() => {
    setInvoices(DataService.getInvoices());
  }, []);

  const filteredInvoices = React.useMemo(() => {
    if (dateRange === 'all') return invoices;
    const now = new Date();
    const days = parseInt(dateRange);
    const cutoff = new Date(now.setDate(now.getDate() - days));
    return invoices.filter(i => new Date(i.date) >= cutoff);
  }, [invoices, dateRange]);

  const stats = React.useMemo(() => {
    return {
      totalSales: filteredInvoices.reduce((acc, curr) => acc + curr.total, 0),
      count: filteredInvoices.length,
      pendingAmount: filteredInvoices.filter(i => i.status === InvoiceStatus.Pending).reduce((acc, i) => acc + i.total, 0),
      paidCount: filteredInvoices.filter(i => i.status === InvoiceStatus.Paid).length,
    };
  }, [filteredInvoices]);

  const chartData = React.useMemo(() => {
    const data: Record<string, number> = {};
    filteredInvoices.forEach(inv => {
      const month = new Date(inv.date).toLocaleString('default', { month: 'short' });
      data[month] = (data[month] || 0) + inv.total;
    });
    return Object.entries(data).map(([name, amount]) => ({ name, amount }));
  }, [filteredInvoices]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const insight = await GeminiService.analyzeBusinessHealth(invoices);
    setAiInsight(insight);
    setAnalyzing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">Business overview and performance metrics.</p>
        </div>
        <div className="flex items-center gap-2">
           <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="90">Last 90 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
          <button 
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Sparkles size={16} />
            {analyzing ? 'Analyzing...' : 'AI Insights'}
          </button>
        </div>
      </div>

      {aiInsight && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={100} />
          </div>
          <h3 className="text-indigo-900 font-semibold flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-indigo-600" />
            AI Business Analysis
          </h3>
          <p className="text-indigo-800 leading-relaxed text-sm md:text-base relative z-10">
            {aiInsight}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Sales" 
          value={`$${stats.totalSales.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-emerald-500"
        />
        <StatCard 
          title="Total Invoices" 
          value={stats.count.toString()} 
          icon={FileText} 
          color="bg-blue-500"
        />
        <StatCard 
          title="Pending Amount" 
          value={`$${stats.pendingAmount.toLocaleString()}`} 
          icon={Clock} 
          color="bg-amber-500"
        />
        <StatCard 
          title="Paid Invoices" 
          value={stats.paidCount.toString()} 
          icon={CheckCircle} 
          color="bg-purple-500"
        />
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Revenue Overview</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Invoices</h3>
          <div className="flex-1 overflow-auto no-scrollbar">
            <div className="space-y-4">
              {filteredInvoices.slice(0, 5).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{inv.customerName}</p>
                      <p className="text-xs text-slate-500">{inv.invoiceNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800 text-sm">${inv.total.toLocaleString()}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      inv.status === InvoiceStatus.Paid ? 'bg-emerald-100 text-emerald-700' :
                      inv.status === InvoiceStatus.Pending ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
              {filteredInvoices.length === 0 && (
                <div className="text-center py-8 text-slate-400">No recent invoices found.</div>
              )}
            </div>
          </div>
          <button className="mt-4 w-full py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1">
            View All <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg text-white ${color} shadow-lg shadow-${color}/30`}>
      <Icon size={20} />
    </div>
  </div>
);