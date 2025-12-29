import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, FileText, IndianRupee, Clock, AlertCircle,
  Plus, ArrowUpRight, TrendingUp, CreditCard, Wallet, Banknote
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { invoiceService, customerService, paymentService } from '../../services/firebaseService';
import { authService } from '../../services/authService';
import { Invoice, Customer, Payment, InvoiceStatus } from '../../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const unsubInvoices = invoiceService.subscribeToInvoices(user.id, setInvoices);
    const unsubCustomers = customerService.subscribeToCustomers(user.id, setCustomers);
    const unsubPayments = paymentService.subscribeToPayments(user.id, setPayments);

    return () => {
      unsubInvoices();
      unsubCustomers();
      unsubPayments();
    };
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);

    const pendingAmount = invoices
      .filter(inv => inv.status !== InvoiceStatus.Paid && inv.status !== InvoiceStatus.Draft)
      .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0);

    const overdueAmount = invoices
      .filter(inv => {
        const isDatePast = new Date(inv.dueDate).getTime() < Date.now();
        return inv.status !== InvoiceStatus.Paid && inv.status !== InvoiceStatus.Draft && isDatePast;
      })
      .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0);

    return {
      totalCustomers: customers.length,
      totalInvoices: invoices.length,
      totalRevenue,
      pendingAmount,
      overdueAmount
    };
  }, [invoices, customers]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(m => ({ name: m, revenue: 0 }));

    payments.forEach(p => {
      const date = new Date(p.date);
      const monthIdx = date.getMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        data[monthIdx].revenue += p.amount;
      }
    });

    return data;
  }, [payments]);

  const statusData = useMemo(() => [
    { name: 'Paid', value: invoices.filter(i => i.status === InvoiceStatus.Paid).length, color: '#8FFF00' },
    { name: 'Pending', value: invoices.filter(i => i.status === InvoiceStatus.Pending).length, color: '#FBBF24' },
    { name: 'Overdue', value: invoices.filter(i => i.status === InvoiceStatus.Overdue).length, color: '#EF4444' }
  ].filter(d => d.value > 0), [invoices]);

  const methodData = useMemo(() => {
    const methods: Record<string, number> = {};
    payments.forEach(p => {
      methods[p.method] = (methods[p.method] || 0) + p.amount;
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  }, [payments]);

  const COLORS = ['#8FFF00', '#00E5FF', '#FF00E5', '#FFB400'];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Business Overview</h1>
          <p className="text-gray-400">Real-time performance metrics</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/invoices')} className="bg-[#2C3035] p-2 rounded-xl text-gray-400 hover:text-white border border-gray-700 transition-colors"><TrendingUp size={20} /></button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => navigate('/invoices')} className="flex items-center gap-3 bg-[#8FFF00]/10 hover:bg-[#8FFF00]/20 text-[#8FFF00] p-4 rounded-2xl border border-[#8FFF00]/20 transition-all font-bold">
          <Plus size={20} /> New Invoice
        </button>
        <button onClick={() => navigate('/estimates')} className="flex items-center gap-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-4 rounded-2xl border border-blue-500/20 transition-all font-bold">
          <Plus size={20} /> New Estimate
        </button>
        <button onClick={() => navigate('/customers')} className="flex items-center gap-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 p-4 rounded-2xl border border-purple-500/20 transition-all font-bold">
          <Plus size={20} /> Add Customer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <DashboardStatCard title="Total Customers" value={stats.totalCustomers} icon={Users} color="text-blue-400" />
        <DashboardStatCard title="Total Invoices" value={stats.totalInvoices} icon={FileText} color="text-purple-400" />
        <DashboardStatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={IndianRupee} color="text-[#8FFF00]" />
        <DashboardStatCard title="Pending" value={`₹${stats.pendingAmount.toLocaleString()}`} icon={Clock} color="text-amber-400" />
        <DashboardStatCard title="Overdue" value={`₹${stats.overdueAmount.toLocaleString()}`} icon={AlertCircle} color="text-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-[#24282D] p-8 rounded-[40px] border border-gray-800 flex flex-col min-h-[450px]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">Monthly Revenue <ArrowUpRight size={18} className="text-[#8FFF00]" /></h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="95%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1D2125', border: '1px solid #374151', borderRadius: '12px' }} />
                <Bar dataKey="revenue" fill="#8FFF00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-[#24282D] p-8 rounded-[40px] border border-gray-800 flex flex-col min-h-[450px]">
          <h3 className="text-xl font-bold mb-6">Invoice Status</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="95%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Methods */}
        <div className="bg-[#24282D] p-8 rounded-[40px] border border-gray-800">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CreditCard size={20} className="text-[#8FFF00]" /> Payment Methods Breakdown</h3>
          <div className="space-y-4">
            {methodData.length > 0 ? methodData.map((m, idx) => (
              <div key={m.name} className="flex items-center justify-between p-4 bg-[#1D2125] rounded-2xl border border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-800 text-gray-400">
                    {m.name.toLowerCase().includes('bank') ? <Banknote size={18} /> :
                      m.name.toLowerCase().includes('upi') ? <Wallet size={18} /> :
                        <CreditCard size={18} />}
                  </div>
                  <span className="font-medium text-white">{m.name}</span>
                </div>
                <span className="font-bold text-[#8FFF00]">₹{m.value.toLocaleString()}</span>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-600">No payment data available</div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#24282D] p-8 rounded-[40px] border border-gray-800">
          <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {invoices.slice(0, 4).map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-[#8FFF00] transition-colors">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{inv.customerName}</p>
                    <p className="text-xs text-gray-500">Invoice {inv.invoiceNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">₹{inv.total.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-black">{inv.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardStatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-[#24282D] p-6 rounded-[32px] border border-gray-800 hover:border-gray-700 transition-all group overflow-hidden relative">
    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
      <Icon size={80} className={color} />
    </div>
    <div className={`w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
      <Icon size={24} className={color} />
    </div>
    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
    <h4 className="text-xl font-bold text-white">{value}</h4>
  </div>
);