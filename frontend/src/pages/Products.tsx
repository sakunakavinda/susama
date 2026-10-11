import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  HiStar, 
  HiShoppingBag, 
  HiOutlineMagnifyingGlass, 
  HiOutlineAdjustmentsHorizontal, 
  HiXMark, 
  HiCheck,
  HiOutlineHeart
} from 'react-icons/hi2';

export interface Product {
  id: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug: string;
  sku?: string;
  short_description?: string;
  full_description?: string;
  ingredients?: string;
  how_to_use?: string;
  base_price: number | string;
  sale_price?: number | string | null;
  stock_quantity?: number;
  is_in_stock?: boolean | number;
  is_featured?: boolean | number;
  is_new_arrival?: boolean | number;
  primary_image?: string;
  image_url?: string;
  images?: Array<{ id: string; image_url: string }>;
  tag?: string;
  rating?: number;
  reviews?: number;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  title?: string;
  comment: string;
  is_verified_purchase?: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'name'>('featured');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reviews State
  const [modalReviews, setModalReviews] = useState<Review[]>([]);
  const [modalReviewsLoading, setModalReviewsLoading] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'details' | 'reviews'>('details');
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewEmail, setNewReviewEmail] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  // Sync category param
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Fetch categories and products from backend
  useEffect(() => {
    fetch('http://localhost:5001/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
        }
      })
      .catch((err) => console.log('Categories API error:', err));

    fetch('http://localhost:5001/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped = data.data.map((item: any) => ({
            ...item,
            base_price: Number(item.base_price),
            sale_price: item.sale_price ? Number(item.sale_price) : null,
            tag: item.tag || (item.is_new_arrival ? 'NEW ARRIVAL' : (item.is_featured ? 'BESTSELLER' : undefined)),
            rating: item.rating ? Number(item.rating) : 5.0,
            reviews: item.reviews ? Number(item.reviews) : 0,
            primary_image: item.primary_image || item.image_url || ''
          }));
          setProducts(mapped);
        }
      })
      .catch((err) => console.log('Products API error:', err));
  }, []);

  // Fetch reviews for selected product in Quick View
  useEffect(() => {
    if (selectedProduct) {
      setModalReviewsLoading(true);
      setActiveModalTab('details');
      setReviewSubmitSuccess(false);
      fetch(`http://localhost:5001/api/reviews/product/${selectedProduct.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setModalReviews(data.data);
          } else {
            setModalReviews([]);
          }
        })
        .catch(() => setModalReviews([]))
        .finally(() => setModalReviewsLoading(false));
    } else {
      setModalReviews([]);
    }
  }, [selectedProduct]);

  // Submit product review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !newReviewAuthor.trim() || !newReviewComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch('http://localhost:5001/api/reviews/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          customer_name: newReviewAuthor.trim(),
          customer_email: newReviewEmail.trim() || undefined,
          rating: newReviewRating,
          title: newReviewTitle.trim() || undefined,
          comment: newReviewComment.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviewSubmitSuccess(true);
        setNewReviewAuthor('');
        setNewReviewEmail('');
        setNewReviewTitle('');
        setNewReviewComment('');
        const refreshed = await fetch(`http://localhost:5001/api/reviews/product/${selectedProduct.id}`);
        const refData = await refreshed.json();
        if (refData.success && Array.isArray(refData.data)) {
          setModalReviews(refData.data);
          if (refData.product) {
            setSelectedProduct((prev) => prev ? {
              ...prev,
              rating: refData.product.average_rating,
              reviews: refData.product.total_reviews
            } : null);
            setProducts((prev) => prev.map((p) => p.id === selectedProduct.id ? {
              ...p,
              rating: refData.product.average_rating,
              reviews: refData.product.total_reviews
            } : p));
          }
        }
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCategoryChange = (catIdOrSlug: string) => {
    setSelectedCategory(catIdOrSlug);
    if (catIdOrSlug === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catIdOrSlug });
    }
  };

  // Filter and Sort
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category Match
      const matchesCategory =
        selectedCategory === 'all' ||
        prod.category_id === selectedCategory ||
        prod.category_slug === selectedCategory;

      // Search Query Match
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch =
        term === '' ||
        prod.name.toLowerCase().includes(term) ||
        (prod.short_description && prod.short_description.toLowerCase().includes(term)) ||
        (prod.ingredients && prod.ingredients.toLowerCase().includes(term)) ||
        (prod.category_name && prod.category_name.toLowerCase().includes(term));

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      const priceA = Number(a.sale_price || a.base_price);
      const priceB = Number(b.sale_price || b.base_price);

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // Default order
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const addToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setToastMessage(`Added "${product.name}" to bag!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-brand-light text-gray-900 font-sans pb-24">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-fade-in">
          <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-white">
            <HiCheck className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <section className="relative bg-gray-950 text-white pt-32 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary/90 to-brand-primary/80 z-10" />
        <img 
          src="/hero-bg.jpg" 
          alt="SUSÁMÁ Haircare Collection" 
          className="absolute inset-0 w-full h-full object-cover object-center brightness-75"
        />
        <div className="relative z-20 max-w-5xl mx-auto text-center flex flex-col items-center">
          <span className="text-[11px] sm:text-xs font-extrabold tracking-[0.25em] text-white/90 uppercase mb-2">
            THE BOTANICAL HAIR RITUAL
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold tracking-tight mb-4 drop-shadow-md">
            The SUSÁMÁ Collection
          </h1>
          <p className="max-w-2xl text-xs sm:text-sm md:text-base text-white/90 font-light leading-relaxed mb-6">
            Explore our complete range of sulfate-free shampoos, conditioners, restorative keratin oils, curling creams, and botanical hair perfume mists.
          </p>
          <div className="w-16 h-1 bg-white/70 rounded-full" />
        </div>
      </section>

      {/* Controls & Filter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-30">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6">
          
          {/* Top Bar: Search & Sort */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Search shampoos, keratin, sprays, scents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-full bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort & Count */}
            <div className="flex items-center justify-between w-full md:w-auto gap-4">
              <span className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
                Showing <strong className="text-gray-900 font-bold">{filteredProducts.length}</strong> of {products.length} Products
              </span>

              <div className="flex items-center gap-2">
                <HiOutlineAdjustmentsHorizontal className="w-4 h-4 text-brand-primary hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-800 text-xs sm:text-sm rounded-full px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer font-medium"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 flex-shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-brand-secondary to-brand-primary text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Products ({products.length})
            </button>

            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id || selectedCategory === cat.slug;
              const count = products.filter(p => p.category_id === cat.id || p.category_slug === cat.slug).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug || cat.id)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 flex-shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-secondary to-brand-primary text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto shadow-md border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary mx-auto flex items-center justify-center mb-4 text-2xl">
              🔍
            </div>
            <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 font-light">
              We couldn't find any products matching your current filters. Try changing category or search terms.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setSearchParams({});
              }}
              className="px-6 py-2.5 rounded-full bg-brand-primary text-white text-xs sm:text-sm font-semibold hover:bg-brand-secondary transition-all shadow"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((prod) => {
              const imageSrc = prod.primary_image || prod.image_url || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop';
              const priceDisplay = prod.sale_price 
                ? `LKR ${Number(prod.sale_price).toLocaleString()}`
                : `LKR ${Number(prod.base_price).toLocaleString()}`;
              const basePriceDisplay = prod.sale_price ? `LKR ${Number(prod.base_price).toLocaleString()}` : null;

              return (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1.5"
                >
                  {/* Image & Badges */}
                  <div className="relative h-64 sm:h-72 overflow-hidden bg-gray-50">
                    <img 
                      src={imageSrc} 
                      alt={prod.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                      <span className="px-3 py-1 rounded-full bg-brand-primary/95 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold tracking-widest uppercase shadow">
                        {prod.tag || 'HAIR CARE'}
                      </span>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Wishlist toggle
                        }}
                        className="w-8 h-8 rounded-full bg-white/85 backdrop-blur-md text-gray-700 hover:text-red-500 hover:bg-white flex items-center justify-center transition-all shadow"
                        aria-label="Save to wishlist"
                      >
                        <HiOutlineHeart className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick View Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="px-4 py-2 rounded-full bg-white/95 text-gray-900 text-xs font-bold tracking-wider uppercase shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        Quick View
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Rating & Category */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-brand-secondary tracking-widest uppercase truncate max-w-[150px]">
                          {prod.category_name || 'Hair Care'}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400">
                          <HiStar className="w-3.5 h-3.5 fill-current" />
                          <span className="text-xs font-bold text-gray-700">{prod.rating || 4.9}</span>
                          <span className="text-[10px] text-gray-400">({prod.reviews || 25})</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-heading font-bold text-base sm:text-lg text-gray-900 mb-2 leading-snug group-hover:text-brand-secondary transition-colors">
                        {prod.name}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3 font-light">
                        {prod.short_description || prod.full_description}
                      </p>
                    </div>

                    {/* Price and Add to Bag Button */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-base sm:text-lg font-extrabold text-brand-secondary">
                          {priceDisplay}
                        </span>
                        {basePriceDisplay && (
                          <span className="text-[11px] text-gray-400 line-through font-light">
                            {basePriceDisplay}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => addToCart(prod, e)}
                        className="p-2.5 sm:p-3 rounded-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-200 cursor-pointer shadow-sm hover:scale-110 active:scale-95 flex items-center justify-center"
                        title="Add to Cart"
                        aria-label={`Add ${prod.name} to cart`}
                      >
                        <HiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick View Product Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col md:flex-row relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <HiXMark className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="md:w-1/2 relative bg-gray-100 min-h-[260px] md:min-h-[420px]">
              <img 
                src={selectedProduct.primary_image || selectedProduct.image_url || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop'} 
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-brand-primary text-white text-[10px] font-bold tracking-widest uppercase shadow">
                {selectedProduct.tag || 'PREMIUM HAIRCARE'}
              </span>
            </div>

            {/* Modal Details */}
            <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between max-h-[60vh] md:max-h-[500px]">
              <div>
                <span className="text-[10px] font-extrabold text-brand-secondary tracking-widest uppercase block mb-1">
                  {selectedProduct.category_name || 'Hair Care'}
                </span>

                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-gray-900 mb-2 leading-snug">
                  {selectedProduct.name}
                </h2>

                {selectedProduct.sku && (
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-3">
                    SKU: {selectedProduct.sku}
                  </span>
                )}

                {/* Rating */}
                <div 
                  className="flex items-center gap-1.5 text-amber-400 mb-3 cursor-pointer"
                  onClick={() => setActiveModalTab('reviews')}
                >
                  <HiStar className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold text-gray-800">{selectedProduct.rating || 5.0}</span>
                  <span className="text-xs text-brand-primary underline ml-1 font-medium">
                    ({modalReviews.length || selectedProduct.reviews || 0} customer reviews)
                  </span>
                </div>

                {/* Tabs Switcher */}
                <div className="flex border-b border-gray-100 gap-4 text-xs font-semibold mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('details')}
                    className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                      activeModalTab === 'details'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Overview &amp; Ritual
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('reviews')}
                    className={`pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeModalTab === 'reviews'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Verified Reviews ({modalReviews.length})
                  </button>
                </div>

                {activeModalTab === 'details' ? (
                  <>
                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-5">
                      <span className="text-2xl font-extrabold text-brand-secondary">
                        {selectedProduct.sale_price 
                          ? `LKR ${Number(selectedProduct.sale_price).toLocaleString()}`
                          : `LKR ${Number(selectedProduct.base_price).toLocaleString()}`}
                      </span>
                      {selectedProduct.sale_price && (
                        <span className="text-sm text-gray-400 line-through">
                          LKR {Number(selectedProduct.base_price).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light mb-4">
                      {selectedProduct.full_description || selectedProduct.short_description}
                    </p>

                    {/* Ingredients & How to Use Accordion style */}
                    {selectedProduct.how_to_use && (
                      <div className="bg-amber-50/60 rounded-xl p-3 mb-3 border border-amber-100">
                        <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block mb-1">
                          💡 How to Use:
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed font-light">
                          {selectedProduct.how_to_use}
                        </p>
                      </div>
                    )}

                    {selectedProduct.ingredients && (
                      <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                          🌿 Key Ingredients:
                        </span>
                        <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                          {selectedProduct.ingredients}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col gap-4 overflow-y-auto max-h-[35vh] pr-1 mb-3">
                    {modalReviewsLoading ? (
                      <div className="py-8 text-center text-xs text-gray-400">Loading reviews...</div>
                    ) : modalReviews.length === 0 ? (
                      <div className="py-6 text-center text-xs text-gray-400">
                        No reviews yet for this product. Be the first to share your experience!
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {modalReviews.map((rev) => (
                          <div key={rev.id} className="p-3 rounded-xl bg-stone-50 border border-gray-100/90 text-left">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-gray-900">{rev.customer_name}</span>
                              <div className="flex items-center gap-0.5 text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <HiStar
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < Math.round(rev.rating) ? 'fill-current text-amber-400' : 'text-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {rev.title && (
                              <h5 className="text-xs font-semibold text-gray-800 mb-0.5">"{rev.title}"</h5>
                            )}
                            <p className="text-xs text-gray-600 leading-relaxed font-light">{rev.comment}</p>
                            <div className="flex items-center gap-2 mt-2 pt-1 border-t border-gray-200/50 text-[10px] text-gray-400">
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <HiCheck className="w-2.5 h-2.5" /> Verified Buyer
                              </span>
                              {rev.created_at && (
                                <span>• {new Date(rev.created_at).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Write Review Form */}
                    <div className="mt-2 pt-3 border-t border-gray-100">
                      <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider block mb-2">
                        Write a Review
                      </span>
                      {reviewSubmitSuccess ? (
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                          <HiCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                          Thank you! Your verified review has been published.
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitReview} className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">Your Rating:</span>
                            <div className="flex gap-1 text-amber-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewReviewRating(star)}
                                  className="cursor-pointer focus:outline-hidden"
                                >
                                  <HiStar
                                    className={`w-4 h-4 ${
                                      star <= newReviewRating ? 'fill-current text-amber-400' : 'text-gray-200'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Your Name *"
                              value={newReviewAuthor}
                              onChange={(e) => setNewReviewAuthor(e.target.value)}
                              className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-brand-primary"
                            />
                            <input
                              type="email"
                              placeholder="Email (optional)"
                              value={newReviewEmail}
                              onChange={(e) => setNewReviewEmail(e.target.value)}
                              className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-brand-primary"
                            />
                          </div>

                          <input
                            type="text"
                            placeholder="Review Headline"
                            value={newReviewTitle}
                            onChange={(e) => setNewReviewTitle(e.target.value)}
                            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-brand-primary"
                          />

                          <textarea
                            required
                            rows={2}
                            placeholder="Your experience with this product... *"
                            value={newReviewComment}
                            onChange={(e) => setNewReviewComment(e.target.value)}
                            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-brand-primary resize-none"
                          />

                          <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="self-start text-[10px] font-bold tracking-wider uppercase px-4 py-1.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 btn-primary py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  <HiShoppingBag className="w-4 h-4" />
                  Add to Bag
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
