import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/layout/navbar';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppointmentStatus } from '@shared/schema';
import { Calendar, Mail, X } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type AppointmentFilter = 'upcoming' | 'past' | 'canceled';

export default function CustomerAppointmentsPage() {
  const [filter, setFilter] = useState<AppointmentFilter>('upcoming');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch all appointments
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['/api/appointments'],
  });

  // Cancel appointment mutation
  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('PATCH', `/api/appointments/${id}/status`, {
        status: AppointmentStatus.CANCELED,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Appointment canceled',
        description: 'Your appointment has been successfully canceled.',
      });
      setCancelDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to cancel appointment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const filteredAppointments = appointments
    ? appointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        const now = new Date();

        if (filter === 'upcoming') {
          return (
            appointment.status !== AppointmentStatus.CANCELED && appointmentDate >= now
          );
        }
        if (filter === 'past') {
          return (
            appointment.status !== AppointmentStatus.CANCELED && appointmentDate < now
          );
        }
        if (filter === 'canceled') {
          return appointment.status === AppointmentStatus.CANCELED;
        }
        return true;
      })
    : [];

  const handleCancelAppointment = (id: number) => {
    setAppointmentToCancel(id);
    setCancelDialogOpen(true);
  };

  const confirmCancelAppointment = () => {
    if (appointmentToCancel) {
      cancelMutation.mutate(appointmentToCancel);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold mb-8">My Appointments</h1>

        {/* Appointments Filter */}
        <Card className="mb-8">
          <div className="p-4 border-b flex flex-wrap items-center justify-between">
            <h2 className="text-lg font-semibold">Appointment History</h2>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <Button
                variant={filter === 'upcoming' ? 'default' : 'ghost'}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant={filter === 'past' ? 'default' : 'ghost'}
                onClick={() => setFilter('past')}
              >
                Past
              </Button>
              <Button
                variant={filter === 'canceled' ? 'default' : 'ghost'}
                onClick={() => setFilter('canceled')}
              >
                Canceled
              </Button>
            </div>
          </div>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-8">Loading appointments...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No appointments found.</p>
              </div>
            ) : (
              filteredAppointments.map((appointment, index) => (
                <div
                  key={appointment.id}
                  className={`mb-6 pb-6 ${
                    index < filteredAppointments.length - 1 ? 'border-b' : 'last:border-b-0 last:pb-0 last:mb-0'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{appointment.serviceName}</h3>
                      <p className="text-gray-600">{appointment.serviceCategory}</p>
                      <div className="flex items-center mt-2">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {new Date(appointment.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === AppointmentStatus.CONFIRMED
                            ? 'bg-blue-100 text-primary'
                            : appointment.status === AppointmentStatus.PENDING
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                      <button className="ml-4 text-gray-400 hover:text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {appointment.status !== AppointmentStatus.CANCELED && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Reschedule
                      </Button>
                      {filter === 'upcoming' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 flex items-center"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-300 hover:bg-green-50 flex items-center"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancel Appointment Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              No, keep appointment
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelAppointment}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Yes, cancel appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
