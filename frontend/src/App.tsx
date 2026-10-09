import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

// Placeholder for other pages to avoid errors
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh]">
    <h1 className="text-3xl font-heading text-gray-800">{title}</h1>
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
            <Route path="/products" element={<PlaceholderPage title="Products Page (Coming Soon)" />} />
            <Route path="/about" element={<PlaceholderPage title="About Us (Coming Soon)" />} />
          </Routes>
        </main>
        
        {/* Simple Footer Placeholder */}
        <footer className="bg-gray-900 text-gray-300 py-8 text-center mt-auto">
          <p className="text-sm">© 2026 SUSÁMÁ. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
