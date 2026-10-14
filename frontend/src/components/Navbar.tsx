import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HiOutlineShoppingBag, 
  HiOutlineMagnifyingGlass, 
  HiOutlineBars3, 
  HiOutlineXMark,
  HiOutlineHeart,
  HiOutlineUser,
  HiChevronDown,
  HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const isLightPage = false;

  const { customer, isAuthenticated, openAuthModal, logout } = useAuthStore();
  const { openCart, getTotalItems } = useCartStore();
  const totalCartItems = getTotalItems();

  useEffect(() => {
    fetch('http://localhost:5001/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
        }
      })
      .catch((err) => console.log('Categories API error:', err));
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="absolute top-0 left-0 right-0 w-full z-50 pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="w-full max-w-7xl mx-auto relative flex items-center justify-between h-16 sm:h-20">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group focus:outline-none">
            <img 
              src="/images/branding/logo.png" 
              alt="Susámá Logo" 
              className="h-8 sm:h-10 md:h-12 w-auto object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (Visible on lg screens 1024px+) */}
        <nav className="hidden lg:flex items-center justify-center gap-8 xl:gap-12 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <Link 
            to="/" 
            className={`text-base font-medium tracking-wide transition-colors py-2 drop-shadow-xs ${
              isLightPage ? 'text-stone-800 hover:text-brand-primary' : 'text-white hover:text-brand-primary'
            }`}
          >
            Home
          </Link>

          {/* Categories Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => setIsCategoryDropdownOpen(true)}
            onMouseLeave={() => setIsCategoryDropdownOpen(false)}
          >
            <button className={`flex items-center gap-1.5 text-base font-medium tracking-wide transition-colors py-2 drop-shadow-xs cursor-pointer ${
              isLightPage ? 'text-stone-800 hover:text-brand-primary' : 'text-white hover:text-brand-primary'
            }`}>
              Categories
              <HiChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180 text-brand-primary' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-gray-950/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 py-3 animate-fade-in z-50 text-white overflow-hidden">
                <div className="px-4 py-2 text-[10px] font-bold tracking-widest text-brand-primary/90 uppercase border-b border-white/10 text-center">
                  Product Categories
                </div>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.id}`}
                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-brand-primary/20 hover:text-brand-primary font-medium transition-all duration-200 text-center"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
                <div className="border-t border-white/10 mt-2 pt-2 px-4 text-center">
                  <Link
                    to="/products"
                    className="block text-xs text-brand-primary hover:text-white font-semibold uppercase tracking-wider py-1 transition-all inline-block hover:scale-105"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                  >
                    View All Products →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link 
            to="/products" 
            className={`text-base font-medium tracking-wide transition-colors py-2 drop-shadow-xs ${
              isLightPage ? 'text-stone-800 hover:text-brand-primary' : 'text-white hover:text-brand-primary'
            }`}
          >
            Shop
          </Link>
          <Link 
            to="/about" 
            className={`text-base font-medium tracking-wide transition-colors py-2 drop-shadow-xs ${
              isLightPage ? 'text-stone-800 hover:text-brand-primary' : 'text-white hover:text-brand-primary'
            }`}
          >
            Our Story
          </Link>
        </nav>

        {/* Right: Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Button */}
          <button 
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full backdrop-blur-md border flex items-center justify-center hover:scale-105 active:scale-95 transition-all drop-shadow-xs ${
              isLightPage 
                ? 'bg-stone-200/70 border-stone-300 text-stone-700 hover:bg-stone-300/80 hover:text-stone-900' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`} 
            title="Search"
            aria-label="Search"
          >
            <HiOutlineMagnifyingGlass className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Favourites Icon */}
          <Link 
            to="/wishlist" 
            className={`hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full backdrop-blur-md border items-center justify-center hover:scale-105 active:scale-95 transition-all relative drop-shadow-xs ${
              isLightPage 
                ? 'bg-stone-200/70 border-stone-300 text-stone-700 hover:bg-stone-300/80 hover:text-stone-900' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`} 
            title="Favourites"
            aria-label="Wishlist"
          >
            <HiOutlineHeart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md leading-none">
              0
            </span>
          </Link>

          {/* Profile Icon / Dropdown */}
          {isAuthenticated ? (
            <div 
              className="relative hidden md:block"
              onMouseEnter={() => setIsProfileDropdownOpen(true)}
              onMouseLeave={() => setIsProfileDropdownOpen(false)}
            >
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-primary/20 border border-brand-primary/50 flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white transition-all drop-shadow font-semibold text-sm cursor-pointer relative" 
                title={customer?.name || "Account"}
                aria-label="Account Menu"
              >
                {customer?.name ? customer.name.charAt(0).toUpperCase() : <HiOutlineUser className="w-4 h-4 sm:w-5 sm:h-5" />}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-stone-900 rounded-full"></span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-stone-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl py-2 z-50 text-white animate-fade-in">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-xs font-semibold text-amber-50 truncate">{customer?.name}</p>
                    <p className="text-[11px] text-stone-400 truncate">{customer?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-stone-300 hover:bg-white/10 hover:text-brand-primary transition-colors"
                  >
                    My Account & Addresses
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <HiOutlineArrowRightOnRectangle className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => openAuthModal('signin')}
              className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full backdrop-blur-md border items-center justify-center hover:scale-105 active:scale-95 transition-all drop-shadow-xs cursor-pointer ${
                isLightPage 
                  ? 'bg-stone-200/70 border-stone-300 text-stone-700 hover:bg-stone-300/80 hover:text-stone-900' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`} 
              title="Sign In / Register"
              aria-label="Sign In or Register"
            >
              <HiOutlineUser className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Cart Icon */}
          <button 
            onClick={openCart}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-primary text-white flex items-center justify-center hover:bg-brand-secondary hover:scale-105 active:scale-95 transition-all shadow-lg relative cursor-pointer" 
            title="Shopping Bag"
            aria-label="Shopping Bag"
          >
            <HiOutlineShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-white text-gray-900 text-[10px] font-extrabold rounded-full flex items-center justify-center shadow leading-none">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* Mobile/Tablet Menu Button (visible below lg) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full backdrop-blur-md border flex items-center justify-center hover:scale-105 active:scale-95 transition-all ${
              isLightPage 
                ? 'bg-stone-200/70 border-stone-300 text-stone-700 hover:bg-stone-300/80 hover:text-stone-900' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <HiOutlineXMark className="w-5 h-5" /> : <HiOutlineBars3 className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile / Tablet Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 mt-3 bg-gray-950/95 backdrop-blur-2xl border border-white/15 px-6 py-6 rounded-3xl shadow-2xl z-50 animate-fade-in text-white space-y-4">
            <div className="flex flex-col space-y-3 font-medium">
              <Link to="/" className="text-white hover:text-brand-primary text-base py-1">Home</Link>
              <Link to="/products" className="text-white hover:text-brand-primary text-base py-1">Shop All Products</Link>
              <Link to="/about" className="text-white hover:text-brand-primary text-base py-1">Our Story & Philosophy</Link>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <span className="block text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-3">Shop By Category</span>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <Link 
                    key={cat.id} 
                    to={`/products?category=${cat.id}`} 
                    className="py-1 text-xs text-gray-300 hover:text-brand-primary transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-brand-primary">›</span> {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
              <Link to="/wishlist" className="flex items-center gap-1.5 hover:text-white py-1">
                <HiOutlineHeart className="w-4 h-4 text-brand-primary" /> Favourites (0)
              </Link>
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link to="/profile" className="flex items-center gap-1.5 hover:text-white py-1">
                    <HiOutlineUser className="w-4 h-4 text-brand-primary" /> {customer?.name?.split(' ')[0] || 'Profile'}
                  </Link>
                  <button
                    onClick={logout}
                    className="text-red-400 text-xs hover:text-red-300 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('signin');
                  }}
                  className="flex items-center gap-1.5 text-brand-primary hover:text-white py-1 font-medium cursor-pointer"
                >
                  <HiOutlineUser className="w-4 h-4" /> Sign In / Join
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
