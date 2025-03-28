import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ServiceCategory } from '@shared/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Schema for company profile form
const companyProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  address: z.string().min(5, 'Address is required'),
  category: z.string({
    required_error: 'Please select a category',
  }),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address'),
  description: z.string().optional(),
});

// Schema for working hours form
const workingHoursSchema = z.object({
  monday: z.object({
    isOpen: z.boolean().default(true),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Please enter a valid time (HH:MM)',
    }),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Please enter a valid time (HH:MM)',
    }),
  }),
  tuesday: z.object({
    isOpen: z.boolean().default(true),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Please enter a valid time (HH:MM)',
    }),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Please enter a valid time (HH:MM)',
    }),
  }),
  wednesday: z.object({
    isOpen: z.boolean().default(true),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Please enter a valid time (HH:MM)',
    }),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Please enter a valid time (HH:MM)',
    }),
  }),
  thursday: z.object({
    isOpen: z.boolean().default(true),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Please enter a valid time (HH:MM)',
    }),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Please enter a valid time (HH:MM)',
    }),
  }),
  friday: z.object({
    isOpen: z.boolean().default(true),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Please enter a valid time (HH:MM)',
    }),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Please enter a valid time (HH:MM)',
    }),
  }),
  saturday: z.object({
    isOpen: z.boolean().default(false),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Please enter a valid time (HH:MM)',
    }),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Please enter a valid time (HH:MM)',
    }),
  }),
  sunday: z.object({
    isOpen: z.boolean().default(false),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Please enter a valid time (HH:MM)',
    }),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Please enter a valid time (HH:MM)',
    }),
  }),
});

type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;
type WorkingHoursFormValues = z.infer<typeof workingHoursSchema>;

