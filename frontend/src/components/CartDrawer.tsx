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
    // Navigate to checkout or profile
    navigate('/profile');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Slide-over Drawer */}
      <div 
        className="relative w-full max-w-md bg-stone-900 border-l border-amber-500/20 text-white shadow-2xl flex flex-col h-full z-10 overflow-hidden"
        style={{
          boxShadow: '-10px 0 40px -10px rgba(0, 0, 0, 0.8), 0 0 30px rgba(244, 154, 66, 0.1)'
        }}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-stone-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
              <HiOutlineShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-amber-50">
                Your Shopping Bag
              </h2>
              <p className="text-[11px] text-stone-400">
                {totalCount} {totalCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-stone-400 hover:text-red-400 transition-colors cursor-pointer mr-2"
                title="Clear all items"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Bar (Admin Threshold Setting in LKR) */}
        {items.length > 0 && (
          <div className="px-5 sm:px-6 py-3 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/30 border-b border-white/10">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5">
                <HiOutlineTruck className="w-4 h-4 text-brand-primary" />
                {isFree ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <HiCheck className="w-3.5 h-3.5" /> FREE Islandwide Delivery Unlocked!
                  </span>
                ) : (
                  <span className="text-stone-300">
                    Add <strong className="text-brand-primary font-bold">LKR {remaining.toLocaleString()}</strong> more for <strong className="text-amber-200">FREE Delivery</strong>
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-400 font-medium">
                {percentage}%
              </span>
            </div>

            {/* Progress bar line */}
            <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isFree 
                    ? 'bg-gradient-to-r from-emerald-400 to-brand-primary shadow-sm shadow-emerald-400/50' 
                    : 'bg-gradient-to-r from-brand-secondary to-brand-primary shadow-sm shadow-brand-primary/50'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-stone-950/60 border border-white/10 flex items-center justify-center mb-4 text-stone-500">
              <HiOutlineShoppingBag className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-heading font-medium text-amber-50 mb-2">
              Your bag is currently empty
            </h3>
            <p className="text-stone-400 text-xs sm:text-sm max-w-xs mb-6 leading-relaxed">
              Experience authentic Sri Lankan botanical hair elixirs & ayurvedic haircare rituals.
            </p>
            <Link
              to="/products"
              onClick={closeCart}
              className="py-3 px-8 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold text-xs sm:text-sm shadow-lg hover:brightness-110 transition-all cursor-pointer"
            >
              Discover Formulations →
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 divide-y divide-white/5">
            {items.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex gap-4 items-center">
                {/* Thumbnail */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-stone-950 border border-white/10 flex-shrink-0 relative group">
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
                        <span className="block text-[10px] font-bold text-brand-primary uppercase tracking-wider mb-0.5">
                          {item.categoryName}
                        </span>
                      )}
                      <h4 className="text-sm font-semibold text-amber-50 truncate leading-snug">
                        {item.name}
                      </h4>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-stone-400 hover:text-red-400 p-1 transition-colors cursor-pointer"
                      title="Remove item"
                      aria-label={`Remove ${item.name}`}
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-2.5">
                    <span className="text-xs sm:text-sm font-bold text-brand-primary">
                      LKR {item.price.toLocaleString()}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-[11px] text-stone-500 line-through">
                        LKR {item.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Quantity selector and line total */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-stone-950/80 border border-white/15 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <HiMinus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-white select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <HiPlus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-extrabold text-amber-100">
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
          <div className="p-5 sm:p-6 bg-stone-950/90 border-t border-white/10 space-y-3">
            {/* Calculation Lines */}
            <div className="space-y-1.5 text-xs text-stone-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-white">LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  Estimated Island Delivery
                  {isFree && (
                    <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                      FREE
                    </span>
                  )}
                </span>
                <span className={`font-semibold ${isFree ? 'text-emerald-400' : 'text-white'}`}>
                  {isFree ? 'LKR 0' : `LKR ${shippingFee.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Total Line */}
            <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-heading font-medium text-amber-50">Total</span>
                <p className="text-[10px] text-stone-400">All islandwide taxes included</p>
              </div>
              <span className="text-lg sm:text-xl font-heading font-bold text-brand-primary">
                LKR {grandTotal.toLocaleString()}
              </span>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-110 text-white font-semibold text-sm shadow-xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <span>→</span>
            </button>

            {/* Trust Badges */}
            <div className="pt-1 flex items-center justify-around text-[10px] text-stone-400 text-center">
              <span className="flex items-center gap-1">
                <HiSparkles className="w-3 h-3 text-brand-primary" />
                100% Botanical
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HiOutlineTruck className="w-3 h-3 text-brand-primary" />
                Doorstep Courier
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HiCheck className="w-3 h-3 text-brand-primary" />
                COD & Bank Transfer
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
