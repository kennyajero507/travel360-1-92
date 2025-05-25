
import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/landing/Navigation';
import Footer from '../components/landing/Footer';
import { Button } from '../components/ui/button';
import { CheckCircle } from 'lucide-react';

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <Navigation />
      
      <section className="w-full py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-normal text-gray-900 mb-6 tracking-tight">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Choose the plan that fits your business. Start with our free trial and upgrade as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              tier="Free Trial"
              price="0"
              period="14 days"
              features={[
                "Up to 2 team members",
                "10 quotes per month",
                "Basic hotel database",
                "Email support"
              ]}
              ctaText="Start free trial"
              popular={false}
            />
            <PricingCard 
              tier="Basic"
              price="49"
              period="per month"
              features={[
                "Up to 5 team members",
                "50 quotes per month",
                "Advanced hotel database",
                "Priority support",
                "Custom branding",
                "Advanced analytics"
              ]}
              ctaText="Get started"
              popular={true}
            />
            <PricingCard 
              tier="Pro"
              price="149"
              period="per month"
              features={[
                "Unlimited team members",
                "Unlimited quotes",
                "Premium hotel database",
                "Dedicated support",
                "White-label solution",
                "Custom integrations"
              ]}
              ctaText="Contact sales"
              popular={false}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const PricingCard = ({ 
  tier, 
  price, 
  period,
  features, 
  ctaText,
  popular
}: { 
  tier: string, 
  price: string, 
  period: string,
  features: string[], 
  ctaText: string,
  popular: boolean
}) => (
  <div className={`bg-white rounded-2xl p-8 shadow-sm border ${popular ? 'border-teal-200 ring-2 ring-teal-100' : 'border-gray-100'} relative`}>
    {popular && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </span>
      </div>
    )}
    <div className="text-center mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{tier}</h3>
      <div>
        <span className="text-4xl font-light text-gray-900">${price}</span>
        <span className="text-gray-600 ml-2">/{period}</span>
      </div>
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <CheckCircle className="h-5 w-5 text-teal-600 mr-3 shrink-0 mt-0.5" />
          <span className="text-gray-700">{feature}</span>
        </li>
      ))}
    </ul>
    <Link to="/signup">
      <Button className={`w-full rounded-full py-6 text-lg font-medium ${popular ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
        {ctaText}
      </Button>
    </Link>
  </div>
);

export default Pricing;
