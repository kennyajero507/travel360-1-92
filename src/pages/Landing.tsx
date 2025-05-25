
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { CheckCircle, Globe, Users, CreditCard, Hotel, PieChart, Send, Star, ArrowRight, Zap, Shield, Clock } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Navigation */}
      <header className="border-b py-4 w-full">
        <nav className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-teal-600" />
            <span className="text-xl font-bold text-teal-600">TravelFlow360</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-slate-600 hover:text-teal-600">Login</Link>
            <Link to="/signup">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">Start Free Trial</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-teal-50 py-20 w-full">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-slate-800">
            The Complete Travel Business Management Platform
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-4xl mx-auto">
            Create professional quotes in minutes, manage your team, track bookings, and grow your travel business with our all-in-one platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link to="/signup">
              <Button className="bg-teal-600 hover:bg-teal-700 text-lg px-8 py-6">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" className="text-lg px-8 py-6 border-teal-600 text-teal-600 hover:bg-teal-50">
              View Demo
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-sm text-slate-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 w-full">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
              Everything You Need to Run Your Travel Business
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From quote creation to team management, TravelFlow360 provides all the tools you need to streamline operations and delight customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <FeatureCard 
              icon={<Zap className="h-8 w-8 text-teal-600" />}
              title="Lightning-Fast Quote Builder"
              description="Create professional travel quotes in under 5 minutes with our intuitive drag-and-drop interface. Compare multiple hotels and build custom itineraries."
            />
            <FeatureCard 
              icon={<Hotel className="h-8 w-8 text-teal-600" />}
              title="Multi-Hotel Comparison"
              description="Compare rates, amenities, and availability across multiple properties. Present the best options to your clients with detailed comparisons."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-teal-600" />}
              title="Advanced Agent Tools"
              description="Empower your team with role-based dashboards, assignment management, and performance tracking tools designed for travel professionals."
            />
            <FeatureCard 
              icon={<Send className="h-8 w-8 text-teal-600" />}
              title="Client-Friendly Sharing"
              description="Share beautiful, responsive quotes via email, WhatsApp, or secure links. Clients can view and approve quotes on any device."
            />
            <FeatureCard 
              icon={<PieChart className="h-8 w-8 text-teal-600" />}
              title="Business Analytics"
              description="Track conversion rates, agent performance, and revenue insights with powerful dashboards and automated reporting."
            />
            <FeatureCard 
              icon={<Shield className="h-8 w-8 text-teal-600" />}
              title="Secure & Compliant"
              description="Enterprise-grade security with role-based access control, data encryption, and GDPR compliance built-in."
            />
          </div>

          {/* Feature Showcase */}
          <div className="bg-slate-50 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800">
                  Built for Travel Professionals, By Travel Professionals
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Real-time Collaboration</h4>
                      <p className="text-slate-600">Team members can collaborate on quotes and share updates instantly.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Mobile-First Design</h4>
                      <p className="text-slate-600">Access your business on the go with our responsive mobile interface.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Custom Branding</h4>
                      <p className="text-slate-600">Add your logo and branding to all client-facing materials.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                    <Clock className="h-8 w-8 text-teal-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">Save 10+ Hours Per Week</h4>
                  <p className="text-slate-600">Our customers report saving over 10 hours per week on quote creation and client management.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-50 w-full">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choose the plan that fits your business. Start with our free trial and upgrade as you grow.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row justify-center gap-8 max-w-5xl mx-auto">
            <PricingCard 
              tier="Free Trial"
              price="0"
              period="14 days"
              features={[
                "Up to 2 team members",
                "10 quotes per month",
                "Basic hotel database",
                "Email support",
                "Mobile app access",
                "Basic analytics"
              ]}
              recommended={false}
              ctaText="Start Free Trial"
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
                "WhatsApp & email sharing",
                "Custom branding",
                "Priority support",
                "Advanced analytics",
                "API access"
              ]}
              recommended={true}
              ctaText="Start Basic Plan"
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
                "White-label solution",
                "Dedicated account manager",
                "Custom integrations",
                "Advanced reporting",
                "SLA guarantee"
              ]}
              recommended={false}
              ctaText="Start Pro Plan"
              popular={false}
            />
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-600 mb-4">Need a custom solution for your enterprise?</p>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 w-full">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
              Trusted by Travel Professionals Worldwide
            </h2>
            <p className="text-xl text-slate-600">
              See what our customers have to say about TravelFlow360
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="TravelFlow360 has transformed how we create quotes. What used to take hours now takes minutes, and our clients love the professional presentation."
              author="Sarah Johnson"
              title="Founder, Safari Dreams"
              rating={5}
            />
            <TestimonialCard 
              quote="The team management features are incredible. I can track all my agents' performance and ensure consistent quality across all our quotes."
              author="Michael Chen"
              title="Operations Manager, Adventure Tours Ltd"
              rating={5}
            />
            <TestimonialCard 
              quote="Our conversion rate has increased by 40% since switching to TravelFlow360. The quote presentation is just so much more professional."
              author="Emily Rodriguez"
              title="Travel Consultant, Wanderlust Travel"
              rating={5}
            />
          </div>

          {/* Case Study Highlight */}
          <div className="mt-16 bg-teal-50 rounded-2xl p-8 md:p-12">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800">
                Case Study: Adventure Tours Ltd
              </h3>
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                  <div className="text-3xl font-bold text-teal-600 mb-2">40%</div>
                  <div className="text-slate-600">Increase in conversion rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-teal-600 mb-2">60%</div>
                  <div className="text-slate-600">Faster quote creation</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-teal-600 mb-2">25%</div>
                  <div className="text-slate-600">Revenue growth in 6 months</div>
                </div>
              </div>
              <Button variant="outline">
                Read Full Case Study
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-teal-600 text-white w-full">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Travel Business?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of travel professionals who are already using TravelFlow360 to grow their business.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-slate-100">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600">
              View Pricing
            </Button>
          </div>
          <p className="text-teal-100 mt-4 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 w-full">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-teal-400">About Us</a></li>
                <li><a href="#" className="hover:text-teal-400">Careers</a></li>
                <li><a href="#" className="hover:text-teal-400">Blog</a></li>
                <li><a href="#" className="hover:text-teal-400">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-teal-400">Features</a></li>
                <li><a href="#" className="hover:text-teal-400">Pricing</a></li>
                <li><a href="#" className="hover:text-teal-400">Integrations</a></li>
                <li><a href="#" className="hover:text-teal-400">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-teal-400">Documentation</a></li>
                <li><a href="#" className="hover:text-teal-400">Help Center</a></li>
                <li><a href="#" className="hover:text-teal-400">Tutorials</a></li>
                <li><a href="#" className="hover:text-teal-400">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-teal-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-teal-400">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-teal-400">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Globe className="h-5 w-5 mr-2 text-teal-500" />
              <span className="font-bold text-teal-500">TravelFlow360</span>
            </div>
            <p className="text-sm text-slate-400">© 2025 TravelFlow360. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="border border-slate-200 hover:border-teal-200 hover:shadow-lg transition-all duration-300">
    <CardHeader>
      <div className="mb-4">{icon}</div>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-slate-600 text-base leading-relaxed">{description}</CardDescription>
    </CardContent>
  </Card>
);

