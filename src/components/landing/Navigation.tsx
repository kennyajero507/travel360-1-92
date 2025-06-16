
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Menu, X } from 'lucide-react';
import { Button } from '../ui/button';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-teal-600" />
            <span className="text-xl font-bold text-teal-600">TravelFlow360</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/features" className="text-slate-600 hover:text-teal-600 transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-slate-600 hover:text-teal-600 transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="text-slate-600 hover:text-teal-600 transition-colors">
              About
            </Link>
            <a href="#contact" className="text-slate-600 hover:text-teal-600 transition-colors">
              Contact
            </a>
          </div>
          
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-600 hover:text-teal-600">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-teal-600 hover:bg-teal-700">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link 
                to="/features" 
                className="block px-3 py-2 text-slate-600 hover:text-teal-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="block px-3 py-2 text-slate-600 hover:text-teal-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className="block px-3 py-2 text-slate-600 hover:text-teal-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <a 
                href="#contact" 
                className="block px-3 py-2 text-slate-600 hover:text-teal-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              <div className="flex flex-col space-y-2 px-3 pt-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
