import { useState, useEffect } from 'react';
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

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { 
    id: 'c1000000-0000-4000-8000-000000000001', 
    name: "Shampoos & Cleansers", 
    slug: "shampoos",
    image_url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    id: 'c1000000-0000-4000-8000-000000000002', 
    name: "Nourishing Conditioners", 
    slug: "conditioners",
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    id: 'c1000000-0000-4000-8000-000000000003', 
    name: "Hair Treatments & Oils", 
    slug: "hair-treatments",
    image_url: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    id: 'c1000000-0000-4000-8000-000000000004', 
    name: "Curl Care & Styling", 
    slug: "curl-care-styling",
    image_url: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    id: 'c1000000-0000-4000-8000-000000000005', 
    name: "Hair Perfumes & Mists", 
    slug: "hair-perfumes",
    image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop" 
  },
];

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'p1000000-0000-4000-8000-000000000001',
    category_id: 'c1000000-0000-4000-8000-000000000001',
    category_name: 'Shampoos & Cleansers',
    category_slug: 'shampoos',
    name: 'SUSÁMÁ Sulfate Free Shampoo – Silky Hair',
    slug: 'susama-sulfate-free-shampoo-silky-hair',
    sku: 'SUS-SH-SILK-250',
    price: 'LKR 2,850',
    base_price: 3200,
    sale_price: 2850,
    rating: 4.9,
    reviews: 38,
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop',
    tag: 'BESTSELLER',
    short_description: 'Gentle sulfate-free daily cleanser enriched with silk amino acids and botanical extracts for sleek, ultra-smooth, glossy hair.',
    full_description: "SUSÁMÁ Sulfate-Free Shampoo for Silky Hair gently washes away daily impurities without stripping the hair's natural oils. Infused with hydrolysed silk proteins and organic coconut water, it smooths flyaways, tames frizz, and leaves straight-to-wavy hair with brilliant shine and mirror-like reflection.",
    ingredients: 'Aqua, Sodium Cocoyl Isethionate, Cocamidopropyl Betaine, Hydrolyzed Silk Protein, Argania Spinosa Kernel Oil, Aloe Barbadensis Leaf Juice, Panthenol, Tocopherol, Natural Botanical Fragrance, Citric Acid.',
    how_to_use: 'Apply to wet scalp and massage gently into a rich lather. Rinse thoroughly with lukewarm water. Follow with SUSÁMÁ Conditioner – Silky Hair for optimal sleekness.'
  },
  {
    id: 'p1000000-0000-4000-8000-000000000002',
    category_id: 'c1000000-0000-4000-8000-000000000002',
    category_name: 'Nourishing Conditioners',
    category_slug: 'conditioners',
    name: 'SUSÁMÁ Conditioner – Silky Hair',
    slug: 'susama-conditioner-silky-hair',
    sku: 'SUS-CO-SILK-250',
    price: 'LKR 2,990',
    base_price: 3400,
    sale_price: 2990,
    rating: 4.9,
    reviews: 29,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
    tag: 'POPULAR',
    short_description: 'Weightless smoothing conditioner with organic camellia oil and provitamin B5 to detangle and deeply nourish silky strands.',
    full_description: 'Lock in moisture and softness with SUSÁMÁ Conditioner for Silky Hair. Specially formulated with cold-pressed camellia seed oil, hydrolysed wheat protein, and provitamin B5 to detangle instantly, seal split ends, and deliver touchable, fluid silkiness without weighing hair down.',
    ingredients: 'Aqua, Cetearyl Alcohol, Behentrimonium Chloride, Camellia Japonica Seed Oil, Hydrolyzed Wheat Protein, Butyrospermum Parkii Butter, Cetyl Esters, Panthenol, Ethylhexylglycerin, Natural Aroma.',
    how_to_use: 'After shampooing, smooth generously from mid-lengths to ends. Leave on for 2-3 minutes, then rinse completely.'
  },
  {
    id: 'p1000000-0000-4000-8000-000000000003',
    category_id: 'c1000000-0000-4000-8000-000000000001',
    category_name: 'Shampoos & Cleansers',
    category_slug: 'shampoos',
    name: 'SUSÁMÁ Sulfate Free Shampoo – Curly Hair',
    slug: 'susama-sulfate-free-shampoo-curly-hair',
    sku: 'SUS-SH-CURL-250',
    price: 'LKR 3,100',
    base_price: 3400,
    sale_price: 3100,
    rating: 5.0,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1585232351009-aa87416fca90?q=80&w=800&auto=format&fit=crop',
    tag: 'CURL FAVORITE',
    short_description: 'Hydrating, curl-loving sulfate-free wash packed with shea butter and flaxseed extract to cleanse while preserving natural curl bounce.',
    full_description: 'Cleanse and enhance your curls without causing dryness. SUSÁMÁ Sulfate-Free Shampoo for Curly Hair preserves your curl pattern while gently removing scalp buildup. Flaxseed mucilage and avocado oil infuse lasting moisture for bouncy, defined, frizz-free curls.',
    ingredients: 'Aqua, Sodium Lauroyl Methyl Isethionate, Cocamidopropyl Hydroxysultaine, Linum Usitatissimum (Flaxseed) Extract, Persea Gratissima Oil, Shea Butter, Vegetable Glycerin, Hydrolyzed Quinoa, Citric Acid.',
    how_to_use: 'Lather generously into wet scalp and curls with fingertips. Rinse thoroughly with lukewarm water.'
  },
  {
    id: 'p1000000-0000-4000-8000-000000000004',
    category_id: 'c1000000-0000-4000-8000-000000000002',
    category_name: 'Nourishing Conditioners',
    category_slug: 'conditioners',
    name: 'SUSÁMÁ Conditioner – Curly Hair',
    slug: 'susama-conditioner-curly-hair',
    sku: 'SUS-CO-CURL-250',
    price: 'LKR 3,250',
    base_price: 3600,
    sale_price: 3250,
    rating: 4.8,
    reviews: 34,
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=800&auto=format&fit=crop',
    tag: 'HYDRATION',
    short_description: 'Rich, slip-heavy curl conditioner with murumuru butter and jojoba to detangle, lock in intense hydration, and define curls.',
    full_description: 'Provide high-slip detangling and profound hydration for textured, curly, and coily hair. SUSÁMÁ Conditioner for Curly Hair blends Amazonian murumuru butter and golden jojoba oil to seal in moisture, eliminate friction, and enhance natural curl spring.',
    ingredients: 'Aqua, Cetearyl Alcohol, Astrocaryum Murumuru Seed Butter, Simmondsia Chinensis Seed Oil, Glycerin, Behentrimonium Methosulfate, Hydrolyzed Vegetable Protein, Lactic Acid, Natural Botanical Extract.',
    how_to_use: 'Apply section by section to wet hair. Detangle with fingers or wide-tooth comb. Leave in for 3-5 minutes, then rinse.'
  },
  {
    id: 'p1000000-0000-4000-8000-000000000005',
    category_id: 'c1000000-0000-4000-8000-000000000003',
    category_name: 'Hair Treatments & Oils',
    category_slug: 'hair-treatments',
    name: 'SUSÁMÁ Restorative Keratin Oil',
    slug: 'susama-keratin-oil',
    sku: 'SUS-OIL-KER-50',
    price: 'LKR 4,200',
    base_price: 4800,
    sale_price: 4200,
    rating: 5.0,
    reviews: 52,
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800&auto=format&fit=crop',
    tag: 'HERO PRODUCT',
    short_description: 'Intensive keratin elixir that seals split ends, protects against heat styling up to 230°C, and restores lustrous hair vitality.',
    full_description: 'SUSÁMÁ Keratin Oil is a salon-strength restorative elixir formulated with bioactive keratin proteins, pure argan oil, and macadamia seed oil. It deeply penetrates damaged hair fibers, seals split ends, repairs heat damage, and leaves hair visibly smoother with a luminous glass-hair finish.',
    ingredients: 'Cyclopentasiloxane, Dimethiconol, Hydrolyzed Keratin, Argania Spinosa Kernel Oil, Macadamia Integrifolia Seed Oil, Helianthus Annuus Seed Oil, Tocopheryl Acetate, Fragrance.',
    how_to_use: 'Warm 2-3 drops between palms and glide through damp or dry hair from mid-lengths to ends. Use daily or before heat styling.'
  },
  {
    id: 'p1000000-0000-4000-8000-000000000006',
    category_id: 'c1000000-0000-4000-8000-000000000004',
    category_name: 'Curl Care & Styling',
    category_slug: 'curl-care-styling',
    name: 'SUSÁMÁ Miracle Curling Cream',
    slug: 'susama-miracle-curling-cream',
    sku: 'SUS-CR-CURL-200',
    price: 'LKR 3,450',
    base_price: 3900,
    sale_price: 3450,
    rating: 4.9,
    reviews: 46,
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=800&auto=format&fit=crop',
    tag: 'BESTSELLER',
    short_description: 'Leave-in curl perfecting cream delivering 48-hour definition, zero crunch, and touchable softness for curls and waves.',
    full_description: 'Transform frizzy, undefined curls into soft, glossy, sculpted spirals. SUSÁMÁ Miracle Curling Cream infuses pure mango seed butter, organic aloe leaf juice, and coconut water into a weightless leave-in styling cream that locks in bounce without stiffness or flaking.',
    ingredients: 'Aqua, Mangifera Indica Seed Butter, Aloe Barbadensis Leaf Juice, Cocos Nucifera Extract, Cetearyl Alcohol, Hydroxyethylcellulose, Polyquaternium-11, PVP, Vanilla & Coconut Natural Aroma.',
    how_to_use: 'Distribute evenly through damp curls. Scrunch upward toward roots to encourage curl formation. Let air-dry or diffuse on low heat.'
  },
  {
    id: 'p1000000-0000-4000-8000-000000000007',
    category_id: 'c1000000-0000-4000-8000-000000000005',
    category_name: 'Hair Perfumes & Mists',
    category_slug: 'hair-perfumes',
    name: 'SUSÁMÁ Hair Perfume Spray – Sandalwood',
    slug: 'susama-hair-perfume-spray-sandal',
    sku: 'SUS-MIST-SAN-100',
    price: 'LKR 3,950',
    base_price: 4500,
    sale_price: 3950,
    rating: 4.9,
    reviews: 27,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
    tag: 'NEW ARRIVAL',
    short_description: 'Luxury hair fragrance mist infused with Ceylon Sandalwood essence and UV filters to refresh strands with warm, woody serenity.',
    full_description: 'Impart a captivating, long-lasting scent ritual to your hair. SUSÁMÁ Hair Perfume Spray in Sandalwood features an alcohol-gentle formula blended with rich Ceylon sandalwood oil, creamy amber, and hydrolysed silk to protect strands against environmental odors while giving hair a radiant glow.',
    ingredients: 'Aqua, Plant-Derived Alcohol Denat., Santalum Album Oil, PEG-40 Hydrogenated Castor Oil, Glycerin, Hydrolyzed Silk, Benzophenone-4 (UV Filter), Fragrance, Amber Resin Extract.',
    how_to_use: 'Hold spray bottle 20 cm from hair and mist evenly across dry locks. Reapply whenever a fragrance refresher is desired.'
  },
  {
    id: 'p1000000-0000-4000-8000-000000000008',
    category_id: 'c1000000-0000-4000-8000-000000000005',
    category_name: 'Hair Perfumes & Mists',
    category_slug: 'hair-perfumes',
    name: 'SUSÁMÁ Hair Perfume Spray – Rose',
    slug: 'susama-hair-perfume-spray-rose',
    sku: 'SUS-MIST-ROSE-100',
    price: 'LKR 3,950',
    base_price: 4500,
    sale_price: 3950,
    rating: 5.0,
    reviews: 33,
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800&auto=format&fit=crop',
    tag: 'LIMITED EDITION',
    short_description: 'Delicate botanical hair mist with Damask Rose petals and antioxidant green tea to envelop hair in fresh, romantic floral notes.',
    full_description: 'Spritz your hair with the elegance of freshly bloomed roses. SUSÁMÁ Hair Perfume Spray in Rose infuses organic Damask rose water and antioxidant green tea extract to refresh cuticles, provide subtle shine, and leave a graceful, lingering floral bouquet throughout the day.',
    ingredients: 'Aqua, Rosa Damascena Flower Water, Plant Alcohol, Camellia Sinensis Leaf Extract, Panthenol, PEG-40 Hydrogenated Castor Oil, Rose Petal Extract, Musk Aroma, Ethylhexyl Methoxycinnamate.',
    how_to_use: 'Spray gently across styled dry hair from an arm’s length away for an immediate scent and shine boost.'
  }
];

export default function Home() {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories from API
    fetch('http://localhost:5001/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
        }
      })
      .catch((err) => console.log('Using default categories. API error:', err));

    // Fetch products from API
    fetch('http://localhost:5001/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped = data.data.map((item: any) => {
            const fallback = INITIAL_PRODUCTS.find(p => p.slug === item.slug || p.id === item.id);
            return {
              ...item,
              price: item.sale_price 
                ? `LKR ${Number(item.sale_price).toLocaleString()}`
                : `LKR ${Number(item.base_price).toLocaleString()}`,
              image: item.primary_image || item.image_url || fallback?.image,
              tag: fallback?.tag || (item.is_new_arrival ? 'NEW' : (item.is_featured ? 'BESTSELLER' : 'POPULAR')),
              rating: fallback?.rating || 4.9,
              reviews: fallback?.reviews || 25
            };
          });
          setProducts(mapped);
        }
      })
      .catch((err) => console.log('Using default products. API error:', err));
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
          src="/hero-bg.jpg"
          alt="SUSÁMÁ Botanical Hair Care"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
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
              Botanical Care • Silky &amp; Curly Perfection
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

