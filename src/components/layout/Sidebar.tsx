import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { Button } from '../ui/button';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Users, 
  Settings, 
  Building, 
  BarChart3,
  MapPin,
  Plane,
  CreditCard,
  HelpCircle,
  LogOut,
  Globe
} from 'lucide-react';

const Sidebar = () => {
  const { profile, signOut } = useSimpleAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const getNavigationItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    ];

    const roleSpecificItems = {
      system_admin: [
        { icon: Building, label: 'Organizations', path: '/admin/organizations' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: BarChart3, label: 'System Analytics', path: '/admin/analytics' },
        { icon: Settings, label: 'System Settings', path: '/admin/settings' },
      ],
      org_owner: [
        { icon: MessageSquare, label: 'Inquiries', path: '/inquiries' },
        { icon: FileText, label: 'Quotes', path: '/quotes' },
        { icon: Calendar, label: 'Bookings', path: '/bookings' },
        { icon: Users, label: 'Team', path: '/team' },
        { icon: MapPin, label: 'Destinations', path: '/destinations' },
        { icon: Building, label: 'Hotels', path: '/hotels' },
        { icon: Plane, label: 'Transport', path: '/transport' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ],
      tour_operator: [
        { icon: MessageSquare, label: 'Inquiries', path: '/inquiries' },
        { icon: FileText, label: 'Quotes', path: '/quotes' },
        { icon: Calendar, label: 'Bookings', path: '/bookings' },
        { icon: Users, label: 'Agents', path: '/agents' },
        { icon: MapPin, label: 'Destinations', path: '/destinations' },
        { icon: Building, label: 'Hotels', path: '/hotels' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
      ],
      agent: [
        { icon: MessageSquare, label: 'My Inquiries', path: '/inquiries' },
        { icon: FileText, label: 'My Quotes', path: '/quotes' },
        { icon: Calendar, label: 'My Bookings', path: '/bookings' },
        { icon: Building, label: 'Hotels', path: '/hotels' },
        { icon: Plane, label: 'Transport', path: '/transport' },
      ],
      customer_service: [
        { icon: MessageSquare, label: 'Inquiries', path: '/inquiries' },
        { icon: Users, label: 'Clients', path: '/clients' },
        { icon: Calendar, label: 'Bookings', path: '/bookings' },
        { icon: HelpCircle, label: 'Support', path: '/support' },
      ],
      accounts: [
        { icon: Calendar, label: 'Bookings', path: '/bookings' },
        { icon: CreditCard, label: 'Payments', path: '/payments' },
        { icon: BarChart3, label: 'Financial Reports', path: '/reports/financial' },
        { icon: FileText, label: 'Invoices', path: '/invoices' },
      ],
    };

    const userRole = profile?.role as keyof typeof roleSpecificItems;
    const roleItems = roleSpecificItems[userRole] || [];

    return [...baseItems, ...roleItems];
  };

  const navigationItems = getNavigationItems();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">TravelFlow360</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Travel SaaS</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      {profile && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {profile.full_name?.charAt(0) || profile.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {profile.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {profile.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link
          to="/help"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
        >
          <HelpCircle className="h-5 w-5" />
          <span>Help & Support</span>
        </Link>
        
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start space-x-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;