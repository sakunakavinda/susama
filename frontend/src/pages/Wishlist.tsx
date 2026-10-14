import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineHeart, 
  HiHeart, 
  HiOutlineShoppingBag, 
  HiOutlineTrash, 
  HiStar, 
  HiOutlineArrowLeft,
  HiOutlineXMark,
  HiShoppingBag,
  HiCheck
} from 'react-icons/hi2';
import { useWishlistStore, type WishlistItem } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';

export default function Wishlist() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  const [selectedProduct, setSelectedProduct] = useState<WishlistItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAddToCart = (item: WishlistItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      base_price: item.originalPrice || item.price,
      sale_price: item.originalPrice && item.originalPrice > item.price ? item.price : null,
      primary_image: item.image,
      category_name: item.categoryName
    });
    showNotification(`"${item.name}" added to your shopping bag.`);
  };

  const handleAddAllToCart = () => {
    if (items.length === 0) return;
    items.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        slug: item.slug,
        price: item.price,
        base_price: item.originalPrice || item.price,
        sale_price: item.originalPrice && item.originalPrice > item.price ? item.price : null,
        primary_image: item.image,
        category_name: item.categoryName
      });
    });
    showNotification(`All ${items.length} formulations added to your shopping bag.`);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#FAF8F5] text-stone-900 pb-24">
      {/* Orange Top Header Banner */}
      <section className="relative bg-gray-950 text-white pt-32 sm:pt-36 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary/90 to-brand-primary/80 z-10" />
        <img 
          src="/images/hero/hero-bg.jpg" 
          alt="SUSÁMÁ Sanctuary" 
          className="absolute inset-0 w-full h-full object-cover object-center brightness-75"
        />
        <div className="relative z-20 max-w-5xl mx-auto text-center flex flex-col items-center">
          <span className="text-[11px] sm:text-xs font-extrabold tracking-[0.25em] text-white/90 uppercase mb-2">
            YOUR CURATED BOTANICAL SANCTUARY
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold tracking-tight mb-3 drop-shadow-md text-white">
            My Favourites & Wishlist
          </h1>
          <p className="max-w-xl text-xs sm:text-sm md:text-base text-white/90 font-light leading-relaxed mb-4">
            Saved Ceylon botanical hair rituals, restorative elixirs, and ayurvedic formulations.
          </p>
          <div className="w-16 h-1 bg-white/70 rounded-full" />
        </div>
      </section>

      {/* Main Wishlist Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between py-3 border-b border-stone-200 mb-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-brand-secondary transition-colors font-medium"
          >
            <HiOutlineArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <Link to="/" className="text-stone-500 hover:text-stone-900 transition-colors">Home</Link>
            <span className="text-stone-400">/</span>
            <span className="text-stone-900 font-semibold">Favourites</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
            <HiHeart className="w-3.5 h-3.5 text-brand-secondary" />
            <span>{items.length} {items.length === 1 ? 'item saved' : 'items saved'}</span>
          </div>
        </div>

        {/* Global Toast Notification */}
        {notification && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 shadow-xs animate-fade-in">
            <span className="flex items-center gap-2">
              <HiCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{notification}</span>
            </span>
            <button 
              onClick={() => setNotification(null)}
              className="text-stone-400 hover:text-stone-700"
            >
              <HiOutlineXMark className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-12 sm:p-16 text-center shadow-xs max-w-lg mx-auto space-y-5 my-8">
            <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-brand-secondary shadow-xs">
              <HiOutlineHeart className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-heading font-semibold text-stone-900 mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                Explore our catalog of Sri Lankan botanical hair rituals and click the heart icon on any formulation to save it here for later.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold text-xs sm:text-sm shadow-md hover:brightness-105 transition-all cursor-pointer"
              >
                <span>Discover Formulations</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-primary" />
                <span className="text-xs font-semibold text-stone-900">
                  {items.length} {items.length === 1 ? 'Curated Formulation' : 'Curated Formulations'}
                </span>
                <span className="text-stone-400 text-xs">•</span>
                <span className="text-stone-500 text-xs">Saved in your browser</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={clearWishlist}
                  className="px-3.5 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <HiOutlineTrash className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>

                <button
                  onClick={handleAddAllToCart}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-105 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <HiOutlineShoppingBag className="w-3.5 h-3.5" />
                  <span>Move All to Shopping Bag</span>
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-stone-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-primary text-white text-[9px] font-bold tracking-widest uppercase shadow-xs">
                        {item.tag || item.categoryName || 'HAIR CARE'}
                      </span>

                      {/* Remove from Favourites Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-red-500 flex items-center justify-center shadow-xs transition-transform hover:scale-110 cursor-pointer"
                        title="Remove from favourites"
                        aria-label={`Remove ${item.name} from wishlist`}
                      >
                        <HiHeart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    {/* Quick View Hover Button */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => setSelectedProduct(item)}
                        className="px-4 py-2 rounded-full bg-white text-stone-900 text-xs font-bold tracking-wider uppercase shadow-md hover:bg-brand-primary hover:text-white transition-colors cursor-pointer"
                      >
                        Quick View
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Category & Star Rating */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">
                          {item.categoryName || 'Ayurvedic Ritual'}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400">
                          <HiStar className="w-3.5 h-3.5 fill-current" />
                          <span className="text-xs font-bold text-stone-700">{item.rating || 4.9}</span>
                          <span className="text-[10px] text-stone-400">({item.reviews || 32})</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-heading font-semibold text-sm sm:text-base text-stone-900 line-clamp-1 mb-2">
                        {item.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-base sm:text-lg font-bold text-stone-900 font-mono">
                          LKR {item.price.toLocaleString()}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-stone-400 line-through font-mono">
                            LKR {item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action: Add to Shopping Bag */}
                    <button
                      onClick={(e) => handleAddToCart(item, e)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-105 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <HiOutlineShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick View Product Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col md:flex-row relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="md:w-1/2 aspect-square md:aspect-auto bg-stone-100 relative">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name} 
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-brand-primary text-white text-[10px] font-bold tracking-widest uppercase shadow">
                {selectedProduct.tag || selectedProduct.categoryName || 'BOTANICAL'}
              </span>
            </div>

            {/* Modal Content */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-brand-secondary tracking-widest uppercase">
                    {selectedProduct.categoryName || 'Formulation'}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <HiStar className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-bold text-stone-700">{selectedProduct.rating || 4.9}</span>
                  </div>
                </div>

                <h3 className="text-xl font-heading font-semibold text-stone-900 mb-2">
                  {selectedProduct.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-stone-900 font-mono">
                    LKR {selectedProduct.price.toLocaleString()}
                  </span>
                  {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-sm text-stone-400 line-through font-mono">
                      LKR {selectedProduct.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {selectedProduct.short_description && (
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    {selectedProduct.short_description}
                  </p>
                )}

                {selectedProduct.how_to_use && (
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 mb-3 text-xs">
                    <span className="text-[10px] font-bold text-brand-secondary uppercase block mb-1">
                      Ritual & Use
                    </span>
                    <p className="text-stone-700 leading-relaxed font-light">
                      {selectedProduct.how_to_use}
                    </p>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-stone-200 flex items-center gap-3">
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-105 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HiShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Bag</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
