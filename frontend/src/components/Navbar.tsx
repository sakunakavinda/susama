import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineShoppingBag, 
  HiOutlineMagnifyingGlass, 
  HiOutlineBars3, 
  HiOutlineXMark,
  HiOutlineHeart,
  HiOutlineUser,
  HiChevronDown
} from 'react-icons/hi2';

const CATEGORIES = [
  { id: 1, name: "Skincare Essentials", slug: "skincare-essentials" },
  { id: 2, name: "Luxury Serums", slug: "luxury-serums" },
  { id: 3, name: "Natural Cleansers", slug: "natural-cleansers" },
  { id: 4, name: "Face Oils & Creams", slug: "face-oils-creams" },
  { id: 5, name: "Sun Protection", slug: "sun-protection" }
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brand-light/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-brand-primary"
          >
            {isMobileMenuOpen ? <HiOutlineXMark className="w-6 h-6" /> : <HiOutlineBars3 className="w-6 h-6" />}
          </button>

          {/* Logo (SUSÁMÁ) */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Susámá Logo" 
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-brand-secondary font-medium transition-colors">
              Home
            </Link>

            {/* Categories Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsCategoryDropdownOpen(true)}
              onMouseLeave={() => setIsCategoryDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 text-gray-700 hover:text-brand-secondary font-medium transition-colors py-2">
                Categories
                <HiChevronDown className={`w-4 h-4 transition-transform ${isCategoryDropdownOpen ? 'rotate-180 text-brand-primary' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-3 animate-fade-in z-50">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                    Product Categories
                  </div>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.id}`}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-primary/10 hover:text-brand-primary font-medium transition-colors"
                      onClick={() => setIsCategoryDropdownOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-2 pt-2 px-4">
                    <Link
                      to="/products"
                      className="block text-xs text-brand-secondary hover:text-brand-primary font-semibold uppercase tracking-wider py-1"
                      onClick={() => setIsCategoryDropdownOpen(false)}
                    >
                      View All Products →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/products" className="text-gray-700 hover:text-brand-secondary font-medium transition-colors">
              Shop
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-brand-secondary font-medium transition-colors">
              Our Story
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="p-2 text-gray-700 hover:text-brand-secondary transition-colors" title="Search">
              <HiOutlineMagnifyingGlass className="w-6 h-6" />
            </button>

            {/* Favourites Icon */}
            <Link to="/wishlist" className="p-2 text-gray-700 hover:text-brand-secondary transition-colors relative" title="Favourites">
              <HiOutlineHeart className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Profile Icon */}
            <Link to="/profile" className="p-2 text-gray-700 hover:text-brand-secondary transition-colors" title="Account">
              <HiOutlineUser className="w-6 h-6" />
            </Link>

            {/* Cart Icon */}
            <button className="p-2 text-gray-700 hover:text-brand-secondary transition-colors relative" title="Shopping Cart">
              <HiOutlineShoppingBag className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Category Bar (Sub-Nav) for Desktop */}
      <div className="hidden md:block bg-brand-primary/5 border-t border-gray-100 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-8 text-xs font-medium tracking-wide uppercase text-gray-600">
          {CATEGORIES.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/products?category=${cat.id}`}
              className="hover:text-brand-primary transition-colors py-0.5 border-b-2 border-transparent hover:border-brand-primary"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4 shadow-lg absolute w-full z-50">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 font-medium hover:text-brand-primary">Home</Link>
          <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 font-medium hover:text-brand-primary">Shop All</Link>
          
          <div className="pt-2 border-t border-gray-100">
            <span className="block text-xs font-bold text-gray-400 uppercase mb-2">Categories</span>
            {CATEGORIES.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/products?category=${cat.id}`} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="block pl-3 py-1.5 text-sm text-gray-600 hover:text-brand-primary"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 font-medium hover:text-brand-primary pt-2 border-t border-gray-100">Our Story</Link>
        </div>
      )}
    </header>
  );
}
