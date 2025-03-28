import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar } from '@/components/layout/sidebar';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ServiceCategory } from '@shared/schema';
import { Label } from '@/components/ui/label';
import { Search, Edit, Plus, User, Trash2, AlertCircle } from 'lucide-react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertEmployeeSchema } from '@shared/schema';

const employeeFormSchema = insertEmployeeSchema.extend({
  workingHours: z.object({
    monday: z.object({
      isOpen: z.boolean().default(true),
      start: z.string().min(1, "Start time is required"),
      end: z.string().min(1, "End time is required"),
    }),
    tuesday: z.object({
      isOpen: z.boolean().default(true),
      start: z.string().min(1, "Start time is required"),
      end: z.string().min(1, "End time is required"),
    }),
    wednesday: z.object({
      isOpen: z.boolean().default(true),
      start: z.string().min(1, "Start time is required"),
      end: z.string().min(1, "End time is required"),
    }),
    thursday: z.object({
      isOpen: z.boolean().default(true),
      start: z.string().min(1, "Start time is required"),
      end: z.string().min(1, "End time is required"),
    }),
    friday: z.object({
      isOpen: z.boolean().default(true),
      start: z.string().min(1, "Start time is required"),
      end: z.string().min(1, "End time is required"),
    }),
    saturday: z.object({
      isOpen: z.boolean().default(false),
      start: z.string().optional(),
      end: z.string().optional(),
    }),
    sunday: z.object({
      isOpen: z.boolean().default(false),
      start: z.string().optional(),
      end: z.string().optional(),
    }),
  }).optional(),
}).omit({ providerId: true });

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export default function AdminEmployeeManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<ServiceCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [activeDialog, setActiveDialog] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: ServiceCategory.HEALTHCARE,
      position: '',
      workingHours: {
        monday: { isOpen: true, start: '09:00', end: '17:00' },
        tuesday: { isOpen: true, start: '09:00', end: '17:00' },
        wednesday: { isOpen: true, start: '09:00', end: '17:00' },
        thursday: { isOpen: true, start: '09:00', end: '17:00' },
        friday: { isOpen: true, start: '09:00', end: '17:00' },
        saturday: { isOpen: false, start: '09:00', end: '17:00' },
        sunday: { isOpen: false, start: '09:00', end: '17:00' },
      },
    },
  });

  // Fetch employees
  const { data: employees, isLoading } = useQuery({
    queryKey: ['/api/employees'],
  });

  // Fetch providers for selecting in the form
  const { data: providers } = useQuery({
    queryKey: ['/api/providers'],
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormValues) => {
      const res = await apiRequest('POST', '/api/employees', {
        ...data,
        providerId: 1, // Use the first provider for demo, or ideally select from a dropdown
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Employee created',
        description: 'The employee has been added successfully.',
      });
      closeDialog();
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create employee',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EmployeeFormValues }) => {
      const res = await apiRequest('PATCH', `/api/employees/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Employee updated',
        description: 'The employee information has been updated successfully.',
      });
      closeDialog();
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update employee',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/employees/${id}`);
      if (res.ok) {
        return { success: true };
      }
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to delete employee');
    },
    onSuccess: () => {
      toast({
        title: 'Employee deleted',
        description: 'The employee has been removed successfully.',
      });
      closeDialog();
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete employee',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const openAddDialog = () => {
    reset();
    setActiveDialog('add');
  };

  const openEditDialog = (employee: any) => {
    setSelectedEmployee(employee);
    
    // Set form values
    setValue('firstName', employee.firstName);
    setValue('lastName', employee.lastName);
    setValue('email', employee.email);
    setValue('phone', employee.phone || '');
    setValue('department', employee.department);
    setValue('position', employee.position);
    
    // Set working hours if available
    if (employee.workingHours) {
      try {
        const hours = typeof employee.workingHours === 'string'
          ? JSON.parse(employee.workingHours)
          : employee.workingHours;
          
        Object.keys(hours).forEach((day) => {
          setValue(`workingHours.${day}.isOpen` as any, hours[day].isOpen);
          setValue(`workingHours.${day}.start` as any, hours[day].start);
          setValue(`workingHours.${day}.end` as any, hours[day].end);
        });
      } catch (error) {
        console.error('Failed to parse working hours:', error);
      }
    }
    
    setActiveDialog('edit');
  };

  const openDeleteDialog = (employee: any) => {
    setSelectedEmployee(employee);
    setActiveDialog('delete');
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setSelectedEmployee(null);
    reset();
  };

  const onSubmit = (data: EmployeeFormValues) => {
    if (activeDialog === 'add') {
      createEmployeeMutation.mutate(data);
    } else if (activeDialog === 'edit' && selectedEmployee) {
      updateEmployeeMutation.mutate({ id: selectedEmployee.id, data });
    }
  };

  const confirmDelete = () => {
    if (selectedEmployee) {
      deleteEmployeeMutation.mutate(selectedEmployee.id);
    }
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees
    ? employees.filter((employee) => {
        const searchMatch = 
          searchTerm === '' ||
          `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.position.toLowerCase().includes(searchTerm.toLowerCase());

        const departmentMatch = 
          departmentFilter === 'all' || 
          employee.department === departmentFilter;
          
        const statusMatch =
          statusFilter === 'all' ||
          (statusFilter === 'active' && employee.isActive) ||
          (statusFilter === 'inactive' && !employee.isActive);

        return searchMatch && departmentMatch && statusMatch;
      })
    : [];

  // Monitor working hours form fields
  const workingHours = watch('workingHours');
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar variant="admin" />
      
      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Employee Management</h1>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Employee
                </Button>
              </div>
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
                            placeholder="Search employees"
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <Select 
                          value={departmentFilter} 
                          onValueChange={(value) => setDepartmentFilter(value as ServiceCategory | 'all')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Departments" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            <SelectItem value={ServiceCategory.HEALTHCARE}>Healthcare</SelectItem>
                            <SelectItem value={ServiceCategory.SPORTS}>Sports</SelectItem>
                            <SelectItem value={ServiceCategory.PERSONAL_CARE}>Personal Care</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <Select 
                          value={statusFilter} 
                          onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Employee List */}
                <Card>
                  <CardHeader className="p-0">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Employee
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact Info
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Department
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Appointments
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {isLoading ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 text-center">
                                <p className="text-gray-500">Loading employees...</p>
                              </td>
                            </tr>
                          ) : filteredEmployees.length > 0 ? (
                            filteredEmployees.map((employee) => (
                              <tr key={employee.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="h-6 w-6 text-gray-500" />
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {employee.firstName} {employee.lastName}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {employee.position}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{employee.email}</div>
                                  <div className="text-sm text-gray-500">{employee.phone || 'No phone number'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{employee.department}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    employee.isActive
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {employee.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="text-sm text-gray-900">
                                    {employee.appointmentsCount || 0} Booked
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {employee.todayAppointmentsCount || 0} Today
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-primary hover:text-primary/80 mr-2"
                                    onClick={() => openEditDialog(employee)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => openDeleteDialog(employee)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center py-6">
                                  <AlertCircle className="h-10 w-10 text-gray-400 mb-2" />
                                  <h3 className="text-lg font-medium text-gray-900">No employees found</h3>
                                  <p className="mt-1 text-sm text-gray-500 max-w-md text-center">
                                    {searchTerm || departmentFilter !== 'all' || statusFilter !== 'all'
                                      ? 'Try adjusting your search or filters'
                                      : 'Get started by adding your first employee'}
                                  </p>
                                  {!searchTerm && departmentFilter === 'all' && statusFilter === 'all' && (
                                    <Button onClick={openAddDialog} className="mt-4">
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Employee
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={activeDialog === 'add' || activeDialog === 'edit'} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{activeDialog === 'add' ? 'Add New Employee' : 'Edit Employee'}</DialogTitle>
            <DialogDescription>
              {activeDialog === 'add'
                ? 'Add a new employee to your organization.'
                : 'Update employee information.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...register('firstName')} />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...register('lastName')} />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" {...register('phone')} />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    onValueChange={(value) => setValue('department', value as ServiceCategory)}
                    defaultValue={selectedEmployee?.department || ServiceCategory.HEALTHCARE}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ServiceCategory.HEALTHCARE}>Healthcare</SelectItem>
                      <SelectItem value={ServiceCategory.SPORTS}>Sports</SelectItem>
                      <SelectItem value={ServiceCategory.PERSONAL_CARE}>Personal Care</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-sm text-red-500">{errors.department.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" placeholder="e.g., Doctor, Trainer" {...register('position')} />
                  {errors.position && (
                    <p className="text-sm text-red-500">{errors.position.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Working Hours</Label>
                <div className="space-y-4 border rounded-md p-4">
                  {days.map((day) => (
                    <div key={day} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3 md:col-span-2">
                        <Label className="capitalize">{day}</Label>
                      </div>
                      <div className="col-span-3 md:col-span-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`${day}-isOpen`}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                            {...register(`workingHours.${day}.isOpen` as any)}
                          />
                          <Label htmlFor={`${day}-isOpen`} className="text-sm">
                            {workingHours?.[day]?.isOpen ? 'Open' : 'Closed'}
                          </Label>
                        </div>
                      </div>
                      <div className="col-span-6 md:col-span-8">
                        {workingHours?.[day]?.isOpen && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Input
                                type="time"
                                {...register(`workingHours.${day}.start` as any)}
                              />
                            </div>
                            <div>
                              <Input
                                type="time"
                                {...register(`workingHours.${day}.end` as any)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
              >
                {createEmployeeMutation.isPending || updateEmployeeMutation.isPending
                  ? 'Saving...'
                  : activeDialog === 'add'
                  ? 'Add Employee'
                  : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={activeDialog === 'delete'} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="py-4">
              <div className="text-sm space-y-2">
                <p className="font-medium text-gray-900">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </p>
                <p className="text-gray-500">
                  {selectedEmployee.position} ({selectedEmployee.department})
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteEmployeeMutation.isPending}
            >
              {deleteEmployeeMutation.isPending ? 'Deleting...' : 'Delete Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
