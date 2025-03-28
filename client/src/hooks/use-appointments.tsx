import { queryClient, apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "./use-toast";

export enum AppointmentStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  CANCELED = "Canceled",
  COMPLETED = "Completed"
}

export interface Appointment {
  id: number;
  customerId: number;
  providerId: number;
  serviceId: number;
  employeeId?: number;
  date: string;
  customerName: string;
  providerName: string;
  serviceName: string;
  serviceCategory: string;
  duration: number;
  status: string;
  createdAt: string;
}

export interface AppointmentCreateDTO {
  customerId: number;
  providerId: number;
  serviceId: number;
  employeeId?: number;
  date: string;
}

export interface AppointmentUpdateDTO {
  status: AppointmentStatus;
}

export function useAppointments(role: string) {
  const { toast } = useToast();
  
  // Get appointments based on role
  const endpoint = role === "Customer" ? "/api/appointments/customer" : 
                  role === "Provider" ? "/api/appointments/provider" : 
                  "/api/appointments";
  
  const { data: appointments, isLoading, error, refetch } = useQuery<Appointment[]>({
    queryKey: [endpoint],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", endpoint);
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching appointments:", error);
        throw error;
      }
    }
  });

  // Create new appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointment: AppointmentCreateDTO) => {
      const res = await apiRequest("POST", "/api/appointments", appointment);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment booked",
        description: "Your appointment has been booked successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update appointment status mutation
  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: AppointmentStatus }) => {
      const res = await apiRequest("PUT", `/api/appointments/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      const actionText = variables.status === AppointmentStatus.CONFIRMED 
        ? "confirmed" 
        : variables.status === AppointmentStatus.CANCELED 
          ? "canceled" 
          : "updated";
      
      toast({
        title: `Appointment ${actionText}`,
        description: `The appointment has been ${actionText} successfully`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    appointments,
    isLoading,
    error,
    refetch,
    createAppointmentMutation,
    updateAppointmentStatusMutation
  };
}

export function useAppointmentById(id: number) {
  return useQuery<Appointment>({
    queryKey: [`/api/appointments/${id}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/appointments/${id}`);
      return await res.json();
    },
    enabled: !!id,
  });
}