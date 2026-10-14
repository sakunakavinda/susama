import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminStore } from '../../store/useAdminStore';
import {
  HiOutlineSquares2X2,
  HiOutlineShoppingBag,
  HiOutlineSparkles,
  HiOutlineTag,
  HiOutlineStar,
  HiOutlineCog6Tooth,
  HiOutlineEnvelope,
  HiOutlineArrowRightOnRectangle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineShieldCheck
} from 'react-icons/hi2';

export default function AdminLayout() {
  const { adminUser, isAuthenticated, logout, checkAuth } = useAdminStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  // Authenticate on mount
  useEffect(() => {
    let mounted = true;
    checkAuth().then((isValid) => {
      if (mounted) {
        setIsVerifying(false);
        if (!isValid) {
          navigate('/admin/login', { replace: true, state: { from: location.pathname } });
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, [checkAuth, navigate, location.pathname]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center text-stone-300">
        <div className="w-12 h-12 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase tracking-widest font-mono text-stone-400">Verifying Executive Session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: HiOutlineSquares2X2, exact: true },
    { name: 'Orders Pipeline', path: '/admin/orders', icon: HiOutlineShoppingBag },
    { name: 'Product Catalog', path: '/admin/products', icon: HiOutlineSparkles },
    { name: 'Categories', path: '/admin/categories', icon: HiOutlineTag },
    { name: 'Review Moderation', path: '/admin/reviews', icon: HiOutlineStar },
    { name: 'Store & Bank Settings', path: '/admin/settings', icon: HiOutlineCog6Tooth },
    { name: 'VIP Subscribers', path: '/admin/newsletter', icon: HiOutlineEnvelope },
  ];

  return (
    <div className="min-h-screen bg-[#0E1015] text-stone-100 flex flex-col md:flex-row font-body antialiased selection:bg-[#B48346] selection:text-white">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 bottom-0 z-50
        w-72 bg-[#141820] border-r border-stone-800/80
        flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        h-screen overflow-y-auto
      `}>
        {/* Brand Header */}
        <div>
          <div className="p-6 border-b border-stone-800/80 flex items-center justify-between">
            <Link to="/admin" className="flex flex-col">
              <span className="font-heading text-2xl tracking-[0.2em] font-light text-stone-100 flex items-center gap-2">
                SUSÁMÁ
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#B48346]"></span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-mono text-[#B48346] mt-0.5 font-medium">
                Executive Portal
              </span>
            </Link>
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-stone-400 hover:text-white p-1"
            >
              <HiOutlineXMark className="w-6 h-6" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            <p className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-stone-300">
              Navigation
            </p>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.exact 
                ? location.pathname === link.path || location.pathname === '/admin/dashboard'
                : location.pathname.startsWith(link.path);

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={`
                    flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-[#B48346]/20 to-[#B48346]/5 text-[#F3C082] border-l-4 border-[#B48346] shadow-sm'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#F3C082]' : 'text-stone-400'}`} />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User & Logout */}
        <div className="p-4 border-t border-stone-800/80 bg-[#11141A]/50 space-y-3">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg bg-stone-900/60 hover:bg-stone-800/80 text-xs text-stone-300 hover:text-white border border-stone-800/80 transition-colors"
          >
            <span className="flex items-center gap-2">
              <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-[#B48346]" />
              <span>Live Storefront</span>
            </span>
            <span className="text-[10px] uppercase font-mono text-stone-300 bg-stone-800 px-2 py-0.5 rounded">Preview</span>
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-[#B48346]/20 border border-[#B48346]/30 flex items-center justify-center text-[#F3C082] font-heading font-medium text-sm flex-shrink-0">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-stone-200 truncate">{adminUser?.name || 'Administrator'}</p>
                <p className="text-[10px] text-stone-300 font-mono truncate">{adminUser?.email || 'admin@susama.lk'}</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              title="Sign Out"
              className="p-2 text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
            >
              <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-[#141820]/90 backdrop-blur-md border-b border-stone-800/80 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800"
            >
              <HiOutlineBars3 className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-stone-300">
              <HiOutlineShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SUSÁMÁ CEYLON SECURE CONSOLE</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-stone-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SYSTEM ONLINE</span>
            </div>
            
            <div className="h-4 w-px bg-stone-800 hidden sm:block"></div>

            <span className="text-xs text-stone-400 font-mono">
              v1.4 Enterprise
            </span>
          </div>
        </header>

        {/* View Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