// Pricing Card Component
const PricingCard = ({ 
  tier, 
  price, 
  period,
  features, 
  recommended,
  ctaText,
  popular
}: { 
  tier: string, 
  price: string, 
  period: string,
  features: string[], 
  recommended: boolean,
  ctaText: string,
  popular: boolean
}) => (
  <Card className={`${recommended ? 'border-teal-500 border-2 scale-105' : 'border-slate-200'} relative max-w-sm w-full`}>
    {popular && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          Most Popular
        </span>
      </div>
    )}
    <CardHeader className={`${recommended ? 'bg-teal-50' : ''} text-center`}>
      <CardTitle className="text-2xl font-bold">{tier}</CardTitle>
      <div className="mt-4">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-slate-600 ml-1">/{period}</span>
      </div>
    </CardHeader>
    <CardContent className="pt-6">
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="h-5 w-5 text-teal-500 mr-3 shrink-0 mt-0.5" />
            <span className="text-slate-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Link to="/signup">
        <Button className={`w-full ${recommended ? 'bg-teal-600 hover:bg-teal-700' : 'bg-slate-800 hover:bg-slate-900'}`}>
          {ctaText}
        </Button>
      </Link>
    </CardContent>
  </Card>
);

// Testimonial Card Component
const TestimonialCard = ({ 
  quote, 
  author, 
  title, 
  rating 
}: { 
  quote: string, 
  author: string, 
  title: string, 
  rating: number 
}) => (
  <Card className="border border-slate-200">
    <CardContent className="pt-6">
      <div className="flex mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
        ))}
      </div>
      <blockquote className="text-slate-700 mb-4 italic">"{quote}"</blockquote>
      <div>
        <div className="font-semibold text-slate-800">{author}</div>
        <div className="text-sm text-slate-600">{title}</div>
      </div>
    </CardContent>
  </Card>
);

export default Landing;
