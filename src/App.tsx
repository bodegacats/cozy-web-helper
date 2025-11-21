import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Index from "./pages/Index";
import AIIntake from "./pages/AIIntake";
import AdminSubmissions from "./pages/AdminSubmissions";
import Portal from "./pages/Portal";
import PortalRequest from "./pages/PortalRequest";
import PortalAIChat from "./pages/PortalAIChat";
import AdminClients from "./pages/AdminClients";
import AdminClientDetail from "./pages/AdminClientDetail";
import AdminRequests from "./pages/AdminRequests";
import AdminPipeline from "./pages/AdminPipeline";
import AdminIntakes from "./pages/AdminIntakes";
import AdminBlog from "./pages/AdminBlog";
import AdminBlogEditor from "./pages/AdminBlogEditor";
// import Blog from "./pages/Blog";
// import BlogPost from "./pages/BlogPost";
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
            <Route path="/start" element={<AIIntake />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/portal/request" element={<PortalRequest />} />
          <Route path="/portal/chat" element={<PortalAIChat />} />
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
          <Route
            path="/admin/intakes"
            element={
              <ProtectedRoute>
                <AdminIntakes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pipeline"
            element={
              <ProtectedRoute>
                <AdminPipeline />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blog"
            element={
              <ProtectedRoute>
                <AdminBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blog/:id"
            element={
              <ProtectedRoute>
                <AdminBlogEditor />
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
