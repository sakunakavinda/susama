import { useState, useEffect } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import {
  HiOutlineDocumentDuplicate,
  HiOutlineCheck,
  HiOutlineArrowDownTray,
  HiOutlineMagnifyingGlass
} from 'react-icons/hi2';

export default function AdminNewsletter() {
  const { getAuthHeaders } = useAdminStore();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/admin/subscribers', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSubscribers(data.data);
      }
    } catch (err) {
      console.error('Failed to load subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleCopyEmails = () => {
    const emails = subscribers.map(s => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      ['Email,Source,Subscribed At,Status', ...subscribers.map(s => `"${s.email}","${s.source || ''}","${s.subscribed_at || ''}","${s.is_active ? 'Active' : 'Unsubscribed'}"`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `susama_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = subscribers.filter(s =>
    s.email?.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="font-heading text-2xl font-light text-stone-100 flex items-center gap-3">
            <span>VIP Newsletter Subscribers</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-stone-800 text-[#F3C082] border border-stone-700">
              {subscribers.length} Members
            </span>
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            Island VIP community members subscribed to product releases and ceremonial hair rituals.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyEmails}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono uppercase tracking-wider rounded-xl border border-stone-700 transition-colors cursor-pointer"
          >
            {copied ? <HiOutlineCheck className="w-4 h-4 text-emerald-400" /> : <HiOutlineDocumentDuplicate className="w-4 h-4 text-[#B48346]" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy All Emails'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#B48346] hover:bg-[#C79456] text-white text-xs font-mono uppercase tracking-wider rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <HiOutlineArrowDownTray className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="w-full pl-9 pr-4 py-2 bg-[#141820] border border-stone-800 rounded-xl text-xs text-stone-200 placeholder:text-stone-300 focus:outline-none focus:border-[#B48346]"
        />
      </div>

      {/* Subscribers Table */}
      <div className="bg-[#141820] border border-stone-800/90 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E1015] text-stone-300 font-mono uppercase tracking-wider border-b border-stone-800">
              <tr>
                <th className="py-3.5 px-6">Subscriber Email</th>
                <th className="py-3.5 px-6">Sign-up Source</th>
                <th className="py-3.5 px-6">Joined Date</th>
                <th className="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-body">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-stone-300 font-mono">
                    <div className="w-8 h-8 border-2 border-[#B48346]/20 border-t-[#B48346] rounded-full animate-spin mx-auto mb-3"></div>
                    Loading subscribers...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-800/30 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-stone-200">
                      {s.email}
                    </td>
                    <td className="py-4 px-6 font-mono text-[#F3C082] uppercase text-[11px]">
                      {s.source || 'Homepage VIP'}
                    </td>
                    <td className="py-4 px-6 font-mono text-stone-300">
                      {new Date(s.subscribed_at || s.created_at).toLocaleDateString('en-LK', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-block text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full ${
                        s.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-stone-800 text-stone-300'
                      }`}>
                        {s.is_active ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-stone-300 font-mono">
                    No subscribers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
