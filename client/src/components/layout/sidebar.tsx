import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { UserRole } from '@shared/schema';
import { 
  Home, 
  Calendar, 
  FileText, 
  Settings, 
  Users, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  variant: 'provider' | 'admin';
}

export function Sidebar({ variant }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation('/');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-white font-bold text-xl">AppointEase</span>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {variant === 'provider' && (
                <>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      location === '/provider'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setLocation('/provider')}
                  >
                    <LayoutDashboard className="mr-3 h-6 w-6" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      location === '/provider/appointments'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setLocation('/provider/appointments')}
                  >
                    <Calendar className="mr-3 h-6 w-6" />
                    Appointments
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      location === '/provider/services'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setLocation('/provider/services')}
                  >
                    <FileText className="mr-3 h-6 w-6" />
                    Services
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      location === '/provider/settings'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setLocation('/provider/settings')}
                  >
                    <Settings className="mr-3 h-6 w-6" />
                    Settings
                  </Button>
                </>
              )}

              {variant === 'admin' && (
                <>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      location === '/admin/dashboard'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setLocation('/admin/dashboard')}
                  >
                    <LayoutDashboard className="mr-3 h-6 w-6" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      location === '/admin/employees'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setLocation('/admin/employees')}
                  >
                    <Users className="mr-3 h-6 w-6" />
                    Employee Management
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      location === '/admin/services'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setLocation('/admin/services')}
                  >
                    <FileText className="mr-3 h-6 w-6" />
                    Service Management
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      location === '/admin/settings'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setLocation('/admin/settings')}
                  >
                    <Settings className="mr-3 h-6 w-6" />
                    Settings
                  </Button>
                </>
              )}
            </nav>
          </div>
          <div className="flex-shrink-0 flex bg-gray-700 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.profilePicture || ''} alt={`${user?.firstName} ${user?.lastName}`} />
                  <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs font-medium text-gray-300 group-hover:text-gray-200">
                    {user?.role === UserRole.PROVIDER
                      ? 'Service Provider'
                      : user?.role === UserRole.ADMIN
                      ? 'Administrator'
                      : 'User'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto text-gray-400 hover:text-white"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
