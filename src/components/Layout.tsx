
import React from 'react';
import { Outlet } from 'react-router-dom';
import SimplifiedSidebar from './SimplifiedSidebar';
import MobileNavigation from './mobile/MobileNavigation';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SimplifiedSidebar />
      </div>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-blue-600">TravelFlow360</h1>
          <MobileNavigation />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden h-16"></div> {/* Spacer for mobile header */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
