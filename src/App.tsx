
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Courts from "./pages/Courts";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Subscription from "./pages/Subscription";
import PlayerReceipts from "./pages/PlayerReceipts";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import PaymentLinkRedirect from "./pages/PaymentLinkRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<Landing />} />
              
              {/* User Authentication */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              
              {/* User Dashboard and Features */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courts" element={<Courts />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/receipts" element={<PlayerReceipts />} />
              
              {/* Admin Authentication */}
              <Route path="/admin-login" element={<AdminLogin />} />
              
              {/* Admin Panel - All admin routes */}
              <Route path="/admin/*" element={<Admin />} />
              
              {/* Payment Link Redirect */}
              <Route path="/payment/:linkId" element={<PaymentLinkRedirect />} />
              
              {/* Catch-all for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
