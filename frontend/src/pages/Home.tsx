import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const MOCK_CATEGORIES = [
  { id: 1, name: "Skincare Essentials", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop" },
  { id: 2, name: "Luxury Serums", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop" },
  { id: 3, name: "Natural Cleansers", image: "https://images.unsplash.com/photo-1556228720-192a6af4e865?q=80&w=600&auto=format&fit=crop" },
  { id: 4, name: "Face Oils & Creams", image: "https://images.unsplash.com/photo-1608248597266-c89a9f243003?q=80&w=600&auto=format&fit=crop" },
  { id: 5, name: "Sun Protection", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop" },
  { id: 6, name: "Body & Bath Care", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop" },
];

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[500px] flex items-center justify-center bg-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary/90 to-brand-primary/80 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=1600&auto=format&fit=crop" 
          alt="Hero background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-20 text-center px-4 animate-fade-in">
          <div className="flex flex-col items-center justify-center mb-6">
            <img 
              src="/logo-emblem.png" 
              alt="SUSÁMÁ Logo Emblem" 
              className="h-24 sm:h-28 md:h-32 w-auto object-contain drop-shadow-lg mb-4"
            />
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-brand-light">
              SUSAMA
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto">
            Natural Care. Timeless Beauty
            </p>
          <Link to="/products" className="btn-primary text-lg inline-block px-8">
            Shop the Collection
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3">
              Shop by Category
            </h2>
            <div className="w-24 h-1 bg-brand-primary rounded-full"></div>
          </div>

          {/* Category Navigation Arrows */}
          <div className="flex items-center gap-3 mt-6 md:mt-0">
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
          className="flex gap-6 overflow-x-auto scroll-smooth pb-4 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {MOCK_CATEGORIES.map((category) => (
            <Link 
              key={category.id} 
              to={`/products?category=${category.id}`}
              className="group relative min-w-[280px] sm:min-w-[320px] md:min-w-[360px] h-[420px] rounded-2xl overflow-hidden shadow-lg cursor-pointer flex-shrink-0 block"
            >
              <img 
                src={category.image} 
                alt={category.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                <h3 className="text-2xl font-heading font-bold text-white mb-2">
                  {category.name}
                </h3>
                <span className="text-brand-primary font-medium text-sm tracking-wider uppercase opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  Explore Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand Values Banner */}
      <section className="bg-brand-primary/10 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h4 className="font-heading text-xl font-semibold text-brand-secondary mb-2">Cruelty Free</h4>
            <p className="text-sm text-gray-600">Never tested on animals</p>
          </div>
          <div>
            <h4 className="font-heading text-xl font-semibold text-brand-secondary mb-2">100% Vegan</h4>
            <p className="text-sm text-gray-600">Plant-based ingredients</p>
          </div>
          <div>
            <h4 className="font-heading text-xl font-semibold text-brand-secondary mb-2">Dermatologist Tested</h4>
            <p className="text-sm text-gray-600">Safe for sensitive skin</p>
          </div>
          <div>
            <h4 className="font-heading text-xl font-semibold text-brand-secondary mb-2">Eco-Friendly</h4>
            <p className="text-sm text-gray-600">Sustainable packaging</p>
          </div>
        </div>
      </section>
      
    </div>
  );
}
