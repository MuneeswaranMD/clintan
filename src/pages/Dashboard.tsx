import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, FileText, IndianRupee, Clock, AlertCircle,
  Plus, ArrowUpRight, TrendingUp, CreditCard, Wallet, Banknote, LayoutDashboard, ShoppingBag, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { invoiceService, customerService, paymentService, orderService, stockService, productService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Invoice, Customer, Payment, InvoiceStatus, Order, Product } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockStats, setStockStats] = useState({ lowStock: 0, outOfStock: 0, totalValue: 0, capitalLocked: 0 });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const unsubInvoices = invoiceService.subscribeToInvoices(user.id, setInvoices);
    const unsubCustomers = customerService.subscribeToCustomers(user.id, setCustomers);
    const unsubPayments = paymentService.subscribeToPayments(user.id, setPayments);
    const unsubOrders = orderService.subscribeToOrders(user.id, setOrders);
    const unsubProducts = productService.subscribeToProducts(user.id, (data) => {
      setProducts(data);
      const stats = {
        lowStock: data.filter(p => (p.inventory?.stock || 0) <= (p.inventory?.minStockLevel || 0) && (p.inventory?.stock || 0) > 0).length,
        outOfStock: data.filter(p => (p.inventory?.stock || 0) <= 0).length,
        totalValue: data.reduce((sum, p) => sum + ((p.inventory?.stock || 0) * (p.pricing?.sellingPrice || 0)), 0),
        capitalLocked: data.reduce((sum, p) => sum + ((p.inventory?.stock || 0) * (p.pricing?.costPrice || 0)), 0)
      };
      setStockStats(stats);
    });

    return () => {
      unsubInvoices();
      unsubCustomers();
      unsubPayments();
      unsubOrders();
      unsubProducts();
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
      overdueAmount,
      totalOrders: orders.length
    };
  }, [invoices, customers, orders]);

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
    { name: 'Paid', value: invoices.filter(i => i.status === InvoiceStatus.Paid).length, color: '#10B981' },
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

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <LayoutDashboard size={20} />
            </div>
            Business Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">Monitor your sales, revenue, and collection status.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white px-4 py-2 rounded-lg text-slate-600 hover:text-blue-600 border border-slate-200 transition-all shadow-sm flex items-center gap-2 font-bold text-sm">
            <TrendingUp size={18} />
            Growth Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <DashboardStatCard title="Potential Revenue" value={`₹${stockStats.totalValue.toLocaleString()}`} icon={ShoppingBag} bgColor="bg-indigo-50" iconColor="text-indigo-600" description="Total stock worth" />
        <DashboardStatCard title="Capital Locked" value={`₹${stockStats.capitalLocked.toLocaleString()}`} icon={Wallet} bgColor="bg-slate-50" iconColor="text-slate-600" description="Procurement cost" />
        <DashboardStatCard title="Low Stock Assets" value={stockStats.lowStock} icon={AlertCircle} bgColor="bg-amber-50" iconColor="text-amber-600" description="Below threshold" />
        <DashboardStatCard title="Out of Stock" value={stockStats.outOfStock} icon={X} bgColor="bg-red-50" iconColor="text-red-600" description="Refill required" />
        <DashboardStatCard title="Settled Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={IndianRupee} bgColor="bg-emerald-50" iconColor="text-emerald-600" description="Confirmed earnings" />
        <DashboardStatCard title="Pending Amount" value={`₹${stats.pendingAmount.toLocaleString()}`} icon={Clock} bgColor="bg-blue-50" iconColor="text-blue-600" description="Invoices unpaid" />
      </div>

      {/* Quick Action Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={() => navigate('/invoices')} className="group flex flex-col items-start p-8 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-blue-600 group-hover:scale-110 transition-transform"><FileText size={80} /></div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all"><Plus size={20} /></div>
          <h4 className="text-lg font-bold text-slate-800">Create Invoice</h4>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Start a new billing cycle</p>
        </button>
        <button onClick={() => navigate('/estimates')} className="group flex flex-col items-start p-8 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-blue-600 group-hover:scale-110 transition-transform"><IndianRupee size={80} /></div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all"><Plus size={20} /></div>
          <h4 className="text-lg font-bold text-slate-800">New Estimate</h4>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Draft a professional quote</p>
        </button>
        <button onClick={() => navigate('/customers')} className="group flex flex-col items-start p-8 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-emerald-600 group-hover:scale-110 transition-transform"><Users size={80} /></div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all"><Plus size={20} /></div>
          <h4 className="text-lg font-bold text-slate-800">Add Customer</h4>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Register a new client entity</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Revenue Growth</h3>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-widest mt-1">Monthly Earnings</p>
            </div>
            <div className="px-3 py-1 bg-blue-50 rounded-full text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span> Performance Analysis
            </div>
          </div>
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: [4, 4, 4, 4] }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 700 }}
                />
                <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Distribution */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[450px]">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Invoice Status</h3>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-10">Payment Distribution</p>
          <div className="h-[280px] w-full relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health</p>
                <p className="text-2xl font-bold text-slate-800 tracking-tight">100%</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie data={statusData} innerRadius={80} outerRadius={100} paddingAngle={8} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12, border: 'none', shadow: 'sm', fontWeight: 700 }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: '20px', textTransform: 'uppercase', color: '#64748B' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Channels */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-600"><CreditCard size={20} /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Revenue Sources</h3>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest leading-none mt-1">Top Payment Methods</p>
            </div>
          </div>
          <div className="space-y-4">
            {methodData.length > 0 ? methodData.map((m, idx) => (
              <div key={m.name} className="flex items-center justify-between p-5 bg-slate-50 rounded-lg border border-transparent hover:border-blue-200 hover:bg-white transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white border border-slate-100 text-slate-300 group-hover:text-blue-600 transition-all flex items-center justify-center shadow-sm">
                    {m.name.toLowerCase().includes('bank') ? <Banknote size={20} /> :
                      m.name.toLowerCase().includes('upi') ? <Wallet size={20} /> :
                        <CreditCard size={20} />}
                  </div>
                  <span className="font-bold text-slate-800">{m.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                  <span className="font-bold text-blue-600 text-xl tracking-tight">₹{m.value.toLocaleString()}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center">
                <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">No Channel Signal Detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-600"><TrendingUp size={20} /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest leading-none mt-1">Latest Transactions</p>
            </div>
          </div>
          <div className="space-y-3">
            {invoices.slice(0, 5).map(inv => (
              <div key={inv.id} onClick={() => navigate('/invoices')} className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{inv.customerName}</p>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Invoice #{inv.invoiceNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-lg tracking-tight mb-1">₹{inv.total.toLocaleString()}</p>
                  <div className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${inv.status === InvoiceStatus.Paid ? 'text-emerald-700 bg-emerald-100 border-emerald-200' :
                    inv.status === InvoiceStatus.Overdue ? 'text-red-700 bg-red-100 border-red-200' :
                      'text-amber-700 bg-amber-100 border-amber-200'
                    }`}>
                    {inv.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/invoices')} className="mt-8 py-3 border border-slate-200 border-dashed rounded-lg text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">View All Invoices →</button>
        </div>
      </div>
    </div>
  );
};

const DashboardStatCard = ({ title, value, icon: Icon, bgColor, iconColor, description }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group relative shadow-sm h-full flex flex-col justify-between overflow-hidden">
    <div className="absolute -top-2 -right-2 opacity-[0.03] text-slate-900 group-hover:scale-110 transition-transform"><Icon size={80} /></div>
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center mb-4 transition-all shadow-sm`}>
        <Icon size={24} className={`${iconColor} group-hover:scale-110 transition-transform`} />
      </div>
      <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-slate-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors">{value}</h4>
      <p className="text-[10px] font-medium text-slate-400 mt-3 flex items-center gap-1.5 uppercase tracking-widest">
        <span className="w-1 h-1 rounded-full bg-slate-300"></span> {description}
      </p>
    </div>
  </div>
);
