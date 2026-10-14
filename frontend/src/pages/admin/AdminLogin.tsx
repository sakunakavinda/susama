import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminStore } from '../../store/useAdminStore';
import { 
  HiOutlineLockClosed, 
  HiOutlineEnvelope, 
  HiOutlineShieldCheck, 
  HiOutlineArrowLeft,
  HiOutlineSparkles 
} from 'react-icons/hi2';

export default function AdminLogin() {
  const { login, isAuthenticated, isLoading, error, clearError } = useAdminStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      const destination = (location.state as any)?.from || '/admin';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      const destination = (location.state as any)?.from || '/admin';
      navigate(destination, { replace: true });
    } else {
      setLocalError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1015] flex flex-col justify-center items-center px-4 relative overflow-hidden font-body selection:bg-[#B48346] selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#B48346]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-rose-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Return to Store Link */}
      <Link 
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-stone-400 hover:text-white text-xs font-mono tracking-wider transition-colors"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        <span>BACK TO STOREFRONT</span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#B48346]/20 to-stone-900 border border-[#B48346]/30 mb-4 shadow-xl">
            <HiOutlineShieldCheck className="w-7 h-7 text-[#F3C082]" />
          </div>
          <h1 className="font-heading text-3xl tracking-[0.25em] font-light text-stone-100 uppercase">
            SUSÁMÁ
          </h1>
          <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#B48346] mt-1 font-medium">
            Executive Control Portal
          </p>
          <p className="text-xs text-stone-400 mt-2 max-w-xs mx-auto">
            Authorized administrative access for store operations and management.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#141820]/80 backdrop-blur-xl border border-stone-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Error Banner */}
          {(localError || error) && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <span className="font-mono font-bold text-rose-400">ERROR:</span>
              <p>{localError || error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-2">
                Executive Email
              </label>
              <div className="relative">
                <HiOutlineEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@susama.lk"
                  required
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 bg-[#0B0D11] border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-[#B48346] focus:ring-1 focus:ring-[#B48346] transition-colors placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#0B0D11] border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-[#B48346] focus:ring-1 focus:ring-[#B48346] transition-colors placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#B48346] to-[#966730] hover:from-[#C79456] hover:to-[#A8753B] text-white font-medium text-sm rounded-xl tracking-wider uppercase transition-all duration-200 shadow-lg shadow-[#B48346]/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <HiOutlineSparkles className="w-4 h-4" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Reminder */}
          <div className="mt-6 pt-5 border-t border-stone-800/80 text-center">
            <p className="text-[11px] font-mono text-stone-300 mb-1">
              DEFAULT SYSTEM CREDENTIALS:
            </p>
            <div className="inline-flex items-center gap-3 bg-stone-900/90 border border-stone-800 px-3 py-1.5 rounded-lg text-xs font-mono text-stone-300">
              <span className="text-[#F3C082]">admin@susama.lk</span>
              <span className="text-stone-400">•</span>
              <span className="text-stone-400">admin123</span>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <p className="text-center text-[11px] text-stone-400 mt-6 font-mono">
          Protected by Argon2 &amp; JWT 256-bit isolation. Unauthorized attempts are logged.
        </p>
      </div>
    </div>
  );
}
