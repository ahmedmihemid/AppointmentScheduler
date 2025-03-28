import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CalendarInput } from "@/components/ui/calendar-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAppointments, AppointmentCreateDTO } from "@/hooks/use-appointments";
import { useState } from "react";
import { Loader2 } from "lucide-react";

// Define Service type
interface Service {
  id: number;
  name: string;
  description?: string;
  category: string;
  duration: number;
  price: number;
  providerId: number;
}

// Define Provider type
interface Provider {
  id: number;
  companyName: string;
  category: string;
}

// Define Employee type
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  providerId: number;
}

interface AppointmentFormProps {
  services: Service[];
  providers: Provider[];
  employees: Employee[];
  customerId: number;
  onSuccess?: () => void;
}

const appointmentSchema = z.object({
  providerId: z.number({
    required_error: "Please select a provider",
  }),
  serviceId: z.number({
    required_error: "Please select a service",
  }),
  employeeId: z.number().optional(),
  date: z.date({
    required_error: "Please select a date and time",
  }),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export function AppointmentForm({ 
  services, 
  providers, 
  employees, 
  customerId,
  onSuccess 
}: AppointmentFormProps) {
  const { toast } = useToast();
  const { createAppointmentMutation } = useAppointments("Customer");
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);

  // Filter services based on selected provider
  const filteredServices = selectedProviderId 
    ? services.filter(service => service.providerId === selectedProviderId) 
    : [];

  // Filter employees based on selected provider
  const filteredEmployees = selectedProviderId 
    ? employees.filter(employee => employee.providerId === selectedProviderId) 
    : [];

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      providerId: 0,
      serviceId: 0,
      employeeId: undefined,
      date: undefined,
    },
  });

  async function onSubmit(values: AppointmentFormValues) {
    const appointmentData: AppointmentCreateDTO = {
      customerId,
      providerId: values.providerId,
      serviceId: values.serviceId,
      employeeId: values.employeeId,
      date: values.date.toISOString(),
    };
    
    try {
      await createAppointmentMutation.mutateAsync(appointmentData);
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="providerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Provider</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(parseInt(value));
                  setSelectedProviderId(parseInt(value));
                  // Reset service and employee selection when provider changes
                  form.setValue("serviceId", 0);
                  // Reset employeeId - we need to unregister it to avoid type errors with undefined
                  form.unregister("employeeId");
                  // Re-register with default undefined value
                  form.register("employeeId");
                }}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id.toString()}>
                      {provider.companyName} - {provider.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the service provider for your appointment
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
                disabled={!selectedProviderId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredServices.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} - ${service.price} ({service.duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the service you want to book
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {filteredEmployees.length > 0 && (
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Staff Member (Optional)</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                  disabled={!selectedProviderId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a staff member (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.firstName} {employee.lastName} - {employee.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose a specific staff member if you prefer
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date and Time</FormLabel>
              <CalendarInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Select date and time"
                className="w-full"
              />
              <FormDescription>
                Select a date and time for your appointment
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={createAppointmentMutation.isPending}
        >
          {createAppointmentMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            "Book Appointment"
          )}
        </Button>
      </form>
    </Form>
  );
}