export default function ProviderSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch provider details
  const { data: providerData, isLoading: isLoadingProvider } = useQuery({
    queryKey: ['/api/providers/byUserId', user?.id],
    enabled: !!user?.id,
  });

  // Company profile form
  const {
    register: registerCompany,
    handleSubmit: handleSubmitCompany,
    reset: resetCompany,
    setValue: setCompanyValue,
    formState: { errors: companyErrors, isDirty: isCompanyDirty },
  } = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: '',
      address: '',
      category: ServiceCategory.HEALTHCARE,
      phone: '',
      email: '',
      description: '',
    },
  });

  // Working hours form
  const {
    register: registerHours,
    handleSubmit: handleSubmitHours,
    setValue: setHoursValue,
    watch: watchHours,
    formState: { errors: hoursErrors, isDirty: isHoursDirty },
  } = useForm<WorkingHoursFormValues>({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: {
      monday: { isOpen: true, start: '09:00', end: '17:00' },
      tuesday: { isOpen: true, start: '09:00', end: '17:00' },
      wednesday: { isOpen: true, start: '09:00', end: '17:00' },
      thursday: { isOpen: true, start: '09:00', end: '17:00' },
      friday: { isOpen: true, start: '09:00', end: '17:00' },
      saturday: { isOpen: false, start: '09:00', end: '17:00' },
      sunday: { isOpen: false, start: '09:00', end: '17:00' },
    },
  });

  // Watch working hours form values to toggle fields
  const workingHours = watchHours();

  // Update form values when provider data is loaded
  useEffect(() => {
    if (providerData) {
      // Update company profile form
      setCompanyValue('companyName', providerData.companyName || '');
      setCompanyValue('address', providerData.address || '');
      setCompanyValue('category', providerData.category || ServiceCategory.HEALTHCARE);
      
      // User information from the provider's user account
      if (providerData.userInfo) {
        setCompanyValue('phone', providerData.userInfo.phone || '');
        setCompanyValue('email', providerData.userInfo.email || '');
      }
      
      setCompanyValue('description', providerData.description || '');
      
      // Update working hours form if workingHours is available
      if (providerData.workingHours) {
        try {
          const hours = typeof providerData.workingHours === 'string'
            ? JSON.parse(providerData.workingHours)
            : providerData.workingHours;
            
          Object.keys(hours).forEach((day) => {
            setHoursValue(`${day}.isOpen` as any, hours[day].isOpen);
            setHoursValue(`${day}.start` as any, hours[day].start);
            setHoursValue(`${day}.end` as any, hours[day].end);
          });
        } catch (error) {
          console.error('Failed to parse working hours:', error);
        }
      }
    }
  }, [providerData, setCompanyValue, setHoursValue]);

  // Update provider profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: CompanyProfileFormValues) => {
      const providerId = providerData?.id;
      if (!providerId) {
        throw new Error('Provider ID not found');
      }
      
      const res = await apiRequest('PATCH', `/api/providers/${providerId}`, {
        companyName: data.companyName,
        address: data.address,
        category: data.category,
        description: data.description,
      });
      
      // Also update user information (email, phone)
      await apiRequest('PATCH', '/api/profile', {
        email: data.email,
        phone: data.phone,
      });
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your business profile has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/providers/byUserId'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update working hours mutation
  const updateHoursMutation = useMutation({
    mutationFn: async (data: WorkingHoursFormValues) => {
      const providerId = providerData?.id;
      if (!providerId) {
        throw new Error('Provider ID not found');
      }
      
      const res = await apiRequest('PATCH', `/api/providers/${providerId}`, {
        workingHours: data,
      });
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Working hours updated',
        description: 'Your business hours have been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/providers/byUserId'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update working hours',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onCompanySubmit = (data: CompanyProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onHoursSubmit = (data: WorkingHoursFormValues) => {
    updateHoursMutation.mutate(data);
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar variant="provider" />
      
      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">Company Settings</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">
                {isLoadingProvider ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading provider information...</p>
                  </div>
                ) : (
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                      <TabsTrigger value="profile">Business Profile</TabsTrigger>
                      <TabsTrigger value="hours">Working Hours</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="profile">
                      <Card>
                        <CardHeader>
                          <CardTitle>Business Profile</CardTitle>
                          <CardDescription>
                            Update your business information that will be visible to customers.
                          </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmitCompany(onCompanySubmit)}>
                          <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="companyName">Business Name</Label>
                                <Input
                                  id="companyName"
                                  {...registerCompany('companyName')}
                                />
                                {companyErrors.companyName && (
                                  <p className="text-sm text-red-500">{companyErrors.companyName.message}</p>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                  defaultValue={providerData?.category || ServiceCategory.HEALTHCARE}
                                  onValueChange={(value) => setCompanyValue('category', value)}
                                >
                                  <SelectTrigger id="category">
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={ServiceCategory.HEALTHCARE}>Healthcare</SelectItem>
                                    <SelectItem value={ServiceCategory.SPORTS}>Sports</SelectItem>
                                    <SelectItem value={ServiceCategory.PERSONAL_CARE}>Personal Care</SelectItem>
                                  </SelectContent>
                                </Select>
                                {companyErrors.category && (
                                  <p className="text-sm text-red-500">{companyErrors.category.message}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="address">Address</Label>
                              <Input
                                id="address"
                                {...registerCompany('address')}
                              />
                              {companyErrors.address && (
                                <p className="text-sm text-red-500">{companyErrors.address.message}</p>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  {...registerCompany('email')}
                                />
                                {companyErrors.email && (
                                  <p className="text-sm text-red-500">{companyErrors.email.message}</p>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                  id="phone"
                                  {...registerCompany('phone')}
                                />
                                {companyErrors.phone && (
                                  <p className="text-sm text-red-500">{companyErrors.phone.message}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="description">Description (Optional)</Label>
                              <Textarea
                                id="description"
                                placeholder="Tell customers about your business"
                                rows={4}
                                {...registerCompany('description')}
                              />
                              {companyErrors.description && (
                                <p className="text-sm text-red-500">{companyErrors.description.message}</p>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end">
                            <Button
                              type="submit"
                              disabled={updateProfileMutation.isPending || !isCompanyDirty}
                            >
                              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </CardFooter>
                        </form>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="hours">
                      <Card>
                        <CardHeader>
                          <CardTitle>Working Hours</CardTitle>
                          <CardDescription>
                            Set your business hours so customers know when they can book appointments.
                          </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmitHours(onHoursSubmit)}>
                          <CardContent>
                            <div className="space-y-6">
                              {days.map((day) => (
                                <div key={day} className="grid grid-cols-12 gap-4 items-center">
                                  <div className="col-span-3 md:col-span-2">
                                    <Label className="capitalize">{day}</Label>
                                  </div>
                                  <div className="col-span-3 md:col-span-2">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`${day}-isOpen`}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                        {...registerHours(`${day}.isOpen` as any)}
                                      />
                                      <Label htmlFor={`${day}-isOpen`} className="text-sm">
                                        {workingHours[day]?.isOpen ? 'Open' : 'Closed'}
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="col-span-6 md:col-span-8">
                                    {workingHours[day]?.isOpen && (
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <Label htmlFor={`${day}-start`} className="text-xs">
                                            Open
                                          </Label>
                                          <Input
                                            id={`${day}-start`}
                                            type="time"
                                            {...registerHours(`${day}.start` as any)}
                                          />
                                          {hoursErrors[day]?.start && (
                                            <p className="text-xs text-red-500">
                                              {hoursErrors[day]?.start?.message}
                                            </p>
                                          )}
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`${day}-end`} className="text-xs">
                                            Close
                                          </Label>
                                          <Input
                                            id={`${day}-end`}
                                            type="time"
                                            {...registerHours(`${day}.end` as any)}
                                          />
                                          {hoursErrors[day]?.end && (
                                            <p className="text-xs text-red-500">
                                              {hoursErrors[day]?.end?.message}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end">
                            <Button
                              type="submit"
                              disabled={updateHoursMutation.isPending || !isHoursDirty}
                            >
                              {updateHoursMutation.isPending ? 'Saving...' : 'Save Working Hours'}
                            </Button>
                          </CardFooter>
                        </form>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
