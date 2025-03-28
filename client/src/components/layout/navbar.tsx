import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, Search, ChevronDown, User, Calendar, LogOut, Settings } from 'lucide-react';
import { UserRole } from '@shared/schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation('/');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  const getDashboardLink = () => {
    if (user?.role === UserRole.CUSTOMER) return '/customer';
    if (user?.role === UserRole.PROVIDER) return '/provider';
    if (user?.role === UserRole.ADMIN) return '/admin/employees';
    return '/';
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <a
                onClick={() => setLocation(getDashboardLink())}
                className="text-primary font-bold text-xl cursor-pointer"
              >
                AppointEase
              </a>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {user?.role === UserRole.CUSTOMER && (
                <>
                  <a
                    onClick={() => setLocation('/customer')}
                    className={`border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${
                      window.location.pathname === '/customer'
                        ? 'border-primary text-gray-900'
                        : ''
                    }`}
                  >
                    Home
                  </a>
                  <a
                    onClick={() => setLocation('/customer/appointments')}
                    className={`border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${
                      window.location.pathname === '/customer/appointments'
                        ? 'border-primary text-gray-900'
                        : ''
                    }`}
                  >
                    My Appointments
                  </a>
                </>
              )}

              {user?.role === UserRole.PROVIDER && (
                <>
                  <a
                    onClick={() => setLocation('/provider')}
                    className={`border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${
                      window.location.pathname === '/provider'
                        ? 'border-primary text-gray-900'
                        : ''
                    }`}
                  >
                    Dashboard
                  </a>
                  <a
                    onClick={() => setLocation('/provider/appointments')}
                    className={`border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${
                      window.location.pathname === '/provider/appointments'
                        ? 'border-primary text-gray-900'
                        : ''
                    }`}
                  >
                    Appointments
                  </a>
                  <a
                    onClick={() => setLocation('/provider/services')}
                    className={`border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${
                      window.location.pathname === '/provider/services'
                        ? 'border-primary text-gray-900'
                        : ''
                    }`}
                  >
                    Services
                  </a>
                </>
              )}

              {user?.role === UserRole.ADMIN && (
                <>
                  <a
                    onClick={() => setLocation('/admin/employees')}
                    className={`border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${
                      window.location.pathname === '/admin/employees'
                        ? 'border-primary text-gray-900'
                        : ''
                    }`}
                  >
                    Employees
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {/* Search Button */}
            <button
              className="p-2 rounded-full text-gray-500 hover:text-gray-600 focus:outline-none"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-6 w-6" />
            </button>

            {/* User Menu */}
            {user ? (
              <div className="ml-3 relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="max-w-xs flex items-center text-sm rounded-full focus:outline-none">
                      <span className="mr-2 hidden md:inline-block">
                        {user.firstName} {user.lastName}
                      </span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profilePicture || ''} alt={`${user.firstName} ${user.lastName}`} />
                        <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                      </Avatar>
                      <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {user.role === UserRole.CUSTOMER && (
                      <>
                        <DropdownMenuItem onClick={() => setLocation('/customer/profile')}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation('/customer/appointments')}>
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Appointments</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {user.role === UserRole.PROVIDER && (
                      <>
                        <DropdownMenuItem onClick={() => setLocation('/provider')}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation('/provider/settings')}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => setLocation('/auth')}>
                  Log in
                </Button>
                <Button onClick={() => setLocation('/auth')}>Sign up</Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden ml-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 space-y-4">
                    {user?.role === UserRole.CUSTOMER && (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setLocation('/customer')}
                        >
                          Home
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setLocation('/customer/appointments')}
                        >
                          My Appointments
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setLocation('/customer/profile')}
                        >
                          Profile
                        </Button>
                      </>
                    )}

                    {user?.role === UserRole.PROVIDER && (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setLocation('/provider')}
                        >
                          Dashboard
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setLocation('/provider/appointments')}
                        >
                          Appointments
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setLocation('/provider/services')}
                        >
                          Services
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setLocation('/provider/settings')}
                        >
                          Settings
                        </Button>
                      </>
                    )}

                    {user?.role === UserRole.ADMIN && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setLocation('/admin/employees')}
                      >
                        Employees
                      </Button>
                    )}

                    <div className="pt-4 border-t">
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
