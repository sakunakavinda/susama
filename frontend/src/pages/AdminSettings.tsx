import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineBuildingLibrary, 
  HiOutlineTruck, 
  HiOutlineCheckCircle, 
  HiOutlineArrowLeft,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineDocumentDuplicate,
  HiOutlineInformationCircle
} from 'react-icons/hi2';

export default function AdminSettings() {
  // Bank Details State
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [instructions, setInstructions] = useState('');
  
  const [isBankLoading, setIsBankLoading] = useState(false);
  const [bankSuccessMsg, setBankSuccessMsg] = useState<string | null>(null);
  const [bankErrorMsg, setBankErrorMsg] = useState<string | null>(null);

  // Shipping Settings State
  const [freeThreshold, setFreeThreshold] = useState<number>(7500);
  const [shippingFee, setShippingFee] = useState<number>(450);
  const [isShippingLoading, setIsShippingLoading] = useState(false);
  const [shippingSuccessMsg, setShippingSuccessMsg] = useState<string | null>(null);
  const [shippingErrorMsg, setShippingErrorMsg] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'bank' | 'shipping'>('bank');

  // Load current bank settings from database
  useEffect(() => {
    fetch('http://localhost:5001/api/settings/bank')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBankName(data.data.bank_name || '');
          setAccountName(data.data.account_name || '');
          setAccountNumber(data.data.account_number || '');
          setBranch(data.data.branch || '');
          setInstructions(data.data.instructions || '');
        }
      })
      .catch((err) => {
        console.error('Failed to load bank settings:', err);
      });
  }, []);

  // Load current shipping settings from database
  useEffect(() => {
    fetch('http://localhost:5001/api/settings/shipping')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setFreeThreshold(Number(data.data.free_shipping_threshold) || 7500);
          setShippingFee(Number(data.data.standard_shipping_fee) || 450);
        }
      })
      .catch((err) => {
        console.error('Failed to load shipping settings:', err);
      });
  }, []);

  // Save Bank Details to Database
  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBankLoading(true);
    setBankSuccessMsg(null);
    setBankErrorMsg(null);

    try {
      const res = await fetch('http://localhost:5001/api/settings/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_name: bankName.trim(),
          account_name: accountName.trim(),
          account_number: accountNumber.trim(),
          branch: branch.trim(),
          instructions: instructions.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBankSuccessMsg(data.message || 'Bank details saved to database successfully!');
        if (data.data) {
          setBankName(data.data.bank_name);
          setAccountName(data.data.account_name);
          setAccountNumber(data.data.account_number);
          setBranch(data.data.branch);
          setInstructions(data.data.instructions);
        }
        setTimeout(() => setBankSuccessMsg(null), 6000);
      } else {
        setBankErrorMsg(data.message || 'Failed to update bank details.');
      }
    } catch {
      setBankErrorMsg('Network error. Unable to connect to server.');
    } finally {
      setIsBankLoading(false);
    }
  };

  // Save Shipping Settings to Database
  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsShippingLoading(true);
    setShippingSuccessMsg(null);
    setShippingErrorMsg(null);

    try {
      const res = await fetch('http://localhost:5001/api/settings/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          free_shipping_threshold: Number(freeThreshold),
          standard_shipping_fee: Number(shippingFee)
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShippingSuccessMsg('Shipping settings saved to database successfully!');
        setTimeout(() => setShippingSuccessMsg(null), 6000);
      } else {
        setShippingErrorMsg(data.message || 'Failed to update shipping settings.');
      }
    } catch {
      setShippingErrorMsg('Network error. Unable to connect to server.');
    } finally {
      setIsShippingLoading(false);
    }
  };

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
            ADMINISTRATION & STORE SETTINGS
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold tracking-tight mb-3 drop-shadow-md text-white">
            Store Admin Settings
          </h1>
          <p className="max-w-xl text-xs sm:text-sm md:text-base text-white/90 font-light leading-relaxed mb-4">
            Manage corporate bank account credentials, islandwide delivery fee thresholds, and store configuration.
          </p>
          <div className="w-16 h-1 bg-white/70 rounded-full" />
        </div>
      </section>

      {/* Main Admin Content Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-brand-secondary transition-colors font-medium"
          >
            <HiOutlineArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Profile</span>
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500">Admin</span>
            <span className="text-stone-400">/</span>
            <span className="text-stone-900 font-semibold">Store Settings</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
            <HiOutlineShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Database Connected</span>
          </div>
        </div>

        {/* Setting Category Tabs */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'bank'
                ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md'
                : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <HiOutlineBuildingLibrary className="w-4 h-4" />
            <span>Corporate Bank Details</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'shipping'
                ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md'
                : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <HiOutlineTruck className="w-4 h-4" />
            <span>Islandwide Delivery & Fees</span>
          </button>
        </div>

        {/* Tab 1: Bank Transfer Details */}
        {activeTab === 'bank' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-stone-200 pb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-heading font-semibold text-stone-900 flex items-center gap-2">
                    <HiOutlineBuildingLibrary className="w-5 h-5 text-brand-secondary" />
                    Bank Transfer Credentials
                  </h2>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                    These account details are dynamically shown to customers when selecting &ldquo;Direct Bank Transfer / Deposit&rdquo; on the checkout page.
                  </p>
                </div>
                <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  Live on Checkout
                </span>
              </div>

              {/* Status Notifications */}
              {bankSuccessMsg && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fade-in shadow-2xs">
                  <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-medium">{bankSuccessMsg}</span>
                </div>
              )}

              {bankErrorMsg && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 animate-fade-in shadow-2xs">
                  <span className="font-bold text-red-600">!</span>
                  <span>{bankErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveBank} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bank Name */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Bank Name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Commercial Bank of Ceylon"
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/20 shadow-2xs"
                    />
                  </div>

                  {/* Account Name */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Account Holder / Company Name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. SUSÁMÁ (PVT) LTD"
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/20 shadow-2xs"
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Account Number <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 1000 8492 4110"
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-300 rounded-md text-xs sm:text-sm font-mono text-stone-900 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/20 shadow-2xs"
                    />
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Branch / Code <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. Torrington (07)"
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/20 shadow-2xs"
                    />
                  </div>

                  {/* Customer Notice / Instructions */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Checkout Transfer Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="e.g. Transfer directly to our corporate bank account and attach your reference slip or transaction ID."
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/20 shadow-2xs resize-none"
                    />
                    <p className="text-[11px] text-stone-400 mt-1">
                      This note will be shown directly beneath the bank option on checkout.
                    </p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-500 text-xs">
                    <HiOutlineInformationCircle className="w-4 h-4 text-stone-400" />
                    <span>Values are saved directly to MySQL database</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isBankLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-105 text-white font-semibold text-xs sm:text-sm rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isBankLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving to Database...</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        <span>Save Bank Details</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Live Customer Preview Card */}
            <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-secondary flex items-center gap-1.5">
                  <HiOutlineSparkles className="w-4 h-4" />
                  Live Customer Checkout Preview
                </span>
                <span className="text-[11px] text-stone-500">How customers see this box at /checkout</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HiOutlineBuildingLibrary className="w-4 h-4 text-brand-secondary" />
                    <span className="text-xs font-semibold text-stone-900">Direct Bank Transfer / Deposit</span>
                  </div>
                  <span className="text-[10px] text-amber-900 font-medium px-2 py-0.5 rounded bg-amber-100/70 border border-amber-200">
                    {bankName || 'Commercial Bank'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  {instructions || 'Transfer directly to our corporate bank account and attach your reference slip.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-[11px]">
                  <div>
                    <span className="text-stone-500 block text-[10px]">Bank</span>
                    <span className="font-semibold text-stone-800">{bankName || 'Commercial Bank'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Account Name</span>
                    <span className="font-semibold text-stone-800">{accountName || 'SUSÁMÁ (PVT) LTD'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Account Number</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-stone-900">
                      <span>{accountNumber || '1000 8492 4110'}</span>
                      <HiOutlineDocumentDuplicate className="w-3.5 h-3.5 text-stone-400" />
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Branch</span>
                    <span className="font-semibold text-stone-800">{branch || 'Torrington (07)'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Shipping Settings */}
        {activeTab === 'shipping' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <h2 className="text-lg font-heading font-semibold text-stone-900 flex items-center gap-2">
                  <HiOutlineTruck className="w-5 h-5 text-brand-secondary" />
                  Islandwide Delivery Settings
                </h2>
                <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                  Configure free shipping threshold and standard courier delivery fees in Sri Lankan Rupees (LKR).
                </p>
              </div>

              {/* Status Notifications */}
              {shippingSuccessMsg && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fade-in shadow-2xs">
                  <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-medium">{shippingSuccessMsg}</span>
                </div>
              )}

              {shippingErrorMsg && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 animate-fade-in shadow-2xs">
                  <span className="font-bold text-red-600">!</span>
                  <span>{shippingErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveShipping} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Free Shipping Threshold (LKR)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-stone-400">
                        LKR
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        required
                        value={freeThreshold}
                        onChange={(e) => setFreeThreshold(Number(e.target.value))}
                        className="w-full pl-12 pr-3 py-2 bg-stone-50/50 border border-stone-300 rounded-md text-xs sm:text-sm font-mono text-stone-900 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/20 shadow-2xs"
                      />
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Orders at or above this amount receive free delivery islandwide.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Standard Courier Delivery Fee (LKR)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-stone-400">
                        LKR
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        required
                        value={shippingFee}
                        onChange={(e) => setShippingFee(Number(e.target.value))}
                        className="w-full pl-12 pr-3 py-2 bg-stone-50/50 border border-stone-300 rounded-md text-xs sm:text-sm font-mono text-stone-900 focus:outline-none focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary/20 shadow-2xs"
                      />
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Flat delivery fee charged when subtotal is below the threshold.
                    </p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-500 text-xs">
                    <HiOutlineInformationCircle className="w-4 h-4 text-stone-400" />
                    <span>Affects cart drawer calculations and checkout total</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isShippingLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-105 text-white font-semibold text-xs sm:text-sm rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isShippingLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        <span>Save Shipping Settings</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
