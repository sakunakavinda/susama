import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiStar, 
  HiShoppingBag, 
  HiSparkles,
  HiCheck,
  HiXMark
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
    <div className="flex flex-col min-h-screen w-full bg-brand-light text-gray-900 overflow-x-hidden font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-fade-in">
          <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-white">
            <HiCheck className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          1. HERO SECTION — Full-viewport branded hero
      ───────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[90vh] md:min-h-screen flex items-center justify-center bg-gray-950 overflow-hidden pt-24 sm:pt-28 md:pt-32 pb-20 sm:pb-24">
        {/* Brand Orange Gradient Filter */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary/85 to-brand-primary/75 z-10" />
        
        {/* Hero Background Image */}
        <img 
          src="/hero-bg.jpg" 
          alt="SUSÁMÁ Hair Rituals" 
          className="absolute inset-0 w-full h-full object-cover object-center md:object-top"
        />
        
        {/* Hero Content */}
        <div className="relative z-20 text-center w-full max-w-4xl mx-auto flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 animate-fade-in">
          
          {/* Emblem */}
          <div className="mb-5 sm:mb-8 md:mb-10 transition-transform duration-500 hover:scale-105">
            <img 
              src="/logo-emblem.png" 
              alt="SUSÁMÁ Emblem" 
              className="h-16 sm:h-24 md:h-28 lg:h-32 w-auto object-contain drop-shadow-2xl"
            />
          </div>

          {/* Brand Typography */}
          <div className="mb-8 sm:mb-12 md:mb-14 px-2">
            <img 
              src="/font.png" 
              alt="SUSÁMÁ" 
              className="h-10 sm:h-16 md:h-20 lg:h-24 w-auto max-w-[85vw] sm:max-w-lg md:max-w-xl object-contain drop-shadow-2xl mx-auto"
            />
          </div>

          {/* Tagline with Accent Lines */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 mb-8 sm:mb-12 md:mb-14 w-full max-w-xs sm:max-w-md md:max-w-xl px-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/40 to-white/70" />
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white font-light tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] uppercase font-heading whitespace-nowrap drop-shadow-md">
              Botanical Care. Silky & Curly Perfection
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/40 to-white/70" />
          </div>

          {/* CTA Button */}
          <div>
            <Link 
              to="/products" 
              className="btn-primary text-xs sm:text-sm md:text-base font-semibold inline-flex items-center justify-center px-7 sm:px-10 md:px-12 py-3 sm:py-3.5 md:py-4 rounded-full shadow-2xl hover:shadow-brand-primary/60 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 border border-white/20 tracking-wider uppercase"
            >
              Shop Hair Care Line →
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          2. TRUST & VALUES BAR — Full-width flex banner
      ───────────────────────────────────────────────────── */}
      <section className="relative z-30 -mt-6 sm:-mt-8 md:-mt-10 w-full bg-white/95 backdrop-blur-2xl border-y border-gray-100 shadow-lg py-6 sm:py-8">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-between gap-4 sm:gap-6 text-center">
            
            <div className="flex-1 min-w-[140px] flex flex-col items-center p-2 sm:p-3">
              <span className="text-2xl sm:text-3xl mb-1 sm:mb-2">🌿</span>
              <h4 className="font-heading text-xs sm:text-sm font-bold text-gray-900 mb-0.5">Sulfate & Paraben Free</h4>
              <p className="text-[10px] sm:text-xs text-gray-500 font-light leading-relaxed">Gentle on scalp and cuticles</p>
            </div>

            <div className="hidden md:block w-px h-12 bg-gray-200/80" />

            <div className="flex-1 min-w-[140px] flex flex-col items-center p-2 sm:p-3">
              <span className="text-2xl sm:text-3xl mb-1 sm:mb-2">✨</span>
              <h4 className="font-heading text-xs sm:text-sm font-bold text-gray-900 mb-0.5">Keratin Enriched</h4>
              <p className="text-[10px] sm:text-xs text-gray-500 font-light leading-relaxed">Restores strength & shine</p>
            </div>

            <div className="hidden md:block w-px h-12 bg-gray-200/80" />

            <div className="flex-1 min-w-[140px] flex flex-col items-center p-2 sm:p-3">
              <span className="text-2xl sm:text-3xl mb-1 sm:mb-2">🌀</span>
              <h4 className="font-heading text-xs sm:text-sm font-bold text-gray-900 mb-0.5">Silky & Curly Care</h4>
              <p className="text-[10px] sm:text-xs text-gray-500 font-light leading-relaxed">Customized for every hair texture</p>
            </div>

            <div className="hidden md:block w-px h-12 bg-gray-200/80" />

            <div className="flex-1 min-w-[140px] flex flex-col items-center p-2 sm:p-3">
              <span className="text-2xl sm:text-3xl mb-1 sm:mb-2">🚚</span>
              <h4 className="font-heading text-xs sm:text-sm font-bold text-gray-900 mb-0.5">Islandwide Delivery</h4>
              <p className="text-[10px] sm:text-xs text-gray-500 font-light leading-relaxed">Fast & secure shipping in Sri Lanka</p>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────
          3. CATEGORIES SECTION — Full-width centered grid
      ───────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 md:py-24 w-full px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="w-full max-w-[1600px] mx-auto flex flex-col items-center">
          {/* Section Header */}
          <div className="flex flex-col items-center justify-center text-center mb-10 sm:mb-14">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-brand-secondary uppercase mb-2">
              CURATED BOTANICAL HAIRCARE
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 tracking-tight mb-3 sm:mb-4">
              Shop by Category
            </h2>
            <div className="w-14 sm:w-20 h-1 sm:h-1.5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full" />
          </div>

          {/* Full-width Centered Category Cards Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 xl:gap-6 justify-center">
            {categories.map((category, idx) => {
              const fallbackKey = category.slug || `shampoos`;
              const meta = CATEGORY_META_FALLBACK[fallbackKey] || CATEGORY_META_FALLBACK['shampoos'];
              
              const displayTitle = category.name;
              const displayImage = category.image_url || category.image || meta.image;

              return (
                <Link 
                  key={category.id || idx} 
                  to={`/products?category=${category.slug || category.id}`}
                  className="group relative w-full h-[360px] sm:h-[400px] md:h-[430px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col justify-end border border-gray-100 hover:-translate-y-2 bg-gray-900"
                >
                  <img 
                    src={displayImage} 
                    alt={displayTitle} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-black/40 to-transparent transition-opacity duration-300" />
                  
                  {/* Floating Tag */}
                  <div className="absolute top-4 sm:top-5 left-4 sm:left-5 z-20">
                    <span className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[9px] sm:text-[10px] font-extrabold text-white tracking-widest uppercase shadow-lg">
                      {meta.tag}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="relative p-5 sm:p-6 text-center flex flex-col items-center justify-center z-20">
                    <h3 className="text-lg sm:text-xl font-heading font-bold text-white mb-2 tracking-wide drop-shadow">
                      {displayTitle}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-2 mb-4 font-light max-w-xs drop-shadow leading-relaxed">
                      {category.description || meta.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-brand-primary text-white font-semibold text-[10px] sm:text-xs tracking-wider uppercase shadow-xl group-hover:bg-white group-hover:text-gray-950 transition-all duration-300 transform group-hover:scale-105">
                      Explore Category →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          4. FEATURED BESTSELLERS / PRODUCT GRID WITH TABS (FULL WIDTH & CENTERED)
      ───────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 md:py-24 bg-gray-50/70 border-y border-gray-100 w-full px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="w-full max-w-[1600px] mx-auto flex flex-col items-center">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-brand-primary uppercase mb-2">
              SIGNATURE PRODUCTS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 mb-3 sm:mb-4">
              The Haircare Collection
            </h2>
            <div className="w-14 sm:w-20 h-1 sm:h-1.5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full mb-8" />

            {/* Centered Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-4xl mx-auto">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-sm ${
                  selectedFilter === 'all'
                    ? 'bg-gradient-to-r from-brand-secondary to-brand-primary text-white shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All Products ({products.length})
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFilter(cat.slug || cat.id)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 flex-shrink-0 cursor-pointer shadow-sm ${
                    selectedFilter === cat.id || selectedFilter === cat.slug
                      ? 'bg-gradient-to-r from-brand-secondary to-brand-primary text-white shadow-md scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Full-width Product Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 justify-center">
            {filteredProducts.map((prod) => {
              const imageSrc = prod.image || prod.primary_image || prod.image_url || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop';
              const priceDisplay = prod.sale_price 
                ? `LKR ${Number(prod.sale_price).toLocaleString()}`
                : (prod.price || `LKR ${Number(prod.base_price).toLocaleString()}`);
              
              return (
                <div 
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1.5"
                >
                  <div className="relative h-64 sm:h-72 overflow-hidden bg-gray-100">
                    <img 
                      src={imageSrc} 
                      alt={prod.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop';
                      }}
                    />
                    <span className="absolute top-3 sm:top-4 left-3 sm:left-4 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-brand-primary text-white text-[9px] sm:text-[10px] font-bold tracking-widest uppercase shadow">
                      {prod.tag || 'HAIR CARE'}
                    </span>

                    {/* Quick view text overlay */}
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3.5 py-1.5 rounded-full bg-white text-gray-900 text-[11px] font-bold tracking-wider uppercase shadow-lg">
                        Quick Details
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-amber-400">
                          <HiStar className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                          <span className="text-[11px] sm:text-xs font-bold text-gray-700">{prod.rating || 4.9}</span>
                          <span className="text-[10px] sm:text-xs text-gray-400 font-light">({prod.reviews || 30})</span>
                        </div>
                        {prod.category_name && (
                          <span className="text-[9px] font-bold text-brand-secondary uppercase tracking-wider truncate max-w-[130px]">
                            {prod.category_name}
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading font-bold text-base sm:text-lg text-gray-900 mb-2 group-hover:text-brand-secondary transition-colors leading-snug">
                        {prod.name}
                      </h3>

                      <p className="text-xs text-gray-500 line-clamp-2 font-light leading-relaxed mb-3">
                        {prod.short_description || prod.full_description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-base sm:text-lg font-extrabold text-brand-secondary">{priceDisplay}</span>
                      <button 
                        onClick={(e) => addToCart(prod, e)}
                        className="p-2 sm:p-2.5 rounded-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                        aria-label={`Add ${prod.name} to cart`}
                        title="Add to Cart"
                      >
                        <HiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center w-full flex justify-center">
            <Link 
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gray-900 text-white font-semibold text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:bg-brand-primary transition-all duration-300 hover:scale-105"
            >
              Browse All 8 Hair Products →
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          5. BRAND STORY & PHILOSOPHY
      ───────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 md:py-28 w-full px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="w-full max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center">
            
            {/* Image Column */}
            <div className="relative order-2 lg:order-1">
              <div className="relative h-[300px] sm:h-[380px] md:h-[460px] lg:h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop" 
                  alt="SUSÁMÁ Beauty Craftsmanship" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Floating Stat Card inside the frame */}
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white/95 backdrop-blur-xl p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-xl border border-white/40 max-w-[180px] sm:max-w-[220px] flex flex-col">
                  <div className="flex items-center gap-1 text-brand-primary mb-1">
                    <HiSparkles className="w-4 h-4" />
                    <span className="text-xl sm:text-2xl font-heading font-extrabold">100%</span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-700 leading-tight">
                    Pure Botanical Extracts & Keratin
                  </span>
                </div>
              </div>
            </div>

            {/* Text Column */}
            <div className="flex flex-col items-start text-left order-1 lg:order-2">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-brand-secondary uppercase mb-2 sm:mb-3">
                OUR PHILOSOPHY
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 leading-tight mb-4 sm:mb-6">
                Crafted for Every Texture. Designed for Timeless Shine.
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light leading-relaxed mb-6 sm:mb-8">
                At <strong className="font-semibold text-gray-900">SUSÁMÁ</strong>, our hair rituals blend active keratin peptides, cold-pressed island oils, and pure botanical aromas to nourish from root to tip. Whether revitalizing silky smooth lengths, defining bouncy curls, or imparting exotic sandalwood & rose perfumes, our formulas respect your hair’s natural moisture barrier.
              </p>

              <Link 
                to="/about"
                className="btn-secondary px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm md:text-base font-semibold tracking-wider uppercase shadow-md hover:shadow-xl transition-all"
              >
                Discover Our Story →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          6. NEWSLETTER / VIP CLUB
      ───────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-brand-secondary to-brand-primary text-white py-14 sm:py-18 md:py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl sm:max-w-3xl mx-auto flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-white/90 uppercase mb-2 sm:mb-3">
            SUSÁMÁ VIP CLUB
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold mb-3 sm:mb-4">
            Get 10% Off Your First Hair Order
          </h2>
          <p className="text-white/90 text-xs sm:text-sm md:text-base font-light mb-6 sm:mb-8 max-w-md sm:max-w-xl leading-relaxed">
            Subscribe to receive exclusive hair care rituals, early access to new product releases, and member-only promotions.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-md">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="px-5 sm:px-6 py-3.5 sm:py-4 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white flex-1 bg-white text-xs sm:text-sm shadow-inner"
              required
            />
            <button 
              type="submit" 
              className="bg-gray-950 text-white font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full hover:bg-gray-900 transition-colors text-xs sm:text-sm tracking-wider uppercase shadow-lg whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Quick View Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col md:flex-row relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <HiXMark className="w-5 h-5" />
            </button>

            <div className="md:w-1/2 relative bg-gray-100 min-h-[260px] md:min-h-[420px]">
              <img 
                src={selectedProduct.image || selectedProduct.primary_image || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop'} 
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop';
                }}
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-brand-primary text-white text-[10px] font-bold tracking-widest uppercase shadow">
                {selectedProduct.tag || 'HAIR CARE'}
              </span>
            </div>

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

                <div className="flex items-center gap-1.5 text-amber-400 mb-4">
                  <HiStar className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold text-gray-800">{selectedProduct.rating || 4.9}</span>
                  <span className="text-xs text-gray-400 font-light">({selectedProduct.reviews || 30} reviews)</span>
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl font-extrabold text-brand-secondary">
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

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light mb-4">
                  {selectedProduct.full_description || selectedProduct.short_description}
                </p>

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
              </div>

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
