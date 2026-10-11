import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiStar, 
  HiShoppingBag, 
  HiSparkles,
  HiCheck,
  HiXMark,
  HiArrowRight,
  HiOutlineHeart
} from 'react-icons/hi2';
import { 
  FaInstagram, 
  FaTiktok, 
  FaPlay, 
  FaPause, 
  FaVolumeHigh, 
  FaVolumeXmark, 
  FaHeart, 
  FaRegHeart,
  FaRegComment, 
  FaArrowUpRightFromSquare 
} from 'react-icons/fa6';

interface SocialPost {
  id: string;
  platform: 'instagram' | 'tiktok';
  author: string;
  handle: string;
  verified: boolean;
  avatar: string;
  image: string;
  likes: number;
  comments: number;
  caption: string;
  tags: string[];
  productName: string;
  productPrice: string;
}

const SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    platform: 'instagram',
    author: 'Ananya Perera',
    handle: '@ananya.curls',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    image: '/social-card-1.jpg',
    likes: 12480,
    comments: 348,
    caption: 'Day 14 using the @susama Botanical Curl Elixir. The frizz is completely gone and my curl definition has never felt this bouncy! 🌀✨',
    tags: ['#SusamaRitual', '#CurlyHairCare', '#CeylonBotanicals'],
    productName: 'Botanical Curl Elixir',
    productPrice: 'LKR 4,200'
  },
  {
    id: 'post-2',
    platform: 'tiktok',
    author: 'Kavindi Silva',
    handle: '@kavindi_curls',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    image: '/social-card-2.jpg',
    likes: 28940,
    comments: 892,
    caption: 'My complete wash-day routine with the Keratin Masque! The slip when detangling is unmatched. 10/10 Holy Grail 💆‍♀️🧴',
    tags: ['#HairCareRoutine', '#CurlCheck', '#NaturalHair'],
    productName: 'Nourishing Curl Masque',
    productPrice: 'LKR 3,850'
  },
  {
    id: 'post-3',
    platform: 'instagram',
    author: 'Salon Elixir Colombo',
    handle: '@salon_elixir.lk',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=120&q=80',
    image: '/social-card-3.jpg',
    likes: 15320,
    comments: 412,
    caption: 'Salon client transformation! Before & after Ceylon Keratin Infusion. Intense mirror shine without weighing down fine curls.',
    tags: ['#SalonMasterclass', '#CeylonKeratin', '#SilkyCurls'],
    productName: 'Keratin Repair Serum',
    productPrice: 'LKR 4,800'
  },
  {
    id: 'post-4',
    platform: 'instagram',
    author: 'Ruwi Alwis',
    handle: '@ruwi.botanicals',
    verified: false,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    image: '/social-card-4.jpg',
    likes: 9840,
    comments: 195,
    caption: 'Obsessed with the botanical fragrance of lotus & vetiver. Finally a clean Sri Lankan haircare brand made for tropical humidity! 🌸🌿',
    tags: ['#CleanBeautyLK', '#SusamaGlow', '#BotanicalCare'],
    productName: 'Botanical Scalp Elixir',
    productPrice: 'LKR 3,900'
  }
];


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

const CATEGORY_META_FALLBACK: Record<string, { title: string; tag: string; image: string; description: string }> = {
  'shampoos': { 
    title: "Shampoos & Cleansers", 
    tag: "🧴 GENTLE CLEANSING", 
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop",
    description: "Sulfate-free botanical cleansers for silky smoothness and curl preservation."
  },
  'conditioners': { 
    title: "Nourishing Conditioners", 
    tag: "💧 DEEP HYDRATION", 
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop",
    description: "Slip-rich moisture and detangling formulas that seal shine and eliminate friction."
  },
  'hair-treatments': { 
    title: "Hair Treatments & Oils", 
    tag: "✨ INTENSIVE REPAIR", 
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800&auto=format&fit=crop",
    description: "Restorative keratin oil that reconstructs fibers and repairs damage."
  },
  'curl-care-styling': { 
    title: "Curl Care & Styling", 
    tag: "🌀 DEFINE & BOUNCE", 
    image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=800&auto=format&fit=crop",
    description: "Miracle curling cream for bouncy, soft, touchable curls with zero crunch."
  },
  'hair-perfumes': { 
    title: "Hair Perfumes & Mists", 
    tag: "🌸 SIGNATURE ESSENCE", 
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop",
    description: "Long-lasting botanical mists in exotic Ceylon Sandalwood and Damask Rose."
  }
};

