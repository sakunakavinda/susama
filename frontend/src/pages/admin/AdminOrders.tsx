import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminStore } from '../../store/useAdminStore';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineBanknotes,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlinePencilSquare
} from 'react-icons/hi2';

export default function AdminOrders() {
  const { getAuthHeaders } = useAdminStore();
  const [searchParams] = useSearchParams();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  // Modal / Detail drawer
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state for status update
  const [editOrderStatus, setEditOrderStatus] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentFilter !== 'all') params.append('payment_status', paymentFilter);
      if (paymentMethodFilter !== 'all') params.append('payment_method', paymentMethodFilter);

      const res = await fetch(`http://localhost:5001/api/admin/orders?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setTotalCount(data.total || data.data.length);

        // If there was an active selected order, refresh it
        if (selectedOrder) {
          const updated = data.data.find((o: any) => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter, paymentMethodFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const openOrderModal = (order: any) => {
    setSelectedOrder(order);
    setEditOrderStatus(order.order_status);
    setEditPaymentStatus(order.payment_status);
    setEditAdminNotes(order.admin_notes || '');
    setUpdateMsg(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    setUpdateMsg(null);

    try {
      const res = await fetch(`http://localhost:5001/api/admin/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          order_status: editOrderStatus,
          payment_status: editPaymentStatus,
          admin_notes: editAdminNotes
        })
      });
      const data = await res.json();

      if (data.success) {
        setUpdateMsg({ type: 'success', text: 'Order status updated successfully in database!' });
        fetchOrders();
      } else {
        setUpdateMsg({ type: 'error', text: data.message || 'Failed to update order status' });
      }
    } catch (err: any) {
      setUpdateMsg({ type: 'error', text: err.message || 'Server error occurred' });
    } finally {
      setUpdating(false);
    }
  };

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statusTabs = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending Verification', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="font-heading text-2xl font-light text-stone-100 flex items-center gap-3">
            <span>Orders Management</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-stone-800 text-[#F3C082] border border-stone-700">
              {totalCount} Total
            </span>
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            Track customer deliveries, verify bank transfer slips, and update dispatch milestones.
          </p>
        </div>

        {/* Quick Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, phone, ref..."
              className="pl-9 pr-4 py-2 bg-[#141820] border border-stone-800 rounded-xl text-xs text-stone-200 placeholder:text-stone-300 focus:outline-none focus:border-[#B48346] w-64"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#B48346] hover:bg-[#C79456] text-white text-xs font-medium rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Tabs & Secondary Filters */}
      <div className="flex flex-col gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.value
                  ? 'bg-[#B48346] text-white font-medium shadow-sm'
                  : 'bg-[#141820] text-stone-400 hover:text-white border border-stone-800/80 hover:border-stone-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Payment & Method Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="text-stone-300 flex items-center gap-1.5">
            <HiOutlineFunnel className="w-4 h-4" /> Filter by:
          </span>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-[#141820] border border-stone-800 rounded-lg px-3 py-1.5 text-stone-300 focus:outline-none focus:border-[#B48346]"
          >
            <option value="all">Payment Status (All)</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="bg-[#141820] border border-stone-800 rounded-lg px-3 py-1.5 text-stone-300 focus:outline-none focus:border-[#B48346]"
          >
            <option value="all">Payment Method (All)</option>
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="bank_transfer">Corporate Bank Transfer</option>
          </select>

          {(statusFilter !== 'all' || paymentFilter !== 'all' || paymentMethodFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPaymentFilter('all');
                setPaymentMethodFilter('all');
                setSearch('');
              }}
              className="text-stone-300 hover:text-stone-200 underline text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#141820] border border-stone-800/90 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E1015] text-stone-300 font-mono uppercase tracking-wider border-b border-stone-800">
              <tr>
                <th className="py-3.5 px-6">Order Ref</th>
                <th className="py-3.5 px-6">Customer & Phone</th>
                <th className="py-3.5 px-6">Delivery Destination</th>
                <th className="py-3.5 px-6">Payment Info</th>
                <th className="py-3.5 px-6">Total (LKR)</th>
                <th className="py-3.5 px-6">Status Pipeline</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-body">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-300 font-mono">
                    <div className="w-8 h-8 border-2 border-[#B48346]/20 border-t-[#B48346] rounded-full animate-spin mx-auto mb-3"></div>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-stone-800/30 transition-colors">
                    <td className="py-4 px-6 font-mono">
                      <span className="font-medium text-stone-100">{ord.order_number}</span>
                      <p className="text-[10px] text-stone-300 mt-0.5">
                        {new Date(ord.created_at).toLocaleDateString('en-LK', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-medium text-stone-200">{ord.customer_name}</p>
                      <p className="text-[11px] text-stone-300 font-mono">{ord.customer_phone}</p>
                    </td>

                    <td className="py-4 px-6">
                      <p className="text-stone-300 truncate max-w-[180px]">{ord.address_line1}</p>
                      <p className="text-[11px] text-[#F3C082] font-mono">{ord.city}</p>
                    </td>

                    <td className="py-4 px-6 font-mono">
                      <span className="uppercase text-[11px] px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300">
                        {ord.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'COD'}
                      </span>
                      {ord.bank_transfer_ref && (
                        <p className="text-[10px] text-purple-300 mt-1 font-mono">
                          Slip Ref: {ord.bank_transfer_ref}
                        </p>
                      )}
                      <div className="mt-1">
                        <span className={`inline-block text-[10px] uppercase px-2 py-0.5 rounded-full ${
                          ord.payment_status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : ord.payment_status === 'pending_verification'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-stone-800 text-stone-300'
                        }`}>
                          {ord.payment_status === 'pending_verification' ? 'Pending Slip' : ord.payment_status}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono font-medium text-[#F3C082]">
                      {formatLKR(Number(ord.total_amount))}
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
                      <button
                        onClick={() => openOrderModal(ord)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#B48346]/10 hover:bg-[#B48346]/20 text-[#F3C082] border border-[#B48346]/30 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-300 font-mono">
                    No orders matching selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141820] border border-stone-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-800 flex items-center justify-between sticky top-0 bg-[#141820] z-10">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-heading text-xl font-light text-white">
                    Order {selectedOrder.order_number}
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-800 text-[#F3C082] uppercase">
                    {selectedOrder.payment_method}
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-mono mt-0.5">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString('en-LK')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Feedback Alert */}
              {updateMsg && (
                <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                  updateMsg.type === 'success' 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                }`}>
                  <HiOutlineCheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{updateMsg.text}</span>
                </div>
              )}

              {/* Status Update Form Card */}
              <div className="bg-[#0E1015] border border-stone-800/80 rounded-xl p-5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#B48346] mb-4 font-semibold">
                  Update Order Pipeline &amp; Verification
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-mono text-stone-300 mb-1.5 uppercase">
                      Order Fulfillment Status
                    </label>
                    <select
                      value={editOrderStatus}
                      onChange={(e) => setEditOrderStatus(e.target.value)}
                      className="w-full bg-[#141820] border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:outline-none focus:border-[#B48346]"
                    >
                      <option value="pending">Pending (Awaiting Confirmation)</option>
                      <option value="confirmed">Confirmed (Fulfillment Queued)</option>
                      <option value="processing">Processing (Packaging in Lab)</option>
                      <option value="shipped">Shipped (With Island Courier)</option>
                      <option value="delivered">Delivered (Completed)</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-stone-300 mb-1.5 uppercase">
                      Payment Verification Status
                    </label>
                    <select
                      value={editPaymentStatus}
                      onChange={(e) => setEditPaymentStatus(e.target.value)}
                      className="w-full bg-[#141820] border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:outline-none focus:border-[#B48346]"
                    >
                      <option value="unpaid">Unpaid (COD)</option>
                      <option value="pending_verification">Pending Bank Slip Verification</option>
                      <option value="paid">Paid &amp; Cleared</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-mono text-stone-300 mb-1.5 uppercase">
                    Admin Notes (Internal Courier Tracking # / Slip Audit)
                  </label>
                  <input
                    type="text"
                    value={editAdminNotes}
                    onChange={(e) => setEditAdminNotes(e.target.value)}
                    placeholder="e.g. Verified Commercial Bank branch ref. Waybill #194892..."
                    className="w-full bg-[#141820] border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:outline-none focus:border-[#B48346]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#B48346] to-[#966730] hover:from-[#C79456] text-white text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {updating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Saving Status...</span>
                    </>
                  ) : (
                    <span>Save Order Updates</span>
                  )}
                </button>
              </div>

              {/* Customer Information & Delivery Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0E1015]/60 border border-stone-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-mono uppercase text-stone-300">Customer Identity</h4>
                  <p className="text-sm font-medium text-white">{selectedOrder.customer_name}</p>
                  <p className="text-xs text-stone-300 font-mono flex items-center gap-1.5">
                    <HiOutlinePhone className="w-4 h-4 text-[#B48346]" /> {selectedOrder.customer_phone}
                  </p>
                  <p className="text-xs text-stone-300 font-mono flex items-center gap-1.5">
                    <HiOutlineEnvelope className="w-4 h-4 text-stone-300" /> {selectedOrder.customer_email}
                  </p>
                </div>

                <div className="bg-[#0E1015]/60 border border-stone-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-mono uppercase text-stone-300">Delivery Destination</h4>
                  <p className="text-xs text-stone-200">{selectedOrder.address_line1}</p>
                  {selectedOrder.address_line2 && (
                    <p className="text-xs text-stone-300">{selectedOrder.address_line2}</p>
                  )}
                  <p className="text-xs text-[#F3C082] font-mono">
                    {selectedOrder.city}, {selectedOrder.district || 'Western'} {selectedOrder.postal_code || ''}
                  </p>
                </div>
              </div>

              {/* Bank Transfer Details (if applicable) */}
              {selectedOrder.payment_method === 'bank_transfer' && (
                <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-1">
                  <p className="text-xs font-mono uppercase text-purple-300 font-semibold flex items-center gap-2">
                    <HiOutlineBanknotes className="w-4 h-4" /> Bank Transfer Reference
                  </p>
                  <p className="text-sm font-mono text-purple-200">
                    Slip Reference / Transaction ID: <span className="font-bold underline">{selectedOrder.bank_transfer_ref || 'None provided by customer'}</span>
                  </p>
                  <p className="text-[11px] text-stone-300">
                    Corporate Account: Commercial Bank (Torrington) - SUSÁMÁ (PVT) LTD
                  </p>
                </div>
              )}

              {/* Items Purchased */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-stone-300 mb-3">
                  Purchased Items ({selectedOrder.items?.length || 0})
                </h4>
                <div className="space-y-2.5">
                  {selectedOrder.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-[#0E1015] border border-stone-800 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-3">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-10 h-10 object-cover rounded-lg bg-stone-900 border border-stone-800"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center text-stone-300 font-mono">
                            SUS
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-stone-100">{item.product_name}</p>
                          <p className="text-[11px] text-stone-300 font-mono">
                            Qty: {item.quantity} × {formatLKR(Number(item.unit_price))}
                          </p>
                        </div>
                      </div>
                      <div className="font-mono font-medium text-stone-200">
                        {formatLKR(Number(item.line_total))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="p-4 bg-[#0E1015] border border-stone-800 rounded-xl space-y-2 text-xs font-mono">
                <div className="flex justify-between text-stone-300">
                  <span>Subtotal</span>
                  <span>{formatLKR(Number(selectedOrder.subtotal))}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Delivery Fee</span>
                  <span>{Number(selectedOrder.shipping_fee) === 0 ? 'FREE (Complimentary)' : formatLKR(Number(selectedOrder.shipping_fee))}</span>
                </div>
                {Number(selectedOrder.discount_amount) > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatLKR(Number(selectedOrder.discount_amount))}</span>
                  </div>
                )}
                <div className="border-t border-stone-800 pt-2 flex justify-between text-sm font-bold text-[#F3C082]">
                  <span>Total Payable</span>
                  <span>{formatLKR(Number(selectedOrder.total_amount))}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-800 bg-[#0E1015] flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
