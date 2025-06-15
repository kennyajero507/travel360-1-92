
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminHeader from '../AdminHeader';
import { Sidebar } from './AdminSidebar';

const AdminLayout = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
