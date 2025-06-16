
import React from 'react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const MobileNavigation = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/inquiries', label: 'Inquiries' },
    { href: '/quotes', label: 'Quotes' },
    { href: '/bookings', label: 'Bookings' },
    { href: '/clients', label: 'Clients' },
    { href: '/hotels', label: 'Hotels' },
    { href: '/team', label: 'Team' },
    { href: '/settings', label: 'Settings' },
  ];

  const adminItems = [
    { href: '/admin/dashboard', label: 'Admin Dashboard' },
    { href: '/admin/users', label: 'User Management' },
    { href: '/admin/organizations', label: 'Organizations' },
    { href: '/admin/settings', label: 'Admin Settings' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Navigation</h2>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {profile?.role === 'system_admin' && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Admin
                      </h3>
                      {adminItems.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setOpen(false)}
                          className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive(item.href)
                              ? 'bg-red-100 text-red-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </nav>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="space-y-2">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;
