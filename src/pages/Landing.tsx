
import React from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/landing/Navigation";
import HeroSection from "../components/landing/HeroSection";
import Footer from "../components/landing/Footer";
import { Button } from "../components/ui/button";
import { ArrowRight, CheckCircle, Zap, Shield, Users, Globe, BarChart3, Sparkles, Star } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden">
      <Navigation />
      
      <HeroSection />

      {/* Features Section - Full Width */}
      <section className="w-full py-32 bg-white">
        <div className="w-full px-8 lg:px-16 xl:px-24">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-8 tracking-tight leading-tight">
              Everything you need to run
              <br />
              <span className="text-teal-600">your travel business</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
              From quote creation to team management, TravelFlow360 provides all the tools 
              you need to streamline operations and delight customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-none">
            <FeatureCard 
              icon={<Zap className="h-12 w-12 text-teal-600" />}
              title="Lightning-fast quotes"
              description="Create professional travel quotes in under 5 minutes with our intuitive interface."
            />
            <FeatureCard 
              icon={<Globe className="h-12 w-12 text-teal-600" />}
              title="Multi-hotel comparison"
              description="Compare rates and amenities across multiple properties in real-time."
            />
            <FeatureCard 
              icon={<Users className="h-12 w-12 text-teal-600" />}
              title="Team management"
              description="Manage agents and track performance with role-based dashboards."
            />
            <FeatureCard 
              icon={<Shield className="h-12 w-12 text-teal-600" />}
              title="Secure & compliant"
              description="Enterprise-grade security with GDPR compliance built-in."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-12 w-12 text-teal-600" />}
              title="Business insights"
              description="Track conversion rates and revenue with powerful analytics."
            />
            <FeatureCard 
              icon={<Sparkles className="h-12 w-12 text-teal-600" />}
              title="Client-friendly sharing"
              description="Share beautiful quotes via email, WhatsApp, or secure links."
            />
          </div>
        </div>
      </section>

      {/* Stats Section - Full Width */}
      <section className="w-full py-32 bg-gradient-to-br from-slate-50 to-white">
        <div className="w-full px-8 lg:px-16 xl:px-24 text-center">
          <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-24 tracking-tight">
            Trusted by travel professionals
            <br />
            <span className="text-teal-600">worldwide</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-light text-teal-600 mb-4">10+</div>
              <div className="text-xl text-gray-600 font-light">Hours saved per week</div>
            </div>
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-light text-teal-600 mb-4">40%</div>
              <div className="text-xl text-gray-600 font-light">Higher conversion rates</div>
            </div>
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-light text-teal-600 mb-4">500+</div>
              <div className="text-xl text-gray-600 font-light">Travel businesses using TravelFlow360</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Full Width */}
      <section className="w-full py-32 bg-white">
        <div className="w-full px-8 lg:px-16 xl:px-24">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-8 tracking-tight">
              Simple, transparent
              <br />
              <span className="text-teal-600">pricing</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light">
              Choose the plan that fits your business. Start with our free trial and upgrade as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
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
      <section className="w-full py-32 bg-gradient-to-br from-slate-50 to-white">
        <div className="w-full px-8 lg:px-16 xl:px-24 text-center">
          <div className="bg-white rounded-none p-16 max-w-5xl mx-auto border border-gray-100">
            <div className="flex justify-center mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-8 w-8 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-12 leading-relaxed">
              "TravelFlow360 has transformed how we create quotes. What used to take hours 
              now takes minutes, and our clients love the professional presentation."
            </blockquote>
            <div>
              <div className="font-light text-gray-900 text-2xl mb-2">Sarah Johnson</div>
              <div className="text-gray-600 text-xl font-light">Founder, Safari Dreams</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Full Width */}
      <section className="w-full py-32 bg-black text-white">
        <div className="w-full px-8 lg:px-16 xl:px-24 text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-light mb-8 tracking-tight leading-tight">
            Ready to transform
            <br />
            your travel business?
          </h2>
          <p className="text-xl md:text-2xl mb-16 max-w-4xl mx-auto font-light text-gray-300 leading-relaxed">
            Join thousands of travel professionals who are already using TravelFlow360 to grow their business.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 rounded-none px-12 py-8 text-xl font-light tracking-wide">
                Start free trial
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black rounded-none px-12 py-8 text-xl font-light tracking-wide">
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
  <div className="bg-white rounded-none p-12 border border-gray-100 hover:border-teal-200 transition-all duration-300 group">
    <div className="mb-8 group-hover:scale-110 transition-transform duration-300">{icon}</div>
    <h3 className="text-2xl font-light text-gray-900 mb-6 tracking-wide">{title}</h3>
    <p className="text-gray-600 leading-relaxed font-light text-lg">{description}</p>
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
  <div className={`bg-white rounded-none p-12 border-2 ${popular ? 'border-teal-600 scale-105' : 'border-gray-100'} relative transition-all duration-300`}>
    {popular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-teal-600 text-white px-6 py-2 rounded-none text-lg font-light tracking-wide">
          Most Popular
        </span>
      </div>
    )}
    <div className="text-center mb-12">
      <h3 className="text-2xl font-light text-gray-900 mb-6 tracking-wide">{tier}</h3>
      <div>
        <span className="text-5xl font-light text-gray-900">${price}</span>
        <span className="text-gray-600 ml-3 text-xl font-light">/{period}</span>
      </div>
    </div>
    <ul className="space-y-6 mb-12">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <CheckCircle className="h-6 w-6 text-teal-600 mr-4 shrink-0 mt-0.5" />
          <span className="text-gray-700 font-light text-lg">{feature}</span>
        </li>
      ))}
    </ul>
    <Link to="/signup">
      <Button className={`w-full rounded-none py-6 text-lg font-light tracking-wide ${popular ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
        {ctaText}
      </Button>
    </Link>
  </div>
);

export default Landing;
