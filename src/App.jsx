import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/DashboardLayout";
//import NotFound from "./pages/NotFound";
import Places from "./pages/Places";
import Events from "./pages/Events";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="places" element={<Places />} />
            <Route path="events" element={<Events />} />
            <Route path="analytics" element={<div className="p-6">Analytics Page</div>} />
            <Route path="bookings" element={<div className="p-6">Bookings Page</div>} />
            <Route path="destinations" element={<div className="p-6">Destinations Page</div>} />
            <Route path="users" element={<div className="p-6">Users Page</div>} />
            <Route path="revenue" element={<div className="p-6">Revenue Page</div>} />
            <Route path="settings" element={<div className="p-6">Settings Page</div>} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;