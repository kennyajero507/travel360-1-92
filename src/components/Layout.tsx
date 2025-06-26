
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import ProfessionalSidebar from "./ProfessionalSidebar";
import MobileNavigation from "./mobile/MobileNavigation";
import { CurrencyProvider } from "../contexts/CurrencyContext";
import AuthErrorBoundary from "./common/AuthErrorBoundary";
import { useAuth } from "../contexts/AuthContext";
import OrganizationSetupWizard from "./organization/OrganizationSetupWizard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Building2 } from "lucide-react";

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { profile, organization, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show organization setup if user doesn't have an organization
  if (profile && !profile.org_id) {
    return (
      <AuthErrorBoundary>
        <CurrencyProvider>
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
              <Card className="mb-6">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">Welcome to TravelFlow</CardTitle>
                  <CardDescription>
                    You need to set up your organization to continue using the platform.
                    This will only take a few minutes.
                  </CardDescription>
                </CardHeader>
              </Card>
              <OrganizationSetupWizard />
            </div>
          </div>
        </CurrencyProvider>
      </AuthErrorBoundary>
    );
  }

  // Show main layout for users with organizations
  return (
    <AuthErrorBoundary>
      <CurrencyProvider>
        <div className="min-h-screen flex w-full bg-slate-50">
          <ProfessionalSidebar />
          <main className="flex-1 overflow-auto">
            <div className="lg:hidden p-4 border-b bg-white">
              <MobileNavigation />
            </div>
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
