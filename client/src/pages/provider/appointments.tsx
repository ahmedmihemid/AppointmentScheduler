import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar } from '@/components/layout/sidebar';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppointmentStatus } from '@shared/schema';
import { Calendar, Search, User, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type AppointmentStatusType = AppointmentStatus | 'all';

export default function ProviderAppointments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatusType>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [actionType, setActionType] = useState<'confirm' | 'cancel'>('confirm');
  const { toast } = useToast();

  // Fetch all appointments
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['/api/appointments'],
  });

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: AppointmentStatus }) => {
      const res = await apiRequest('PATCH', `/api/appointments/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: (data) => {
      const statusText = data.status === AppointmentStatus.CONFIRMED ? 'confirmed' : 'canceled';
      toast({
        title: `Appointment ${statusText}`,
        description: `The appointment has been successfully ${statusText}.`,
      });
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update appointment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleConfirmAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setActionType('confirm');
    setDialogOpen(true);
  };

  const handleCancelAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setActionType('cancel');
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedAppointment) return;
    
    updateStatusMutation.mutate({
      id: selectedAppointment.id,
      status: actionType === 'confirm' 
        ? AppointmentStatus.CONFIRMED 
        : AppointmentStatus.CANCELED
    });
  };

  // Filter appointments based on search, status, and date
  const filteredAppointments = appointments
    ? appointments.filter((appointment) => {
        // Search filter
        const searchMatch = 
          searchTerm === '' ||
          appointment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.serviceName?.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const statusMatch = 
          statusFilter === 'all' || 
          appointment.status === statusFilter;

        // Date filter
        const appointmentDate = new Date(appointment.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let dateMatch = true;
        if (dateFilter === 'today') {
          const endOfDay = new Date(today);
          endOfDay.setHours(23, 59, 59, 999);
          dateMatch = appointmentDate >= today && appointmentDate <= endOfDay;
        } else if (dateFilter === 'upcoming') {
          dateMatch = appointmentDate >= today;
        } else if (dateFilter === 'past') {
          dateMatch = appointmentDate < today;
        }

        return searchMatch && statusMatch && dateMatch;
      })
    : [];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar variant="provider" />
      
      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">
                {/* Filters */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Search
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            type="text"
                            placeholder="Search customer or service"
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <Select 
                          value={statusFilter} 
                          onValueChange={(value) => setStatusFilter(value as AppointmentStatusType)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value={AppointmentStatus.PENDING}>Pending</SelectItem>
                            <SelectItem value={AppointmentStatus.CONFIRMED}>Confirmed</SelectItem>
                            <SelectItem value={AppointmentStatus.CANCELED}>Canceled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <Select 
                          value={dateFilter} 
                          onValueChange={(value) => setDateFilter(value as 'all' | 'today' | 'upcoming' | 'past')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by date" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Dates</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="past">Past</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Appointments Table */}
                <Card>
                  <CardHeader className="px-6 py-4 border-b">
                    <CardTitle className="text-lg font-medium">Appointments</CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center">
                              <p className="text-gray-500">Loading appointments...</p>
                            </td>
                          </tr>
                        ) : filteredAppointments.length > 0 ? (
                          filteredAppointments.map((appointment) => (
                            <tr key={appointment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      <User className="h-6 w-6 text-gray-500" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {appointment.customerName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Customer
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {appointment.serviceName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {appointment.duration} min
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {format(new Date(appointment.date), 'MMMM d, yyyy')}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {format(new Date(appointment.date), 'h:mm a')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    appointment.status === AppointmentStatus.CONFIRMED
                                      ? 'bg-green-100 text-green-800'
                                      : appointment.status === AppointmentStatus.PENDING
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {appointment.status === AppointmentStatus.PENDING && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-green-600 border-green-300 hover:bg-green-50 mr-2"
                                      onClick={() => handleConfirmAppointment(appointment)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Confirm
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 border-red-300 hover:bg-red-50"
                                      onClick={() => handleCancelAppointment(appointment)}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </>
                                )}
                                {appointment.status === AppointmentStatus.CONFIRMED && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                    onClick={() => handleCancelAppointment(appointment)}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center">
                              <p className="text-gray-500">No appointments found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'confirm' ? 'Confirm Appointment' : 'Cancel Appointment'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'confirm'
                ? 'Are you sure you want to confirm this appointment?'
                : 'Are you sure you want to cancel this appointment? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="py-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-medium">{selectedAppointment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Service:</span>
                  <span className="font-medium">{selectedAppointment.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date & Time:</span>
                  <span className="font-medium">
                    {format(new Date(selectedAppointment.date), 'MMMM d, yyyy')} at{' '}
                    {format(new Date(selectedAppointment.date), 'h:mm a')}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'confirm' ? 'default' : 'destructive'}
              onClick={confirmAction}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>Processing...</>
              ) : actionType === 'confirm' ? (
                <>Confirm Appointment</>
              ) : (
                <>Cancel Appointment</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
