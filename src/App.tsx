import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { SessionProvider, useSession } from "@/contexts/SessionContext";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import Sales from "@/pages/Sales";
import Finance from "@/pages/Finance";
import Profile from "@/pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isLoggedIn } = useSession();

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} />
      {isLoggedIn ? (
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/clientes" element={<Customers />} />
          <Route path="/vendas" element={<Sales />} />
          <Route path="/financeiro" element={<Finance />} />
            <Route path="/perfil" element={<Profile />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SessionProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SessionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
