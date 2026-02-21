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
import { useTenant } from '../context/TenantContext';
import { invoiceService, customerService, paymentService, orderService, stockService, productService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Invoice, Customer, Payment, InvoiceStatus, Order, Product } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tenant, isWhiteLabeled } = useTenant();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockStats, setStockStats] = useState({ lowStock: 0, outOfStock: 0, totalValue: 0, capitalLocked: 0 });

  useEffect(() => {
    document.title = 'Dashboard';
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

  const statsList = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const pendingAmount = invoices
      .filter(inv => inv.status !== InvoiceStatus.Paid && inv.status !== InvoiceStatus.Draft)
      .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0);

    return [
      { label: 'Settled Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: Banknote, color: 'emerald' },
      { label: 'Pending Revenue', value: `₹${pendingAmount.toLocaleString()}`, icon: Clock, color: 'amber' },
      { label: 'Inventory Value', value: `₹${stockStats.totalValue.toLocaleString()}`, icon: ShoppingBag, color: 'blue' },
      { label: 'Active Customers', value: customers.length.toString(), icon: Users, color: 'slate' },
    ];
  }, [invoices, customers, stockStats]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Overview</h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time business performance and metrics.
          </p>
        </div>
        <div className="flex items-center gap-2 font-bold text-[10px] text-slate-400 uppercase tracking-widest">
          <Clock size={14} />
          Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-2 rounded bg-slate-50 text-slate-400`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 leading-none">{stat.value}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight underline decoration-blue-500/30 underline-offset-8">Financial Pulse</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">Monthly Revenue Stream</p>
            </div>
          </div>
          <div className="h-[350px] w-full min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={350} debounce={50}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-8 rounded-lg text-white space-y-6 flex flex-col justify-between h-full min-h-[400px]">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center">
                <LayoutDashboard size={24} className="text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">
                {isWhiteLabeled && tenant ? tenant.companyName : 'Averqon Platform'}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Welcome to your command center. Monitor flows, manage clients, and control your business assets from a single interface.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Shortcuts</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate('/invoices')}
                  className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold uppercase transition-colors"
                >
                  <FileText size={14} /> Invoices
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold uppercase transition-colors"
                >
                  <ShoppingBag size={14} /> Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects/Invoices Table */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Activity</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Latest Invoice Transactions</p>
          </div>
          <button
            onClick={() => navigate('/invoices')}
            className="px-4 py-2 border border-slate-200 rounded text-[10px] font-bold text-slate-700 uppercase tracking-widest hover:bg-slate-50 transition-colors"
          >
            View Registry
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.slice(0, 5).map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-[10px] border border-slate-200 uppercase">
                        {(inv.customerName || '?').charAt(0)}
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{inv.customerName}</span>
                    </div>
                  </td>
                  <td className="py-4 text-[11px] font-bold text-slate-600">₹{inv.total.toLocaleString()}</td>
                  <td className="py-4 text-center">
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${inv.status === InvoiceStatus.Paid ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'
                      }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 text-right text-[10px] font-bold text-slate-400 uppercase">{new Date(inv.date).toLocaleDateString()}</td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">No recent transactions</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DashboardStatCard = ({ title, value, icon: Icon, iconBg, percentage, trend }: any) => (
  <div className="bg-white p-5 rounded-2xl shadow-premium hover:translate-y-[-2px] transition-all group flex flex-col justify-between h-full border-none">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 leading-none">{title}</p>
        <h4 className="text-xl font-bold text-slate-800 tracking-tight leading-none group-hover:text-primary transition-colors">{value}</h4>
      </div>
      <div className={`w-11 h-11 rounded-lg ${iconBg} flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform`}>
        <Icon size={18} className="text-white" strokeWidth={3} />
      </div>
    </div>

    <div className="mt-4 flex items-center gap-2">
      <span className={`text-xs font-bold ${percentage.startsWith('+') ? 'text-success' : 'text-error'}`}>
        {percentage}
      </span>
      <span className="text-[11px] font-bold text-slate-400 lowercase">{trend}</span>
    </div>
  </div>
);
