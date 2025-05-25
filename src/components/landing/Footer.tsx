
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
      <div className="w-full px-8 lg:px-16 xl:px-24 py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-8">
              <Globe className="h-10 w-10 text-teal-500" />
              <span className="text-2xl font-light text-teal-500 tracking-wide">TravelFlow360</span>
            </Link>
            <p className="text-slate-400 mb-8 max-w-md text-lg font-light leading-relaxed">
              The complete travel business management platform. Create professional quotes, 
              manage your team, and grow your travel business.
            </p>
            
            {/* Newsletter Signup */}
            <div className="space-y-4">
              <h4 className="font-light text-white text-xl tracking-wide">Stay Updated</h4>
              <div className="flex gap-3">
                <Input 
                  placeholder="Enter your email" 
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 rounded-none flex-1"
                />
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 rounded-none px-6">
                  <Mail className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-light text-white mb-6 text-xl tracking-wide">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      to={link.href} 
                      className="text-slate-400 hover:text-teal-400 transition-colors font-light text-lg"
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
        <div className="border-t border-slate-800 pt-12 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <Globe className="h-6 w-6 mr-3 text-teal-500" />
            <span className="font-light text-teal-500 text-xl tracking-wide">TravelFlow360</span>
          </div>
          <p className="text-lg text-slate-400 font-light">
            © 2025 TravelFlow360. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
