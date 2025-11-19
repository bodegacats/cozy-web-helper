import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminSubmissions from "./pages/AdminSubmissions";
import Portal from "./pages/Portal";
import PortalHome from "./pages/PortalHome";
import PortalRequest from "./pages/PortalRequest";
import AdminClients from "./pages/AdminClients";
import AdminClientDetail from "./pages/AdminClientDetail";
import AdminRequests from "./pages/AdminRequests";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/portal/home" element={<PortalHome />} />
          <Route path="/portal/request" element={<PortalRequest />} />
          <Route
            path="/admin/submissions"
            element={
              <ProtectedRoute>
                <AdminSubmissions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute>
                <AdminClients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clients/:id"
            element={
              <ProtectedRoute>
                <AdminClientDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <ProtectedRoute>
                <AdminRequests />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
