import { Link } from 'react-router-dom';

const MOCK_CATEGORIES = [
  { id: 1, name: "Skincare Essentials", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop" },
  { id: 2, name: "Luxury Serums", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop" },
  { id: 3, name: "Natural Cleansers", image: "https://images.unsplash.com/photo-1556228720-192a6af4e865?q=80&w=600&auto=format&fit=crop" },
];

export default function Home() {
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
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-brand-light mb-6">
            SUSAMA
          </h1>
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
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <div className="w-24 h-1 bg-brand-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MOCK_CATEGORIES.map((category) => (
            <Link 
              key={category.id} 
              to={`/products?category=${category.id}`}
              className="group relative h-96 rounded-2xl overflow-hidden shadow-lg cursor-pointer block"
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
