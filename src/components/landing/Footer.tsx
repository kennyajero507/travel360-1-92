
import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const Footer = () => {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Integrations', href: '/integrations' },
        { label: 'API', href: '/api' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '/docs' },
        { label: 'Help Center', href: '/help' },
        { label: 'Tutorials', href: '/tutorials' },
        { label: 'Community', href: '/community' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'Careers', href: '/careers' },
        { label: 'Blog', href: '/blog' },
        { label: 'Press', href: '/press' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookie-policy' },
        { label: 'GDPR Compliance', href: '/gdpr' },
      ]
    }
  ];

  return (
    <footer className="w-full bg-slate-900 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Globe className="h-8 w-8 text-teal-500" />
              <span className="text-xl font-bold text-teal-500">TravelFlow360</span>
            </Link>
            <p className="text-slate-400 mb-6 max-w-md">
              The complete travel business management platform. Create professional quotes, 
              manage your team, and grow your travel business.
            </p>
            
            {/* Newsletter Signup */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white">Stay Updated</h4>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter your email" 
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      to={link.href} 
                      className="text-slate-400 hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Globe className="h-5 w-5 mr-2 text-teal-500" />
            <span className="font-bold text-teal-500">TravelFlow360</span>
          </div>
          <p className="text-sm text-slate-400">
            © 2025 TravelFlow360. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
