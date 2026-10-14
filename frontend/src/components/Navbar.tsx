import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { useWishlistStore } from '../store/useWishlistStore';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export default function Navbar() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const isLightPage = false;

  const { customer, isAuthenticated, openAuthModal, logout } = useAuthStore();
  const { openCart, getTotalItems } = useCartStore();
  const { getTotalItems: getTotalWishlistItems } = useWishlistStore();
  const totalCartItems = getTotalItems();
  const totalWishlistItems = getTotalWishlistItems();

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

  // Fetch products when search modal opens
  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
      if (allProducts.length === 0) {
        fetch('http://localhost:5001/api/products')
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              setAllProducts(data.data);
            }
          })
          .catch((err) => console.log('Products API error:', err));
      }
    }
  }, [isSearchModalOpen, allProducts.length]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
      }
    };
    if (isSearchModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen]);

  // Close mobile menu and search modal on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchModalOpen(false);
  }, [location]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchModalOpen(false);
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const searchResults = allProducts.filter((prod) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return false;
    return (
      prod.name?.toLowerCase().includes(q) ||
      prod.category_name?.toLowerCase().includes(q) ||
      prod.short_description?.toLowerCase().includes(q) ||
      prod.ingredients?.toLowerCase().includes(q)
    );
  });

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
            onClick={() => setIsSearchModalOpen(true)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full backdrop-blur-md border flex items-center justify-center hover:scale-105 active:scale-95 transition-all drop-shadow-xs cursor-pointer ${
              isLightPage 
                ? 'bg-stone-200/70 border-stone-300 text-stone-700 hover:bg-stone-300/80 hover:text-stone-900' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`} 
            title="Search Products"
            aria-label="Search Products"
          >
            <HiOutlineMagnifyingGlass className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Favourites Icon */}
          <Link 
            to="/wishlist" 
            className={`flex w-9 h-9 sm:w-10 sm:h-10 rounded-full backdrop-blur-md border items-center justify-center hover:scale-105 active:scale-95 transition-all relative drop-shadow-xs ${
              isLightPage 
                ? 'bg-stone-200/70 border-stone-300 text-stone-700 hover:bg-stone-300/80 hover:text-stone-900' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`} 
            title="Favourites"
            aria-label="Wishlist"
          >
            <HiOutlineHeart className="w-4 h-4 sm:w-5 sm:h-5" />
            {totalWishlistItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md leading-none animate-fade-in">
                {totalWishlistItems}
              </span>
            )}
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
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchModalOpen(true);
                }}
                className="flex items-center gap-1.5 hover:text-white py-1 cursor-pointer"
              >
                <HiOutlineMagnifyingGlass className="w-4 h-4 text-brand-primary" /> Search
              </button>
              <Link to="/wishlist" className="flex items-center gap-1.5 hover:text-white py-1">
                <HiOutlineHeart className="w-4 h-4 text-brand-primary" /> Favourites ({totalWishlistItems})
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

      {/* ── Global Search Modal ── */}
      {isSearchModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-28 px-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsSearchModalOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Header */}
            <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 border-b border-stone-100 flex items-center gap-3">
              <HiOutlineMagnifyingGlass className="w-5 h-5 sm:w-6 sm:h-6 text-brand-secondary shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search botanical shampoos, keratin, oils, mist..."
                className="w-full text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none font-medium bg-transparent"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  title="Clear"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="text-[11px] text-stone-500 hover:text-stone-900 px-2.5 py-1 rounded-md border border-stone-200 hover:bg-stone-50 font-mono uppercase tracking-wider cursor-pointer"
              >
                ESC
              </button>
            </form>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
              {searchQuery.trim() === '' ? (
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-3">
                    Popular Botanical Searches
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['Keratin', 'Rose Water', 'Hair Oil', 'Curl Cream', 'Scalp Care', 'Serum', 'Sulfate Free'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setIsSearchModalOpen(false);
                          navigate(`/products?search=${encodeURIComponent(tag)}`);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-brand-primary hover:text-white text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-stone-500 text-sm mb-3">No formulations found for "{searchQuery}".</p>
                  <button
                    onClick={() => {
                      setIsSearchModalOpen(false);
                      navigate('/products');
                    }}
                    className="text-xs font-semibold text-brand-secondary hover:underline cursor-pointer"
                  >
                    View All Products in Shop →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <span>{searchResults.length} Formulations Found</span>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-brand-secondary font-semibold hover:underline cursor-pointer"
                    >
                      View All in Shop →
                    </button>
                  </div>
                  {searchResults.slice(0, 5).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setIsSearchModalOpen(false);
                        navigate(`/products?search=${encodeURIComponent(prod.name)}`);
                      }}
                      className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all cursor-pointer group"
                    >
                      <img
                        src={prod.primary_image || prod.image_url || prod.image || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=300&auto=format&fit=crop'}
                        alt={prod.name}
                        className="w-12 h-12 object-cover rounded-xl bg-stone-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-bold text-brand-secondary uppercase tracking-widest block truncate">
                          {prod.category_name || 'Hair Care'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-stone-900 truncate group-hover:text-brand-secondary transition-colors">
                          {prod.name}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-bold font-mono text-stone-900 block">
                          LKR {Number(prod.sale_price || prod.base_price).toLocaleString()}
                        </span>
                        {prod.sale_price && (
                          <span className="text-[10px] text-stone-400 line-through font-mono">
                            LKR {Number(prod.base_price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-stone-100 text-center">
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full py-2.5 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white text-xs font-bold tracking-wider uppercase transition-colors shadow-xs cursor-pointer"
                    >
                      Show All Results for "{searchQuery}"
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
