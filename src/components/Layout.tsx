
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import ProfessionalSidebar from "./ProfessionalSidebar";
import { CurrencyProvider } from "../contexts/CurrencyContext";

const Layout = () => {
  return (
    <CurrencyProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <ProfessionalSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              fontFamily: 'Jost, sans-serif',
            },
          }}
        />
      </div>
    </CurrencyProvider>
  );
};

export default Layout;
