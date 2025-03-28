import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar } from '@/components/layout/sidebar';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ServiceCategory } from '@shared/schema';
import { Plus, Search, Clock, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertServiceSchema } from '@shared/schema';

// Extended schema for the service form
const serviceFormSchema = insertServiceSchema.extend({
  priceInDollars: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: 'Price must be a valid dollar amount (e.g., 75.00)',
  }),
}).omit({ providerId: true });

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export default function ProviderServices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | 'all'>('all');
  const [activeDialog, setActiveDialog] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: '',
      description: '',
      duration: 30,
      category: ServiceCategory.HEALTHCARE,
      priceInDollars: '0.00',
    },
  });

  // Fetch provider services
  const { data: services, isLoading } = useQuery({
    queryKey: ['/api/services/provider'],
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormValues) => {
      // Convert price from dollars to cents for storage
      const price = Math.round(parseFloat(data.priceInDollars) * 100);
      const { priceInDollars, ...serviceData } = data;
      
      const res = await apiRequest('POST', '/api/services', {
        ...serviceData,
        price,
        providerId: 1, // This should be dynamically fetched from the user's provider ID
      });
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Service created',
        description: 'The service has been created successfully.',
      });
      closeDialog();
      queryClient.invalidateQueries({ queryKey: ['/api/services/provider'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create service',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ServiceFormValues }) => {
      // Convert price from dollars to cents for storage
      const price = Math.round(parseFloat(data.priceInDollars) * 100);
      const { priceInDollars, ...serviceData } = data;
      
      const res = await apiRequest('PATCH', `/api/services/${id}`, {
        ...serviceData,
        price,
      });
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Service updated',
        description: 'The service has been updated successfully.',
      });
      closeDialog();
      queryClient.invalidateQueries({ queryKey: ['/api/services/provider'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update service',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/services/${id}`);
      if (res.ok) {
        return { success: true };
      }
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to delete service');
    },
    onSuccess: () => {
      toast({
        title: 'Service deleted',
        description: 'The service has been deleted successfully.',
      });
      closeDialog();
      queryClient.invalidateQueries({ queryKey: ['/api/services/provider'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete service',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const openAddDialog = () => {
    reset();
    setActiveDialog('add');
  };

  const openEditDialog = (service: any) => {
    setSelectedService(service);
    setValue('name', service.name);
    setValue('description', service.description || '');
    setValue('duration', service.duration);
    setValue('category', service.category);
    setValue('priceInDollars', (service.price / 100).toFixed(2));
    setActiveDialog('edit');
  };

  const openDeleteDialog = (service: any) => {
    setSelectedService(service);
    setActiveDialog('delete');
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setSelectedService(null);
    reset();
  };

  const onSubmit = (data: ServiceFormValues) => {
    if (activeDialog === 'add') {
      createServiceMutation.mutate(data);
    } else if (activeDialog === 'edit' && selectedService) {
      updateServiceMutation.mutate({ id: selectedService.id, data });
    }
  };

  const confirmDelete = () => {
    if (selectedService) {
      deleteServiceMutation.mutate(selectedService.id);
    }
  };

  // Filter services based on search and category
  const filteredServices = services
    ? services.filter((service) => {
        const searchMatch = 
          searchTerm === '' ||
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const categoryMatch = 
          categoryFilter === 'all' || 
          service.category === categoryFilter;

        return searchMatch && categoryMatch;
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
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">
                {/* Filters */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            placeholder="Search service name or description"
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <Select 
                          value={categoryFilter} 
                          onValueChange={(value) => setCategoryFilter(value as ServiceCategory | 'all')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value={ServiceCategory.HEALTHCARE}>Healthcare</SelectItem>
                            <SelectItem value={ServiceCategory.SPORTS}>Sports</SelectItem>
                            <SelectItem value={ServiceCategory.PERSONAL_CARE}>Personal Care</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Services List */}
                <Card>
                  <CardHeader className="px-6 py-4 border-b">
                    <CardTitle className="text-lg font-medium">Your Services</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="p-6 text-center">
                        <p className="text-gray-500">Loading services...</p>
                      </div>
                    ) : filteredServices.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {filteredServices.map((service) => (
                          <div key={service.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                  {service.duration} minutes
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {service.category}
                                  </span>
                                </div>
                              </div>
                              {service.description && (
                                <p className="mt-2 text-sm text-gray-500">{service.description}</p>
                              )}
                            </div>
                            <div className="mt-4 md:mt-0 md:ml-6 flex items-center space-x-4">
                              <div className="text-lg font-medium text-gray-900">
                                ${(service.price / 100).toFixed(2)}
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(service)}
                                >
                                  <Pencil className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => openDeleteDialog(service)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                          <AlertCircle className="h-6 w-6 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No services found</h3>
                        <p className="mt-2 text-sm text-gray-500">
                          Get started by adding your first service.
                        </p>
                        <Button onClick={openAddDialog} className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Service
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Service Dialog */}
      <Dialog open={activeDialog === 'add' || activeDialog === 'edit'} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{activeDialog === 'add' ? 'Add New Service' : 'Edit Service'}</DialogTitle>
            <DialogDescription>
              {activeDialog === 'add'
                ? 'Create a new service that you offer to customers.'
                : 'Update the details of your existing service.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="name" className="text-right">
                  Service Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Dental Checkup"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="description" className="text-right">
                  Description (Optional)
                </Label>
                <Input
                  id="description"
                  placeholder="Brief description of the service"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration" className="text-right">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    {...register('duration', { valueAsNumber: true })}
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-500">{errors.duration.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price" className="text-right">
                    Price (USD)
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <Input
                      id="priceInDollars"
                      placeholder="0.00"
                      className="pl-7"
                      {...register('priceInDollars')}
                    />
                  </div>
                  {errors.priceInDollars && (
                    <p className="text-sm text-red-500">{errors.priceInDollars.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  onValueChange={(value) => setValue('category', value as ServiceCategory)}
                  defaultValue={selectedService?.category || ServiceCategory.HEALTHCARE}
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
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
              >
                {createServiceMutation.isPending || updateServiceMutation.isPending
                  ? 'Saving...'
                  : activeDialog === 'add'
                  ? 'Add Service'
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
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="py-4">
              <div className="text-sm space-y-2">
                <p className="font-medium text-gray-900">{selectedService.name}</p>
                <p className="text-gray-500">
                  {selectedService.duration} minutes | ${(selectedService.price / 100).toFixed(2)}
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
              disabled={deleteServiceMutation.isPending}
            >
              {deleteServiceMutation.isPending ? 'Deleting...' : 'Delete Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
