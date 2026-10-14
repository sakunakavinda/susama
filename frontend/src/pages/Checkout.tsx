import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HiOutlineUser, 
  HiOutlineEnvelope, 
  HiOutlinePhone, 
  HiOutlineMapPin, 
  HiOutlineShoppingBag, 
  HiOutlineTruck, 
  HiOutlineBanknotes, 
  HiOutlineBuildingLibrary,
  HiOutlineShieldCheck,
  HiCheck,
  HiOutlineArrowLeft
} from 'react-icons/hi2';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Checkout() {
  const navigate = useNavigate();
  const { 
    items, 
    getSubtotal, 
    getShippingFee, 
    getGrandTotal, 
    getFreeShippingProgress,
    clearCart,
    fetchShippingSettings
  } = useCartStore();

  const { customer, isAuthenticated, token } = useAuthStore();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  // Payment State: only 'cod' or 'bank_transfer'
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod');
  const [bankRef, setBankRef] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync latest shipping threshold from admin settings
  useEffect(() => {
    fetchShippingSettings();
  }, [fetchShippingSettings]);

  // Pre-fill fields if customer is logged in
  useEffect(() => {
    if (customer) {
      if (customer.name) setName(customer.name);
      if (customer.email) setEmail(customer.email);
      if (customer.phone) setPhone(customer.phone);
      if (customer.address_line1) setAddressLine1(customer.address_line1);
      if (customer.address_line2) setAddressLine2(customer.address_line2);
      if (customer.city) setCity(customer.city);
      if (customer.district) setDistrict(customer.district);
      if (customer.postal_code) setPostalCode(customer.postal_code);
    }
  }, [customer]);

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const grandTotal = getGrandTotal();
  const { isFree } = getFreeShippingProgress();

  // Empty cart guard
  if (items.length === 0) {
    return (
      <div className="flex-1 min-h-[75vh] flex items-center justify-center px-4 py-20 bg-stone-950 text-white">
        <div className="max-w-md w-full text-center p-8 sm:p-12 bg-stone-900 border border-amber-500/20 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-stone-800 border border-white/10 flex items-center justify-center mx-auto mb-4 text-brand-primary">
            <HiOutlineShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-heading font-medium text-amber-50 mb-2">
            Your shopping bag is empty
          </h2>
          <p className="text-stone-400 text-sm mb-6 leading-relaxed">
            Please add your favorite botanical hair formulations to your bag before proceeding to checkout.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-primary text-white text-sm font-semibold hover:bg-brand-secondary transition-all shadow-lg"
          >
            ← Explore Formulations
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic validation
    if (!name.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please provide a contact phone number for courier delivery confirmation.');
      return;
    }
    if (!addressLine1.trim() || !city.trim()) {
      setErrorMessage('Please provide your delivery street address and city.');
      return;
    }

    if (paymentMethod === 'bank_transfer' && !bankRef.trim()) {
      setErrorMessage('Please enter your Bank Deposit Reference or Transaction ID.');
      return;
    }

    setIsSubmitting(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload = {
        customer_name: name.trim(),
        customer_email: email.trim() || null,
        customer_phone: phone.trim(),
        address_line1: addressLine1.trim(),
        address_line2: addressLine2.trim() || null,
        city: city.trim(),
        district: district.trim() || null,
        postal_code: postalCode.trim() || null,
        payment_method: paymentMethod,
        bank_transfer_ref: paymentMethod === 'bank_transfer' ? bankRef.trim() : null,
        customer_notes: notes.trim() || null,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        }))
      };

      const res = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Unable to place order. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Order created successfully!
      const orderNumber = data.data.order_number;
      clearCart();
      navigate(`/order-success/${orderNumber}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage('Network error. Please verify your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-brand-primary transition-colors font-medium"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <span className="text-xs text-amber-200/80 uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <HiOutlineShieldCheck className="w-4 h-4 text-brand-primary" />
            Secure Islandwide Checkout
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-amber-50 mb-8">
          Complete Your Order
        </h1>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/70 border border-red-500/40 text-red-200 text-sm flex items-start gap-2.5 animate-fade-in">
            <span className="text-red-400 font-bold">!</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Form Details (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-8">
              
              {/* Step 1: Contact Information */}
              <div className="bg-stone-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-bold flex items-center justify-center border border-brand-primary/40">
                      1
                    </span>
                    <h2 className="text-base sm:text-lg font-heading font-medium text-amber-50">
                      Customer Contact
                    </h2>
                  </div>
                  {isAuthenticated ? (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <HiCheck className="w-3.5 h-3.5" /> Logged In
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-400">
                      Guest Checkout
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <HiOutlineUser className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Dilini Senanayake"
                        className="w-full pl-10 pr-4 py-3 bg-stone-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                      Contact Phone * <span className="text-[10px] text-stone-500 normal-case">(Courier confirmation)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <HiOutlinePhone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="077 123 4567"
                        className="w-full pl-10 pr-4 py-3 bg-stone-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                      Email Address <span className="text-[10px] text-stone-500 normal-case">(For receipt)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <HiOutlineEnvelope className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full pl-10 pr-4 py-3 bg-stone-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Delivery Address */}
              <div className="bg-stone-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <span className="w-6 h-6 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-bold flex items-center justify-center border border-brand-primary/40">
                    2
                  </span>
                  <h2 className="text-base sm:text-lg font-heading font-medium text-amber-50">
                    Delivery Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-stone-300 mb-1">
                      Street Address / Apartment *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <HiOutlineMapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="e.g. 45/2 Green Path, Colombo 03"
                        className="w-full pl-10 pr-4 py-3 bg-stone-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-stone-300 mb-1">
                      Apartment, Floor, Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="e.g. Near Royal Gardens"
                      className="w-full px-4 py-3 bg-stone-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">
                      City / Town *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Colombo, Kandy, Galle"
                      className="w-full px-4 py-3 bg-stone-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">
                      District / Province
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Western Province"
                      className="w-full px-4 py-3 bg-stone-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-stone-300 mb-1">
                      Special Courier Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Please call before arriving or leave with security"
                      className="w-full px-4 py-3 bg-stone-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method (COD or Bank Transfer Only) */}
              <div className="bg-stone-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <span className="w-6 h-6 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-bold flex items-center justify-center border border-brand-primary/40">
                    3
                  </span>
                  <h2 className="text-base sm:text-lg font-heading font-medium text-amber-50">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Option 1: Cash on Delivery */}
                  <label 
                    className={`block p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'bg-brand-primary/10 border-brand-primary shadow-lg shadow-brand-primary/10'
                        : 'bg-stone-950/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="mt-1 accent-brand-primary w-4 h-4"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <HiOutlineBanknotes className="w-5 h-5 text-brand-primary" />
                            <span className="font-semibold text-sm sm:text-base text-amber-50">
                              Cash on Delivery (COD)
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                              Popular
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 mt-1">
                            Pay securely in cash to the delivery rider when your package arrives at your doorstep.
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Bank Deposit / Online Transfer */}
                  <label 
                    className={`block p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-brand-primary/10 border-brand-primary shadow-lg shadow-brand-primary/10'
                        : 'bg-stone-950/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={() => setPaymentMethod('bank_transfer')}
                          className="mt-1 accent-brand-primary w-4 h-4"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <HiOutlineBuildingLibrary className="w-5 h-5 text-brand-primary" />
                            <span className="font-semibold text-sm sm:text-base text-amber-50">
                              Direct Bank Transfer / Deposit
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 mt-1">
                            Transfer directly to our corporate bank account and enter your deposit reference below.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bank Details Dropdown (When Selected) */}
                    {paymentMethod === 'bank_transfer' && (
                      <div className="mt-4 pt-4 border-t border-white/10 bg-stone-950/80 p-4 rounded-xl space-y-3 animate-fade-in text-xs">
                        <div className="space-y-1 text-stone-300">
                          <p><strong className="text-white">Bank:</strong> Commercial Bank of Ceylon</p>
                          <p><strong className="text-white">Account Name:</strong> SUSAMA COSMETICS (PVT) LTD</p>
                          <p><strong className="text-white">Account Number:</strong> 1000 8492 4110</p>
                          <p><strong className="text-white">Branch:</strong> Colombo 07 (Torrington Branch)</p>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-200 mb-1">
                            Bank Reference / Transaction ID *
                          </label>
                          <input
                            type="text"
                            required={paymentMethod === 'bank_transfer'}
                            value={bankRef}
                            onChange={(e) => setBankRef(e.target.value)}
                            placeholder="e.g. Ref #98124 or Slip Number"
                            className="w-full px-3.5 py-2.5 bg-stone-900 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:border-brand-primary"
                          />
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-stone-900 border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl sticky top-28 space-y-6">
              
              <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                <h2 className="text-lg font-heading font-semibold text-amber-50">
                  Order Summary
                </h2>
                <span className="text-xs text-stone-400">
                  {items.length} {items.length === 1 ? 'product' : 'products'}
                </span>
              </div>

              {/* Items List */}
              <div className="max-h-72 overflow-y-auto space-y-3.5 pr-1 divide-y divide-white/5">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-14 h-14 rounded-xl object-cover bg-stone-950 border border-white/10 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-amber-50 truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        Qty: {item.quantity} × LKR {item.price.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-brand-primary flex-shrink-0">
                      LKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-stone-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <HiOutlineTruck className="w-4 h-4 text-brand-primary" />
                    Island Courier Delivery
                  </span>
                  <span className={`font-semibold ${isFree ? 'text-emerald-400' : 'text-white'}`}>
                    {isFree ? 'FREE' : `LKR ${shippingFee.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t border-white/10 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-heading font-medium text-amber-50">Grand Total</span>
                  <p className="text-[10px] text-stone-400">All islandwide taxes included</p>
                </div>
                <span className="text-xl sm:text-2xl font-heading font-bold text-brand-primary">
                  LKR {grandTotal.toLocaleString()}
                </span>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-110 text-white font-semibold text-sm shadow-xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Place Order • LKR {grandTotal.toLocaleString()}</span>
                    <span>→</span>
                  </>
                )}
              </button>

              {/* Trust & Guarantee Badges */}
              <div className="pt-3 border-t border-white/10 space-y-2 text-[11px] text-stone-400">
                <div className="flex items-center gap-2">
                  <HiCheck className="w-4 h-4 text-brand-primary flex-shrink-0" />
                  <span>Doorstep delivery to any address in Sri Lanka</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiCheck className="w-4 h-4 text-brand-primary flex-shrink-0" />
                  <span>Sealed luxury packaging with authentic botanical extract seal</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
