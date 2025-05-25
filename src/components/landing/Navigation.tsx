
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Globe, Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 fixed top-0 z-50">
      <nav className="w-full px-8 lg:px-16 xl:px-24 flex justify-between items-center h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <Globe className="h-10 w-10 text-teal-600" />
          <span className="text-2xl font-light text-teal-600 tracking-wide">TravelFlow360</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-12">
          <Link to="/features" className="text-gray-700 hover:text-teal-600 font-light text-lg tracking-wide transition-colors">Features</Link>
          <Link to="/pricing" className="text-gray-700 hover:text-teal-600 font-light text-lg tracking-wide transition-colors">Pricing</Link>
          <Link to="/about" className="text-gray-700 hover:text-teal-600 font-light text-lg tracking-wide transition-colors">About</Link>
          <Link to="/blog" className="text-gray-700 hover:text-teal-600 font-light text-lg tracking-wide transition-colors">Blog</Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center space-x-6">
          <Link to="/login">
            <Button variant="ghost" size="lg" className="text-lg font-light tracking-wide">Login</Button>
          </Link>
          <Link to="/signup">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800 rounded-none px-8 py-3 text-lg font-light tracking-wide">Start Free Trial</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 w-full">
          <div className="px-8 py-8 space-y-6">
            <Link to="/features" className="block text-gray-700 hover:text-teal-600 font-light text-xl">Features</Link>
            <Link to="/pricing" className="block text-gray-700 hover:text-teal-600 font-light text-xl">Pricing</Link>
            <Link to="/about" className="block text-gray-700 hover:text-teal-600 font-light text-xl">About</Link>
            <Link to="/blog" className="block text-gray-700 hover:text-teal-600 font-light text-xl">Blog</Link>
            
            <div className="pt-6 border-t border-gray-200 space-y-4">
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full text-lg font-light">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" className="w-full bg-black text-white hover:bg-gray-800 rounded-none text-lg font-light">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
