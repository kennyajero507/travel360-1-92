
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Quotes from "./pages/Quotes";
import CreateQuote from "./pages/CreateQuote";
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
import { RoleProvider } from "./contexts/RoleContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import Calendar from "./pages/Calendar";

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
              <Route path="quotes/edit/:quoteId" element={<CreateQuote />} />
              <Route path="quote-preview" element={<QuotePreview />} />
              <Route path="clients" element={<Clients />} />
              <Route path="inquiries" element={<Inquiries />} />
              <Route path="inquiries/create" element={<CreateInquiry />} />
              <Route path="hotels" element={<Hotels />} />
              <Route path="hotels/create" element={<CreateHotel />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </CurrencyProvider>
    </RoleProvider>
  );
}

export default App;
