
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="w-full pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-gray-900 mb-6 leading-tight">
          Travel quotations
          <br />
          <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            made simple
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          Create professional travel quotes in minutes with multi-hotel comparison, 
          team management, and client-friendly sharing.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/signup">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-6 text-lg font-medium">
              Start free trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-8 py-6 text-lg font-medium">
              View pricing
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
