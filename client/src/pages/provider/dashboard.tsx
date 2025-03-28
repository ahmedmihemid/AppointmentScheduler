import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { useQuery } from '@tanstack/react-query';
import { AppointmentStatus } from '@shared/schema';
import { Calendar, CheckCircle, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { format } from 'date-fns';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['/api/appointments'],
    select: (data) => data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
  });

  // Fetch provider services
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/services/provider'],
  });

  // Count statistics
  const todayAppointments = appointments?.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  }).length || 0;

  const confirmedAppointments = appointments?.filter(
    appointment => appointment.status === AppointmentStatus.CONFIRMED
  ).length || 0;

  const pendingAppointments = appointments?.filter(
    appointment => appointment.status === AppointmentStatus.PENDING
  ).length || 0;

  const upcomingAppointments = appointments
    ?.filter(appointment => 
      new Date(appointment.date) >= new Date() && 
      (appointment.status === AppointmentStatus.CONFIRMED || 
       appointment.status === AppointmentStatus.PENDING)
    )
    .slice(0, 4);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar variant="provider" />
      
      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">
                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
                          <p className="text-2xl font-bold text-gray-800">{todayAppointments}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-semibold text-gray-900">Confirmed</h2>
                          <p className="text-2xl font-bold text-gray-800">{confirmedAppointments}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
                          <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-semibold text-gray-900">Pending</h2>
                          <p className="text-2xl font-bold text-gray-800">{pendingAppointments}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Upcoming Appointments */}
                <Card className="mb-8">
                  <CardHeader className="px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-medium">Upcoming Appointments</CardTitle>
                    </div>
                  </CardHeader>
                  <div className="px-4 py-3 flex justify-between text-sm font-medium bg-gray-50 text-gray-500">
                    <span className="w-1/4">Customer</span>
                    <span className="w-1/4">Service</span>
                    <span className="w-1/4">Time</span>
                    <span className="w-1/4 text-right">Actions</span>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {isLoadingAppointments ? (
                      <div className="px-6 py-4 text-center">Loading appointments...</div>
                    ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                      upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                          <div className="w-1/4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-500" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{appointment.customerName}</div>
                                <div className="text-sm text-gray-500">Customer</div>
                              </div>
                            </div>
                          </div>
                          <div className="w-1/4">
                            <div className="text-sm text-gray-900">{appointment.serviceName}</div>
                            <div className="text-sm text-gray-500">{appointment.duration} min</div>
                          </div>
                          <div className="w-1/4">
                            <div className="text-sm text-gray-900">
                              {format(new Date(appointment.date), 'MMMM d, h:mm a')}
                            </div>
                          </div>
                          <div className="w-1/4 text-right">
                            {appointment.status === AppointmentStatus.PENDING ? (
                              <>
                                <Button variant="outline" size="sm" className="text-green-600 border-green-300 hover:bg-green-50 mr-2">
                                  Confirm
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Confirmed
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-4 text-center">No upcoming appointments</div>
                    )}
                  </div>
                  <div className="bg-gray-50 px-4 py-3 text-center">
                    <Button 
                      variant="link" 
                      className="text-primary"
                      onClick={() => setLocation('/provider/appointments')}
                    >
                      View all appointments
                    </Button>
                  </div>
                </Card>
                
                {/* Services Overview */}
                <Card>
                  <CardHeader className="px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-medium">Services Overview</CardTitle>
                      <Button size="sm" onClick={() => setLocation('/provider/services')}>
                        Add Service
                      </Button>
                    </div>
                  </CardHeader>
                  <div className="divide-y divide-gray-200">
                    {isLoadingServices ? (
                      <div className="px-6 py-4 text-center">Loading services...</div>
                    ) : services && services.length > 0 ? (
                      services.slice(0, 3).map((service) => (
                        <div 
                          key={service.id} 
                          className="px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900">{service.name}</div>
                            <div className="text-sm text-gray-500">{service.duration} min</div>
                          </div>
                          <div className="mt-2 sm:mt-0 flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              ${(service.price / 100).toFixed(2)}
                            </span>
                            <div className="ml-4 flex">
                              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 mr-3">
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-4 text-center">
                        <p className="text-gray-500 mb-4">You haven't added any services yet.</p>
                        <Button onClick={() => setLocation('/provider/services')}>
                          Add Your First Service
                        </Button>
                      </div>
                    )}
                  </div>
                  {services && services.length > 0 && (
                    <div className="bg-gray-50 px-4 py-3 text-center">
                      <Button 
                        variant="link" 
                        className="text-primary"
                        onClick={() => setLocation('/provider/services')}
                      >
                        Manage all services
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
