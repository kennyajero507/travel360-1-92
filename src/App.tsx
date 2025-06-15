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
              <Route 
                path="/"
                element={
                  <AuthGuard>
                    <DashboardPage />
                  </AuthGuard>
                }
              />
              <Route 
                path="/dashboard"
                element={
                  <AuthGuard>
                    <DashboardPage />
                  </AuthGuard>
                }
              />
              {/* Admin dashboard route stays for now */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <AuthGuard allowedRoles={['system_admin']}>
                    <AdminDashboard />
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
