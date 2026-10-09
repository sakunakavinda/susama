import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineShoppingBag, 
  HiOutlineMagnifyingGlass, 
  HiOutlineBars3, 
  HiOutlineXMark,
  HiOutlineHeart,
  HiOutlineUser
} from 'react-icons/hi2';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <nav className="hidden md:flex gap-8">
            <Link to="/" className="text-gray-700 hover:text-brand-secondary font-medium transition-colors">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-brand-secondary font-medium transition-colors">Shop</Link>
            <Link to="/about" className="text-gray-700 hover:text-brand-secondary font-medium transition-colors">Our Story</Link>
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

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4 shadow-lg absolute w-full">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 font-medium hover:text-brand-primary">Home</Link>
          <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 font-medium hover:text-brand-primary">Shop All</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 font-medium hover:text-brand-primary">Our Story</Link>
        </div>
      )}
    </header>
  );
}
