
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
import { CheckCircle, Globe, Users, CreditCard, Hotel, PieChart, Send } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b py-4">
        <nav className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-teal-600" />
            <span className="text-xl font-bold text-teal-600">TravelFlow360</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-slate-600 hover:text-teal-600">Login</Link>
            <Link to="/signup">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">Sign Up</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-teal-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-slate-800">
            Simplify Your Tour Quoting with TravelFlow360
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto">
            Create, customize, and share quotes in minutes. 
            Streamline your travel business operations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button className="bg-teal-600 hover:bg-teal-700 text-lg px-8 py-6">
                Start Free Trial
              </Button>
            </Link>
            <Button variant="outline" className="text-lg px-8 py-6 border-teal-600 text-teal-600 hover:bg-teal-50">
              View Demo
            </Button>
            <Button variant="ghost" className="text-lg px-8 py-6 text-teal-600 hover:bg-teal-50">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-slate-800">
            Everything You Need For Travel Quoting
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Hotel className="h-8 w-8 text-teal-600" />}
              title="Fast Quote Creation"
              description="Create professional quotes in minutes with our easy-to-use interface. Add hotels, transfers, and activities with ease."
            />
            <FeatureCard 
              icon={<CreditCard className="h-8 w-8 text-teal-600" />}
              title="Hotel & Transfer Cost Management"
              description="Manage all your costs in one place. Set rates, markups, and special offers for maximum profitability."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-teal-600" />}
              title="Per-Person Sharing Pricing"
              description="Configure different rates for adults, children, and infants with customizable bed arrangements."
            />
            <FeatureCard 
              icon={<CheckCircle className="h-8 w-8 text-teal-600" />}
              title="Agent Assignments & Approvals"
              description="Assign inquiries to agents and manage approvals through a streamlined workflow."
            />
            <FeatureCard 
              icon={<Send className="h-8 w-8 text-teal-600" />}
              title="Client-Friendly Quote Views"
              description="Share professional quotes with clients through secure links they can view on any device."
            />
            <FeatureCard 
              icon={<PieChart className="h-8 w-8 text-teal-600" />}
              title="Performance Analytics"
              description="Track quote conversions, agent performance, and business metrics with our powerful dashboard."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-slate-800">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">
            Choose the plan that works for your business. All plans include our core features.
          </p>

          <div className="flex flex-col lg:flex-row justify-center gap-8">
            <PricingCard 
              tier="Starter"
              price="29"
              features={[
                "1 Organization",
                "Up to 2 Agents",
                "50 Quotes per Month",
                "Basic Hotel Database",
                "Email & WhatsApp Sharing",
                "Standard Support"
              ]}
              recommended={false}
            />
            <PricingCard 
              tier="Pro"
              price="99"
              features={[
                "1 Organization",
                "Up to 10 Agents",
                "Unlimited Quotes",
                "Advanced Hotel Database",
                "PDF Export & Branding",
                "Premium Support",
                "Advanced Analytics"
              ]}
              recommended={true}
            />
            <PricingCard 
              tier="Enterprise"
              price="Custom"
              features={[
                "Multiple Organizations",
                "Unlimited Agents",
                "Unlimited Quotes",
                "Custom Hotel Database",
                "Full White-Labeling",
                "Dedicated Support",
                "API Access"
              ]}
              recommended={false}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-10 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-teal-400">About Us</a></li>
                <li><a href="#" className="hover:text-teal-400">Careers</a></li>
                <li><a href="#" className="hover:text-teal-400">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-teal-400">Features</a></li>
                <li><a href="#" className="hover:text-teal-400">Pricing</a></li>
                <li><a href="#" className="hover:text-teal-400">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-teal-400">Documentation</a></li>
                <li><a href="#" className="hover:text-teal-400">Support</a></li>
                <li><a href="#" className="hover:text-teal-400">Tutorials</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-teal-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-teal-400">Cookie Policy</a></li>
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
  <Card className="border border-slate-200">
    <CardHeader>
      <div className="mb-2">{icon}</div>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-slate-600 text-base">{description}</CardDescription>
    </CardContent>
  </Card>
);

// Pricing Card Component
const PricingCard = ({ 
  tier, 
  price, 
  features, 
  recommended 
}: { 
  tier: string, 
  price: string, 
  features: string[], 
  recommended: boolean 
}) => (
  <Card className={`${recommended ? 'border-teal-500 border-2' : 'border-slate-200'} max-w-xs w-full`}>
    {recommended && (
      <div className="bg-teal-500 text-white text-center py-1 text-sm font-medium">
        RECOMMENDED
      </div>
    )}
    <CardHeader className={`${recommended ? 'bg-teal-50' : ''}`}>
      <CardTitle className="text-xl font-bold">{tier}</CardTitle>
      <div className="mt-4">
        <span className="text-4xl font-bold">${price}</span>
        {price !== "Custom" && <span className="text-slate-600 ml-1">/month</span>}
      </div>
    </CardHeader>
    <CardContent className="pt-6">
      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="h-5 w-5 text-teal-500 mr-2 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button className={`w-full mt-8 ${recommended ? 'bg-teal-600 hover:bg-teal-700' : 'bg-slate-800 hover:bg-slate-900'}`}>
        {price === "Custom" ? "Contact Sales" : "Get Started"}
      </Button>
    </CardContent>
  </Card>
);

export default Landing;
