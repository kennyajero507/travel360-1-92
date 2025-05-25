
import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { Button } from './ui/button';

interface PublicLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

const PublicLayout = ({ children, showNavigation = true }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50">
      {showNavigation && (
        <header className="border-b bg-white">
          <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-teal-600" />
              <span className="text-xl font-bold text-teal-600">TravelFlow360</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/features" className="text-slate-600 hover:text-teal-600 transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="text-slate-600 hover:text-teal-600 transition-colors">
                Pricing
              </Link>
              <Link to="/about" className="text-slate-600 hover:text-teal-600 transition-colors">
                About
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
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
          </nav>
        </header>
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showNavigation && (
        <footer className="bg-white border-t py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-slate-500">
              © 2025 TravelFlow360. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PublicLayout;
