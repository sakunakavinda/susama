import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../store/useAdminStore';
import {
  HiOutlineCurrencyDollar,
  HiOutlineShoppingBag,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineArrowRight,
  HiOutlinePlus,
  HiOutlineBuildingLibrary,
  HiOutlineUserGroup,
  HiOutlineEnvelope
} from 'react-icons/hi2';

interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  pending_orders: number;
  pending_bank_transfers: number;
  total_products: number;
  low_stock_count: number;
  total_customers: number;
  total_subscribers: number;
  recent_orders: any[];
}

export default function AdminDashboard() {
  const { getAuthHeaders, adminUser } = useAdminStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/admin/stats', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-[#B48346]/20 border-t-[#B48346] rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase font-mono tracking-widest text-stone-400">Loading Dashboard Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#B48346] font-medium">Overview</span>
            <span className="text-stone-400">•</span>
            <span className="text-[11px] font-mono text-stone-300">Colombo, Sri Lanka</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-light text-stone-100">
            Welcome back, {adminUser?.name || 'Administrator'}
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            Real-time sales, order fulfillment status, and inventory health for SUSÁMÁ.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#B48346] hover:bg-[#C79456] text-white text-xs font-medium rounded-xl uppercase tracking-wider transition-colors shadow-sm"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl uppercase tracking-wider border border-stone-700 transition-colors"
          >
            <HiOutlineShoppingBag className="w-4 h-4" />
            <span>Fulfill Orders</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-[#141820] border border-stone-800/90 rounded-2xl p-6 relative overflow-hidden group hover:border-[#B48346]/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-300">Gross Sales</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-[#F3C082] border border-amber-500/20">
              <HiOutlineCurrencyDollar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-light text-white tracking-tight">
            {formatLKR(stats?.total_revenue || 0)}
          </div>
          <p className="text-[11px] text-stone-300 mt-2 font-mono flex items-center gap-1.5">
            <span className="text-emerald-400">Total processed</span>
            <span>across all orders</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-[#141820] border border-stone-800/90 rounded-2xl p-6 relative overflow-hidden group hover:border-[#B48346]/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-300">Total Orders</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <HiOutlineShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-light text-white tracking-tight">
            {stats?.total_orders || 0}
          </div>
          <p className="text-[11px] text-stone-300 mt-2 font-mono flex items-center gap-1.5">
            <span className="text-[#F3C082] font-semibold">{stats?.pending_orders || 0} pending</span>
            <span>dispatch or review</span>
          </p>
        </div>

        {/* Bank Slip Verifications */}
        <div className="bg-[#141820] border border-stone-800/90 rounded-2xl p-6 relative overflow-hidden group hover:border-[#B48346]/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-300">Bank Verifications</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <HiOutlineClock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-light text-white tracking-tight">
            {stats?.pending_bank_transfers || 0}
          </div>
          <p className="text-[11px] text-stone-300 mt-2 font-mono flex items-center gap-1.5">
            <span className={stats?.pending_bank_transfers ? 'text-amber-400 font-semibold' : 'text-stone-300'}>
              {stats?.pending_bank_transfers ? 'Slips awaiting approval' : 'All slips verified'}
            </span>
          </p>
        </div>

        {/* Inventory Stock Alerts */}
        <div className="bg-[#141820] border border-stone-800/90 rounded-2xl p-6 relative overflow-hidden group hover:border-[#B48346]/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-300">Stock Alerts</span>
            <div className={`p-2.5 rounded-xl border ${
              (stats?.low_stock_count || 0) > 0 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              <HiOutlineExclamationTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-light text-white tracking-tight">
            {stats?.low_stock_count || 0}
          </div>
          <p className="text-[11px] text-stone-300 mt-2 font-mono">
            {(stats?.low_stock_count || 0) > 0 ? (
              <span className="text-rose-400 font-medium">Items with ≤ 5 units in stock</span>
            ) : (
              <span className="text-emerald-400">All catalog stock healthy</span>
            )}
          </p>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#141820]/60 border border-stone-800/80 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-stone-800/80 rounded-xl text-stone-300">
            <HiOutlineUserGroup className="w-5 h-5 text-[#B48346]" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase text-stone-300">Registered Customers</p>
            <p className="text-lg font-heading text-white">{stats?.total_customers || 0}</p>
          </div>
        </div>

        <div className="bg-[#141820]/60 border border-stone-800/80 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-stone-800/80 rounded-xl text-stone-300">
            <HiOutlineEnvelope className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase text-stone-300">VIP Newsletter Subscribers</p>
            <p className="text-lg font-heading text-white">{stats?.total_subscribers || 0}</p>
          </div>
        </div>

        <div className="bg-[#141820]/60 border border-stone-800/80 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-stone-800/80 rounded-xl text-stone-300">
            <HiOutlineBuildingLibrary className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase text-stone-300">Corporate Bank Transfer</p>
              <p className="text-xs text-[#F3C082] font-mono mt-0.5">Commercial Bank (07)</p>
            </div>
            <Link to="/admin/settings" className="text-xs text-stone-300 hover:text-white underline font-mono">Edit</Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-[#141820] border border-stone-800/90 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-medium text-white">Recent Customer Orders</h2>
            <p className="text-xs text-stone-300 mt-0.5">Latest transactions awaiting fulfillment or verification</p>
          </div>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#B48346] hover:text-[#F3C082] transition-colors"
          >
            <span>View All Orders</span>
            <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E1015] text-stone-300 font-mono uppercase tracking-wider border-b border-stone-800">
              <tr>
                <th className="py-3.5 px-6">Order Ref</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Payment Method</th>
                <th className="py-3.5 px-6">Total Amount</th>
                <th className="py-3.5 px-6">Payment Status</th>
                <th className="py-3.5 px-6">Order Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-body">
              {stats?.recent_orders && stats.recent_orders.length > 0 ? (
                stats.recent_orders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-stone-800/30 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-stone-200">
                      {ord.order_number}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-stone-100">{ord.customer_name}</p>
                      <p className="text-[11px] text-stone-300 font-mono">{ord.customer_phone}</p>
                    </td>
                    <td className="py-4 px-6 font-mono">
                      <span className="uppercase text-[11px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                        {ord.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Cash On Delivery'}
                      </span>
                      {ord.bank_transfer_ref && (
                        <p className="text-[10px] text-purple-300 mt-1 font-mono">Ref: {ord.bank_transfer_ref}</p>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono font-medium text-[#F3C082]">
                      {formatLKR(Number(ord.total_amount))}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-mono uppercase px-2.5 py-1 rounded-full ${
                        ord.payment_status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ord.payment_status === 'pending_verification'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-stone-700/30 text-stone-400 border border-stone-700'
                      }`}>
                        {ord.payment_status === 'pending_verification' ? 'Pending Verification' : ord.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-mono uppercase px-2.5 py-1 rounded-full ${
                        ord.order_status === 'delivered'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ord.order_status === 'shipped'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : ord.order_status === 'processing'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : ord.order_status === 'cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}>
                        {ord.order_status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/admin/orders?search=${ord.order_number}`}
                        className="text-xs text-[#B48346] hover:text-[#F3C082] font-mono uppercase tracking-wider hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-300 font-mono">
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
