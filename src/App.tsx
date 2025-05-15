
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Quotes from "./pages/Quotes";
import CreateQuote from "./pages/CreateQuote";
import EditQuote from "./pages/EditQuote"; // Import the new EditQuote component
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
// Import from the new location
import { RoleProvider } from "./contexts/role";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import Calendar from "./pages/Calendar";
import AgentManagement from "./pages/AgentManagement";

function App() {
  return (
    <RoleProvider>
      <CurrencyProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="quotes" element={<Quotes />} />
              <Route path="quotes/create" element={<CreateQuote />} />
              <Route path="quotes/create/:inquiryId" element={<CreateQuote />} />
              <Route path="quotes/edit/:quoteId" element={<EditQuote />} /> {/* Use new EditQuote component */}
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
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </CurrencyProvider>
    </RoleProvider>
  );
}

export default App;
