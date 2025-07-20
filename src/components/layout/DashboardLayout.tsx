import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { SimpleAuthGuard } from '../auth/SimpleAuthGuard';

const DashboardLayout = () => {
  const { profile } = useSimpleAuth();

  return (
    <SimpleAuthGuard>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SimpleAuthGuard>
  );
};

export default DashboardLayout;