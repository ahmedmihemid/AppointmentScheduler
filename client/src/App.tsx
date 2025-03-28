import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import CustomerDashboardPage from "@/pages/customer/dashboard-page";
import ProviderDashboardPage from "@/pages/provider/dashboard-page";
import AdminDashboardPage from "@/pages/admin/dashboard-page";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Customer routes */}
      <Route path="/customer">
        <ProtectedRoute 
          path="/customer" 
          component={CustomerDashboardPage} 
          requiredRole={UserRole.CUSTOMER}
        />
      </Route>
      
      {/* Provider routes */}
      <Route path="/provider">
        <ProtectedRoute 
          path="/provider" 
          component={ProviderDashboardPage} 
          requiredRole={UserRole.PROVIDER}
        />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin">
        <ProtectedRoute 
          path="/admin" 
          component={AdminDashboardPage} 
          requiredRole={UserRole.ADMIN}
        />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
