import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import { UserRole } from "@shared/schema";

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole
}: {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: UserRole;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // If a specific role is required, check if the user has that role
  // Admin can access all pages regardless of required role
  if (requiredRole && user.role !== requiredRole && user.role !== UserRole.ADMIN) {
    // Redirect based on the user's role
    if (user.role === UserRole.CUSTOMER) {
      return <Redirect to="/customer" />;
    } else if (user.role === UserRole.PROVIDER) {
      return <Redirect to="/provider" />;
    } else if (user.role === UserRole.ADMIN) {
      return <Redirect to="/admin/employees" />;
    }
  }

  return <Component />;
}
