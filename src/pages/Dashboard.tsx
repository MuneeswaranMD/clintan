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
    <div className="space-y-6 animate-fade-in pb-16 relative z-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStatCard
          title="Potential Revenue"
          value={`₹${stockStats.totalValue.toLocaleString()}`}
          icon={ShoppingBag}
          iconBg="bg-gradient-primary"
          percentage="+55%"
          trend="since yesterday"
        />
        <DashboardStatCard
          title="Capital Locked"
          value={`₹${stockStats.capitalLocked.toLocaleString()}`}
          icon={Wallet}
          iconBg="bg-gradient-danger"
          percentage="+3%"
          trend="since last week"
        />
        <DashboardStatCard
          title="Settled Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={IndianRupee}
          iconBg="bg-gradient-success"
          percentage="+12%"
          trend="since last month"
        />
        <DashboardStatCard
          title="Pending Amount"
          value={`₹${stats.pendingAmount.toLocaleString()}`}
          icon={Clock}
          iconBg="bg-gradient-warning"
          percentage="-2%"
          trend="since last quarter"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border-none shadow-premium flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Sales overview</p>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="text-success">(+5%) more</span> in 2024
              </h3>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5e72e4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#5e72e4" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ADB5BD', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ADB5BD', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(94, 114, 228, 0.05)', radius: 4 }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 700 }}
                />
                <Bar dataKey="revenue" fill="#5e72e4" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Promotion Card (Inspired by the right image in Averqon ) */}
        <div className="bg-gradient-primary rounded-2xl p-6 shadow-premium relative overflow-hidden flex flex-col justify-end min-h-[450px]">
          <div className="absolute top-0 left-0 right-0 bottom-0 opacity-20 pointer-events-none">
            <LayoutDashboard size={400} className="text-white -rotate-12 transform translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-lg mb-6">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
              {isWhiteLabeled && tenant ? `Manage ${tenant.companyName}` : 'Get started with Averqon'}
            </h3>
            <p className="text-white/80 text-sm mb-6 max-w-[240px]">
              {isWhiteLabeled && tenant
                ? `Welcome back to your autonomous revenue control center for ${tenant.companyName}.`
                : "There's nothing I really wanted to do in life that I wasn't able to get good at."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices Table Style */}
        <div className="bg-white p-6 rounded-2xl shadow-premium">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800">Projects</h3>
            <button className="text-xs font-bold text-primary uppercase tracking-widest hover:opacity-80 transition-opacity">See all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50 text-left">
                  <th className="pb-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Project</th>
                  <th className="pb-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest text-center">Budget</th>
                  <th className="pb-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest text-center">Status</th>
                  <th className="pb-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest text-center text-right">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.slice(0, 5).map(inv => (
                  <tr key={inv.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                          <FileText size={14} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{inv.customerName}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center text-sm font-medium text-slate-600">₹{inv.total.toLocaleString()}</td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${inv.status === InvoiceStatus.Paid ? 'text-success' : 'text-warning'
                        }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-3 min-w-[100px]">
                        <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">60%</span>
                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[60%]" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales by Country style card */}
        <div className="bg-white p-6 rounded-2xl shadow-premium">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800">Sales by Category</h3>
            <button className="text-xs font-bold text-primary uppercase tracking-widest hover:opacity-80 transition-opacity">Details</button>
          </div>
          <div className="space-y-6">
            {statusData.map(stat => (
              <div key={stat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-white transition-all shadow-sm">
                    <LayoutDashboard size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                    <span className="font-bold text-slate-800">{stat.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Value</p>
                  <span className="font-bold text-slate-900 leading-none">{stat.value} Invoices</span>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Health</p>
                  <span className="font-bold text-slate-900 leading-none">80%</span>
                </div>
              </div>
            ))}
          </div>
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
