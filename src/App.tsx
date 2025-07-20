
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SimpleAuthProvider } from "./contexts/SimpleAuthContext";
import { SimpleAuthGuard } from "./components/auth/SimpleAuthGuard";
import DashboardLayout from "./components/layout/DashboardLayout";
import SimpleLogin from "./pages/SimpleLogin";
import SimpleSignup from "./pages/SimpleSignup";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import InquiriesPage from "./pages/inquiries/InquiriesPage";
import CreateInquiryPage from "./pages/inquiries/CreateInquiryPage";
import QuotesPage from "./pages/quotes/QuotesPage";
import CreateQuotePage from "./pages/quotes/CreateQuotePage";
import QuotePreviewPage from "./pages/quotes/QuotePreviewPage";

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
              <Route path="/" element={<DashboardLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="inquiries" element={<InquiriesPage />} />
                <Route path="inquiries/create" element={<CreateInquiryPage />} />
                <Route path="quotes" element={<QuotesPage />} />
                <Route path="quotes/create" element={<CreateQuotePage />} />
                <Route path="quotes/:id/preview" element={<QuotePreviewPage />} />
                {/* Add more protected routes here */}
              </Route>
              
              {/* Default redirect */}
              <Route index element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SimpleAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
