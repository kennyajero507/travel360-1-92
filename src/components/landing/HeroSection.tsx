
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
      <div className="w-full max-w-none px-8 lg:px-16 xl:px-24">
        <div className="w-full text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-gray-900 mb-8 leading-tight">
            Travel quotations
            <br />
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent font-normal">
              made simple
            </span>
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            Create professional travel quotes in minutes with multi-hotel comparison, 
            team management, and client-friendly sharing.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/signup">
              <Button size="lg" className="bg-black text-white hover:bg-gray-800 rounded-none px-12 py-8 text-xl font-light tracking-wide">
                Start free trial
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-none px-12 py-8 text-xl font-light tracking-wide">
                View pricing
              </Button>
            </Link>
          </div>
          <p className="text-lg text-gray-500 mt-12 font-light">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
