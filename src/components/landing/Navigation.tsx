
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Globe, Menu, X, ChevronDown } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const resourcesItems = [
    { label: 'Documentation', href: '/docs' },
    { label: 'Help Center', href: '/help' },
    { label: 'Tutorials', href: '/tutorials' },
    { label: 'Community', href: '/community' },
  ];

  const legalItems = [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
    { label: 'GDPR', href: '/gdpr' },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="container mx-auto px-6 flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Globe className="h-8 w-8 text-teal-600" />
          <span className="text-xl font-bold text-teal-600">TravelFlow360</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link to="/product" className="text-gray-600 hover:text-teal-600 font-medium">Product</Link>
          <Link to="/features" className="text-gray-600 hover:text-teal-600 font-medium">Features</Link>
          <Link to="/pricing" className="text-gray-600 hover:text-teal-600 font-medium">Pricing</Link>
          <Link to="/blog" className="text-gray-600 hover:text-teal-600 font-medium">Blog</Link>
          
          {/* Resources Dropdown */}
          <div className="relative group">
            <button className="flex items-center text-gray-600 hover:text-teal-600 font-medium">
              Resources <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {resourcesItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal Dropdown */}
          <div className="relative group">
            <button className="flex items-center text-gray-600 hover:text-teal-600 font-medium">
              Legal <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {legalItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link to="/login">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Start Free Trial</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-6 py-4 space-y-4">
            <Link to="/product" className="block text-gray-600 hover:text-teal-600 font-medium">Product</Link>
            <Link to="/features" className="block text-gray-600 hover:text-teal-600 font-medium">Features</Link>
            <Link to="/pricing" className="block text-gray-600 hover:text-teal-600 font-medium">Pricing</Link>
            <Link to="/blog" className="block text-gray-600 hover:text-teal-600 font-medium">Blog</Link>
            
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="w-full">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="w-full">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
