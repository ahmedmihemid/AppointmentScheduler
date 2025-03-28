import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/layout/navbar';
import { useQuery } from '@tanstack/react-query';
import { AppointmentStatus, ServiceCategory } from '@shared/schema';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

export default function CustomerHomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  // Parse query parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (category && Object.values(ServiceCategory).includes(category as ServiceCategory)) {
      setSelectedCategory(category as ServiceCategory);
    }
  }, []);

  // Fetch upcoming appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['/api/appointments'],
    select: (data) => {
      // Get upcoming appointments (confirmed or pending)
      return data
        .filter((appt) => 
          (appt.status === AppointmentStatus.CONFIRMED || 
           appt.status === AppointmentStatus.PENDING) && 
          new Date(appt.date) >= new Date()
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 2); // Only show the next 2 appointments
    }
  });

  const handleCategoryClick = (category: ServiceCategory) => {
    setSelectedCategory(category);
    // Now implement browsing providers in this category...
    // For now, redirect to the appointments page as a placeholder
    setLocation('/customer/appointments');
  };

  const handleViewAllAppointments = () => {
    setLocation('/customer/appointments');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold mb-8">
          Welcome back, {user?.firstName}!
        </h1>

        {/* Categories */}
        <h2 className="text-xl font-semibold mb-4">What service are you looking for today?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Healthcare Category */}
          <div 
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleCategoryClick(ServiceCategory.HEALTHCARE)}
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Healthcare</h3>
              <p className="text-gray-600 mb-4">
                Doctor visits, dental appointments, therapy sessions, and more
              </p>
              <span className="text-primary font-medium flex items-center">
                Browse providers <ArrowRight className="h-4 w-4 ml-1" />
              </span>
            </div>
          </div>

          {/* Sports Category */}
          <div 
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleCategoryClick(ServiceCategory.SPORTS)}
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Sports</h3>
              <p className="text-gray-600 mb-4">
                Personal trainers, sports facilities, coaching, and fitness classes
              </p>
              <span className="text-green-600 font-medium flex items-center">
                Browse providers <ArrowRight className="h-4 w-4 ml-1" />
              </span>
            </div>
          </div>

          {/* Personal Care Category */}
          <div 
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleCategoryClick(ServiceCategory.PERSONAL_CARE)}
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Personal Care</h3>
              <p className="text-gray-600 mb-4">
                Hair salons, spas, beauty treatments, nail salons, and more
              </p>
              <span className="text-amber-600 font-medium flex items-center">
                Browse providers <ArrowRight className="h-4 w-4 ml-1" />
              </span>
            </div>
          </div>
        </div>

        {/* Recent Appointments */}
        <h2 className="text-xl font-semibold mb-4">Your Upcoming Appointments</h2>
        <Card className="mb-8">
          <CardContent className="p-6">
            {isLoadingAppointments ? (
              <div className="text-center py-4">Loading appointments...</div>
            ) : appointments && appointments.length > 0 ? (
              appointments.map((appointment, index) => (
                <div
                  key={appointment.id}
                  className={`${
                    index < appointments.length - 1 ? 'mb-4 pb-4 border-b' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      appointment.status === AppointmentStatus.CONFIRMED
                        ? 'bg-blue-100 text-primary'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-4 flex">
                    <Button variant="ghost" size="sm" className="text-gray-600 mr-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      Reschedule
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Cancel
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You don't have any upcoming appointments.</p>
                <Button onClick={() => setSelectedCategory(ServiceCategory.HEALTHCARE)}>
                  Book Your First Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="link" className="text-primary" onClick={handleViewAllAppointments}>
            View all appointments
          </Button>
        </div>
      </div>
    </div>
  );
}
