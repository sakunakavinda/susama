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
    checkAuth 
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
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // If not logged in
  if (!isAuthenticated || !customer) {
    return (
      <div className="flex-1 min-h-[70vh] flex items-center justify-center px-4 py-16 bg-stone-950 text-white">
        <div className="max-w-md w-full text-center p-8 sm:p-10 bg-stone-900 border border-amber-500/20 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center mx-auto mb-5 text-brand-primary">
            <HiOutlineUser className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-medium text-amber-50 mb-2">
            Customer Sanctuary
          </h1>
          <p className="text-stone-400 text-sm mb-8 leading-relaxed">
            Please sign in to access your personal ritual profile, order history, and saved addresses.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => openAuthModal('signin')}
              className="w-full py-3.5 px-6 rounded-xl bg-brand-primary text-white font-semibold shadow-lg hover:bg-brand-secondary transition-all cursor-pointer"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="w-full py-3.5 px-6 rounded-xl bg-white/5 border border-white/10 text-stone-300 font-semibold hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              Create a New Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const initial = customer.name ? customer.name.charAt(0).toUpperCase() : 'S';

  return (
    <div className="flex-1 min-h-screen bg-stone-950 text-stone-100 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-amber-500/20 p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              {/* Avatar Initial */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-secondary to-brand-primary text-white text-3xl font-heading font-bold flex items-center justify-center shadow-xl border-2 border-white/20">
                {initial}
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-amber-50">
                    {customer.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[11px] font-semibold text-brand-primary uppercase tracking-wider">
                    <HiSparkles className="w-3 h-3" /> VIP Member
                  </span>
                </div>
                <p className="text-sm text-stone-400 flex items-center justify-center sm:justify-start gap-1.5">
                  <HiOutlineEnvelope className="w-4 h-4 text-stone-500" />
                  {customer.email}
                </p>
                {customer.phone && (
                  <p className="text-xs text-stone-400 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                    <HiOutlinePhone className="w-3.5 h-3.5 text-stone-500" />
                    {customer.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-950/50 hover:border-red-500/30 text-stone-300 hover:text-red-300 text-xs sm:text-sm font-medium transition-all cursor-pointer"
            >
              <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-brand-primary text-white shadow-lg'
                  : 'text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Personal & Delivery Details
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-brand-primary text-white shadow-lg'
                  : 'text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              My Orders & Rituals
            </button>
          </div>
        </div>

        {/* Content Section */}
        {activeTab === 'profile' ? (
          <div className="bg-stone-900 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
            <div>
              <h2 className="text-xl font-heading font-medium text-amber-50">
                Account & Shipping Information
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm mt-1">
                Keep your details updated for effortless 1-click island delivery.
              </p>
            </div>

            {statusMsg && (
              <div
                className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/60 border border-red-500/40 text-red-200'
                }`}
              >
                {statusMsg.type === 'success' && <HiOutlineCheckCircle className="w-5 h-5 text-emerald-400" />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Section 1: Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                    Full Name
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
                      className="w-full pl-10 pr-4 py-3 bg-stone-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                    Email Address <span className="text-stone-500 text-[10px] normal-case">(Primary login ID)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <HiOutlineEnvelope className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      disabled
                      value={customer.email}
                      className="w-full pl-10 pr-4 py-3 bg-stone-950/40 border border-white/5 rounded-xl text-sm text-stone-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                    Contact Phone Number <span className="text-stone-500 text-[10px] normal-case">(For courier delivery confirmation)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <HiOutlinePhone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="w-full pl-10 pr-4 py-3 bg-stone-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Address */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <HiOutlineMapPin className="w-4 h-4 text-brand-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-100">
                    Default Shipping Address
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-stone-300 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Street address, apartment or villa"
                      className="w-full px-4 py-2.5 bg-stone-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-stone-300 mb-1">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Floor, suite, or landmark"
                      className="w-full px-4 py-2.5 bg-stone-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Colombo, Kandy, Galle"
                      className="w-full px-4 py-2.5 bg-stone-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">District / Province</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Western Province"
                      className="w-full px-4 py-2.5 bg-stone-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 00700"
                      className="w-full px-4 py-2.5 bg-stone-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3.5 bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-brand-primary/20 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-stone-900 border border-white/10 rounded-3xl p-12 text-center shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-800 border border-white/10 flex items-center justify-center mx-auto text-brand-primary">
              <HiOutlineShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-heading font-medium text-amber-50">
              No orders placed yet
            </h3>
            <p className="text-stone-400 text-sm max-w-sm mx-auto">
              Your recent ritual orders and doorstep deliveries across Sri Lanka will appear right here.
            </p>
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-primary text-white text-sm font-semibold hover:bg-brand-secondary transition-all shadow-md"
              >
                Discover Formulations →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
