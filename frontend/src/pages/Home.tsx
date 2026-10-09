import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
  image?: string;
  image_url?: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: '65018a4c-8456-4399-a027-105b131ecb5e', name: "Category 1", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop" },
  { id: '1bb7edde-0b65-46db-8d7d-bd072b84cbc2', name: "Category 2", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop" },
  { id: 'd9905f89-cf66-4365-bab9-e4fc425310cc', name: "Category 3", image: "https://images.unsplash.com/photo-1556228720-192a6af4e865?q=80&w=600&auto=format&fit=crop" },
  { id: '7b8eb027-a4f4-4208-9f76-6a57f229c0d8', name: "Category 4", image: "https://images.unsplash.com/photo-1608248597266-c89a9f243003?q=80&w=600&auto=format&fit=crop" },
  { id: '35cfac92-76d3-45e2-99cf-cb0a62c84dab', name: "Category 5", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop" },
];

export default function Home() {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
        }
      })
      .catch((err) => console.log('Using default categories. API error:', err));
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[520px] max-h-[800px] flex items-center justify-center bg-gray-50 overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary/85 to-brand-primary/75 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=1600&auto=format&fit=crop" 
          alt="Hero background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-20 text-center max-w-3xl mx-auto flex flex-col items-center justify-center animate-fade-in">
          {/* Logo & Emblem Group */}
          <div className="flex flex-col items-center justify-center mb-6 max-w-full">
            <img 
              src="/logo-emblem.png" 
              alt="SUSÁMÁ Logo Emblem" 
              className="h-20 sm:h-28 md:h-32 lg:h-36 w-auto max-w-[70vw] object-contain drop-shadow-xl mb-4"
            />
            <img 
              src="/font.png" 
              alt="SUSÁMÁ" 
              className="h-14 sm:h-18 md:h-22 lg:h-24 w-auto max-w-[85vw] object-contain drop-shadow-xl"
            />
          </div>

          <p className="text-lg sm:text-xl md:text-2xl text-white/95 font-light tracking-wide mb-8 max-w-xl mx-auto text-center">
            Natural Care. Timeless Beauty
          </p>

          <Link 
            to="/products" 
            className="btn-primary text-base sm:text-lg inline-flex items-center justify-center px-8 py-3.5 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            Shop the Collection
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-10 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3">
              Shop by Category
            </h2>
            <div className="w-20 h-1 bg-brand-primary rounded-full"></div>
          </div>

          {/* Category Navigation Arrows */}
          <div className="flex items-center justify-center gap-3 mt-6 md:mt-0">
            <button 
              onClick={() => scroll('left')}
              className="p-3 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm hover:shadow active:scale-95"
              aria-label="Scroll left"
            >
              <HiChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-3 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm hover:shadow active:scale-95"
              aria-label="Scroll right"
            >
              <HiChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Categories List */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth pb-6 no-scrollbar snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/products?category=${category.id}`}
              className="group relative min-w-[260px] sm:min-w-[300px] md:min-w-[340px] h-[380px] sm:h-[420px] rounded-2xl overflow-hidden shadow-lg cursor-pointer flex-shrink-0 block snap-center"
            >
              <img 
                src={category.image_url || category.image || "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600"} 
                alt={category.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-center flex flex-col items-center justify-center">
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-white mb-2">
                  {category.name}
                </h3>
                <span className="text-brand-primary font-medium text-xs sm:text-sm tracking-wider uppercase opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  Explore Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand Values Banner */}
      <section className="bg-brand-primary/10 py-16 mt-auto border-t border-brand-primary/20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center justify-items-center">
          <div className="flex flex-col items-center max-w-[200px]">
            <h4 className="font-heading text-lg sm:text-xl font-semibold text-brand-secondary mb-2">Cruelty Free</h4>
            <p className="text-xs sm:text-sm text-gray-600">Never tested on animals</p>
          </div>
          <div className="flex flex-col items-center max-w-[200px]">
            <h4 className="font-heading text-lg sm:text-xl font-semibold text-brand-secondary mb-2">100% Vegan</h4>
            <p className="text-xs sm:text-sm text-gray-600">Plant-based ingredients</p>
          </div>
          <div className="flex flex-col items-center max-w-[200px]">
            <h4 className="font-heading text-lg sm:text-xl font-semibold text-brand-secondary mb-2">Dermatologist Tested</h4>
            <p className="text-xs sm:text-sm text-gray-600">Safe for sensitive skin</p>
          </div>
          <div className="flex flex-col items-center max-w-[200px]">
            <h4 className="font-heading text-lg sm:text-xl font-semibold text-brand-secondary mb-2">Eco-Friendly</h4>
            <p className="text-xs sm:text-sm text-gray-600">Sustainable packaging</p>
          </div>
        </div>
      </section>
      
    </div>
  );
}
