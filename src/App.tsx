import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import OrganizationSetup from "./components/OrganizationSetup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { checkOrganizationSetupNeeded } from "./utils/fixRLSPolicies";
import { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";

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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/organization-setup" element={<OrganizationSetup />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AuthErrorBoundary>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
