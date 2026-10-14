import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HiOutlineUser, 
  HiOutlineEnvelope, 
  HiOutlinePhone, 
  HiOutlineMapPin, 
  HiOutlineShoppingBag,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCheckCircle,
  HiOutlineBuildingLibrary,
  HiSparkles
} from 'react-icons/hi2';
import { useAuthStore } from '../store/useAuthStore';

export default function Profile() {
  const { 
    customer, 
    isAuthenticated, 
    openAuthModal, 
    logout, 
    updateProfile, 
    isLoading,
    checkAuth,
    token
  } = useAuthStore();
  
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && token) {
      setOrdersLoading(true);
      fetch('http://localhost:5001/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setOrders(data.data);
          }
        })
        .catch((err) => console.error('Error fetching customer orders:', err))
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab, token]);

  // Sync profile data into form state
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
      setAddressLine1(customer.address_line1 || '');
      setAddressLine2(customer.address_line2 || '');
      setCity(customer.city || '');
      setDistrict(customer.district || '');
      setPostalCode(customer.postal_code || '');
    }
  }, [customer]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const res = await updateProfile({
      name,
      phone,
      address_line1: addressLine1,
      address_line2: addressLine2,
      city,
      district,
      postal_code: postalCode
    });

    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Your profile and address details have been updated.' });
      setTimeout(() => {
        setStatusMsg(null);
      }, 5000);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // If not logged in: Orange Banner top + Clean Light card below
  if (!isAuthenticated || !customer) {
    return (
      <div className="flex-1 min-h-screen bg-[#FAF8F5] text-stone-900 pb-24">
        {/* Orange Top Header Banner */}
        <section className="relative bg-gray-950 text-white pt-32 sm:pt-36 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary/90 to-brand-primary/80 z-10" />
          <img 
            src="/images/hero/hero-bg.jpg" 
            alt="SUSÁMÁ Sanctuary" 
            className="absolute inset-0 w-full h-full object-cover object-center brightness-75"
          />
          <div className="relative z-20 max-w-5xl mx-auto text-center flex flex-col items-center">
            <span className="text-[11px] sm:text-xs font-extrabold tracking-[0.25em] text-white/90 uppercase mb-2">
              PERSONAL RITUAL SANCTUARY
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold tracking-tight mb-3 drop-shadow-md text-white">
              Customer Account
            </h1>
            <p className="max-w-xl text-xs sm:text-sm md:text-base text-white/90 font-light leading-relaxed mb-4">
              Sign in to manage your delivery address, access order receipts, and track your botanical hair rituals.
            </p>
            <div className="w-16 h-1 bg-white/70 rounded-full" />
          </div>
        </section>

        <div className="max-w-md w-full mx-auto px-4 pt-12 pb-20">
          <div className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-10 text-center shadow-xs space-y-5">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-brand-secondary">
              <HiOutlineUser className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-stone-900">
                Welcome to SUSÁMÁ
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Please sign in to access your personal ritual profile, order history, and saved addresses.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => openAuthModal('signin')}
                className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold text-xs sm:text-sm shadow-md hover:brightness-105 transition-all cursor-pointer"
              >
                Sign In to Your Account
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="w-full py-3 px-6 rounded-lg bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-stone-800 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Create a New Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initial = customer.name ? customer.name.charAt(0).toUpperCase() : 'S';

  return (
    <div className="flex-1 min-h-screen bg-[#FAF8F5] text-stone-900 pb-24">
      {/* Orange Top Header Banner (Matching Shop & Checkout) */}
      <section className="relative bg-gray-950 text-white pt-32 sm:pt-36 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary/90 to-brand-primary/80 z-10" />
        <img 
          src="/images/hero/hero-bg.jpg" 
          alt="SUSÁMÁ Sanctuary" 
          className="absolute inset-0 w-full h-full object-cover object-center brightness-75"
        />
        <div className="relative z-20 max-w-5xl mx-auto text-center flex flex-col items-center">
          <span className="text-[11px] sm:text-xs font-extrabold tracking-[0.25em] text-white/90 uppercase mb-2">
            PERSONAL RITUAL SANCTUARY
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold tracking-tight mb-3 drop-shadow-md text-white">
            My Account & Rituals
          </h1>
          <p className="max-w-xl text-xs sm:text-sm md:text-base text-white/90 font-light leading-relaxed mb-4">
            Manage your personal delivery address, view order receipts, and track your botanical formulations.
          </p>
          <div className="w-16 h-1 bg-white/70 rounded-full" />
        </div>
      </section>

      {/* Main Body Content (Light Themed) */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* User Profile Overview Strip */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              {/* Avatar Initial */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-brand-secondary to-brand-primary text-white text-2xl font-heading font-bold flex items-center justify-center shadow-md">
                {initial}
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-heading font-semibold text-stone-900">
                    {customer.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-semibold text-brand-secondary uppercase tracking-wider">
                    <HiSparkles className="w-3 h-3" /> VIP Member
                  </span>
                </div>
                <p className="text-xs text-stone-500 flex items-center justify-center sm:justify-start gap-1.5">
                  <HiOutlineEnvelope className="w-3.5 h-3.5 text-stone-400" />
                  {customer.email}
                </p>
                {customer.phone && (
                  <p className="text-xs text-stone-500 mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
                    <HiOutlinePhone className="w-3.5 h-3.5 text-stone-400" />
                    {customer.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-100 border border-stone-200 hover:bg-red-50 hover:border-red-200 text-stone-600 hover:text-red-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-stone-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Personal & Delivery Details
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              My Orders & Rituals
            </button>

            <Link
              to="/admin"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-brand-secondary bg-amber-50 hover:bg-amber-100/80 border border-amber-200 transition-all flex items-center gap-1.5 sm:ml-auto cursor-pointer"
            >
              <HiOutlineBuildingLibrary className="w-3.5 h-3.5" />
              <span>Store Admin & Bank Settings →</span>
            </Link>
          </div>
        </div>

        {/* Content Section */}
        {activeTab === 'profile' ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-base font-heading font-semibold text-stone-900">
                Account & Shipping Information
              </h3>
              <p className="text-stone-500 text-xs mt-0.5">
                Keep your details updated for effortless 1-click island delivery.
              </p>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Section 1: Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Full Name
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
                      className="w-full pl-9 pr-3 py-2 bg-stone-50/50 border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/20 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Email Address <span className="text-stone-400 text-[10px] normal-case">(Primary ID)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <HiOutlineEnvelope className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      disabled
                      value={customer.email}
                      className="w-full pl-9 pr-3 py-2 bg-stone-100 border border-stone-200 rounded-md text-xs sm:text-sm text-stone-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Contact Phone Number <span className="text-stone-400 text-[10px] normal-case">(For courier delivery confirmation)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <HiOutlinePhone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50/50 border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/20 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Address */}
              <div className="pt-4 border-t border-stone-200">
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineMapPin className="w-4 h-4 text-brand-secondary" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                    Default Shipping Address
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Street address, apartment or villa"
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/20 shadow-2xs"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Floor, suite, or landmark"
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/20 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">City / Town</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Colombo, Kandy"
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/20 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">District / Province</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Western"
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/20 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 00700"
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/20 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Submit Area & Status Notification */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {statusMsg ? (
                  <div
                    className={`flex-1 p-3 rounded-md text-xs flex items-center gap-2 animate-fade-in ${
                      statusMsg.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                  >
                    {statusMsg.type === 'success' && (
                      <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    )}
                    <span>{statusMsg.text}</span>
                  </div>
                ) : (
                  <div className="hidden sm:block flex-1" />
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-105 text-white font-semibold text-xs sm:text-sm rounded-md transition-all shadow-md cursor-pointer disabled:opacity-50 flex-shrink-0 text-center"
                >
                  {isLoading ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500 shadow-xs">
                <span className="inline-block w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-xs space-y-3">
                <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-brand-secondary">
                  <HiOutlineShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-stone-900">
                  No orders placed yet
                </h3>
                <p className="text-stone-500 text-xs max-w-sm mx-auto">
                  Your recent ritual orders and doorstep deliveries across Sri Lanka will appear right here.
                </p>
                <div className="pt-2">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-semibold hover:brightness-105 transition-all shadow-md"
                  >
                    Discover Formulations →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div 
                    key={ord.id} 
                    className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs sm:text-sm font-bold text-brand-secondary">
                            {ord.order_number}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                            {ord.order_status || 'Confirmed'}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500">
                          Placed on {new Date(ord.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-stone-500 block uppercase font-medium">Total Amount</span>
                        <span className="text-sm sm:text-base font-bold text-stone-900 font-mono">
                          LKR {Number(ord.total_amount).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="space-y-1.5 text-xs">
                      {ord.items && ord.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-stone-700">
                          <span className="truncate pr-3">
                            {item.product_name} <span className="text-stone-400">× {item.quantity}</span>
                          </span>
                          <span className="font-semibold whitespace-nowrap text-stone-900">
                            LKR {Number(item.line_total).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <span>Payment: <strong className="text-stone-800 capitalize">{ord.payment_method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}</strong></span>
                      <Link 
                        to={`/order-success/${ord.order_number}`}
                        className="text-brand-secondary hover:underline font-semibold"
                      >
                        View Receipt →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
