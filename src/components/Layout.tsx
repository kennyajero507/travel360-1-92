
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import ProfessionalSidebar from "./ProfessionalSidebar";
import { CurrencyProvider } from "../contexts/CurrencyContext";
import AuthErrorBoundary from "./common/AuthErrorBoundary";

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <AuthErrorBoundary>
      <CurrencyProvider>
        <div className="min-h-screen flex w-full bg-slate-50">
          <ProfessionalSidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {children || <Outlet />}
            </div>
          </main>
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                fontFamily: 'Inter, sans-serif',
              },
            }}
          />
        </div>
      </CurrencyProvider>
    </AuthErrorBoundary>
  );
};

export default Layout;
