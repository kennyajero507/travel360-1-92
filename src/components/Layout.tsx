
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
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
        </div>
      </CurrencyProvider>
    </AuthErrorBoundary>
  );
};

export default Layout;
