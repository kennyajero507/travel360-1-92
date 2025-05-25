
import React from 'react';
import Navigation from '../components/landing/Navigation';
import Footer from '../components/landing/Footer';
import { Zap, Globe, Users, Shield, BarChart3, Sparkles } from 'lucide-react';

const Features = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <Navigation />
      
      <section className="w-full py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-normal text-gray-900 mb-6 tracking-tight">
              Powerful Features for Travel Professionals
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Everything you need to streamline your travel business operations and delight your customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="h-12 w-12 text-teal-600" />}
              title="Lightning-fast quotes"
              description="Create professional travel quotes in under 5 minutes with our intuitive interface and automated calculations."
            />
            <FeatureCard 
              icon={<Globe className="h-12 w-12 text-teal-600" />}
              title="Multi-hotel comparison"
              description="Compare rates and amenities across multiple properties in real-time to find the best options for your clients."
            />
            <FeatureCard 
              icon={<Users className="h-12 w-12 text-teal-600" />}
              title="Team management"
              description="Manage agents and track performance with role-based dashboards and comprehensive analytics."
            />
            <FeatureCard 
              icon={<Shield className="h-12 w-12 text-teal-600" />}
              title="Secure & compliant"
              description="Enterprise-grade security with GDPR compliance built-in to protect your business and client data."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-12 w-12 text-teal-600" />}
              title="Business insights"
              description="Track conversion rates and revenue with powerful analytics and detailed reporting capabilities."
            />
            <FeatureCard 
              icon={<Sparkles className="h-12 w-12 text-teal-600" />}
              title="Client-friendly sharing"
              description="Share beautiful quotes via email, WhatsApp, or secure links with professional presentation."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="mb-6">{icon}</div>
    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export default Features;
