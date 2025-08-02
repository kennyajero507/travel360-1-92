import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { SimpleAuthGuard } from '../auth/SimpleAuthGuard';
import { SidebarProvider, SidebarTrigger, SidebarInset } from "../ui/sidebar";
import { AppSidebar } from "../AppSidebar";

const DashboardLayout = () => {
  const { profile } = useSimpleAuth();

  return (
    <SimpleAuthGuard>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-12 items-center border-b px-4">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-lg font-semibold">TravelFlow360</h1>
            </header>
            <main className="flex-1 p-6">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </SimpleAuthGuard>
  );
};

export default DashboardLayout;