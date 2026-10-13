import { 
  FaPlay, 
  FaPause, 
  FaVolumeHigh, 
  FaVolumeXmark 
} from 'react-icons/fa6';

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiStar, 
  HiShoppingBag, 
  HiSparkles,
  HiCheck,
  HiXMark,
  HiArrowRight,
  HiOutlineHeart,
  HiChevronLeft,
  HiChevronRight,
  HiShieldCheck,
  HiTruck,
  HiHeart
} from 'react-icons/hi2';

interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  image?: string;
}

interface ProductItem {
  id: string;
  category_id?: string;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug?: string;
  price?: string;
  base_price?: number | string;
  sale_price?: number | string | null;
  rating?: number;
  reviews?: number;
  image?: string;
  primary_image?: string;
  image_url?: string;
  tag?: string;
  short_description?: string;
  full_description?: string;
  ingredients?: string;
  how_to_use?: string;
  sku?: string;
}

interface ReviewItem {
  id: string;
  product_id?: string | null;
  review_type?: 'overall' | 'product';
  product_name?: string;
  product_slug?: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  title?: string;
  comment: string;
  is_verified_purchase?: boolean;
  helpful_count?: number;
  created_at?: string;
}

interface OverallReviewsStats {
  average_rating: number;
  total_reviews: number;
  recommendation_percentage: number;
  rating_breakdown: Record<number, number>;
}


