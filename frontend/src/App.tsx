import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';

// Placeholder for other pages to avoid errors
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh] px-4 text-center">
    <h1 className="text-2xl sm:text-3xl font-heading text-gray-800">{title}</h1>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-body bg-brand-light text-gray-900 selection:bg-brand-primary selection:text-white">
        <Navbar />
        
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/about" element={<PlaceholderPage title="About Us (Coming Soon)" />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
