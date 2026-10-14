import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HiOutlineShoppingBag, 
  HiOutlineXMark, 
  HiOutlineTrash, 
  HiPlus, 
  HiMinus, 
  HiOutlineTruck,
  HiCheck,
  HiSparkles
} from 'react-icons/hi2';
import { useCartStore } from '../store/useCartStore';

export default function CartDrawer() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    clearCart,
    getSubtotal, 
    getShippingFee, 
    getGrandTotal, 
    getTotalItems,
    getFreeShippingProgress,
    fetchShippingSettings
  } = useCartStore();

  const navigate = useNavigate();

  // Load latest admin shipping settings on mount
  useEffect(() => {
    fetchShippingSettings();
  }, [fetchShippingSettings]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalCount = getTotalItems();
  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const grandTotal = getGrandTotal();
  const { isFree, remaining, percentage } = getFreeShippingProgress();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      {/* Soft Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      {/* Slide-over Drawer (Warm Light Luxury Theme) */}
      <div 
        className="relative w-full max-w-md bg-[#FAF8F5] border-l border-stone-200 text-stone-900 shadow-2xl flex flex-col h-full z-10 overflow-hidden"
        style={{
          boxShadow: '-12px 0 40px -10px rgba(44, 30, 20, 0.15), 0 0 25px rgba(244, 154, 66, 0.05)'
        }}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/25 flex items-center justify-center text-brand-secondary">
              <HiOutlineShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-stone-900">
                Your Shopping Bag
              </h2>
              <p className="text-[11px] text-stone-500">
                {totalCount} {totalCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-medium text-stone-500 hover:text-red-600 transition-colors cursor-pointer mr-2"
                title="Clear all items"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Bar (Admin Threshold Setting in LKR) */}
        {items.length > 0 && (
          <div className="px-5 sm:px-6 py-3 bg-amber-50/70 border-b border-amber-200/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5">
                <HiOutlineTruck className="w-4 h-4 text-brand-secondary" />
                {isFree ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <HiCheck className="w-3.5 h-3.5 text-emerald-600" /> FREE Islandwide Delivery Unlocked!
                  </span>
                ) : (
                  <span className="text-stone-700">
                    Add <strong className="text-brand-secondary font-bold">LKR {remaining.toLocaleString()}</strong> more for <strong className="text-stone-900">FREE Delivery</strong>
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-500 font-medium">
                {percentage}%
              </span>
            </div>

            {/* Progress bar line */}
            <div className="w-full h-1.5 bg-amber-200/60 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isFree 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-xs' 
                    : 'bg-gradient-to-r from-brand-secondary to-brand-primary shadow-xs'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF8F5]">
            <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-brand-secondary shadow-xs">
              <HiOutlineShoppingBag className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-stone-900 mb-2">
              Your bag is currently empty
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm max-w-xs mb-6 leading-relaxed">
              Experience authentic Sri Lankan botanical hair elixirs & ayurvedic haircare rituals.
            </p>
            <Link
              to="/products"
              onClick={closeCart}
              className="py-3 px-8 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold text-xs sm:text-sm shadow-md hover:brightness-105 transition-all cursor-pointer"
            >
              Discover Formulations →
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 divide-y divide-stone-200/70 bg-[#FAF8F5]">
            {items.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex gap-4 items-center">
                {/* Thumbnail */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white border border-stone-200 flex-shrink-0 relative group shadow-2xs">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Info & Controls */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      {item.categoryName && (
                        <span className="block text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-0.5">
                          {item.categoryName}
                        </span>
                      )}
                      <h4 className="text-sm font-semibold text-stone-900 truncate leading-snug">
                        {item.name}
                      </h4>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-stone-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                      title="Remove item"
                      aria-label={`Remove ${item.name}`}
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-2.5">
                    <span className="text-xs sm:text-sm font-bold text-stone-900">
                      LKR {item.price.toLocaleString()}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-[11px] text-stone-400 line-through">
                        LKR {item.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Quantity selector and line total */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-white border border-stone-300 rounded-md overflow-hidden shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <HiMinus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-stone-900 select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <HiPlus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-stone-900 font-mono">
                      LKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Checkout Footer */}
        {items.length > 0 && (
          <div className="p-5 sm:p-6 bg-white border-t border-stone-200 space-y-3.5 shadow-lg">
            {/* Calculation Lines */}
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900 font-mono">LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  Estimated Island Delivery
                  {isFree && (
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded">
                      FREE
                    </span>
                  )}
                </span>
                <span className={`font-semibold ${isFree ? 'text-emerald-700' : 'text-stone-900 font-mono'}`}>
                  {isFree ? 'LKR 0' : `LKR ${shippingFee.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Total Line */}
            <div className="pt-2.5 border-t border-stone-200 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-heading font-semibold text-stone-900">Total</span>
                <p className="text-[10px] text-stone-500">All islandwide taxes included</p>
              </div>
              <span className="text-xl font-heading font-bold text-stone-900 font-mono">
                LKR {grandTotal.toLocaleString()}
              </span>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-105 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <span>→</span>
            </button>

            {/* Trust Badges */}
            <div className="pt-1 flex items-center justify-around text-[10px] text-stone-500 text-center">
              <span className="flex items-center gap-1">
                <HiSparkles className="w-3.5 h-3.5 text-brand-secondary" />
                100% Botanical
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HiOutlineTruck className="w-3.5 h-3.5 text-brand-secondary" />
                Doorstep Courier
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HiCheck className="w-3.5 h-3.5 text-brand-secondary" />
                COD & Bank Transfer
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