export default function Home() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Overall Brand Reviews State
  const [overallStats, setOverallStats] = useState<OverallReviewsStats | null>(null);
  const [overallReviews, setOverallReviews] = useState<ReviewItem[]>([]);
  const [isOverallModalOpen, setIsOverallModalOpen] = useState(false);
  const [overallAuthor, setOverallAuthor] = useState('');
  const [overallEmail, setOverallEmail] = useState('');
  const [overallRating, setOverallRating] = useState(5);
  const [overallTitle, setOverallTitle] = useState('');
  const [overallComment, setOverallComment] = useState('');
  const [isSubmittingOverall, setIsSubmittingOverall] = useState(false);
  const [overallSubmitSuccess, setOverallSubmitSuccess] = useState(false);

  // Product Reviews State
  const [modalReviews, setModalReviews] = useState<ReviewItem[]>([]);
  const [modalReviewsLoading, setModalReviewsLoading] = useState<boolean>(false);
  const [activeModalTab, setActiveModalTab] = useState<'details' | 'reviews'>('details');
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewEmail, setNewReviewEmail] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  // VIP Newsletter Club State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Video and Social Showcase State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ritualVideoUrl, setRitualVideoUrl] = useState<string>('/videos/ritual-video.mp4');
  const [ritualVideoHeading, setRitualVideoHeading] = useState<string>('The Ritual In Motion');
  const [ritualVideoDescription, setRitualVideoDescription] = useState<string>('');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleVideoMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsVideoMuted(videoRef.current.muted);
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || !videoRef.current.duration) return;
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setVideoProgress(isNaN(progress) ? 0 : progress);
  };

  useEffect(() => {
    // Fetch dynamic ritual video and description from database
    fetch('http://localhost:5001/api/settings/ritual-video')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.video_url) {
          setRitualVideoUrl(data.data.video_url);
        }
        if (data.success && data.data?.heading) {
          setRitualVideoHeading(data.data.heading);
        }
        if (data.success && data.data?.description) {
          setRitualVideoDescription(data.data.description);
        }
      })
      .catch((err) => console.log('Using default video setting:', err));

    // Fetch categories from database API
    fetch('http://localhost:5001/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
          console.log(data);
        }
      })
      .catch((err) => console.log('Categories API error:', err));

    // Fetch products from database API
    fetch('http://localhost:5001/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped = data.data.map((item: any) => ({
            ...item,
            base_price: Number(item.base_price),
            sale_price: item.sale_price ? Number(item.sale_price) : undefined,
            price: item.sale_price 
              ? `LKR ${Number(item.sale_price).toLocaleString()}`
              : `LKR ${Number(item.base_price).toLocaleString()}`,
            image: item.primary_image || item.image_url || '',
            tag: item.tag || (item.is_new_arrival ? 'NEW ARRIVAL' : (item.is_featured ? 'BESTSELLER' : undefined)),
            rating: item.rating ? Number(item.rating) : 5.0,
            reviews: item.reviews ? Number(item.reviews) : 0
          }));
          setProducts(mapped);
        }
      })
      .catch((err) => console.log('Products API error:', err));

    // Fetch overall brand reviews and calculated average rating math
    fetch('http://localhost:5001/api/reviews/overall')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.stats) setOverallStats(data.stats);
          if (Array.isArray(data.data)) setOverallReviews(data.data);
        }
      })
      .catch((err) => console.log('Overall reviews API error:', err));

    // Preload hero image for instant rendering
    const heroImg = new Image();
    heroImg.src = '/images/hero/home.jpg';
  }, []);

  // Submit an Overall Brand Experience Review
  const handleSubmitOverallReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overallAuthor.trim() || !overallComment.trim()) return;
    setIsSubmittingOverall(true);
    try {
      const res = await fetch('http://localhost:5001/api/reviews/overall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: overallAuthor.trim(),
          customer_email: overallEmail.trim() || undefined,
          rating: overallRating,
          title: overallTitle.trim() || undefined,
          comment: overallComment.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setOverallSubmitSuccess(true);
        setOverallAuthor('');
        setOverallEmail('');
        setOverallTitle('');
        setOverallComment('');
        // Recalculate and update overall stats & reviews list
        const refreshed = await fetch('http://localhost:5001/api/reviews/overall');
        const refData = await refreshed.json();
        if (refData.success) {
          if (refData.stats) setOverallStats(refData.stats);
          if (Array.isArray(refData.data)) setOverallReviews(refData.data);
        }
        setTimeout(() => {
          setIsOverallModalOpen(false);
          setOverallSubmitSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to submit overall review:', err);
    } finally {
      setIsSubmittingOverall(false);
    }
  };

  // Fetch reviews whenever a product is opened in Quick View
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

  // Submit a customer review
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
        // Refresh product reviews and update product rating/reviews in state
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

  const filteredProducts = products.filter((prod) => {
    if (selectedFilter === 'all') return true;
    return prod.category_id === selectedFilter || prod.category_slug === selectedFilter;
  });

  // Bestsellers State & 3-Second Infinite Forward Autoscroll
  const bestsellerProducts = products.filter(
    (p) => p.tag?.toUpperCase() === 'BESTSELLER'
  );
  // Slides array with clones at both ends for seamless forward wrapping: [last, ...items, first]
  const bestsellerSlides = bestsellerProducts.length > 1
    ? [
        bestsellerProducts[bestsellerProducts.length - 1],
        ...bestsellerProducts,
        bestsellerProducts[0]
      ]
    : bestsellerProducts;

  const [currentIndex, setCurrentIndex] = useState<number>(1);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);

  const nextBestseller = () => {
    if (bestsellerProducts.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      if (prev >= bestsellerProducts.length + 1) return prev;
      return prev + 1;
    });
  };

  const prevBestseller = () => {
    if (bestsellerProducts.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      if (prev <= 0) return prev;
      return prev - 1;
    });
  };

  const goToBestsellerSlide = (dotIdx: number) => {
    setIsTransitioning(true);
    setCurrentIndex(dotIdx + 1);
  };

  const handleTransitionEnd = () => {
    if (bestsellerProducts.length <= 1) return;
    if (currentIndex >= bestsellerProducts.length + 1) {
      // Smoothly scrolled forward past the last photo to the cloned first photo:
      // Instantly jump to the real first photo without animation
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else if (currentIndex <= 0) {
      // Scrolled backward past the first photo to the cloned last photo:
      // Instantly jump to the real last photo without animation
      setIsTransitioning(false);
      setCurrentIndex(bestsellerProducts.length);
    }
  };

  useEffect(() => {
    if (bestsellerProducts.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [bestsellerProducts.length]);

  const activeBestsellerRealIndex = bestsellerProducts.length > 0
    ? (currentIndex - 1 + bestsellerProducts.length) % bestsellerProducts.length
    : 0;

  const addToCart = (product: ProductItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setToastMessage(`Added "${product.name}" to bag!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setIsSubscribing(true);
    try {
      const res = await fetch('http://localhost:5001/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail.trim(), source: 'homepage_vip' })
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(data.message || 'Welcome to the SUSÁMÁ VIP Club! ✨');
        setNewsletterEmail('');
      } else {
        setToastMessage(data.message || 'Subscription failed. Please try again.');
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setToastMessage('Unable to subscribe. Please check your connection.');
    } finally {
      setIsSubscribing(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#FEFCFB] text-gray-900 overflow-x-hidden">

      {/* ── Toast notification ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[60] animate-fade-in">
          <div className="bg-gray-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center shrink-0">
              <HiCheck className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          1. HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative w-full min-h-[92vh] lg:min-h-screen flex items-center justify-center bg-gray-950 overflow-hidden">
        {/* Background image container with smooth luxury load transition */}
        <div className="absolute inset-0 bg-stone-950 overflow-hidden">
          <img
            src="/images/hero/home.jpg"
            alt="SUSÁMÁ Botanical Hair Care"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.includes('/images/hero/home.jpg')) {
                target.src = '/images/hero/hero-bg.jpg';
              }
            }}
            className="w-full h-full object-cover object-[center_20%] animate-hero-zoom"
          />
        </div>

        {/* Sophisticated luxury lighting overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-black/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/50 z-10" />
        <div className="absolute inset-0 bg-radial from-transparent via-amber-950/20 to-black/80 z-10" />

        {/* Hero content */}
        <div className="relative z-20 flex flex-col items-center text-center px-4 sm:px-6 md:px-8 w-full max-w-4xl mx-auto pt-28 sm:pt-36 pb-28">

          {/* Emblem with smooth reveal */}
          <div className="mb-6 sm:mb-8 animate-smooth-reveal">
            <img
              src="/images/branding/logo-emblem.png"
              alt="SUSÁMÁ Emblem"
              className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-float"
            />
          </div>

          {/* Brand Name Logo (SUSÁMÁ) - Gradually turns pure white while loading */}
          <div className="mb-6 sm:mb-8">
            <img
              src="/images/branding/font.png"
              alt="SUSÁMÁ"
              className="h-10 sm:h-14 md:h-18 lg:h-20 w-auto max-w-[85vw] object-contain mx-auto animate-turn-white"
            />
          </div>

          {/* Tagline */}
          <div className="flex items-center gap-3 sm:gap-6 w-full max-w-sm sm:max-w-xl mb-6 sm:mb-8 animate-fade-in delay-200">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/40 to-white/60" />
            <p className="text-[10px] sm:text-xs md:text-sm text-white/95 font-light tracking-[0.28em] sm:tracking-[0.35em] uppercase whitespace-nowrap drop-shadow-md">
              Natural Care, Timeless Beauty
            </p>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/40 to-white/60" />
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-white/80 max-w-lg mb-8 sm:mb-10 font-light leading-relaxed animate-fade-in delay-200 drop-shadow">
            Active keratin peptides and cold-pressed Ceylon island botanicals, formulated to restore vibrant strength, bounce, and mirror shine.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto animate-fade-in delay-300">
            <Link
              to="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm tracking-widest uppercase shadow-2xl shadow-brand-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-brand-secondary/40"
            >
              Shop the Collection <HiArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-medium px-8 sm:px-9 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 hover:-translate-y-0.5"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Scroll Indicator (Correctly pinned at section bottom) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none animate-fade-in delay-500">
          <span className="text-white/60 text-[9px] tracking-[0.25em] uppercase font-semibold">Scroll</span>
          <div className="w-px h-7 bg-gradient-to-b from-white/60 to-transparent" />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. TRUST PILLARS BAR (SLEEK & PROFESSIONAL)
      ══════════════════════════════════════════ */}
      <section className="w-full bg-[#FCFAF7] border-b border-stone-200/60 py-3 sm:py-3.5">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              { 
                icon: HiShieldCheck, 
                title: 'Sulfate & Paraben Free', 
                sub: 'Scalp & cuticle gentle' 
              },
              { 
                icon: HiSparkles, 
                title: 'Keratin Enriched', 
                sub: 'Restores strength & shine' 
              },
              { 
                icon: HiHeart, 
                title: 'Silky & Curly Care', 
                sub: 'Tailored for every texture' 
              },
              { 
                icon: HiTruck, 
                title: 'Islandwide Delivery', 
                sub: 'Fast & secure shipping' 
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 sm:gap-3 px-2 py-1 justify-start"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/10 border border-amber-200/60 flex items-center justify-center text-brand-primary shrink-0">
                  <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-xs font-semibold text-gray-900 tracking-tight truncate leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-light truncate leading-tight mt-0.5">
                    {item.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2.5. THE RITUAL IN MOTION (CINEMATIC VIDEO)
      ══════════════════════════════════════════ */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white via-amber-50/20 to-white relative overflow-hidden border-b border-gray-100">
        {/* Small Dotted Animated Background */}
        <div 
          className="absolute inset-0 animate-dotted-bg pointer-events-none opacity-90 z-0"
          style={{
            maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 85%)'
          }}
        />

        {/* Subtle atmospheric ambient glows */}
        <div className="absolute top-1/4 left-10 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-gray-900 tracking-tight">
              {ritualVideoHeading}
            </h2>
            {ritualVideoDescription && (
              <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-2 font-light leading-relaxed">
                {ritualVideoDescription}
              </p>
            )}
          </div>

          {/* 16:9 Cinematic Video Feature */}
          <div className="max-w-4xl mx-auto">
            <div className="w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-950 shadow-2xl border border-gray-800/80 group relative flex flex-col justify-between">
              
              {/* HTML5 16:9 Video element */}
              <video
                ref={videoRef}
                src={ritualVideoUrl}
                poster="/images/hero/home.jpg"
                autoPlay
                loop
                muted
                playsInline
                onTimeUpdate={handleVideoTimeUpdate}
                onError={() => {
                  if (ritualVideoUrl.endsWith('.mp4')) {
                    setRitualVideoUrl(ritualVideoUrl.replace('.mp4', '.MP4'));
                  } else if (ritualVideoUrl.endsWith('.MP4')) {
                    setRitualVideoUrl(ritualVideoUrl.replace('.MP4', '.mp4'));
                  }
                }}
                className="absolute inset-0 w-full h-full aspect-video object-cover object-center transition-transform duration-700 group-hover:scale-102"
              />

              {/* Dark Vignette Overlay for High Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />

              {/* Top Floating Controls */}
              <div className="relative z-20 p-3.5 sm:p-4.5 flex items-center justify-end">
                <button
                  onClick={toggleVideoMute}
                  aria-label={isVideoMuted ? 'Unmute video' : 'Mute video'}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 shadow-md"
                >
                  {isVideoMuted ? <FaVolumeXmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/90" /> : <FaVolumeHigh className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />}
                </button>
              </div>

              {/* Center Play / Pause Floating Toggle */}
              <div className="relative z-20 flex items-center justify-center my-auto">
                <button
                  onClick={toggleVideoPlay}
                  aria-label={isVideoPlaying ? 'Pause ritual video' : 'Play ritual video'}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl ${
                    isVideoPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100 ring-4 ring-white/30'
                  }`}
                >
                  {isVideoPlaying ? (
                    <FaPause className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  ) : (
                    <FaPlay className="w-5 h-5 sm:w-6 sm:h-6 text-white translate-x-0.5" />
                  )}
                </button>
              </div>

              {/* Bottom Scrub Progress Line */}
              <div className="relative z-20 w-full h-1 bg-white/20">
                <div 
                  className="h-full bg-gradient-to-r from-brand-primary to-amber-400 transition-all duration-150"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          BESTSELLERS AUTOSCROLL SHOWCASE (3s INTERVAL)
      ══════════════════════════════════════════ */}
      {bestsellerProducts.length > 0 && (
        <section className="w-full bg-[#FEFCFB] border-b border-amber-100/60 relative overflow-hidden">
          {/* Section Title */}
          <div className="w-full text-center pt-10 sm:pt-14 pb-6 sm:pb-8 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-gray-900 tracking-tight">
              Most-Loved Formulations
            </h2>
          </div>

          {/* Full Screen Width Showcase Container (Edge-to-Edge) */}
          <div className="relative w-full h-[520px] sm:h-[600px] md:h-[680px] overflow-hidden bg-black group">
            {/* Slider Track (1 image full screen width per slide with seamless forward loop) */}
            <div
              className="flex h-full"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: isTransitioning ? 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {bestsellerSlides.map((prod, idx) => {
                const isClone = idx === 0 || idx === bestsellerSlides.length - 1;
                const slideKey = isClone ? `bestseller-clone-${idx}` : `bestseller-item-${prod.id}`;
                const imageSrc =
                  prod.image ||
                  prod.primary_image ||
                  prod.image_url ||
                  'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop';
                const priceDisplay = prod.sale_price
                  ? `LKR ${Number(prod.sale_price).toLocaleString()}`
                  : (prod.price || `LKR ${Number(prod.base_price).toLocaleString()}`);

                return (
                  <div
                    key={slideKey}
                    onClick={() => setSelectedProduct(prod)}
                    className="w-full h-full flex-shrink-0 relative overflow-hidden cursor-pointer bg-neutral-950"
                  >
                    {/* Full Screen Width Product Image */}
                    <img
                      src={imageSrc}
                      alt={prod.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      loading={idx <= 2 ? 'eager' : 'lazy'}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop';
                      }}
                    />

                    {/* Top Badges: BESTSELLER Tag & Index counter */}
                    <div className="absolute top-6 left-6 sm:top-8 sm:left-10 z-20">
                      <span className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white text-xs sm:text-sm font-black tracking-widest uppercase shadow-xl flex items-center gap-2 border border-amber-300/40 backdrop-blur-md">
                        <HiSparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                        BESTSELLER
                      </span>
                    </div>

                    <div className="absolute top-6 right-6 sm:top-8 sm:right-10 z-20 flex items-center gap-2.5">
                      <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-xs sm:text-sm font-bold tracking-widest border border-white/20 shadow-md">
                        0{activeBestsellerRealIndex + 1} / 0{bestsellerProducts.length}
                      </span>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-brand-primary hover:bg-black/80 flex items-center justify-center border border-white/20 transition-all hover:scale-110 shadow-md"
                        aria-label="Add to wishlist"
                      >
                        <HiOutlineHeart className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    {/* Bottom Gradient Overlay with Full Product Details */}
                    <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-6 sm:p-8 md:p-12 pb-10 sm:pb-12 pt-20 sm:pt-28 text-left">
                      <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="max-w-2xl">
                          <div className="flex items-center gap-3 mb-2.5">
                            <div className="flex items-center gap-1.5 text-amber-400">
                              <HiStar className="w-4 h-4 fill-current" />
                              <span className="text-sm font-bold text-white">{prod.rating || 4.9}</span>
                              <span className="text-xs text-white/70">({prod.reviews || 42} reviews)</span>
                            </div>
                            {prod.category_name && (
                              <span className="text-[10px] sm:text-xs font-bold text-amber-300 bg-amber-500/25 border border-amber-400/40 px-3 py-0.5 rounded-full uppercase tracking-wider">
                                {prod.category_name}
                              </span>
                            )}
                          </div>

                          <h3 className="font-heading font-bold text-xl sm:text-3xl md:text-4xl text-white leading-tight mb-2.5 group-hover:text-amber-200 transition-colors drop-shadow">
                            {prod.name}
                          </h3>

                          <p className="text-xs sm:text-sm md:text-base text-white/85 line-clamp-2 leading-relaxed drop-shadow-xs max-w-xl">
                            {prod.short_description || prod.full_description}
                          </p>
                        </div>

                        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-end gap-3.5 shrink-0 pt-3 sm:pt-0 border-t border-white/15 sm:border-0">
                          <div className="text-left sm:text-right">
                            <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-none drop-shadow">
                              {priceDisplay}
                            </span>
                            {prod.sale_price && prod.base_price && (
                              <span className="block text-xs sm:text-sm text-white/60 line-through mt-1">
                                LKR {Number(prod.base_price).toLocaleString()}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(prod);
                              }}
                              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                            >
                              Quick View
                            </button>
                            <button
                              onClick={(e) => addToCart(prod, e)}
                              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-brand-primary hover:bg-brand-secondary text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
                            >
                              <HiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span>Add to Bag</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Floating Left Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevBestseller();
              }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl opacity-80 hover:opacity-100"
              aria-label="Previous best seller"
            >
              <HiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Floating Right Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextBestseller();
              }}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl opacity-80 hover:opacity-100"
              aria-label="Next best seller"
            >
              <HiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Clickable Pagination Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
              {bestsellerProducts.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToBestsellerSlide(dotIdx);
                  }}
                  aria-label={`Go to bestseller ${dotIdx + 1}`}
                  className={`transition-all duration-300 rounded-full ${
                    activeBestsellerRealIndex === dotIdx
                      ? 'w-8 h-2 bg-gradient-to-r from-amber-400 to-brand-primary shadow-sm'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>

            {/* Bottom 3s Auto-scroll Progress Indicator Line */}
            <div className="absolute bottom-0 inset-x-0 z-30 h-1 bg-white/20">
              <div
                key={activeBestsellerRealIndex}
                className="h-full bg-gradient-to-r from-brand-primary to-amber-400 animate-[bestsellerProgress_3s_linear]"
                style={{
                  animationDuration: '3000ms',
                  animationIterationCount: '1',
                  animationFillMode: 'forwards'
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          3. SHOP BY CATEGORY
      ══════════════════════════════════════════ */}
      <section className="w-full py-20 sm:py-24 md:py-28 bg-[#FEFCFB]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block text-[11px] sm:text-xs font-bold tracking-[0.25em] text-brand-secondary uppercase mb-3">
              Curated Botanical Haircare
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4 tracking-tight">
              Shop by Category
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full mx-auto" />
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {categories.map((category, idx) => {
              const displayImage = category.image_url || category.image;

              return (
                <Link
                  key={category.id || idx}
                  to={`/products?category=${category.slug || category.id}`}
                  className="group relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 bg-gray-950 aspect-[3/4] flex flex-col justify-end"
                >
                  {/* Category Image */}
                  {displayImage && (
                    <img
                      src={displayImage}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  )}

                  {/* High-contrast gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent z-10" />

                  {/* Bottom Content */}
                  <div className="relative z-20 p-5 sm:p-6 text-left">
                    <h3 className="text-base sm:text-lg font-heading font-bold text-white mb-1.5 leading-tight group-hover:text-brand-primary transition-colors duration-200">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-[11px] text-white/80 line-clamp-2 mb-3.5 leading-relaxed font-light">
                        {category.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white/95 tracking-wider uppercase group-hover:text-brand-primary transition-colors duration-200">
                      Explore Category <HiArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. PRODUCT COLLECTION
      ══════════════════════════════════════════ */}
      <section className="w-full py-20 sm:py-24 md:py-28 bg-stone-50/70 border-y border-gray-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header + Category Filters */}
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block text-[11px] sm:text-xs font-bold tracking-[0.25em] text-brand-primary uppercase mb-3">
              Signature Formulations
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4 tracking-tight">
              The Haircare Collection
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full mx-auto mb-8 sm:mb-10" />

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-3xl mx-auto">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer border ${
                  selectedFilter === 'all'
                    ? 'bg-gray-950 border-gray-950 text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                }`}
              >
                All Products ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFilter(cat.slug || cat.id)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer border whitespace-nowrap ${
                    selectedFilter === cat.id || selectedFilter === cat.slug
                      ? 'bg-gray-950 border-gray-950 text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredProducts.slice(0, 4).map((prod) => {
              const imageSrc = prod.image || prod.primary_image || prod.image_url || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop';
              const priceDisplay = prod.sale_price
                ? `LKR ${Number(prod.sale_price).toLocaleString()}`
                : (prod.price || `LKR ${Number(prod.base_price).toLocaleString()}`);

              return (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1.5 flex flex-col"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={imageSrc}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop';
                      }}
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-brand-primary text-white text-[9px] font-bold tracking-widest uppercase shadow-xs">
                      {prod.tag || 'HAIR CARE'}
                    </span>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-gray-400 hover:text-brand-primary hover:bg-white flex items-center justify-center shadow-xs transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                      aria-label="Add to wishlist"
                    >
                      <HiOutlineHeart className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 rounded-full bg-white text-gray-900 text-[11px] font-bold tracking-wider uppercase shadow-xl hover:bg-brand-primary hover:text-white transition-colors">
                        Quick View
                      </span>
                    </div>
                  </div>

                  {/* Product Meta */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <HiStar className="w-3.5 h-3.5 text-amber-400 fill-current" />
                        <span className="text-xs font-bold text-gray-700">{prod.rating || 4.9}</span>
                        <span className="text-[10px] text-gray-400">({prod.reviews || 30})</span>
                      </div>
                      {prod.category_name && (
                        <span className="text-[9px] font-bold text-brand-secondary uppercase tracking-wider truncate max-w-[110px]">
                          {prod.category_name}
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading font-bold text-sm sm:text-base text-gray-900 mb-1.5 leading-snug group-hover:text-brand-secondary transition-colors line-clamp-2">
                      {prod.name}
                    </h3>

                    <p className="text-[11px] sm:text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4 flex-1">
                      {prod.short_description || prod.full_description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-base sm:text-lg font-extrabold text-brand-secondary leading-none">
                          {priceDisplay}
                        </span>
                        {prod.sale_price && prod.base_price && (
                          <span className="block text-[10px] text-gray-400 line-through">
                            LKR {Number(prod.base_price).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => addToCart(prod, e)}
                        className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs"
                        aria-label={`Add ${prod.name} to cart`}
                      >
                        <HiShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Browse All Products CTA */}
          <div className="mt-12 sm:mt-16 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-4 rounded-full bg-gray-950 text-white font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:bg-brand-primary transition-all duration-300 hover:-translate-y-0.5"
            >
              Browse All {products.length} Formulations <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. BRAND PHILOSOPHY & STORY
      ══════════════════════════════════════════ */}
      <section className="w-full py-20 sm:py-24 md:py-32 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-center">

            {/* Editorial Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl aspect-square">
                <img
                  src="/images/branding/susama-beauty-craftsmanship.jpg"
                  alt="SUSÁMÁ Beauty Craftsmanship"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Floating Stat Card */}
              <div className="absolute -top-4 -right-3 sm:-top-6 sm:-right-6 z-10 bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-2xl border border-gray-100/80">
                <div className="flex items-center gap-1.5 mb-1">
                  <HiSparkles className="w-4 h-4 text-brand-primary" />
                  <span className="text-2xl font-heading font-extrabold text-gray-900">100%</span>
                </div>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 leading-tight block max-w-[130px]">
                  Botanical Oils &amp; Pure Keratin
                </span>
              </div>
              {/* Decorative Subtle Accent */}
              <div className="absolute -bottom-4 -left-4 w-28 h-28 opacity-20 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, #F49A42 1.5px, transparent 1.5px)',
                backgroundSize: '12px 12px'
              }} />
            </div>

            {/* Narrative Content */}
            <div className="order-1 lg:order-2 flex flex-col items-start">
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-brand-secondary uppercase mb-3 sm:mb-4">
                Our Philosophy
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-gray-900 leading-tight mb-5 sm:mb-6 tracking-tight">
                Crafted for Every Texture.{' '}
                <span className="text-gradient">Designed for Timeless Shine.</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-500 font-light leading-relaxed mb-6 sm:mb-8 max-w-lg">
                At <strong className="font-semibold text-gray-800">SUSÁMÁ</strong>, our hair rituals blend active keratin peptides, cold-pressed island oils, and pure botanical aromas to nourish from root to tip — respecting your hair's natural moisture barrier at every step.
              </p>

              <ul className="flex flex-col gap-3.5 mb-8 sm:mb-10">
                {[
                  'Zero sulfates, parabens, phthalates, or harsh synthetic silicones',
                  'Dermatologist tested and balanced for silky and curly hair textures',
                  'Enriched with precious Sri Lankan botanical oils and damask rose',
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-primary/15 text-brand-primary flex items-center justify-center shrink-0">
                      <HiCheck className="w-3 h-3" />
                    </span>
                    <span className="text-sm text-gray-600 font-light leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/about"
                className="btn-secondary text-xs sm:text-sm tracking-widest uppercase shadow-xs"
              >
                Discover Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. SOCIAL PROOF / OVERALL BRAND REVIEWS
      ══════════════════════════════════════════ */}
      <section className="w-full py-20 sm:py-24 bg-stone-50 border-t border-gray-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12">
            <span className="inline-block text-[11px] sm:text-xs font-bold tracking-[0.25em] text-brand-secondary uppercase mb-3">
              Overall Brand Experience
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4 tracking-tight">
              Loved by Silk &amp; Curl Lovers
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto font-light">
              Authentic verified customer ratings and experiences across Sri Lanka.
            </p>
          </div>

          {/* Math-Calculated Overall Rating Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100/90 max-w-4xl mx-auto mb-12 sm:mb-16 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-amber-50/70 border border-amber-100/80 shrink-0">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-heading">
                  {overallStats?.average_rating ? Number(overallStats.average_rating).toFixed(1) : '4.9'}
                </span>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mt-0.5">
                  out of 5.0
                </span>
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 mb-1.5">
                  {[...Array(5)].map((_, i) => (
                    <HiStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(overallStats?.average_rating || 4.9)
                          ? 'fill-current text-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xs font-bold text-gray-800">
                    {overallStats?.average_rating ? Number(overallStats.average_rating).toFixed(1) : '4.9'} Rating
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-light">
                  Based on <strong className="font-semibold text-gray-800">{overallStats?.total_reviews || overallReviews.length || 8}</strong> verified customer experiences in Sri Lanka
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    <HiCheck className="w-3 h-3" /> {overallStats?.recommendation_percentage || 100}% Satisfaction
                  </span>
                  <span className="text-[11px] text-gray-400 font-light">• Island-wide Delivery</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setIsOverallModalOpen(true)}
                className="w-full sm:w-auto btn-primary py-3.5 px-6 rounded-full text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md cursor-pointer hover:scale-105 transition-all"
              >
                <HiSparkles className="w-4 h-4" />
                Share Your Experience
              </button>
            </div>
          </div>

          {/* Smooth Continuous Scrolling Review Cards */}
          <div className="relative w-full overflow-hidden py-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            {/* Elegant Side Gradient Masks */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-stone-50 via-stone-50/80 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-stone-50 via-stone-50/80 to-transparent z-10" />

            <div className="animate-marquee-continuous flex gap-6 sm:gap-8">
              {(overallReviews.length > 0 ? [...overallReviews, ...overallReviews] : [
                {
                  id: '1',
                  customer_name: 'Dilini Senanayake',
                  rating: 5,
                  title: 'Exceptional luxury packaging and swift delivery',
                  comment: 'Ordered on Monday morning and received the package in Colombo by Tuesday afternoon. The gold-accented frosted amber glass bottles feel so luxurious on my vanity.',
                },
                {
                  id: '2',
                  customer_name: 'Kavinda Wickramasinghe',
                  rating: 5,
                  title: 'Finally, genuine salon-grade botanical haircare in Sri Lanka',
                  comment: 'SUSÁMÁ has completely raised the bar for Sri Lankan beauty brands. The aromas are naturally subtle rather than artificial, and customer care was wonderful.',
                },
                {
                  id: '3',
                  customer_name: 'Tharushi Jayawardena',
                  rating: 5,
                  title: 'Transformed my whole weekly hair ritual',
                  comment: 'I have sensitive scalp and usually dread trying new formulations. Every single product I received has been so gentle, non-irritating, and truly therapeutic.',
                },
                {
                  id: '4',
                  customer_name: 'Anoma Rathnayake',
                  rating: 5,
                  title: 'Authentic island botanicals that actually work',
                  comment: 'From the damask rose water to Ceylon sandalwood mists, you can instantly tell the ingredients are pure grade. My daughter and I are both hooked on the SUSÁMÁ ritual.',
                },
                {
                  id: '5',
                  customer_name: 'Ruwantha Perera',
                  rating: 5,
                  title: 'Unmatched quality and fast delivery to Galle',
                  comment: 'Delivered all the way down south to Galle in 2 days. The formulas work wonders against the coastal humidity and frizz. Will definitely order the full bundle again.',
                },
                {
                  id: '6',
                  customer_name: 'Shanika De Silva',
                  rating: 5,
                  title: 'The best local haircare investment I have made',
                  comment: 'Salon quality results right at home. It is so refreshing to see a Sri Lankan cosmetics brand delivering world-class formulations with genuine sulfate-free integrity.',
                }
              ].concat([
                {
                  id: '1-dup',
                  customer_name: 'Dilini Senanayake',
                  rating: 5,
                  title: 'Exceptional luxury packaging and swift delivery',
                  comment: 'Ordered on Monday morning and received the package in Colombo by Tuesday afternoon. The gold-accented frosted amber glass bottles feel so luxurious on my vanity.',
                },
                {
                  id: '2-dup',
                  customer_name: 'Kavinda Wickramasinghe',
                  rating: 5,
                  title: 'Finally, genuine salon-grade botanical haircare in Sri Lanka',
                  comment: 'SUSÁMÁ has completely raised the bar for Sri Lankan beauty brands. The aromas are naturally subtle rather than artificial, and customer care was wonderful.',
                },
                {
                  id: '3-dup',
                  customer_name: 'Tharushi Jayawardena',
                  rating: 5,
                  title: 'Transformed my whole weekly hair ritual',
                  comment: 'I have sensitive scalp and usually dread trying new formulations. Every single product I received has been so gentle, non-irritating, and truly therapeutic.',
                },
                {
                  id: '4-dup',
                  customer_name: 'Anoma Rathnayake',
                  rating: 5,
                  title: 'Authentic island botanicals that actually work',
                  comment: 'From the damask rose water to Ceylon sandalwood mists, you can instantly tell the ingredients are pure grade. My daughter and I are both hooked on the SUSÁMÁ ritual.',
                },
                {
                  id: '5-dup',
                  customer_name: 'Ruwantha Perera',
                  rating: 5,
                  title: 'Unmatched quality and fast delivery to Galle',
                  comment: 'Delivered all the way down south to Galle in 2 days. The formulas work wonders against the coastal humidity and frizz. Will definitely order the full bundle again.',
                },
                {
                  id: '6-dup',
                  customer_name: 'Shanika De Silva',
                  rating: 5,
                  title: 'The best local haircare investment I have made',
                  comment: 'Salon quality results right at home. It is so refreshing to see a Sri Lankan cosmetics brand delivering world-class formulations with genuine sulfate-free integrity.',
                }
              ])).map((review, i) => (
                <div 
                  key={`${review.id}-${i}`}
                  className="w-[320px] sm:w-[380px] shrink-0 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100/90 flex flex-col justify-between hover:shadow-lg transition-all duration-300 select-none"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, idx) => (
                          <HiStar 
                            key={idx} 
                            className={`w-4 h-4 ${idx < Math.round(review.rating) ? 'fill-current text-amber-400' : 'text-gray-200'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <HiCheck className="w-3 h-3" /> Verified Buyer
                      </span>
                    </div>
                    {review.title && (
                      <h4 className="font-heading font-bold text-base text-gray-900 mb-2 leading-snug line-clamp-1">
                        "{review.title}"
                      </h4>
                    )}
                    <p className="text-gray-600 text-sm leading-relaxed italic mb-6 line-clamp-3">
                      "{review.comment}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <h5 className="font-heading font-bold text-sm text-gray-900">{review.customer_name}</h5>
                      <span className="text-[11px] text-gray-400">Sri Lanka • Verified Brand Experience</span>
                    </div>
                    <span className="text-[10px] font-semibold text-brand-primary">
                      Overall Experience
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Modal for Submitting Overall Brand Review ── */}
      {isOverallModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOverallModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOverallModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center cursor-pointer transition-all"
            >
              <HiXMark className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest block mb-1">
              Customer Feedback
            </span>
            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">
              Rate Your Overall Experience
            </h3>
            <p className="text-xs text-gray-500 font-light mb-6">
              Tell us about your shopping, delivery, customer support, and brand experience with SUSÁMÁ.
            </p>

            {overallSubmitSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm flex items-center gap-2 font-medium">
                <HiCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                Thank you! Your verified overall experience has been published and recalculated into our score.
              </div>
            ) : (
              <form onSubmit={handleSubmitOverallReview} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-700">Overall Rating:</span>
                  <div className="flex gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setOverallRating(star)}
                        className="cursor-pointer focus:outline-hidden hover:scale-110 transition-transform"
                      >
                        <HiStar
                          className={`w-6 h-6 ${
                            star <= overallRating ? 'fill-current text-amber-400' : 'text-gray-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    value={overallAuthor}
                    onChange={(e) => setOverallAuthor(e.target.value)}
                    className="text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-brand-primary"
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={overallEmail}
                    onChange={(e) => setOverallEmail(e.target.value)}
                    className="text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-brand-primary"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Headline (e.g. Excellent service and rapid delivery!)"
                  value={overallTitle}
                  onChange={(e) => setOverallTitle(e.target.value)}
                  className="text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-brand-primary"
                />

                <textarea
                  required
                  rows={3}
                  placeholder="Share details of your overall brand experience with SUSÁMÁ... *"
                  value={overallComment}
                  onChange={(e) => setOverallComment(e.target.value)}
                  className="text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-brand-primary resize-none"
                />

                <button
                  type="submit"
                  disabled={isSubmittingOverall}
                  className="btn-primary py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingOverall ? 'Submitting...' : 'Post Overall Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          7. VIP NEWSLETTER CLUB
      ══════════════════════════════════════════ */}
      <section className="w-full relative overflow-hidden bg-gray-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-stone-900 to-amber-950/80" />
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        <div className="relative z-10 py-20 sm:py-24 md:py-28 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-xl mx-auto">
            <span className="inline-block text-[11px] sm:text-xs font-bold tracking-[0.3em] text-brand-primary uppercase mb-3">
              SUSÁMÁ VIP Club
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white mb-4 sm:mb-5 tracking-tight">
            Join Susama and be a part of the family
            </h2> 
            <p className="text-white/70 text-sm sm:text-base font-light mb-8 sm:mb-10 max-w-md mx-auto leading-relaxed">
              Subscribe for exclusive botanical hair rituals, seasonal care guides, and VIP-only invitations.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-5 py-3.5 rounded-full text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white shadow-sm"
                required
                disabled={isSubscribing}
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="bg-brand-primary text-white font-bold px-8 py-3.5 rounded-full hover:bg-brand-secondary transition-all duration-300 text-xs tracking-widest uppercase shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer disabled:opacity-60"
              >
                {isSubscribing ? 'Joining...' : 'Join Now'}
              </button>
            </form>

            <p className="text-white/40 text-[10px] mt-4 tracking-wide">No spam ever. Unsubscribe with one click.</p>
          </div>
        </div>
      </section>

      {/* ── Quick View Modal ── */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col md:flex-row relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all cursor-pointer hover:scale-110"
              aria-label="Close modal"
            >
              <HiXMark className="w-5 h-5" />
            </button>

            {/* Product Image */}
            <div className="md:w-5/12 relative bg-gray-50 min-h-[240px] md:min-h-auto shrink-0">
              <img
                src={selectedProduct.image || selectedProduct.primary_image || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop'}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop';
                }}
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-brand-primary text-white text-[10px] font-bold tracking-widest uppercase shadow-xs">
                {selectedProduct.tag || 'HAIR CARE'}
              </span>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto flex flex-col gap-4 max-h-[60vh] md:max-h-none">
              <div>
                <span className="text-[10px] font-bold text-brand-secondary tracking-widest uppercase">
                  {selectedProduct.category_name || 'Hair Care'}
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 mt-1 leading-snug">
                  {selectedProduct.name}
                </h2>
                {selectedProduct.sku && (
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mt-1 block">
                    SKU: {selectedProduct.sku}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveModalTab('reviews')}>
                <HiStar className="w-4 h-4 text-amber-400 fill-current" />
                <span className="text-xs font-bold text-gray-700">{selectedProduct.rating || 4.9}</span>
                <span className="text-xs text-brand-primary underline ml-1">
                  ({modalReviews.length || selectedProduct.reviews || 0} reviews)
                </span>
              </div>

              {/* Tabs Switcher */}
              <div className="flex border-b border-gray-100 gap-4 text-xs font-semibold">
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
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-extrabold text-brand-secondary">
                      {selectedProduct.sale_price
                        ? `LKR ${Number(selectedProduct.sale_price).toLocaleString()}`
                        : (selectedProduct.price || `LKR ${Number(selectedProduct.base_price).toLocaleString()}`)}
                    </span>
                    {selectedProduct.sale_price && (
                      <span className="text-sm text-gray-400 line-through">
                        LKR {Number(selectedProduct.base_price).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed font-light">
                    {selectedProduct.full_description || selectedProduct.short_description}
                  </p>

                  {selectedProduct.how_to_use && (
                    <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-100">
                      <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block mb-1">
                        💡 How to Use
                      </span>
                      <p className="text-xs text-gray-600 leading-relaxed">{selectedProduct.how_to_use}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-4 overflow-y-auto max-h-[38vh] pr-1">
                  {modalReviewsLoading ? (
                    <div className="py-8 text-center text-xs text-gray-400">Loading verified customer reviews...</div>
                  ) : modalReviews.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400">
                      No reviews yet for this product. Be the first to share your experience!
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {modalReviews.map((rev) => (
                        <div key={rev.id} className="p-3.5 rounded-xl bg-stone-50 border border-gray-100/90 text-left">
                          <div className="flex items-center justify-between mb-1.5">
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
                            <h5 className="text-xs font-semibold text-gray-800 mb-1">"{rev.title}"</h5>
                          )}
                          <p className="text-xs text-gray-600 leading-relaxed font-light">{rev.comment}</p>
                          <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-gray-200/50 text-[10px] text-gray-400">
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

                  {/* Add Review Form */}
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
                      <form onSubmit={handleSubmitReview} className="flex flex-col gap-2.5">
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
                            className="text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-brand-primary"
                          />
                          <input
                            type="email"
                            placeholder="Email (optional)"
                            value={newReviewEmail}
                            onChange={(e) => setNewReviewEmail(e.target.value)}
                            className="text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-brand-primary"
                          />
                        </div>

                        <input
                          type="text"
                          placeholder="Review Headline (e.g. Best curl cream!)"
                          value={newReviewTitle}
                          onChange={(e) => setNewReviewTitle(e.target.value)}
                          className="text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-brand-primary"
                        />

                        <textarea
                          required
                          rows={2}
                          placeholder="Share your experience with this product... *"
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          className="text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-brand-primary resize-none"
                        />

                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="self-start text-[11px] font-bold tracking-wider uppercase px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full btn-primary py-4 rounded-full text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg"
                >
                  <HiShoppingBag className="w-5 h-5" />
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

