import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ServiceCategory, UserRole } from "@shared/schema";
import { Footer } from "@/components/layout/footer";

export default function LandingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleCustomerSignup = () => {
    setLocation("/auth");
  };

  const handleProviderLogin = () => {
    setLocation("/auth");
  };

  const handleCategoryClick = (category: ServiceCategory) => {
    if (user) {
      setLocation(`/customer?category=${category}`);
    } else {
      setLocation("/auth");
    }
  };

  // Redirect to dashboard if already logged in
  if (user) {
    if (user.role === UserRole.CUSTOMER) {
      setLocation("/customer");
    } else if (user.role === UserRole.PROVIDER) {
      setLocation("/provider");
    } else if (user.role === UserRole.ADMIN) {
      setLocation("/admin/employees");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-primary font-bold text-xl">AppointEase</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setLocation("/auth")}>
                Log in
              </Button>
              <Button onClick={handleCustomerSignup}>Sign up</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Book appointments with ease</h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect with service providers in healthcare, sports, and personal care with our simple booking platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={handleCustomerSignup}>
                Sign up as Customer
              </Button>
              <Button size="lg" variant="outline" onClick={handleProviderLogin}>
                Login as Service Provider
              </Button>
            </div>
          </div>
          <div className="order-first md:order-last mb-8 md:mb-0">
            <img
              src="https://images.unsplash.com/photo-1552345387-a7d5065b9a0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
              alt="Booking appointment illustration"
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Browse Services by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Healthcare Category */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary"
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
                <h3 className="text-xl font-semibold mb-2">Healthcare</h3>
                <p className="text-gray-600 mb-4">
                  Book appointments with doctors, dentists, therapists, and more
                </p>
                <Button onClick={() => handleCategoryClick(ServiceCategory.HEALTHCARE)}>
                  Explore Healthcare
                </Button>
              </div>
            </div>

            {/* Sports Category */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-600"
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
                <h3 className="text-xl font-semibold mb-2">Sports</h3>
                <p className="text-gray-600 mb-4">
                  Schedule sessions with trainers, coaches, and sports facilities
                </p>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleCategoryClick(ServiceCategory.SPORTS)}
                >
                  Explore Sports
                </Button>
              </div>
            </div>

            {/* Personal Care Category */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-amber-600"
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
                <h3 className="text-xl font-semibold mb-2">Personal Care</h3>
                <p className="text-gray-600 mb-4">
                  Book appointments for salons, spas, beauty treatments and more
                </p>
                <Button
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => handleCategoryClick(ServiceCategory.PERSONAL_CARE)}
                >
                  Explore Personal Care
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-primary font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose a Category</h3>
              <p className="text-gray-600">
                Browse through our categories and find the service you need
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-primary font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a Provider</h3>
              <p className="text-gray-600">
                Find available service providers in your city and view their details
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-primary font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Appointment</h3>
              <p className="text-gray-600">
                Choose a time slot and confirm your booking in just a few clicks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-300 mr-3"></div>
                <div>
                  <h4 className="font-medium">Sarah Johnson</h4>
                  <p className="text-gray-500 text-sm">Customer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "AppointEase has made booking my healthcare appointments so much easier. No more
                waiting on hold or dealing with scheduling conflicts!"
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-300 mr-3"></div>
                <div>
                  <h4 className="font-medium">Mark Williams</h4>
                  <p className="text-gray-500 text-sm">Service Provider</p>
                </div>
              </div>
              <p className="text-gray-600">
                "As a personal trainer, this platform has helped me organize my schedule and connect
                with new clients. It's been a game-changer!"
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-300 mr-3"></div>
                <div>
                  <h4 className="font-medium">Emily Davis</h4>
                  <p className="text-gray-500 text-sm">Customer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "I use AppointEase for all my salon appointments now. The reminders and easy
                rescheduling features have saved me from missing appointments!"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
