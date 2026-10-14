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
  HiOutlineArrowLeft,
  HiLockClosed,
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentDuplicate
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
    fetchShippingSettings,
    shippingSettings
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
  const [copiedAccount, setCopiedAccount] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync latest shipping settings on mount
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
  const { isFree, remaining } = getFreeShippingProgress();
  const threshold = shippingSettings.freeShippingThreshold;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('100084924110');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  // Empty cart guard (Light Themed & Card-free)
  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-24 bg-[#FAF8F5] text-stone-900">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-brand-secondary">
            <HiOutlineShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-semibold text-stone-900">
              Your shopping bag is empty
            </h2>
            <p className="text-stone-500 text-xs mt-1">
              Select your desired botanical haircare formulations to proceed.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary text-white text-xs font-semibold hover:bg-brand-secondary transition-all shadow-xs"
            >
              <HiOutlineArrowLeft className="w-3.5 h-3.5" />
              Return to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter a contact phone number for courier delivery confirmation.');
      return;
    }
    if (!addressLine1.trim() || !city.trim()) {
      setErrorMessage('Please enter your delivery street address and city.');
      return;
    }
    if (paymentMethod === 'bank_transfer' && !bankRef.trim()) {
      setErrorMessage('Please provide your Bank Deposit Reference or Transaction Slip ID.');
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

      const orderNumber = data.data.order_number;
      clearCart();
      navigate(`/order-success/${orderNumber}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage('Network connection error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Compact Navigation Bar */}
        <div className="flex items-center justify-between py-3 border-b border-stone-200 mb-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-brand-secondary transition-colors font-medium"
          >
            <HiOutlineArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-900 font-semibold">Checkout</span>
            <span className="text-stone-400">/</span>
            <span className="text-stone-500">Receipt</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-stone-500">
            <HiLockClosed className="w-3.5 h-3.5 text-stone-700" />
            <span>256-Bit SSL Secure</span>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-3 rounded-md bg-red-50 border-l-3 border-red-500 text-red-800 text-xs flex items-start gap-2.5 animate-fade-in shadow-2xs">
            <span className="font-bold text-red-600">!</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2-Column Professional Ledger Architecture (Light Themed, Card-Free) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Seamless Customer Form (7 cols) */}
          <div className="lg:col-span-7">
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-7">
              
              {/* Section 1: Contact Information */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 text-[10px] flex items-center justify-center font-bold">1</span>
                    Contact Information
                  </h2>
                  {isAuthenticated ? (
                    <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                      <HiCheck className="w-3 h-3 text-emerald-600" /> Logged In ({customer?.email})
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-500">
                      Guest Checkout
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Full Name <span className="text-amber-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <HiOutlineUser className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Dilini Senanayake"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 shadow-2xs transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Phone Number <span className="text-amber-600">*</span> <span className="text-[10px] text-stone-500">(For courier delivery)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <HiOutlinePhone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="077 123 4567"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 shadow-2xs transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Email Address <span className="text-[10px] text-stone-500">(For order confirmation)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <HiOutlineEnvelope className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 shadow-2xs transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Delivery Address */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 text-[10px] flex items-center justify-center font-bold">2</span>
                    Delivery Address
                  </h2>
                  <span className="text-[11px] text-stone-500 flex items-center gap-1">
                    <HiOutlineTruck className="w-3.5 h-3.5 text-stone-600" /> Islandwide Delivery
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Street Address / House No. <span className="text-amber-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <HiOutlineMapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="e.g. 45/2 Green Path, Colombo 03"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 shadow-2xs transition-colors"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Apartment, Floor, Landmark <span className="text-[10px] text-stone-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="e.g. Level 3, Pearl Residences"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 shadow-2xs transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      City / Town <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Colombo"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 shadow-2xs transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      District / Province
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Western"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 shadow-2xs transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Postal Code <span className="text-[10px] text-stone-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 00300"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 shadow-2xs transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Special Delivery Instructions <span className="text-[10px] text-stone-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Call before arrival or leave with reception"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 shadow-2xs transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Payment Method (Light Theme, Zero Card Wrapper) */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 text-[10px] flex items-center justify-center font-bold">3</span>
                    Payment Method
                  </h2>
                  <span className="text-[11px] text-stone-500">
                    COD & Bank Deposit
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Option 1: Cash on Delivery */}
                  <label 
                    className={`flex items-start gap-3 p-3 rounded-md border transition-all cursor-pointer ${
                      paymentMethod === 'cod' 
                        ? 'border-brand-primary bg-amber-50/40 shadow-xs ring-1 ring-brand-primary/20' 
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-0.5 accent-brand-secondary w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-semibold text-stone-900 flex items-center gap-2">
                          <HiOutlineBanknotes className="w-4 h-4 text-brand-secondary" />
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] text-emerald-800 font-medium px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                          Pay upon delivery
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Pay cash directly to the courier rider upon package handover.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Bank Transfer */}
                  <div 
                    className={`rounded-md border transition-all ${
                      paymentMethod === 'bank_transfer' 
                        ? 'border-brand-primary bg-amber-50/40 shadow-xs ring-1 ring-brand-primary/20' 
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <label className="flex items-start gap-3 p-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                        className="mt-0.5 accent-brand-secondary w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-semibold text-stone-900 flex items-center gap-2">
                            <HiOutlineBuildingLibrary className="w-4 h-4 text-brand-secondary" />
                            Direct Bank Transfer / Deposit
                          </span>
                          <span className="text-[10px] text-amber-900 font-medium px-2 py-0.5 rounded bg-amber-100/70 border border-amber-200">
                            Commercial Bank
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Transfer directly to our corporate bank account and attach your reference slip.
                        </p>
                      </div>
                    </label>

                    {/* Compact Bank Account Credentials (Light) */}
                    {paymentMethod === 'bank_transfer' && (
                      <div className="px-4 pb-4 pt-2 border-t border-amber-100 space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 bg-white rounded border border-stone-200 text-[11px] shadow-2xs">
                          <div>
                            <span className="text-stone-500 block text-[10px]">Bank</span>
                            <span className="font-semibold text-stone-800">Commercial Bank</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px]">Account Name</span>
                            <span className="font-semibold text-stone-800">SUSAMA (PVT) LTD</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px]">Account Number</span>
                            <div className="flex items-center gap-1.5 font-mono font-bold text-stone-900">
                              <span>1000 8492 4110</span>
                              <button
                                type="button"
                                onClick={handleCopyAccount}
                                title="Copy account number"
                                className="text-stone-500 hover:text-brand-secondary transition-colors p-0.5"
                              >
                                {copiedAccount ? (
                                  <HiOutlineClipboardDocumentCheck className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <HiOutlineDocumentDuplicate className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px]">Branch</span>
                            <span className="font-semibold text-stone-800">Torrington (07)</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-stone-700 mb-1">
                            Bank Deposit Reference / Slip Number <span className="text-amber-600">*</span>
                          </label>
                          <input
                            type="text"
                            required={paymentMethod === 'bank_transfer'}
                            value={bankRef}
                            onChange={(e) => setBankRef(e.target.value)}
                            placeholder="e.g. Ref #89201 or Deposit Slip Number"
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-brand-primary shadow-2xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Right Column: Seamless Ledger Order Summary (5 cols, anchored with clean border-l) */}
          <div className="lg:col-span-5 lg:border-l lg:border-stone-200 lg:pl-10">
            <div className="sticky top-24 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                  Order Summary
                </h3>
                <span className="text-xs text-stone-500 font-medium">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List (Compact & Clean) */}
              <div className="max-h-72 overflow-y-auto space-y-3 pr-1 divide-y divide-stone-100">
                {items.map((item) => (
                  <div key={item.id} className="pt-2.5 first:pt-0 flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-11 h-11 rounded-md object-cover bg-stone-100 border border-stone-200"
                      />
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-stone-800 text-white text-[10px] font-bold flex items-center justify-center border border-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-stone-900 truncate leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        LKR {item.price.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-stone-900 flex-shrink-0">
                      LKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Free Shipping Dynamic Progress */}
              {isFree ? (
                <div className="py-2 px-3 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2 font-medium">
                  <HiOutlineTruck className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>Free Islandwide Courier unlocked!</span>
                </div>
              ) : remaining > 0 ? (
                <div className="py-2 px-3 rounded bg-amber-50/70 border border-amber-200/80 text-[11px] text-stone-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <HiOutlineTruck className="w-3.5 h-3.5 text-brand-secondary" />
                    Free delivery over LKR {threshold.toLocaleString()}
                  </span>
                  <span className="text-brand-secondary font-semibold">Add LKR {remaining.toLocaleString()}</span>
                </div>
              ) : null}

              {/* Price Calculation (Clean Ledger Lines) */}
              <div className="pt-3 border-t border-stone-200 space-y-2 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-stone-900 font-medium">LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    Delivery
                  </span>
                  <span className={`font-semibold ${isFree ? 'text-emerald-700' : 'text-stone-900'}`}>
                    {isFree ? 'FREE' : `LKR ${shippingFee.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Total Row */}
              <div className="pt-3 border-t border-stone-200 flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900">Total Due</span>
                <span className="text-xl font-bold text-stone-900 font-mono">
                  LKR {grandTotal.toLocaleString()}
                </span>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-md bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-105 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Confirm Order • LKR {grandTotal.toLocaleString()}</span>
                )}
              </button>

              {/* Compact Trust Footnote */}
              <div className="pt-1 flex items-center justify-center gap-3 text-[10px] text-stone-500 text-center">
                <span className="flex items-center gap-1">
                  <HiOutlineShieldCheck className="w-3.5 h-3.5 text-brand-secondary" /> 100% Authentic Formulas
                </span>
                <span>•</span>
                <span>Islandwide Express Courier</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
