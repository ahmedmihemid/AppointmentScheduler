import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentList } from "@/components/appointment/appointment-list";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, Users, AlertCircle } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function ProviderDashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Protected route should handle redirecting, but we need to return an element
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading user data...</p>
      </div>
    );
  }

  // In a real application, these would come from API calls
  const stats = {
    total: 12,
    upcoming: 5,
    confirmed: 3,
    pending: 2,
    canceled: 2,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Provider Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.firstName}! Manage your appointments, services, and staff here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All appointment requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">
              Appointments in the next 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Requests awaiting confirmation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">
              Ready to go appointments
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <AppointmentList role="Provider" />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <AppointmentList role="Provider" />
        </TabsContent>
        <TabsContent value="confirmed" className="mt-4">
          <AppointmentList role="Provider" />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <AppointmentList role="Provider" />
        </TabsContent>
      </Tabs>
    </div>
  );
}