import React, { useState, useEffect } from 'react';
import {
  HiXMark,
  HiStar,
  HiShoppingBag,
  HiHeart,
  HiOutlineHeart,
  HiCheck,
  HiPlus,
  HiMinus,
  HiSparkles,
  HiShieldCheck,
  HiTruck,
  HiArrowsPointingOut,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

export interface ModalProduct {
  id: string;
  name: string;
  slug?: string;
  category_id?: string;
  category_name?: string;
  categoryName?: string;
  category_slug?: string;
  sku?: string;
  description?: string;
  short_description?: string;
  full_description?: string;
  ingredients?: string;
  how_to_use?: string;
  base_price?: number | string;
  sale_price?: number | string | null;
  price?: string | number;
  originalPrice?: number | string | null;
  stock_quantity?: number;
  is_in_stock?: boolean | number;
  is_featured?: boolean | number;
  is_new_arrival?: boolean | number;
  primary_image?: string;
  image_url?: string;
  image?: string;
  images?: Array<{ id?: string; image_url: string }>;
  tag?: string;
  rating?: number;
  reviews?: number;
}

interface ProductReview {
  id: string;
  customer_name: string;
  rating: number;
  title?: string;
  comment: string;
  created_at?: string;
}

interface ProductDetailModalProps {
  product: ModalProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onAddedToCart?: (productName: string) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddedToCart
}: ProductDetailModalProps) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'ritual' | 'ingredients' | 'reviews'>('details');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newAuthor, setNewAuthor] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  // Reset state when a new product opens
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setActiveTab('details');
      setActiveImageIndex(0);
      setIsImageLightboxOpen(false);
      setIsWritingReview(false);
      setReviewSubmitSuccess(false);

      // Fetch verified product reviews
      setReviewsLoading(true);
      fetch(`http://localhost:5001/api/reviews/product/${product.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setReviews(data.data);
          } else {
            setReviews([]);
          }
        })
        .catch(() => setReviews([]))
        .finally(() => setReviewsLoading(false));
    }
  }, [product]);

  // Lock background scroll when modal or lightbox is open
  useEffect(() => {
    if (isOpen || isImageLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isImageLightboxOpen]);

  // Handle keyboard events (Escape to close lightbox)
  useEffect(() => {
    if (!isImageLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsImageLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageLightboxOpen]);

  if (!isOpen || !product) return null;

  // Calculate pricing
  const rawBase = product.base_price !== undefined && product.base_price !== null && product.base_price !== ''
    ? product.base_price
    : (product.originalPrice !== undefined && product.originalPrice !== null ? product.originalPrice : product.price);
  const basePriceNum = Number(rawBase) || 0;

  const rawSale = product.sale_price !== null && product.sale_price !== undefined && product.sale_price !== ''
    ? Number(product.sale_price)
    : (product.originalPrice && product.price ? Number(product.price) : null);
  const salePriceNum = rawSale !== null && !isNaN(rawSale) ? rawSale : null;
  const effectivePrice = salePriceNum !== null && !isNaN(salePriceNum) ? salePriceNum : basePriceNum;
  const hasDiscount = salePriceNum !== null && !isNaN(salePriceNum) && salePriceNum < basePriceNum;
  const discountPercent = hasDiscount
    ? Math.round(((basePriceNum - salePriceNum!) / basePriceNum) * 100)
    : 0;

  // Stock status
  const stockQuantity = product.stock_quantity !== undefined ? Number(product.stock_quantity) : 0;
  const isOutOfStock = stockQuantity <= 0 || product.is_in_stock === false;
  const isLowStock = !isOutOfStock && stockQuantity <= 5;

  // Collect all images (primary, image, image_url, images array)
  const allImages: string[] = [];
  const primaryImg = product.primary_image || product.image_url || product.image;
  if (primaryImg) allImages.push(primaryImg);
  if (Array.isArray(product.images)) {
    product.images.forEach((img) => {
      if (img.image_url && !allImages.includes(img.image_url)) {
        allImages.push(img.image_url);
      }
    });
  }
  if (allImages.length === 0) {
    allImages.push('https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop');
  }

  const currentDisplayImage = allImages[activeImageIndex] || allImages[0];


  const handleIncrement = () => {
    if (isOutOfStock) return;
    if (stockQuantity > 0 && quantity >= stockQuantity) return;
    setQuantity((q) => q + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    if (onAddedToCart) {
      onAddedToCart(product.name);
    }
    onClose();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newAuthor.trim() || !newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch('http://localhost:5001/api/reviews/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          customer_name: newAuthor.trim(),
          customer_email: newEmail.trim() || undefined,
          rating: newRating,
          title: newTitle.trim() || undefined,
          comment: newComment.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviewSubmitSuccess(true);
        if (data.data) {
          setReviews((prev) => [data.data, ...prev]);
        }
        setNewAuthor('');
        setNewEmail('');
        setNewTitle('');
        setNewComment('');
        setNewRating(5);
        setTimeout(() => {
          setIsWritingReview(false);
          setReviewSubmitSuccess(false);
        }, 2500);
      }
    } catch (err) {
      console.error('Review submit error:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 md:p-6 animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Card: Mobile Bottom Sheet + Desktop Centered Dialog */}
      <div
        className="bg-white w-full sm:max-w-4xl h-[94vh] max-h-[94vh] sm:h-auto sm:max-h-[88vh] rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-stone-200/90 flex flex-col overflow-hidden relative animate-slide-up sm:animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-9 h-9 rounded-full bg-white/95 sm:bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 shadow-md sm:shadow-xs flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Close product view"
        >
          <HiXMark className="w-5 h-5" />
        </button>

        {/* Scrollable Content Body (Desktop 2-Col, Mobile Stacked) */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-stone-100">
          
          {/* ══════════════════════════════════════════
              LEFT: PRODUCT MEDIA SHOWCASE
          ══════════════════════════════════════════ */}
          <div className="md:w-5/12 lg:w-1/2 p-2 sm:p-5 md:p-6 bg-stone-50/70 flex flex-col justify-between shrink-0">
            <div>
              {/* Main Image Frame (clickable to pop up image) */}
              <div
                className="relative h-40 sm:h-60 md:h-auto md:aspect-square w-full rounded-2xl overflow-hidden bg-white border border-stone-200/80 shadow-xs cursor-pointer group"
                onClick={() => setIsImageLightboxOpen(true)}
              >
                <img
                  src={currentDisplayImage}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                    isOutOfStock ? 'opacity-85 grayscale-[15%]' : ''
                  }`}
                  loading="eager"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop';
                  }}
                />

                {/* Top Badges Overlay */}
                <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10 pointer-events-none">
                  <div className="flex flex-col gap-1.5 items-start pointer-events-auto">
                    {isOutOfStock ? (
                      <span className="px-3 py-1 rounded-full bg-stone-900/90 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[10px] font-bold tracking-widest uppercase shadow-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        Out of stock
                      </span>
                    ) : (
                      <>
                        <span className="px-3 py-1 rounded-full bg-brand-primary text-white text-[10px] font-bold tracking-widest uppercase shadow-sm">
                          {product.tag || '100% BOTANICAL'}
                        </span>
                        {hasDiscount && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black text-[9px] tracking-wider uppercase shadow-xs">
                            -{discountPercent}% OFF
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Wishlist Button over Image */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist({
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        base_price: product.base_price,
                        sale_price: product.sale_price,
                        primary_image: currentDisplayImage,
                        category_name: product.category_name,
                        tag: product.tag,
                        rating: product.rating,
                        reviews: product.reviews,
                        short_description: product.short_description,
                        ingredients: product.ingredients,
                        how_to_use: product.how_to_use,
                        stock_quantity: product.stock_quantity,
                        is_in_stock: product.is_in_stock
                      });
                    }}
                    className={`w-9 h-9 rounded-full shadow-md backdrop-blur-md flex items-center justify-center transition-all cursor-pointer pointer-events-auto hover:scale-110 active:scale-95 ${
                      isInWishlist(product.id)
                        ? 'bg-white text-red-500 shadow-md'
                        : 'bg-white/90 text-stone-700 hover:text-red-500 hover:bg-white'
                    }`}
                    title={isInWishlist(product.id) ? 'Remove from favourites' : 'Save to favourites'}
                    aria-label="Toggle favourite"
                  >
                    {isInWishlist(product.id) ? (
                      <HiHeart className="w-5 h-5 fill-current text-red-500" />
                    ) : (
                      <HiOutlineHeart className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* View Product Image Pill Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsImageLightboxOpen(true);
                  }}
                  className="absolute bottom-2.5 right-2.5 z-10 px-2.5 py-1 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white backdrop-blur-md text-[10px] font-semibold tracking-wide flex items-center gap-1.5 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
                  title="Click to view full image popup"
                  aria-label="View product image"
                >
                  <HiArrowsPointingOut className="w-3.5 h-3.5" />
                  <span>View Image</span>
                </button>
              </div>

              {/* Multiple Images Gallery Thumbnails (if > 1) */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        activeImageIndex === idx
                          ? 'border-brand-primary ring-2 ring-brand-primary/20 scale-105'
                          : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Micro Trust Strip under Image */}
            <div className="hidden sm:grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-200/70 text-[11px] text-stone-600">
              <div className="flex items-center gap-1.5">
                <HiTruck className="w-4 h-4 text-brand-primary shrink-0" />
                <span>Islandwide 2-3 Day Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HiShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
                <span>100% Genuine Formula</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT: PRODUCT DETAILS & TABS
          ══════════════════════════════════════════ */}
          <div className="md:w-7/12 lg:w-1/2 p-3.5 sm:p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Category Eyebrow & Stock Count Display (Simple, borderless) */}
              <div className="flex items-center justify-between gap-2 mb-1.5 pr-8 sm:pr-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-brand-secondary tracking-widest uppercase">
                  {product.category_name || (product as any).categoryName || 'Ayurvedic Ritual'}
                </span>

                {/* Simple borderless stock count */}
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-rose-600 shrink-0 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    Out of stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-amber-600 shrink-0 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    Only {stockQuantity} in stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-emerald-600 shrink-0 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    {stockQuantity > 0 ? `${stockQuantity} in stock` : 'In stock'}
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h2 className="text-lg sm:text-2xl md:text-3xl font-heading font-extrabold text-stone-900 leading-snug tracking-tight mb-1 sm:mb-2">
                {product.name}
              </h2>

              {/* SKU & Star Rating Row */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3 text-xs">
                {product.sku && (
                  <span className="font-mono text-stone-400 uppercase text-[10px] sm:text-[11px] bg-stone-100 px-2 py-0.5 rounded-md">
                    SKU: {product.sku}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="flex items-center gap-1 text-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <HiStar className="w-4 h-4 fill-current text-amber-400" />
                  <span className="font-bold text-stone-800">{product.rating || 5.0}</span>
                  <span className="text-brand-primary underline ml-0.5 font-medium">
                    ({reviews.length || product.reviews || 0} reviews)
                  </span>
                </button>
              </div>

              {/* Simple, compact price row without bulky bordered boxes */}
              <div className="flex items-baseline gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-secondary font-mono">
                  LKR {effectivePrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-xs sm:text-sm text-stone-400 line-through font-mono">
                    LKR {basePriceNum.toLocaleString()}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Save LKR {(basePriceNum - effectivePrice).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Segmented Mobile-Friendly Navigation Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-stone-100 rounded-2xl mb-3 sm:mb-4 text-[11px] sm:text-xs font-bold text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-1 rounded-xl transition-all cursor-pointer truncate ${
                    activeTab === 'details'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ritual')}
                  className={`py-2 px-1 rounded-xl transition-all cursor-pointer truncate ${
                    activeTab === 'ritual'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <span className="sm:hidden">Ritual</span>
                  <span className="hidden sm:inline">Ritual & Use</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ingredients')}
                  className={`py-2 px-1 rounded-xl transition-all cursor-pointer truncate ${
                    activeTab === 'ingredients'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Ingredients
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className={`py-2 px-1 rounded-xl transition-all cursor-pointer truncate flex items-center justify-center gap-1 ${
                    activeTab === 'reviews'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <span>Reviews</span>
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 font-mono">
                    {reviews.length || product.reviews || 0}
                  </span>
                </button>
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'details' && (
                <div className="space-y-3 sm:space-y-4 animate-fade-in text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                  <p className="whitespace-pre-line">
                    {product.full_description || product.short_description || 'Handcrafted luxury Ayurvedic hair formulation enriched with pristine Ceylon herbal essences.'}
                  </p>

                  {/* Highlight Botanical Features */}
                  <div className="grid grid-cols-2 gap-2 pt-1 sm:pt-2">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center gap-1.5 sm:gap-2">
                      <HiSparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-semibold text-stone-800">Pure Botanicals</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-1.5 sm:gap-2">
                      <HiCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-semibold text-stone-800">Sulfate & Paraben Free</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Ritual & How to Use */}
              {activeTab === 'ritual' && (
                <div className="space-y-2.5 sm:space-y-3 animate-fade-in">
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50/70 border border-amber-200/80">
                    <span className="text-[11px] sm:text-xs font-bold text-brand-secondary uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                      <span>💡</span> Recommended Daily Ritual:
                    </span>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-light whitespace-pre-line">
                      {product.how_to_use || 'Dispense a modest quantity into damp palms. Gently massage through scalp to hair tips in circular restorative motions. Rinse thoroughly with lukewarm spring water.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Ingredients */}
              {activeTab === 'ingredients' && (
                <div className="space-y-2.5 sm:space-y-3 animate-fade-in">
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="text-[11px] sm:text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                      <span>🌿</span> Active Ingredients & Essence:
                    </span>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light whitespace-pre-line">
                      {product.ingredients || 'Ceylon Gotukola, Virgin Coconut Milk, Hibiscus Extract, Argan Kernel Oil, Brahmi, Aloe Vera Leaf Juice, Botanical Keratin, Vitamin E.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 4: Verified Customer Reviews */}
              {activeTab === 'reviews' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Write Review Toggle Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">
                      Customer Feedback ({reviews.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsWritingReview((prev) => !prev)}
                      className="px-3 py-1.5 rounded-full border border-stone-300 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      {isWritingReview ? 'Cancel Review' : '+ Write a Review'}
                    </button>
                  </div>

                  {/* Review Composer Form */}
                  {isWritingReview && (
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70">
                      {reviewSubmitSuccess ? (
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                          <HiCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          Thank you! Your verified review has been published.
                        </div>
                      ) : (
                        <form onSubmit={handleReviewSubmit} className="space-y-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-600">Your Rating:</span>
                            <div className="flex gap-1 text-amber-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewRating(star)}
                                  className="cursor-pointer focus:outline-hidden"
                                >
                                  <HiStar
                                    className={`w-4 h-4 ${
                                      star <= newRating ? 'fill-current text-amber-400' : 'text-stone-300'
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
                              value={newAuthor}
                              onChange={(e) => setNewAuthor(e.target.value)}
                              className="text-xs px-3 py-2 border border-stone-200 rounded-xl bg-white focus:outline-brand-primary"
                            />
                            <input
                              type="email"
                              placeholder="Email address (optional)"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              className="text-xs px-3 py-2 border border-stone-200 rounded-xl bg-white focus:outline-brand-primary"
                            />
                          </div>

                          <input
                            type="text"
                            placeholder="Headline (e.g. Silky and nourished hair!)"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl bg-white focus:outline-brand-primary"
                          />

                          <textarea
                            required
                            rows={2}
                            placeholder="Share your botanical experience with this formula... *"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl bg-white focus:outline-brand-primary resize-none"
                          />

                          <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="px-5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-secondary transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                          >
                            {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-2.5 max-h-[30vh] overflow-y-auto pr-1">
                    {reviewsLoading ? (
                      <div className="py-6 text-center text-xs text-stone-400">Loading verified reviews...</div>
                    ) : reviews.length === 0 ? (
                      <div className="py-6 text-center text-xs text-stone-400">
                        No reviews yet for this formulation. Be the first to share your experience!
                      </div>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-stone-900">{rev.customer_name}</span>
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <HiStar
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < Math.round(rev.rating) ? 'fill-current text-amber-400' : 'text-stone-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {rev.title && (
                            <h5 className="text-xs font-semibold text-stone-800 mb-0.5">"{rev.title}"</h5>
                          )}
                          <p className="text-xs text-stone-600 leading-relaxed font-light">{rev.comment}</p>
                          <div className="flex items-center gap-2 mt-2 pt-1 border-t border-stone-200/50 text-[10px] text-stone-400">
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <HiCheck className="w-2.5 h-2.5" /> Verified Purchase
                            </span>
                            {rev.created_at && (
                              <span>• {new Date(rev.created_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Micro spacer for scroll clearance */}
            <div className="h-4 sm:h-6" />
          </div>
        </div>

        {/* ══════════════════════════════════════════
            STICKY BOTTOM ACTION BAR (Ultra-mobile optimized)
        ══════════════════════════════════════════ */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-stone-200 p-2.5 sm:p-4 md:p-5 flex items-center gap-2.5 sm:gap-4 shrink-0 shadow-lg sm:shadow-none">
          {/* Quantity Stepper */}
          {!isOutOfStock && (
            <div className="flex items-center border border-stone-200 rounded-full bg-stone-50 p-1 shrink-0">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer shadow-2xs active:scale-90"
                aria-label="Decrease quantity"
              >
                <HiMinus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 sm:w-8 text-center text-xs font-bold text-stone-900 font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={stockQuantity > 0 && quantity >= stockQuantity}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer shadow-2xs active:scale-90"
                aria-label="Increase quantity"
              >
                <HiPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Primary Action Button */}
          {isOutOfStock ? (
            <button
              disabled
              className="flex-1 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed select-none shadow-none"
            >
              <HiShoppingBag className="w-4 h-4" />
              <span>Out of stock</span>
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 sm:py-3.5 px-5 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-105 active:scale-[0.99] text-white text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <HiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Add to Bag</span>
              <span className="opacity-90 font-mono text-[11px] sm:text-xs ml-1">
                • LKR {(effectivePrice * quantity).toLocaleString()}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FULLSCREEN POPUP IMAGE LIGHTBOX
      ══════════════════════════════════════════ */}
      {isImageLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setIsImageLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsImageLightboxOpen(false)}
            className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
            aria-label="Close image popup"
          >
            <HiXMark className="w-6 h-6" />
          </button>

          {/* Previous Arrow (if multi-image) */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
              }}
              className="absolute left-3 sm:left-6 z-[110] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
              aria-label="Previous image"
            >
              <HiChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Arrow (if multi-image) */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-3 sm:right-6 z-[110] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
              aria-label="Next image"
            >
              <HiChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Popup Image Container */}
          <div
            className="relative max-w-2xl sm:max-w-3xl max-h-[85vh] flex flex-col items-center justify-center animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentDisplayImage}
              alt={product.name}
              className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl select-none"
            />

            {/* Caption & Image Counter */}
            <div className="mt-3 text-center">
              <h3 className="text-white text-sm sm:text-base font-semibold truncate max-w-xs sm:max-w-md">
                {product.name}
              </h3>
              {allImages.length > 1 && (
                <span className="text-white/60 text-xs font-mono mt-0.5 block">
                  {activeImageIndex + 1} of {allImages.length}
                </span>
              )}
            </div>

            {/* Thumbnails in popup if multi-image */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 max-w-xs sm:max-w-md scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-white scale-105 shadow-md'
                        : 'border-white/30 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
