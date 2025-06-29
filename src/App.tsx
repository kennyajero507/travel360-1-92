
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SimpleAuthProvider } from "./contexts/SimpleAuthContext";
import { SimpleAuthGuard } from "./components/auth/SimpleAuthGuard";
import SimpleLogin from "./pages/SimpleLogin";
import SimpleSignup from "./pages/SimpleSignup";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleAuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<SimpleLogin />} />
              <Route path="/signup" element={<SimpleSignup />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <SimpleAuthGuard>
                    <Dashboard />
                  </SimpleAuthGuard>
                } 
              />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SimpleAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
