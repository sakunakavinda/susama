import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-800/80 pt-16 sm:pt-20 pb-12 w-full px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 sm:gap-8 lg:gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="sm:col-span-2 lg:col-span-2 flex flex-col items-start pr-0 sm:pr-6">
            <Link to="/" className="mb-4 inline-block">
              <img 
                src="/logo.png" 
                alt="SUSÁMÁ" 
                className="h-9 sm:h-11 w-auto object-contain brightness-110"
              />
            </Link>
            <p className="text-gray-400 text-xs sm:text-sm font-light leading-relaxed mb-6 max-w-sm">
              Formulated with island botanicals, keratin proteins, and pure floral extracts to deliver radiant, timeless hair health and effortless styling. Cruelty-free and vegan.
            </p>
            <div className="flex items-center gap-3 text-xs text-brand-primary font-semibold tracking-wider uppercase">
              <span>🌿 100% Botanical</span>
              <span>•</span>
              <span>🐇 Cruelty Free</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-white font-heading text-sm font-bold tracking-wider uppercase mb-1">
              Navigation
            </h4>
            <Link to="/" className="text-xs sm:text-sm text-gray-400 hover:text-brand-primary transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-xs sm:text-sm text-gray-400 hover:text-brand-primary transition-colors">
              Shop All
            </Link>
            <Link to="/about" className="text-xs sm:text-sm text-gray-400 hover:text-brand-primary transition-colors">
              Our Story
            </Link>
            <Link to="/wishlist" className="text-xs sm:text-sm text-gray-400 hover:text-brand-primary transition-colors">
              Wishlist
            </Link>
          </div>

          {/* Collections */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-white font-heading text-sm font-bold tracking-wider uppercase mb-1">
              Collections
            </h4>
            <Link to="/products?category=shampoos" className="text-xs sm:text-sm text-gray-400 hover:text-brand-primary transition-colors">
              Shampoos & Cleansers
            </Link>
            <Link to="/products?category=conditioners" className="text-xs sm:text-sm text-gray-400 hover:text-brand-primary transition-colors">
              Nourishing Conditioners
            </Link>
            <Link to="/products?category=hair-treatments" className="text-xs sm:text-sm text-gray-400 hover:text-brand-primary transition-colors">
              Hair Treatments & Oils
            </Link>
            <Link to="/products?category=curl-care-styling" className="text-xs sm:text-sm text-gray-400 hover:text-brand-primary transition-colors">
              Curl Care & Styling
            </Link>
            <Link to="/products?category=hair-perfumes" className="text-xs sm:text-sm text-gray-400 hover:text-brand-primary transition-colors">
              Hair Perfumes & Mists
            </Link>
          </div>

          {/* Customer Care */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-white font-heading text-sm font-bold tracking-wider uppercase mb-1">
              Customer Care
            </h4>
            <p className="text-xs text-gray-400">
              Colombo, Sri Lanka
            </p>
            <p className="text-xs text-gray-400">
              support@susama.lk
            </p>
            <p className="text-xs text-gray-400">
              +94 11 234 5678
            </p>
            <span className="text-[11px] text-brand-primary font-medium pt-1">
              Mon – Sat: 9am – 7pm
            </span>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} SUSÁMÁ Cosmetics. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-400 cursor-pointer">Shipping & Returns</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
