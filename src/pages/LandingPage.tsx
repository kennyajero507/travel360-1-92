
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Globe, Plane, Users, BarChart3, Shield, Star } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-teal-600" />
            <span className="text-2xl font-bold text-teal-600">TravelFlow360</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/features" className="text-gray-600 hover:text-teal-600 transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-gray-600 hover:text-teal-600 transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-teal-600 transition-colors">
              About
            </Link>
            <Link to="/blog" className="text-gray-600 hover:text-teal-600 transition-colors">
              Blog
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-teal-600">
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
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Streamline Your Travel Agency Operations
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Complete travel management platform for agencies, tour operators, and travel professionals. 
            Manage quotes, bookings, clients, and more in one powerful system.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="px-8 py-3">
                View Features
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="h-8 w-8 text-teal-600" />
              </div>
              <CardTitle>Quote Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Create beautiful, professional quotes with multi-hotel options, 
                currency conversion, and client selection features.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-teal-600" />
              </div>
              <CardTitle>Client Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Track client preferences, booking history, and communications 
                in one centralized customer relationship system.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-teal-600" />
              </div>
              <CardTitle>Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get insights into your business performance with detailed 
                analytics, revenue tracking, and conversion metrics.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Trust Section */}
        <div className="text-center bg-gray-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Trusted by Travel Professionals Worldwide
          </h2>
          <div className="flex justify-center items-center space-x-8 mb-8">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-teal-600" />
              <span className="text-gray-600">Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-6 w-6 text-yellow-500" />
              <span className="text-gray-600">5-Star Support</span>
            </div>
          </div>
          <Link to="/signup">
            <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
              Start Your Free Trial Today
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="h-6 w-6 text-teal-400" />
                <span className="text-xl font-bold">TravelFlow360</span>
              </div>
              <p className="text-gray-400">
                Complete travel management platform for modern agencies.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/about" className="hover:text-white">About</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TravelFlow360. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
