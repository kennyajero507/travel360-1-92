
import React from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/landing/Navigation";
import HeroSection from "../components/landing/HeroSection";
import Footer from "../components/landing/Footer";
import { Button } from "../components/ui/button";
import { ArrowRight, CheckCircle, Zap, Shield, Users, Globe, BarChart3, Sparkles, Star } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <Navigation />
      
      <HeroSection />

      {/* Features Section - Full Width */}
      <section className="w-full py-20 bg-gray-50">
        <div className="w-full px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-normal text-gray-900 mb-6 tracking-tight">
              Everything you need to run your travel business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              From quote creation to team management, TravelFlow360 provides all the tools 
              you need to streamline operations and delight customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <FeatureCard 
              icon={<Zap className="h-8 w-8 text-teal-600" />}
              title="Lightning-fast quotes"
              description="Create professional travel quotes in under 5 minutes with our intuitive interface."
            />
            <FeatureCard 
              icon={<Globe className="h-8 w-8 text-teal-600" />}
              title="Multi-hotel comparison"
              description="Compare rates and amenities across multiple properties in real-time."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-teal-600" />}
              title="Team management"
              description="Manage agents and track performance with role-based dashboards."
            />
            <FeatureCard 
              icon={<Shield className="h-8 w-8 text-teal-600" />}
              title="Secure & compliant"
              description="Enterprise-grade security with GDPR compliance built-in."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-8 w-8 text-teal-600" />}
              title="Business insights"
              description="Track conversion rates and revenue with powerful analytics."
            />
            <FeatureCard 
              icon={<Sparkles className="h-8 w-8 text-teal-600" />}
              title="Client-friendly sharing"
              description="Share beautiful quotes via email, WhatsApp, or secure links."
            />
          </div>
        </div>
      </section>

      {/* Stats Section - Full Width */}
      <section className="w-full py-20">
        <div className="w-full px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-normal text-gray-900 mb-16 tracking-tight">
            Trusted by travel professionals worldwide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl md:text-5xl font-light text-teal-600 mb-2">10+</div>
              <div className="text-lg text-gray-600">Hours saved per week</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-light text-teal-600 mb-2">40%</div>
              <div className="text-lg text-gray-600">Higher conversion rates</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-light text-teal-600 mb-2">500+</div>
              <div className="text-lg text-gray-600">Travel businesses using TravelFlow360</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Full Width */}
      <section className="w-full py-20 bg-gray-50">
        <div className="w-full px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-normal text-gray-900 mb-6 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Choose the plan that fits your business. Start with our free trial and upgrade as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

      {/* Testimonial Section - Full Width */}
      <section className="w-full py-20">
        <div className="w-full px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-3xl p-12 max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-light text-gray-900 mb-8 leading-relaxed">
              "TravelFlow360 has transformed how we create quotes. What used to take hours 
              now takes minutes, and our clients love the professional presentation."
            </blockquote>
            <div>
              <div className="font-medium text-gray-900 text-lg">Sarah Johnson</div>
              <div className="text-gray-600">Founder, Safari Dreams</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Full Width */}
      <section className="w-full py-20 bg-black text-white">
        <div className="w-full px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-normal mb-6 tracking-tight">
            Ready to transform your travel business?
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto font-light text-gray-300">
            Join thousands of travel professionals who are already using TravelFlow360 to grow their business.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-medium">
                Start free trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black rounded-full px-8 py-6 text-lg font-medium">
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="mb-6">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

// Pricing Card Component
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

export default Landing;
