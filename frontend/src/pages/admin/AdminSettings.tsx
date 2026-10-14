import { useState, useEffect } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import {
  HiOutlineBuildingLibrary,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineFilm
} from 'react-icons/hi2';

export default function AdminSettings() {
  const { getAuthHeaders } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'bank' | 'shipping' | 'ritual'>('bank');

  // Bank State
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isBankLoading, setIsBankLoading] = useState(false);
  const [bankMsg, setBankMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Shipping State
  const [freeThreshold, setFreeThreshold] = useState<number>(7500);
  const [shippingFee, setShippingFee] = useState<number>(450);
  const [isShippingLoading, setIsShippingLoading] = useState(false);
  const [shippingMsg, setShippingMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Ritual Video State
  const [videoUrl, setVideoUrl] = useState('/ritual-video.mp4');
  const [videoHeading, setVideoHeading] = useState('The Ritual In Motion');
  const [videoDescription, setVideoDescription] = useState('Watch the botanical curl transformation in action...');
  const [isRitualLoading, setIsRitualLoading] = useState(false);
  const [ritualMsg, setRitualMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load Settings from DB
  useEffect(() => {
    // Bank
    fetch('http://localhost:5001/api/settings/bank')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setBankName(data.data.bank_name || '');
          setAccountName(data.data.account_name || '');
          setAccountNumber(data.data.account_number || '');
          setBranch(data.data.branch || '');
          setInstructions(data.data.instructions || '');
        }
      })
      .catch(err => console.error('Error fetching bank settings:', err));

    // Shipping
    fetch('http://localhost:5001/api/settings/shipping')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setFreeThreshold(Number(data.data.free_shipping_threshold) || 7500);
          setShippingFee(Number(data.data.standard_shipping_fee) || 450);
        }
      })
      .catch(err => console.error('Error fetching shipping settings:', err));

    // Ritual Video
    fetch('http://localhost:5001/api/settings/ritual-video')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setVideoUrl(data.data.video_url || '/ritual-video.mp4');
          if (data.data.heading) setVideoHeading(data.data.heading);
          if (data.data.description) setVideoDescription(data.data.description);
        }
      })
      .catch(err => console.error('Error fetching ritual video settings:', err));
  }, []);

  // Save Bank
  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBankLoading(true);
    setBankMsg(null);

    try {
      const res = await fetch('http://localhost:5001/api/settings/bank', {
        method: 'POST',
        headers: getAuthHeaders(),
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
        setBankMsg({ type: 'success', text: 'Bank details saved to database and live in customer checkout!' });
      } else {
        setBankMsg({ type: 'error', text: data.message || 'Failed to update bank details' });
      }
    } catch {
      setBankMsg({ type: 'error', text: 'Failed to connect to backend server' });
    } finally {
      setIsBankLoading(false);
    }
  };

  // Save Shipping
  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsShippingLoading(true);
    setShippingMsg(null);

    try {
      const res = await fetch('http://localhost:5001/api/settings/shipping', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          free_shipping_threshold: Number(freeThreshold),
          standard_shipping_fee: Number(shippingFee)
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShippingMsg({ type: 'success', text: 'Shipping rates updated and active across checkout calculations!' });
      } else {
        setShippingMsg({ type: 'error', text: data.message || 'Failed to update shipping settings' });
      }
    } catch {
      setShippingMsg({ type: 'error', text: 'Failed to connect to backend server' });
    } finally {
      setIsShippingLoading(false);
    }
  };

  // Save Ritual Video
  const handleSaveRitual = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRitualLoading(true);
    setRitualMsg(null);

    try {
      const res = await fetch('http://localhost:5001/api/settings/ritual-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_url: videoUrl.trim(),
          heading: videoHeading.trim(),
          description: videoDescription.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRitualMsg({ type: 'success', text: 'Ritual motion video settings saved!' });
      } else {
        setRitualMsg({ type: 'error', text: data.message || 'Failed to update ritual settings' });
      }
    } catch {
      setRitualMsg({ type: 'error', text: 'Failed to connect to backend server' });
    } finally {
      setIsRitualLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-800">
        <h1 className="font-heading text-2xl font-light text-stone-100">
          Store &amp; Corporate Settings
        </h1>
        <p className="text-xs text-stone-300 mt-1">
          Configure corporate bank credentials for transfer checkout, delivery tariffs, and hero ritual media.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
        <button
          onClick={() => setActiveTab('bank')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'bank'
              ? 'bg-[#B48346] text-white font-medium shadow-sm'
              : 'bg-[#141820] text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <HiOutlineBuildingLibrary className="w-4 h-4" />
          <span>Bank Transfer Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'shipping'
              ? 'bg-[#B48346] text-white font-medium shadow-sm'
              : 'bg-[#141820] text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <HiOutlineTruck className="w-4 h-4" />
          <span>Delivery Rates &amp; Free Shipping</span>
        </button>

        <button
          onClick={() => setActiveTab('ritual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'ritual'
              ? 'bg-[#B48346] text-white font-medium shadow-sm'
              : 'bg-[#141820] text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <HiOutlineFilm className="w-4 h-4" />
          <span>Ritual Motion Video</span>
        </button>
      </div>

      {/* TAB 1: BANK DETAILS */}
      {activeTab === 'bank' && (
        <div className="bg-[#141820] border border-stone-800/90 rounded-2xl p-6 sm:p-8 shadow-xl max-w-3xl">
          <div className="mb-6">
            <h2 className="font-heading text-lg font-medium text-white flex items-center gap-2">
              <HiOutlineBuildingLibrary className="w-5 h-5 text-[#B48346]" />
              <span>Corporate Bank Account</span>
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              These details are presented to customers during Checkout when they choose "Direct Bank Transfer".
            </p>
          </div>

          {bankMsg && (
            <div className={`p-4 rounded-xl text-xs flex items-center gap-2 mb-6 ${
              bankMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
            }`}>
              <HiOutlineCheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{bankMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveBank} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase text-stone-300 mb-1.5">Bank Name *</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Commercial Bank of Ceylon"
                  required
                  className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                />
              </div>

              <div>
                <label className="block uppercase text-stone-300 mb-1.5">Branch Name / Code *</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Torrington Branch (07)"
                  required
                  className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase text-stone-300 mb-1.5">Account Beneficiary Name *</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. SUSÁMÁ (PVT) LTD"
                  required
                  className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                />
              </div>

              <div>
                <label className="block uppercase text-stone-300 mb-1.5">Account Number *</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 1000 8492 4110"
                  required
                  className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase text-stone-300 mb-1.5">Deposit Instructions for Customer</label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Transfer directly to our account and submit reference number or deposit slip..."
                className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isBankLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#B48346] to-[#966730] hover:from-[#C79456] text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isBankLoading ? 'Saving...' : 'Save Bank Credentials'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SHIPPING RATES */}
      {activeTab === 'shipping' && (
        <div className="bg-[#141820] border border-stone-800/90 rounded-2xl p-6 sm:p-8 shadow-xl max-w-3xl">
          <div className="mb-6">
            <h2 className="font-heading text-lg font-medium text-white flex items-center gap-2">
              <HiOutlineTruck className="w-5 h-5 text-[#B48346]" />
              <span>Islandwide Delivery Rates</span>
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              Adjust your complimentary free shipping qualifying threshold and standard courier fee.
            </p>
          </div>

          {shippingMsg && (
            <div className={`p-4 rounded-xl text-xs flex items-center gap-2 mb-6 ${
              shippingMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
            }`}>
              <HiOutlineCheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{shippingMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveShipping} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase text-stone-300 mb-1.5">
                  Free Delivery Qualifying Subtotal (LKR) *
                </label>
                <input
                  type="number"
                  value={freeThreshold}
                  onChange={(e) => setFreeThreshold(Number(e.target.value))}
                  placeholder="7500"
                  required
                  className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                />
                <p className="text-[11px] text-stone-300 mt-1">
                  Orders equal or above this amount will receive complimentary delivery.
                </p>
              </div>

              <div>
                <label className="block uppercase text-stone-300 mb-1.5">
                  Standard Islandwide Shipping Fee (LKR) *
                </label>
                <input
                  type="number"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  placeholder="450"
                  required
                  className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                />
                <p className="text-[11px] text-stone-300 mt-1">
                  Applied to orders below the free threshold.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isShippingLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#B48346] to-[#966730] hover:from-[#C79456] text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isShippingLoading ? 'Saving...' : 'Save Shipping Rates'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: RITUAL MOTION VIDEO */}
      {activeTab === 'ritual' && (
        <div className="bg-[#141820] border border-stone-800/90 rounded-2xl p-6 sm:p-8 shadow-xl max-w-3xl">
          <div className="mb-6">
            <h2 className="font-heading text-lg font-medium text-white flex items-center gap-2">
              <HiOutlineFilm className="w-5 h-5 text-[#B48346]" />
              <span>Hero Ritual Motion Video</span>
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              Configure the ceremonial application video and copy displayed on the homepage.
            </p>
          </div>

          {ritualMsg && (
            <div className={`p-4 rounded-xl text-xs flex items-center gap-2 mb-6 ${
              ritualMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
            }`}>
              <HiOutlineCheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{ritualMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveRitual} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block uppercase text-stone-300 mb-1.5">Video Source URL or Path</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="/ritual-video.mp4 or https://..."
                required
                className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
              />
            </div>

            <div>
              <label className="block uppercase text-stone-300 mb-1.5">Section Heading</label>
              <input
                type="text"
                value={videoHeading}
                onChange={(e) => setVideoHeading(e.target.value)}
                placeholder="The Ritual In Motion"
                required
                className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
              />
            </div>

            <div>
              <label className="block uppercase text-stone-300 mb-1.5">Description Narrative</label>
              <textarea
                rows={3}
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                placeholder="Watch the botanical curl transformation in action..."
                className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isRitualLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#B48346] to-[#966730] hover:from-[#C79456] text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isRitualLoading ? 'Saving...' : 'Save Ritual Video'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
