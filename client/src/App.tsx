import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import CustomerHomePage from "@/pages/customer/home-page";
import CustomerAppointmentsPage from "@/pages/customer/appointments-page";
import CustomerProfilePage from "@/pages/customer/profile-page";
import ProviderDashboard from "@/pages/provider/dashboard";
import ProviderAppointments from "@/pages/provider/appointments";
import ProviderServices from "@/pages/provider/services";
import ProviderSettings from "@/pages/provider/settings";
import AdminEmployeeManagement from "@/pages/admin/employee-management";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Customer routes */}
      <Route path="/customer">
        <ProtectedRoute path="/customer" component={CustomerHomePage} />
      </Route>
      <Route path="/customer/appointments">
        <ProtectedRoute path="/customer/appointments" component={CustomerAppointmentsPage} />
      </Route>
      <Route path="/customer/profile">
        <ProtectedRoute path="/customer/profile" component={CustomerProfilePage} />
      </Route>
      
      {/* Provider routes */}
      <Route path="/provider">
        <ProtectedRoute path="/provider" component={ProviderDashboard} />
      </Route>
      <Route path="/provider/appointments">
        <ProtectedRoute path="/provider/appointments" component={ProviderAppointments} />
      </Route>
      <Route path="/provider/services">
        <ProtectedRoute path="/provider/services" component={ProviderServices} />
      </Route>
      <Route path="/provider/settings">
        <ProtectedRoute path="/provider/settings" component={ProviderSettings} />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin/employees">
        <ProtectedRoute path="/admin/employees" component={AdminEmployeeManagement} />
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
