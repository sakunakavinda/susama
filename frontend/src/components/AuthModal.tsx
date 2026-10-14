import { useState, useEffect } from 'react';
import { 
  HiOutlineXMark, 
  HiOutlineEnvelope, 
  HiOutlineLockClosed, 
  HiOutlineUser, 
  HiOutlineEye, 
  HiOutlineEyeSlash,
  HiCheck
} from 'react-icons/hi2';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    authModalMode, 
    closeAuthModal, 
    setAuthModalMode, 
    login, 
    register, 
    isLoading, 
    error,
    clearError
  } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [clientError, setClientError] = useState('');

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isAuthModalOpen) {
      clearError();
      setClientError('');
      setSuccessMessage('');
    }
  }, [isAuthModalOpen, authModalMode, clearError]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Prevent background scrolling when auth modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');
    clearError();

    // Client-side validation
    if (authModalMode === 'signup') {
      if (!name.trim()) {
        setClientError('Please enter your full name.');
        return;
      }
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setClientError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setClientError('Password must be at least 6 characters.');
      return;
    }

    if (authModalMode === 'signin') {
      const res = await login(email.trim(), password);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          closeAuthModal();
          setPassword('');
        }, 800);
      }
    } else {
      const res = await register(name.trim(), email.trim(), password);
      if (res.success) {
        setSuccessMessage('Welcome to the SUSÁMÁ family! Your account has been created.');
        setTimeout(() => {
          closeAuthModal();
          setName('');
          setEmail('');
          setPassword('');
        }, 1000);
      }
    }
  };

  const activeError = clientError || error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-950/75 backdrop-blur-md transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Card */}
      <div 
        className="relative w-full max-w-md bg-stone-900 border border-amber-500/20 text-white rounded-3xl shadow-2xl overflow-hidden z-10 transition-all transform scale-100 p-6 sm:p-8"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(244, 154, 66, 0.15)'
        }}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-secondary/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <HiOutlineXMark className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <img 
            src="/images/branding/logo.png" 
            alt="SUSÁMÁ" 
            className="h-8 w-auto mx-auto mb-3 object-contain drop-shadow" 
          />
          
          <h2 className="text-2xl sm:text-3xl font-heading font-medium tracking-tight text-amber-50">
            {authModalMode === 'signin' ? 'Welcome Back' : 'Create Customer Account'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xs mx-auto">
            {authModalMode === 'signin'
              ? 'Sign in to access your orders, rituals, and exclusive benefits.'
              : 'Join the circle for curated botanical hair & beauty formulations.'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-stone-950/60 rounded-xl border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => setAuthModalMode('signin')}
            className={`py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
              authModalMode === 'signin'
                ? 'bg-brand-primary text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthModalMode('signup')}
            className={`py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
              authModalMode === 'signup'
                ? 'bg-brand-primary text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alert Notifications */}
        {activeError && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs sm:text-sm flex items-start gap-2">
            <span className="text-red-400 font-bold">!</span>
            <span>{activeError}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs sm:text-sm flex items-center gap-2">
            <HiCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Sign Up Only) */}
          {authModalMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <HiOutlineUser className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dilini Senanayake"
                  className="w-full pl-11 pr-4 py-3 bg-stone-950/70 border border-white/15 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <HiOutlineEnvelope className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-11 pr-4 py-3 bg-stone-950/70 border border-white/15 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
                Password
              </label>
              {authModalMode === 'signin' && (
                <span className="text-[11px] text-brand-primary/90 hover:text-brand-primary cursor-pointer transition-colors">
                  Forgot?
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <HiOutlineLockClosed className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-11 pr-11 py-3 bg-stone-950/70 border border-white/15 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <HiOutlineEyeSlash className="w-5 h-5" />
                ) : (
                  <HiOutlineEye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Sign Up Perks */}
          {authModalMode === 'signup' && (
            <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-[11px] text-amber-200/90 space-y-1">
              <div className="flex items-center gap-1.5">
                <HiCheck className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
                <span>Seamless 1-click checkout & order tracking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HiCheck className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
                <span>Exclusive member gifts & seasonal botanical drops</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-110 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>
                {authModalMode === 'signin' ? 'Sign In to SUSÁMÁ' : 'Create My Account'}
              </span>
            )}
          </button>
        </form>

        {/* Bottom Switcher */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-stone-400">
          {authModalMode === 'signin' ? (
            <p>
              New to SUSÁMÁ?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('signup')}
                className="text-brand-primary font-semibold hover:underline cursor-pointer ml-1"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('signin')}
                className="text-brand-primary font-semibold hover:underline cursor-pointer ml-1"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
