import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentList } from "@/components/appointment/appointment-list";
import { AppointmentForm } from "@/components/appointment/appointment-form";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// Mock data for providers, services, and employees
// In a real application, these would come from API calls
const mockProviders = [
  { id: 1, companyName: "HealthCare Clinic", category: "Healthcare" },
  { id: 2, companyName: "FitZone Gym", category: "Sports" },
  { id: 3, companyName: "BeautyPlus Salon", category: "Personal Care" },
];

const mockServices = [
  { id: 1, providerId: 1, name: "Medical Checkup", description: "General health checkup", category: "Healthcare", duration: 30, price: 50 },
  { id: 2, providerId: 1, name: "Dental Cleaning", description: "Professional teeth cleaning", category: "Healthcare", duration: 45, price: 75 },
  { id: 3, providerId: 2, name: "Personal Training", description: "One-on-one fitness training", category: "Sports", duration: 60, price: 40 },
  { id: 4, providerId: 2, name: "Yoga Class", description: "Beginner friendly yoga session", category: "Sports", duration: 60, price: 25 },
  { id: 5, providerId: 3, name: "Haircut", description: "Haircut and styling", category: "Personal Care", duration: 45, price: 35 },
  { id: 6, providerId: 3, name: "Manicure", description: "Nail care and polish", category: "Personal Care", duration: 30, price: 25 },
];

const mockEmployees = [
  { id: 1, providerId: 1, firstName: "John", lastName: "Smith", department: "General Medicine", position: "Doctor", email: "john@example.com", phone: "123-456-7890" },
  { id: 2, providerId: 1, firstName: "Sarah", lastName: "Johnson", department: "Dentistry", position: "Dentist", email: "sarah@example.com", phone: "123-456-7891" },
  { id: 3, providerId: 2, firstName: "Mike", lastName: "Taylor", department: "Fitness", position: "Trainer", email: "mike@example.com", phone: "123-456-7892" },
  { id: 4, providerId: 3, firstName: "Lisa", lastName: "Davis", department: "Hair", position: "Stylist", email: "lisa@example.com", phone: "123-456-7893" },
  { id: 5, providerId: 3, firstName: "Emily", lastName: "Wilson", department: "Nails", position: "Technician", email: "emily@example.com", phone: "123-456-7894" },
];

export default function CustomerDashboardPage() {
  const { user, isLoading } = useAuth();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.firstName}! Manage your appointments here.
          </p>
        </div>
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Book New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Book a New Appointment</DialogTitle>
              <DialogDescription>
                Fill out the form below to book an appointment with one of our service providers.
              </DialogDescription>
            </DialogHeader>
            <AppointmentForm
              providers={mockProviders}
              services={mockServices}
              employees={mockEmployees}
              customerId={user.id}
              onSuccess={() => setIsBookingOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
          <TabsTrigger value="past">Past Appointments</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <AppointmentList role="Customer" />
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <AppointmentList role="Customer" />
        </TabsContent>
      </Tabs>
    </div>
  );
}