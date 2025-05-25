
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="w-full bg-gradient-to-br from-teal-600 to-blue-700 text-white py-24 px-6">
      <div className="container mx-auto text-center max-w-6xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Simplify Travel Quotations with Confidence
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
          Generate, compare, and send quotes in minutes with multi-hotel support and agent tools. 
          The complete travel business management platform.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link to="/signup">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-slate-100 text-lg px-8 py-6">
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600 text-lg px-8 py-6">
              View Pricing
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-sm">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
            14-day free trial
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
            No credit card required
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
            Cancel anytime
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
