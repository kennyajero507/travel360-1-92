
import React, { useState } from 'react';
import VerticalNav from './VerticalNav';
import Header from './Header';
import { useAuth } from '../contexts/AuthContext';
import AdminRoleSwitcher from './AdminRoleSwitcher';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { userProfile } = useAuth();
  
  return (
    <div className="flex min-h-screen bg-slate-50">
      <VerticalNav collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <Header />
        
        {/* Add AdminRoleSwitcher if user is system_admin */}
        {userProfile && userProfile.role === 'system_admin' && (
          <div className="bg-amber-50 px-4 py-2 border-b border-amber-200">
            <AdminRoleSwitcher />
          </div>
        )}
        
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
