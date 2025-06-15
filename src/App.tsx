
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import AuthGuard from "./components/auth/AuthGuard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import OrganizationSetup from "./components/OrganizationSetup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DashboardPage from "./pages/DashboardPage";
import AdminLogin from "./pages/AdminLogin";
// Newly added
import Hotels from "./pages/Hotels";
import Inquiries from "./pages/Inquiries";
import Quotes from "./pages/Quotes";
import Bookings from "./pages/Bookings";
import CreateInquiry from "./pages/CreateInquiry";
import CreateQuote from "./pages/CreateQuote";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route 
                path="/admin/login"
                element={<AdminLogin />}
              />
              {/* Core Dashboard/Home */}
              <Route 
                path="/"
                element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                }
              />
              {/* Profile dashboard page */}
              <Route 
                path="/dashboard"
                element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                }
              />
              {/* Admin dashboard route */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <AuthGuard allowedRoles={['system_admin']}>
                    <AdminDashboard />
                  </AuthGuard>
                } 
              />
              {/* Organization Setup */}
              <Route 
                path="/organization/setup"
                element={
                  <AuthGuard>
                    <OrganizationSetup />
                  </AuthGuard>
                }
              />
              {/* Hotels */}
              <Route 
                path="/hotels"
                element={
                  <AuthGuard>
                    <Hotels />
                  </AuthGuard>
                }
              />

              {/* Inquiries */}
              <Route 
                path="/inquiries"
                element={
                  <AuthGuard>
                    <Inquiries />
                  </AuthGuard>
                }
              />
              <Route 
                path="/inquiries/create"
                element={
                  <AuthGuard>
                    <CreateInquiry />
                  </AuthGuard>
                }
              />

              {/* Quotes */}
              <Route 
                path="/quotes"
                element={
                  <AuthGuard>
                    <Quotes />
                  </AuthGuard>
                }
              />
              <Route 
                path="/quotes/create"
                element={
                  <AuthGuard>
                    <CreateQuote />
                  </AuthGuard>
                }
              />

              {/* Bookings */}
              <Route 
                path="/bookings"
                element={
                  <AuthGuard>
                    <Bookings />
                  </AuthGuard>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AuthErrorBoundary>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
