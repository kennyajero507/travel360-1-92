
import React from 'react';
import Navigation from '../components/landing/Navigation';
import Footer from '../components/landing/Footer';
import { CheckCircle, Users, Calendar, FileText, BarChart, Shield } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-teal-600" />,
      title: "Smart Quote Management",
      description: "Create professional quotes with multi-hotel comparisons, automated calculations, and client approval workflows."
    },
    {
      icon: <Calendar className="h-8 w-8 text-teal-600" />,
      title: "End-to-End Booking",
      description: "Convert approved quotes to confirmed bookings with automated voucher generation and client notifications."
    },
    {
      icon: <Users className="h-8 w-8 text-teal-600" />,
      title: "Team Collaboration",
      description: "Manage your travel team with role-based access, inquiry assignment, and real-time collaboration tools."
    },
    {
      icon: <BarChart className="h-8 w-8 text-teal-600" />,
      title: "Analytics & Insights",
      description: "Track conversion rates, revenue metrics, and team performance with comprehensive analytics dashboard."
    },
    {
      icon: <Shield className="h-8 w-8 text-teal-600" />,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with audit trails, data protection, and compliance features built-in."
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-teal-600" />,
      title: "Mobile Optimized",
      description: "Full mobile responsiveness ensures your team can work efficiently from any device, anywhere."
    }
  ];

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
              Everything you need to streamline your travel business operations and delight your clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Ready to get started?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup"
                className="bg-teal-600 text-white px-8 py-3 rounded-full font-medium hover:bg-teal-700 transition-colors"
              >
                Start Free Trial
              </a>
              <a 
                href="/pricing"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
