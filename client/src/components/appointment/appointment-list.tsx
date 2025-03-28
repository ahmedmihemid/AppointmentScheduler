import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Appointment, AppointmentStatus, useAppointments } from "@/hooks/use-appointments";
import { Calendar, Clock, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";

interface AppointmentListProps {
  role: string;
}

export function AppointmentList({ role }: AppointmentListProps) {
  const { 
    appointments, 
    isLoading, 
    error, 
    updateAppointmentStatusMutation 
  } = useAppointments(role);

  const handleUpdateStatus = async (id: number, status: AppointmentStatus) => {
    try {
      await updateAppointmentStatusMutation.mutateAsync({ id, status });
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>Error loading appointments: {error.message}</p>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>No appointments found.</p>
      </div>
    );
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "outline";
      case "Confirmed":
        return "default";
      case "Canceled":
        return "destructive";
      case "Completed":
        return "secondary";
      default:
        return "outline";
    }
  };

  const renderActionButtons = (appointment: Appointment) => {
    if (updateAppointmentStatusMutation.isPending) {
      return (
        <Button disabled className="w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </Button>
      );
    }

    if (role === "Provider" && appointment.status === "Pending") {
      return (
        <div className="flex gap-2">
          <Button 
            onClick={() => handleUpdateStatus(appointment.id, AppointmentStatus.CONFIRMED)}
            className="flex-1"
          >
            Confirm
          </Button>
          <Button 
            onClick={() => handleUpdateStatus(appointment.id, AppointmentStatus.CANCELED)}
            variant="destructive"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      );
    }

    if (role === "Provider" && appointment.status === "Confirmed") {
      return (
        <Button 
          onClick={() => handleUpdateStatus(appointment.id, AppointmentStatus.COMPLETED)}
          className="w-full"
        >
          Mark as Completed
        </Button>
      );
    }

    if (role === "Customer" && (appointment.status === "Pending" || appointment.status === "Confirmed")) {
      return (
        <Button 
          onClick={() => handleUpdateStatus(appointment.id, AppointmentStatus.CANCELED)}
          variant="destructive"
          className="w-full"
        >
          Cancel Appointment
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {appointments.map((appointment) => (
        <Card key={appointment.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{appointment.serviceName}</CardTitle>
                <CardDescription>{appointment.serviceCategory}</CardDescription>
              </div>
              <Badge variant={getBadgeVariant(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{format(parseISO(appointment.date), "PPP")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>{format(parseISO(appointment.date), "p")} ({appointment.duration} min)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span>
                {role === "Customer" 
                  ? `Provider: ${appointment.providerName}` 
                  : `Customer: ${appointment.customerName}`}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Booked on {format(parseISO(appointment.createdAt), "PPP")}
            </div>
          </CardContent>
          <CardFooter>
            {renderActionButtons(appointment)}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}