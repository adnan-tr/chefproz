import React, { useState, useEffect } from 'react';
import { dbService } from '../../lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, MessageSquare, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Service {
  id: string;
  service_id: string;
  title: string;
  description: string;
  timeline: string;
  starting_price: number;
  icon: string;
  image: string;
  included_services: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const initialServiceState: Omit<Service, 'id' | 'created_at' | 'updated_at'> = {
  service_id: '',
  title: '',
  description: '',
  timeline: '',
  starting_price: 0,
  icon: 'FileText',
  image: '',
  included_services: [''],
  is_active: true
};

export default function ServiceAdmin() {
  const [services, setServices] = useState<Service[]>([]);
  const [specialRequests, setSpecialRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Omit<Service, 'id' | 'created_at' | 'updated_at'>>({...initialServiceState});
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [includedService, setIncludedService] = useState('');
  
  const iconOptions = [
    'FileText', 'Settings', 'Tool', 'Utensils', 'PenTool', 
    'Package', 'Wind', 'Briefcase', 'Clock', 'Coffee'
  ];

  useEffect(() => {
    fetchServices();
    fetchSpecialRequests();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dbService.getServices();
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch services');
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialRequests = async () => {
    try {
      const data = await dbService.getContactRequests();
      // Filter requests that are related to services (custom solution or installation)
      const serviceRelatedRequests = data.filter(request => 
        request.request_type === 'custom' || 
        request.request_type === 'installation' ||
        request.request_type === 'maintenance'
      );
      setSpecialRequests(serviceRelatedRequests);
    } catch (err) {
      console.error('Error fetching special requests:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'starting_price') {
      setCurrentService(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setCurrentService(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setCurrentService(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  const handleAddIncludedService = () => {
    if (includedService.trim()) {
      setCurrentService(prev => ({
        ...prev,
        included_services: [...prev.included_services, includedService.trim()]
      }));
      setIncludedService('');
    }
  };

  const handleRemoveIncludedService = (index: number) => {
    setCurrentService(prev => ({
      ...prev,
      included_services: prev.included_services.filter((_, i) => i !== index)
    }));
  };

  const handleEditIncludedService = (index: number, value: string) => {
    setCurrentService(prev => {
      const newIncludedServices = [...prev.included_services];
      newIncludedServices[index] = value;
      return {
        ...prev,
        included_services: newIncludedServices
      };
    });
  };

  const handleCreateService = async () => {
    try {
      setLoading(true);
      // Generate a service_id from the title if not provided
      if (!currentService.service_id) {
        const serviceId = currentService.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        currentService.service_id = serviceId;
      }
      
      // Filter out empty included services
      const filteredIncludedServices = currentService.included_services.filter(item => item.trim() !== '');
      
      const serviceData = {
        ...currentService,
        included_services: filteredIncludedServices.length > 0 ? filteredIncludedServices : []
      };
      
      await dbService.createService(serviceData);
      toast.success('Service created successfully');
      resetForm();
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create service');
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
    }
  };

  const handleUpdateService = async (id: string) => {
    try {
      setLoading(true);
      
      // Filter out empty included services
      const filteredIncludedServices = currentService.included_services.filter(item => item.trim() !== '');
      
      const serviceData = {
        ...currentService,
        included_services: filteredIncludedServices.length > 0 ? filteredIncludedServices : []
      };
      
      await dbService.updateService(id, serviceData);
      toast.success('Service updated successfully');
      resetForm();
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update service');
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
      setIsEditing(false);
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    
    try {
      setLoading(true);
      await dbService.deleteService(serviceToDelete);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete service');
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const openEditDialog = (service: Service) => {
    setCurrentService({
      service_id: service.service_id,
      title: service.title,
      description: service.description,
      timeline: service.timeline,
      starting_price: service.starting_price,
      icon: service.icon,
      image: service.image,
      included_services: [...service.included_services],
      is_active: service.is_active
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setServiceToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setCurrentService({...initialServiceState});
    setIsEditing(false);
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-lg">Loading services...</span>
      </div>
    );
  }

  if (error && services.length === 0) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
        <p className="text-lg">{error}</p>
        <Button 
          onClick={fetchServices} 
          className="mt-4 bg-red-600 hover:bg-red-700 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Function to export services data to JSON file
  const exportServicesData = () => {
    try {
      // Create a JSON string with the services data
      const servicesData = JSON.stringify(services, null, 2);
      
      // Create a blob with the data
      const blob = new Blob([servicesData], { type: 'application/json' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = url;
      a.download = 'services-data.json';
      
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Services data exported successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to export services data');
    }
  };

  return (
    <div className="w-full max-w-full py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Service Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportServicesData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                <DialogDescription>
                  {isEditing ? 'Update the service details below.' : 'Fill in the service details below to create a new service.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={currentService.title}
                      onChange={handleInputChange}
                      placeholder="Service Title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_id">Service ID (URL-friendly)</Label>
                    <Input
                      id="service_id"
                      name="service_id"
                      value={currentService.service_id}
                      onChange={handleInputChange}
                      placeholder="service-id"
                      disabled={isEditing}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={currentService.description}
                    onChange={handleInputChange}
                    placeholder="Service description"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeline">Timeline</Label>
                    <Input
                      id="timeline"
                      name="timeline"
                      value={currentService.timeline}
                      onChange={handleInputChange}
                      placeholder="e.g. 2-3 weeks"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="starting_price">Starting Price ($)</Label>
                    <Input
                      id="starting_price"
                      name="starting_price"
                      type="number"
                      value={currentService.starting_price}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon</Label>
                    <select
                      id="icon"
                      name="icon"
                      value={currentService.icon}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      name="image"
                      value={currentService.image}
                      onChange={handleInputChange}
                      placeholder="/images/services/example.jpg"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="is_active" 
                      checked={currentService.is_active}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Included Services</Label>
                  <div className="space-y-2">
                    {currentService.included_services.map((service, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={service}
                          onChange={(e) => handleEditIncludedService(index, e.target.value)}
                          placeholder="Service item"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          type="button"
                          onClick={() => handleRemoveIncludedService(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={includedService}
                      onChange={(e) => setIncludedService(e.target.value)}
                      placeholder="Add new service item"
                    />
                    <Button 
                      type="button"
                      onClick={handleAddIncludedService}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => isEditing ? 
                    handleUpdateService(services.find(s => s.service_id === currentService.service_id)?.id || '') : 
                    handleCreateService()
                  }
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteService}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Services Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No services found. Create your first service.
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.title}</TableCell>
                      <TableCell>${service.starting_price.toLocaleString()}</TableCell>
                      <TableCell>{service.timeline}</TableCell>
                      <TableCell>
                        {service.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(service)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openDeleteDialog(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Special Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle>Special Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Request Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specialRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No special requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  specialRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.company}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {request.request_type === 'custom' ? 'Custom Solution' : 
                           request.request_type === 'installation' ? 'Installation' : 
                           request.request_type === 'maintenance' ? 'Maintenance' : 
                           request.request_type}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{request.message}</TableCell>
                      <TableCell>
                        {request.status === 'pending' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        ) : request.status === 'in_progress' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}