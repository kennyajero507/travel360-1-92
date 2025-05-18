
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Quotes from "./pages/Quotes";
import CreateQuote from "./pages/CreateQuote";
import EditQuote from "./pages/EditQuote";
import QuotePreview from "./pages/QuotePreview";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { Toaster } from "./components/ui/sonner";
import Inquiries from "./pages/Inquiries";
import CreateInquiry from "./pages/CreateInquiry";
import Hotels from "./pages/Hotels";
import CreateHotel from "./pages/CreateHotel";
import HotelDetails from "./pages/HotelDetails";
import EditHotel from "./pages/EditHotel";
import { RoleProvider } from "./contexts/role";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import Calendar from "./pages/Calendar";
import AgentManagement from "./pages/AgentManagement";

// New pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <RoleProvider>
      <CurrencyProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            {/* Public pages */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            
            {/* Authenticated pages */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="quotes" element={<Quotes />} />
              <Route path="quotes/create" element={<CreateQuote />} />
              <Route path="quotes/create/:inquiryId" element={<CreateQuote />} />
              <Route path="quotes/edit/:quoteId" element={<EditQuote />} />
              <Route path="quote-preview" element={<QuotePreview />} />
              <Route path="clients" element={<Clients />} />
              <Route path="inquiries" element={<Inquiries />} />
              <Route path="inquiries/create" element={<CreateInquiry />} />
              <Route path="hotels" element={<Hotels />} />
              <Route path="hotels/create" element={<CreateHotel />} />
              <Route path="hotels/:hotelId" element={<HotelDetails />} />
              <Route path="hotels/:hotelId/edit" element={<EditHotel />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="settings" element={<Settings />} />
              <Route path="agents" element={<AgentManagement />} />
              
              {/* Admin routes */}
              <Route path="admin/dashboard" element={<Dashboard />} />
              
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </CurrencyProvider>
    </RoleProvider>
  );
}

export default App;