export default function Home() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Video and Social Showcase State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ritualVideoUrl, setRitualVideoUrl] = useState<string>('/ritual-video.mp4');
  const [ritualVideoHeading, setRitualVideoHeading] = useState<string>('The Ritual In Motion');
  const [ritualVideoDescription, setRitualVideoDescription] = useState<string>('');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [activeSocialTab, setActiveSocialTab] = useState<'all' | 'instagram' | 'tiktok'>('all');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    SOCIAL_POSTS.forEach(p => { initial[p.id] = p.likes; });
    return initial;
  });

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

  const toggleLikePost = (id: string) => {
    const isLiked = !!likedPosts[id];
    setLikedPosts(prev => ({ ...prev, [id]: !isLiked }));
    setLikeCounts(prev => ({
      ...prev,
      [id]: isLiked ? (prev[id] || 0) - 1 : (prev[id] || 0) + 1
    }));
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
  }, []);

  const filteredProducts = products.filter((prod) => {
    if (selectedFilter === 'all') return true;
    return prod.category_id === selectedFilter || prod.category_slug === selectedFilter;
  });

  const addToCart = (product: ProductItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setToastMessage(`Added "${product.name}" to bag!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
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
        {/* Background image */}
        <img
          src="/home.jpg"
          alt="SUSÁMÁ Botanical Hair Care"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.endsWith('/home.jpg')) {
              target.src = '/home.JPG';
            }
          }}
          className="absolute inset-0 w-full h-full object-cover object-[center_20%] scale-105"
        />

        {/* Sophisticated luxury lighting overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-black/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/50 z-10" />
        <div className="absolute inset-0 bg-radial from-transparent via-amber-950/20 to-black/80 z-10" />

        {/* Hero content */}
        <div className="relative z-20 flex flex-col items-center text-center px-4 sm:px-6 md:px-8 w-full max-w-4xl mx-auto pt-28 sm:pt-36 pb-28">

          {/* Emblem */}
          <div className="mb-6 sm:mb-8 animate-fade-in animate-float">
            <img
              src="/logo-emblem.png"
              alt="SUSÁMÁ Emblem"
              className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
            />
          </div>

          {/* Brand Name Logo */}
          <div className="mb-6 sm:mb-8 animate-fade-in delay-100">
            <img
              src="/font.png"
              alt="SUSÁMÁ"
              className="h-10 sm:h-14 md:h-18 lg:h-20 w-auto max-w-[85vw] object-contain drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)] mx-auto brightness-0 invert"
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
          2. TRUST PILLARS BAR
      ══════════════════════════════════════════ */}
      <section className="w-full bg-white border-b border-gray-100/80 shadow-xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {[
              { 
                icon: '🌿', 
                title: 'Sulfate & Paraben Free', 
                sub: 'Gentle on scalp and cuticles' 
              },
              { 
                icon: '✨', 
                title: 'Keratin Enriched', 
                sub: 'Restores strength & shine' 
              },
              { 
                icon: '🌀', 
                title: 'Silky & Curly Care', 
                sub: 'Customized for every hair texture' 
              },
              { 
                icon: '🚚', 
                title: 'Islandwide Delivery', 
                sub: 'Fast & secure shipping in Sri Lanka' 
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-4 py-3 sm:py-2 first:pt-0 pt-4 sm:pt-2"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-50/90 border border-amber-100 flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-xs">
                  {item.icon}
                </div>
                <div className="text-left">
                  <h4 className="font-heading text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed mt-0.5">
                    {item.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2.5. IN MOTION & SOCIAL MEDIA CONTENT CARDS
      ══════════════════════════════════════════ */}
      <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white via-amber-50/20 to-white relative overflow-hidden border-b border-gray-100">
        {/* Subtle atmospheric ambient glows */}
        <div className="absolute top-1/4 left-10 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-5">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-gray-900 tracking-tight">
                {ritualVideoHeading}
              </h2>
              {ritualVideoDescription && (
                <p className="text-xs sm:text-sm md:text-base text-gray-500 max-w-xl mt-2 font-light leading-relaxed">
                  {ritualVideoDescription}
                </p>
              )}
            </div>

            {/* Social Platform Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-gray-100/90 p-1.5 rounded-full w-fit border border-gray-200/60 self-start md:self-auto">
              {[
                { id: 'all', label: 'All Community' },
                { id: 'instagram', label: 'Instagram', icon: <FaInstagram className="w-3.5 h-3.5 text-pink-600" /> },
                { id: 'tiktok', label: 'TikTok', icon: <FaTiktok className="w-3 h-3 text-gray-900" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSocialTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                    activeSocialTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-100'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2-Column Responsive Showcase Layout: Video Left, Social Cards Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            
            {/* ── LEFT COLUMN (6 Cols): 16:9 Cinematic Video Feature ── */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              
              {/* 16:9 Aspect Ratio Video Player Card */}
              <div className="w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-950 shadow-2xl border border-gray-800/80 group relative flex flex-col justify-between">
                
                {/* HTML5 16:9 Video element */}
                <video
                  ref={videoRef}
                  src={ritualVideoUrl}
                  poster="/home.jpg"
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

            {/* ── RIGHT COLUMN (6 Cols): Social Media Content Cards (Compact to fit video height) ── */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full">
              
              {/* Cards Grid - Compact 2x2 to perfectly match the left column height */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 h-full">
                {SOCIAL_POSTS
                  .filter(post => activeSocialTab === 'all' || post.platform === activeSocialTab)
                  .map((post) => {
                    const isLiked = !!likedPosts[post.id];
                    const currentLikes = likeCounts[post.id] || post.likes;

                    return (
                      <div
                        key={post.id}
                        className="group bg-white rounded-2xl border border-gray-100 hover:border-amber-200/90 shadow-2xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between p-3 sm:p-3.5 overflow-hidden"
                      >
                        {/* Compact Header: Author Profile & Platform Pill */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={post.avatar}
                              alt={post.author}
                              className="w-6 h-6 rounded-full object-cover border border-gray-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <h5 className="text-[11px] font-bold text-gray-900 truncate leading-tight">
                                  {post.author}
                                </h5>
                                {post.verified && (
                                  <span className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center text-[7px] shrink-0 font-bold">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] text-gray-400 truncate leading-none mt-0.5">
                                {post.handle}
                              </p>
                            </div>
                          </div>

                          {/* Compact Platform Pill */}
                          <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shrink-0 ${
                            post.platform === 'instagram'
                              ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-pink-700 border border-pink-100'
                              : 'bg-gray-100 text-gray-900 border border-gray-200'
                          }`}>
                            {post.platform === 'instagram' ? (
                              <FaInstagram className="w-2.5 h-2.5 text-pink-600" />
                            ) : (
                              <FaTiktok className="w-2 h-2 text-black" />
                            )}
                            <span className="capitalize">{post.platform}</span>
                          </div>
                        </div>

                        {/* Compact Visual Thumbnail */}
                        <div className="relative h-20 sm:h-22 w-full overflow-hidden rounded-xl bg-gray-100 my-auto">
                          <img
                            src={post.image}
                            alt={post.caption}
                            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Hover Play Pill */}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <span className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-md text-gray-900 flex items-center justify-center shadow-md">
                              <FaPlay className="w-2.5 h-2.5 translate-x-0.5 text-gray-900" />
                            </span>
                          </div>

                          {/* Tagged Product Micro Pill on Image */}
                          <div className="absolute bottom-1.5 left-1.5 right-1.5">
                            <div className="bg-black/65 backdrop-blur-md border border-white/20 rounded-lg px-2 py-0.5 text-white flex items-center justify-between text-[9px]">
                              <span className="font-semibold truncate">
                                🌿 {post.productName}
                              </span>
                              <span className="text-amber-300 font-bold shrink-0 ml-1">
                                {post.productPrice}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Compact Caption & Footer in Single Block */}
                        <div className="mt-2 pt-2 border-t border-gray-100/90">
                          <p className="text-[11px] text-gray-600 line-clamp-1 leading-snug">
                            {post.caption}
                          </p>

                          {/* Engagement Row */}
                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-500">
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={() => toggleLikePost(post.id)}
                                className={`flex items-center gap-1 transition-all duration-200 ${
                                  isLiked ? 'text-rose-600 scale-105' : 'hover:text-rose-600'
                                }`}
                              >
                                {isLiked ? (
                                  <FaHeart className="w-2.5 h-2.5 text-rose-600" />
                                ) : (
                                  <FaRegHeart className="w-2.5 h-2.5" />
                                )}
                                <span className="font-medium">
                                  {currentLikes.toLocaleString()}
                                </span>
                              </button>

                              <span className="flex items-center gap-1 text-gray-400">
                                <FaRegComment className="w-2.5 h-2.5" />
                                {post.comments}
                              </span>
                            </div>

                            <Link
                              to="/products"
                              className="font-bold text-gray-400 hover:text-brand-primary flex items-center gap-1 transition-colors text-[9px] uppercase tracking-wider"
                            >
                              Shop <FaArrowUpRightFromSquare className="w-2 h-2" />
                            </Link>
                          </div>
                        </div>

                      </div>
                    );
                  })}
              </div>

              {/* Bottom Community Banner */}
              <div className="mt-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-900 text-base shrink-0">
                    📸
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">
                      Tag @susama.lk or #SusamaRitual
                    </h5>
                    <p className="text-[11px] text-gray-500">
                      Share your journey on Instagram &amp; TikTok to be featured in our collective.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 transition-colors shadow-xs"
                  >
                    <FaInstagram className="w-3 h-3 text-pink-600" />
                    <span>Follow</span>
                  </a>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 transition-colors shadow-xs"
                  >
                    <FaTiktok className="w-2.5 h-2.5 text-black" />
                    <span>Follow</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

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
              const fallbackKey = category.slug || 'shampoos';
              const meta = CATEGORY_META_FALLBACK[fallbackKey] || CATEGORY_META_FALLBACK['shampoos'];
              const displayImage = category.image_url || category.image || meta.image;

              return (
                <Link
                  key={category.id || idx}
                  to={`/products?category=${category.slug || category.id}`}
                  className="group relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 bg-gray-950 aspect-[3/4] flex flex-col justify-end"
                >
                  {/* Category Image */}
                  <img
                    src={displayImage}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop';
                    }}
                  />

                  {/* High-contrast gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent z-10" />

                  {/* Pill Tag */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[9px] font-bold text-white tracking-widest uppercase shadow-xs">
                      {meta.tag}
                    </span>
                  </div>

                  {/* Bottom Content */}
                  <div className="relative z-20 p-5 sm:p-6 text-left">
                    <h3 className="text-base sm:text-lg font-heading font-bold text-white mb-1.5 leading-tight group-hover:text-brand-primary transition-colors duration-200">
                      {category.name}
                    </h3>
                    <p className="text-[11px] text-white/80 line-clamp-2 mb-3.5 leading-relaxed font-light">
                      {category.description || meta.description}
                    </p>
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
            {filteredProducts.map((prod) => {
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
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] sm:aspect-[5/6]">
                <img
                  src="https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop"
                  alt="SUSÁMÁ Beauty Craftsmanship"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Floating Stat Card */}
                <div className="absolute bottom-5 right-5 sm:bottom-7 sm:right-7 bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-xl border border-white/60">
                  <div className="flex items-center gap-1.5 mb-1">
                    <HiSparkles className="w-4 h-4 text-brand-primary" />
                    <span className="text-2xl font-heading font-extrabold text-gray-900">100%</span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 leading-tight block max-w-[130px]">
                    Botanical Oils &amp; Pure Keratin
                  </span>
                </div>
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
          6. SOCIAL PROOF / REVIEWS
      ══════════════════════════════════════════ */}
      <section className="w-full py-20 sm:py-24 bg-stone-50 border-t border-gray-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block text-[11px] sm:text-xs font-bold tracking-[0.25em] text-brand-secondary uppercase mb-3">
              Real Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4 tracking-tight">
              Loved by Silk &amp; Curl Lovers
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto font-light">
              See how our botanical hair care transforms every hair ritual across Sri Lanka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: 'Kavindi Perera',
                location: 'Colombo',
                hair: 'Curly 3A Texture',
                review: 'The SUSÁMÁ Miracle Curling Cream is unmatched. It defines my curls without any crunchy residue and smells like heavenly sandalwood all day long!',
                product: 'Miracle Curling Cream'
              },
              {
                name: 'Nimasha Fernando',
                location: 'Kandy',
                hair: 'Silky Straight Hair',
                review: 'Finding a sulfate-free shampoo that actually lathers nicely and leaves hair completely sleek was impossible until I tried SUSÁMÁ. Truly salon grade.',
                product: 'Sulfate Free Shampoo – Silky'
              },
              {
                name: 'Dinithi Jayasinghe',
                location: 'Galle',
                hair: 'Dry & Color-Treated',
                review: 'The Restorative Keratin Oil brought my bleached ends back to life. Just 2 drops and the frizz disappears completely. Packaging feels so luxurious.',
                product: 'Restorative Keratin Oil'
              }
            ].map((review, i) => (
              <div 
                key={i}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100/90 flex flex-col justify-between hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, idx) => (
                        <HiStar key={idx} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-brand-secondary bg-brand-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {review.hair}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed italic mb-6">
                    "{review.review}"
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <h5 className="font-heading font-bold text-sm text-gray-900">{review.name}</h5>
                    <span className="text-[11px] text-gray-400">{review.location} • Verified Buyer</span>
                  </div>
                  <span className="text-[10px] font-semibold text-brand-primary">
                    {review.product}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              Enjoy 10% Off Your First Ritual
            </h2>
            <p className="text-white/70 text-sm sm:text-base font-light mb-8 sm:mb-10 max-w-md mx-auto leading-relaxed">
              Subscribe for exclusive botanical hair rituals, seasonal care guides, and VIP-only invitations.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              setToastMessage('Thank you for subscribing to the SUSÁMÁ VIP Club!');
              setTimeout(() => setToastMessage(null), 3000);
            }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-5 py-3.5 rounded-full text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white shadow-sm"
                required
              />
              <button
                type="submit"
                className="bg-brand-primary text-white font-bold px-8 py-3.5 rounded-full hover:bg-brand-secondary transition-all duration-300 text-xs tracking-widest uppercase shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
              >
                Join Now
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

              <div className="flex items-center gap-1.5">
                <HiStar className="w-4 h-4 text-amber-400 fill-current" />
                <span className="text-xs font-bold text-gray-700">{selectedProduct.rating || 4.9}</span>
                <span className="text-xs text-gray-400">({selectedProduct.reviews || 30} reviews)</span>
              </div>

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

