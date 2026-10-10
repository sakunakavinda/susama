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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

const FALLBACK_CATEGORIES: Category[] = [
  { id: 'c1000000-0000-4000-8000-000000000001', name: "Shampoos & Cleansers", slug: "shampoos" },
  { id: 'c1000000-0000-4000-8000-000000000002', name: "Nourishing Conditioners", slug: "conditioners" },
  { id: 'c1000000-0000-4000-8000-000000000003', name: "Hair Treatments & Oils", slug: "hair-treatments" },
  { id: 'c1000000-0000-4000-8000-000000000004', name: "Curl Care & Styling", slug: "curl-care-styling" },
  { id: 'c1000000-0000-4000-8000-000000000005', name: "Hair Perfumes & Mists", slug: "hair-perfumes" }
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'p1000000-0000-4000-8000-000000000001',
    category_id: 'c1000000-0000-4000-8000-000000000001',
    category_name: 'Shampoos & Cleansers',
    category_slug: 'shampoos',
    name: 'SUSÁMÁ Sulfate Free Shampoo – Silky Hair',
    slug: 'susama-sulfate-free-shampoo-silky-hair',
    sku: 'SUS-SH-SILK-250',
    short_description: 'Gentle sulfate-free daily cleanser enriched with silk amino acids and botanical extracts for sleek, ultra-smooth, glossy hair.',
    full_description: "SUSÁMÁ Sulfate-Free Shampoo for Silky Hair gently washes away daily impurities without stripping the hair's natural oils. Infused with hydrolysed silk proteins and organic coconut water, it smooths flyaways, tames frizz, and leaves straight-to-wavy hair with brilliant shine and mirror-like reflection.",
    ingredients: 'Aqua, Sodium Cocoyl Isethionate, Cocamidopropyl Betaine, Hydrolyzed Silk Protein, Argania Spinosa Kernel Oil, Aloe Barbadensis Leaf Juice, Panthenol, Tocopherol, Natural Botanical Fragrance, Citric Acid.',
    how_to_use: 'Apply to wet scalp and massage gently into a rich lather. Rinse thoroughly with lukewarm water. Follow with SUSÁMÁ Conditioner – Silky Hair for optimal sleekness.',
    base_price: 3200,
    sale_price: 2850,
    stock_quantity: 50,
    is_in_stock: true,
    is_featured: true,
    is_new_arrival: false,
    primary_image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop',
    tag: 'BESTSELLER',
    rating: 4.9,
    reviews: 38
  },
  {
    id: 'p1000000-0000-4000-8000-000000000002',
    category_id: 'c1000000-0000-4000-8000-000000000002',
    category_name: 'Nourishing Conditioners',
    category_slug: 'conditioners',
    name: 'SUSÁMÁ Conditioner – Silky Hair',
    slug: 'susama-conditioner-silky-hair',
    sku: 'SUS-CO-SILK-250',
    short_description: 'Weightless smoothing conditioner with organic camellia oil and provitamin B5 to detangle and deeply nourish silky strands.',
    full_description: 'Lock in moisture and softness with SUSÁMÁ Conditioner for Silky Hair. Specially formulated with cold-pressed camellia seed oil, hydrolysed wheat protein, and provitamin B5 to detangle instantly, seal split ends, and deliver touchable, fluid silkiness without weighing hair down.',
    ingredients: 'Aqua, Cetearyl Alcohol, Behentrimonium Chloride, Camellia Japonica Seed Oil, Hydrolyzed Wheat Protein, Butyrospermum Parkii Butter, Cetyl Esters, Panthenol, Ethylhexylglycerin, Natural Aroma.',
    how_to_use: 'After shampooing, smooth generously from mid-lengths to ends. Leave on for 2-3 minutes, then rinse completely.',
    base_price: 3400,
    sale_price: 2990,
    stock_quantity: 50,
    is_in_stock: true,
    is_featured: true,
    is_new_arrival: false,
    primary_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
    tag: 'POPULAR',
    rating: 4.9,
    reviews: 29
  },
  {
    id: 'p1000000-0000-4000-8000-000000000003',
    category_id: 'c1000000-0000-4000-8000-000000000001',
    category_name: 'Shampoos & Cleansers',
    category_slug: 'shampoos',
    name: 'SUSÁMÁ Sulfate Free Shampoo – Curly Hair',
    slug: 'susama-sulfate-free-shampoo-curly-hair',
    sku: 'SUS-SH-CURL-250',
    short_description: 'Hydrating, curl-loving sulfate-free wash packed with shea butter and flaxseed extract to cleanse while preserving natural curl bounce.',
    full_description: 'Cleanse and enhance your curls without causing dryness. SUSÁMÁ Sulfate-Free Shampoo for Curly Hair preserves your curl pattern while gently removing scalp buildup. Flaxseed mucilage and avocado oil infuse lasting moisture for bouncy, defined, frizz-free curls.',
    ingredients: 'Aqua, Sodium Lauroyl Methyl Isethionate, Cocamidopropyl Hydroxysultaine, Linum Usitatissimum (Flaxseed) Extract, Persea Gratissima Oil, Shea Butter, Vegetable Glycerin, Hydrolyzed Quinoa, Citric Acid.',
    how_to_use: 'Lather generously into wet scalp and curls with fingertips. Rinse thoroughly with lukewarm water.',
    base_price: 3400,
    sale_price: 3100,
    stock_quantity: 45,
    is_in_stock: true,
    is_featured: true,
    is_new_arrival: false,
    primary_image: 'https://images.unsplash.com/photo-1585232351009-aa87416fca90?q=80&w=800&auto=format&fit=crop',
    tag: 'CURL FAVORITE',
    rating: 5.0,
    reviews: 42
  },
  {
    id: 'p1000000-0000-4000-8000-000000000004',
    category_id: 'c1000000-0000-4000-8000-000000000002',
    category_name: 'Nourishing Conditioners',
    category_slug: 'conditioners',
    name: 'SUSÁMÁ Conditioner – Curly Hair',
    slug: 'susama-conditioner-curly-hair',
    sku: 'SUS-CO-CURL-250',
    short_description: 'Rich, slip-heavy curl conditioner with murumuru butter and jojoba to detangle, lock in intense hydration, and define curls.',
    full_description: 'Provide high-slip detangling and profound hydration for textured, curly, and coily hair. SUSÁMÁ Conditioner for Curly Hair blends Amazonian murumuru butter and golden jojoba oil to seal in moisture, eliminate friction, and enhance natural curl spring.',
    ingredients: 'Aqua, Cetearyl Alcohol, Astrocaryum Murumuru Seed Butter, Simmondsia Chinensis Seed Oil, Glycerin, Behentrimonium Methosulfate, Hydrolyzed Vegetable Protein, Lactic Acid, Natural Botanical Extract.',
    how_to_use: 'Apply section by section to wet hair. Detangle with fingers or wide-tooth comb. Leave in for 3-5 minutes, then rinse.',
    base_price: 3600,
    sale_price: 3250,
    stock_quantity: 40,
    is_in_stock: true,
    is_featured: true,
    is_new_arrival: false,
    primary_image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=800&auto=format&fit=crop',
    tag: 'ULTRA HYDRATING',
    rating: 4.8,
    reviews: 34
  },
  {
    id: 'p1000000-0000-4000-8000-000000000005',
    category_id: 'c1000000-0000-4000-8000-000000000003',
    category_name: 'Hair Treatments & Oils',
    category_slug: 'hair-treatments',
    name: 'SUSÁMÁ Restorative Keratin Oil',
    slug: 'susama-keratin-oil',
    sku: 'SUS-OIL-KER-50',
    short_description: 'Intensive keratin elixir that seals split ends, protects against heat styling up to 230°C, and restores lustrous hair vitality.',
    full_description: 'SUSÁMÁ Keratin Oil is a salon-strength restorative elixir formulated with bioactive keratin proteins, pure argan oil, and macadamia seed oil. It deeply penetrates damaged hair fibers, seals split ends, repairs heat damage, and leaves hair visibly smoother with a luminous glass-hair finish.',
    ingredients: 'Cyclopentasiloxane, Dimethiconol, Hydrolyzed Keratin, Argania Spinosa Kernel Oil, Macadamia Integrifolia Seed Oil, Helianthus Annuus Seed Oil, Tocopheryl Acetate, Fragrance.',
    how_to_use: 'Warm 2-3 drops between palms and glide through damp or dry hair from mid-lengths to ends. Use daily or before heat styling.',
    base_price: 4800,
    sale_price: 4200,
    stock_quantity: 65,
    is_in_stock: true,
    is_featured: true,
    is_new_arrival: false,
    primary_image: 'https://images.unsplash.com/photo-1608248597266-c89a9f243003?q=80&w=800&auto=format&fit=crop',
    tag: 'HERO PRODUCT',
    rating: 5.0,
    reviews: 52
  },
  {
    id: 'p1000000-0000-4000-8000-000000000006',
    category_id: 'c1000000-0000-4000-8000-000000000004',
    category_name: 'Curl Care & Styling',
    category_slug: 'curl-care-styling',
    name: 'SUSÁMÁ Miracle Curling Cream',
    slug: 'susama-miracle-curling-cream',
    sku: 'SUS-CR-CURL-200',
    short_description: 'Leave-in curl perfecting cream delivering 48-hour definition, zero crunch, and touchable softness for curls and waves.',
    full_description: 'Transform frizzy, undefined curls into soft, glossy, sculpted spirals. SUSÁMÁ Miracle Curling Cream infuses pure mango seed butter, organic aloe leaf juice, and coconut water into a weightless leave-in styling cream that locks in bounce without stiffness or flaking.',
    ingredients: 'Aqua, Mangifera Indica Seed Butter, Aloe Barbadensis Leaf Juice, Cocos Nucifera Extract, Cetearyl Alcohol, Hydroxyethylcellulose, Polyquaternium-11, PVP, Vanilla & Coconut Natural Aroma.',
    how_to_use: 'Distribute evenly through damp curls. Scrunch upward toward roots to encourage curl formation. Let air-dry or diffuse on low heat.',
    base_price: 3900,
    sale_price: 3450,
    stock_quantity: 55,
    is_in_stock: true,
    is_featured: true,
    is_new_arrival: false,
    primary_image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=800&auto=format&fit=crop',
    tag: 'BESTSELLER',
    rating: 4.9,
    reviews: 46
  },
  {
    id: 'p1000000-0000-4000-8000-000000000007',
    category_id: 'c1000000-0000-4000-8000-000000000005',
    category_name: 'Hair Perfumes & Mists',
    category_slug: 'hair-perfumes',
    name: 'SUSÁMÁ Hair Perfume Spray – Sandalwood',
    slug: 'susama-hair-perfume-spray-sandal',
    sku: 'SUS-MIST-SAN-100',
    short_description: 'Luxury hair fragrance mist infused with Ceylon Sandalwood essence and UV filters to refresh strands with warm, woody serenity.',
    full_description: 'Impart a captivating, long-lasting scent ritual to your hair. SUSÁMÁ Hair Perfume Spray in Sandalwood features an alcohol-gentle formula blended with rich Ceylon sandalwood oil, creamy amber, and hydrolysed silk to protect strands against environmental odors while giving hair a radiant glow.',
    ingredients: 'Aqua, Plant-Derived Alcohol Denat., Santalum Album Oil, PEG-40 Hydrogenated Castor Oil, Glycerin, Hydrolyzed Silk, Benzophenone-4 (UV Filter), Fragrance, Amber Resin Extract.',
    how_to_use: 'Hold spray bottle 20 cm from hair and mist evenly across dry locks. Reapply whenever a fragrance refresher is desired.',
    base_price: 4500,
    sale_price: 3950,
    stock_quantity: 50,
    is_in_stock: true,
    is_featured: true,
    is_new_arrival: true,
    primary_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
    tag: 'NEW ARRIVAL',
    rating: 4.9,
    reviews: 27
  },
  {
    id: 'p1000000-0000-4000-8000-000000000008',
    category_id: 'c1000000-0000-4000-8000-000000000005',
    category_name: 'Hair Perfumes & Mists',
    category_slug: 'hair-perfumes',
    name: 'SUSÁMÁ Hair Perfume Spray – Rose',
    slug: 'susama-hair-perfume-spray-rose',
    sku: 'SUS-MIST-ROSE-100',
    short_description: 'Delicate botanical hair mist with Damask Rose petals and antioxidant green tea to envelop hair in fresh, romantic floral notes.',
    full_description: 'Spritz your hair with the elegance of freshly bloomed roses. SUSÁMÁ Hair Perfume Spray in Rose infuses organic Damask rose water and antioxidant green tea extract to refresh cuticles, provide subtle shine, and leave a graceful, lingering floral bouquet throughout the day.',
    ingredients: 'Aqua, Rosa Damascena Flower Water, Plant Alcohol, Camellia Sinensis Leaf Extract, Panthenol, PEG-40 Hydrogenated Castor Oil, Rose Petal Extract, Musk Aroma, Ethylhexyl Methoxycinnamate.',
    how_to_use: 'Spray gently across styled dry hair from an arm’s length away for an immediate scent and shine boost.',
    base_price: 4500,
    sale_price: 3950,
    stock_quantity: 50,
    is_in_stock: true,
    is_featured: true,
    is_new_arrival: true,
    primary_image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800&auto=format&fit=crop',
    tag: 'LIMITED EDITION',
    rating: 5.0,
    reviews: 33
  }
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'name'>('featured');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      .catch((err) => console.log('Using default categories. API error:', err));

    fetch('http://localhost:5001/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped = data.data.map((item: any) => {
            const fallback = FALLBACK_PRODUCTS.find(p => p.slug === item.slug || p.id === item.id);
            return {
              ...item,
              tag: fallback?.tag || (item.is_new_arrival ? 'NEW ARRIVAL' : (item.is_featured ? 'BESTSELLER' : 'POPULAR')),
              rating: fallback?.rating || 4.9,
              reviews: fallback?.reviews || 28
            };
          });
          setProducts(mapped);
        }
      })
      .catch((err) => console.log('Using default products. API error:', err));
  }, []);

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
                <div className="flex items-center gap-1.5 text-amber-400 mb-4">
                  <HiStar className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold text-gray-800">{selectedProduct.rating || 5.0}</span>
                  <span className="text-xs text-gray-400 font-light">({selectedProduct.reviews || 30} customer reviews)</span>
                </div>

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
