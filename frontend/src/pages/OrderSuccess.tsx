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
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center pt-20">
        <div className="text-center">
          <span className="inline-block w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-stone-400">Loading your order receipt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        
        {/* Celebration Header Card */}
        <div className="bg-gradient-to-b from-stone-900 to-stone-900/90 border border-amber-500/20 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-xl">
            <HiCheckCircle className="w-12 h-12" />
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-[11px] font-semibold text-brand-primary uppercase tracking-wider mb-3">
            <HiSparkles className="w-3.5 h-3.5" /> Order Confirmed
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-amber-50 mb-2">
            Thank You For Your Order!
          </h1>
          <p className="text-stone-400 text-sm max-w-md mx-auto leading-relaxed">
            Your island ritual formulations are being handcrafted and prepared for express doorstep delivery.
          </p>

          {/* Order Reference Number */}
          <div className="mt-6 inline-block px-5 py-2.5 rounded-2xl bg-stone-950/80 border border-white/10 text-xs sm:text-sm">
            <span className="text-stone-400">Order Reference: </span>
            <strong className="text-brand-primary font-mono font-bold tracking-wider ml-1">
              {orderNumber}
            </strong>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        {order && (
          <div className="bg-stone-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-base font-heading font-medium text-amber-50 border-b border-white/10 pb-3">
              Delivery & Order Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-stone-400 block">Recipient:</span>
                <p className="text-white font-medium">{order.customer_name}</p>
                <p className="text-stone-300">{order.customer_phone}</p>
                {order.customer_email && (
                  <p className="text-stone-400">{order.customer_email}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-stone-400 block">Delivery Address:</span>
                <p className="text-white font-medium">{order.address_line1}</p>
                {order.address_line2 && <p className="text-stone-300">{order.address_line2}</p>}
                <p className="text-stone-300">{order.city} {order.district ? `, ${order.district}` : ''}</p>
              </div>

              <div className="space-y-1 sm:col-span-2 pt-2 border-t border-white/5">
                <span className="text-stone-400 block">Payment Method:</span>
                <div className="flex items-center gap-2 text-white font-medium">
                  {order.payment_method === 'cod' ? (
                    <>
                      <HiOutlineBanknotes className="w-4 h-4 text-brand-primary" />
                      <span>Cash on Delivery (Pay in cash to courier rider)</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineBuildingLibrary className="w-4 h-4 text-brand-primary" />
                      <span>Direct Bank Transfer (Reference: {order.bank_transfer_ref || 'Pending'})</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Items Summary */}
            {order.items && order.items.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-300 block">
                  Ordered Items
                </span>
                <div className="space-y-2 divide-y divide-white/5 text-xs">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="pt-2 flex justify-between items-center">
                      <div className="min-w-0 pr-2">
                        <p className="text-white font-medium truncate">{item.product_name}</p>
                        <p className="text-[11px] text-stone-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-brand-primary font-bold whitespace-nowrap">
                        LKR {Number(item.line_total).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-baseline text-sm">
                  <span className="font-medium text-stone-300">Total Paid / Due</span>
                  <span className="text-lg font-bold text-brand-primary">
                    LKR {Number(order.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="flex-1 py-3.5 px-6 rounded-2xl bg-brand-primary hover:bg-brand-secondary text-white font-semibold text-xs sm:text-sm shadow-lg text-center transition-all flex items-center justify-center gap-2"
          >
            <HiOutlineShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>

          <Link
            to="/profile"
            className="flex-1 py-3.5 px-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-stone-200 font-semibold text-xs sm:text-sm text-center transition-all flex items-center justify-center gap-2"
          >
            <span>View in My Account</span>
            <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
