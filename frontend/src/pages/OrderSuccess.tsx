import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  HiCheckCircle, 
  HiOutlineShoppingBag, 
  HiOutlineBuildingLibrary,
  HiOutlineBanknotes,
  HiOutlineArrowRight,
  HiSparkles
} from 'react-icons/hi2';

export default function OrderSuccess() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      fetch(`http://localhost:5001/api/orders/${orderNumber}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setOrder(data.data);
          }
        })
        .catch((err) => console.error('Error fetching order receipt:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex items-center justify-center pt-20">
        <div className="text-center">
          <span className="inline-block w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-stone-500 font-medium">Loading your order receipt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        
        {/* Celebration Header Card (Light Luxury) */}
        <div className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-10 text-center shadow-xs relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-2xs">
            <HiCheckCircle className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-semibold text-brand-secondary uppercase tracking-wider mb-2">
            <HiSparkles className="w-3.5 h-3.5" /> Order Confirmed
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-stone-900 mb-2">
            Thank You For Your Order!
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Your island ritual formulations are being handcrafted and prepared for express doorstep courier delivery.
          </p>

          {/* Order Reference Number */}
          <div className="mt-5 inline-block px-4 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs sm:text-sm shadow-2xs">
            <span className="text-stone-500">Order Reference: </span>
            <strong className="text-brand-secondary font-mono font-bold tracking-wider ml-1">
              {orderNumber}
            </strong>
          </div>
        </div>

        {/* Order Details & Summary (Light) */}
        {order && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-3">
              Delivery & Order Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-stone-500 block text-[11px]">Recipient</span>
                <p className="text-stone-900 font-semibold">{order.customer_name}</p>
                <p className="text-stone-600">{order.customer_phone}</p>
                {order.customer_email && (
                  <p className="text-stone-500">{order.customer_email}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-stone-500 block text-[11px]">Delivery Address</span>
                <p className="text-stone-900 font-semibold">{order.address_line1}</p>
                {order.address_line2 && <p className="text-stone-600">{order.address_line2}</p>}
                <p className="text-stone-600">{order.city} {order.district ? `, ${order.district}` : ''}</p>
              </div>

              <div className="space-y-1 sm:col-span-2 pt-2 border-t border-stone-100">
                <span className="text-stone-500 block text-[11px]">Payment Method</span>
                <div className="flex items-center gap-2 text-stone-900 font-medium">
                  {order.payment_method === 'cod' ? (
                    <>
                      <HiOutlineBanknotes className="w-4 h-4 text-brand-secondary" />
                      <span>Cash on Delivery (Pay in cash to courier rider upon delivery)</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineBuildingLibrary className="w-4 h-4 text-brand-secondary" />
                      <span>Direct Bank Transfer (Reference: {order.bank_transfer_ref || 'Pending'})</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Items Summary */}
            {order.items && order.items.length > 0 && (
              <div className="pt-4 border-t border-stone-200 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-800 block">
                  Ordered Items
                </span>
                <div className="space-y-2 divide-y divide-stone-100 text-xs">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="pt-2 flex justify-between items-center">
                      <div className="min-w-0 pr-2">
                        <p className="text-stone-900 font-medium truncate">{item.product_name}</p>
                        <p className="text-[11px] text-stone-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-stone-900 font-semibold whitespace-nowrap">
                        LKR {Number(item.line_total).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-sm">
                  <span className="font-semibold text-stone-800">Total Paid / Due</span>
                  <span className="text-lg font-bold text-stone-900 font-mono">
                    LKR {Number(order.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/products"
            className="flex-1 py-3 px-5 rounded-lg bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-105 text-white font-semibold text-xs sm:text-sm shadow-md text-center transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <HiOutlineShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>

          <Link
            to="/profile"
            className="flex-1 py-3 px-5 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold text-xs sm:text-sm text-center transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <span>View in My Account</span>
            <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
