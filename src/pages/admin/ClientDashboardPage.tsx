import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Users,
  MessageSquare,
  FileText,
  ShoppingCart,
  TrendingUp,

  Mail,
  Phone,
  Building,
  MapPin,
  Percent,
  User,

  Target,

  Edit,
  Save,
  X,
  UserCheck,
  Plus
} from 'lucide-react';
import { dbService } from '@/lib/supabase';

interface ClientStats {
  id: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  usual_discount?: number;
  priority?: string;
  created_at: string;
  
  // Aggregated stats
  total_messages: number;
  total_quotations: number;
  total_orders: number;
  total_value: number;
  last_activity: string;
}

interface ClientDetail {
  messages: any[];
  quotations: any[];
  orders: any[];
}

const ClientDashboardPage: React.FC = () => {
  const [clients, setClients] = useState<ClientStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('company_name');
  const [selectedClient, setSelectedClient] = useState<ClientStats | null>(null);
  const [clientDetail] = useState<ClientDetail | null>(null);
  const [detailLoading] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientStats | null>(null);
  const [editForm, setEditForm] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    usual_discount: 0,
    priority: 'medium'
  });
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  useEffect(() => {
    fetchClientStats();
  }, []);

  const fetchClientStats = async () => {
    try {
      setLoading(true);
      
      // Get all data from normalized database structure
      const [quotations, contactRequests, allClients, orders] = await Promise.all([
        dbService.getQuotations(),
        dbService.getContactRequests(),
        dbService.getClients(),
        dbService.getOrders()
      ]);

      // Create a map to aggregate client data starting with actual clients
      const clientMap = new Map<string, ClientStats>();
      let totalQuotationValue = 0;

      // Initialize with all existing clients
      allClients.forEach((client: any) => {
        clientMap.set(client.id, {
          id: client.id,
          company_name: client.company_name,
          contact_person: client.contact_person,
          email: client.email,
          phone: client.phone,
          country: client.country,
          city: client.city,
          address: client.address,
          usual_discount: client.usual_discount || 0,

          priority: client.priority || 'medium',
          created_at: client.created_at,
          total_messages: 0,
          total_quotations: 0,
          total_orders: 0,
          total_value: 0,
          last_activity: client.created_at
        });
      });

      // Process quotations using normalized client relationship
      quotations.forEach((quotation: any) => {
        const quotationValue = quotation.final_amount || quotation.total_amount || 0;
        totalQuotationValue += quotationValue;
        
        if (quotation.client_id && clientMap.has(quotation.client_id)) {
          const client = clientMap.get(quotation.client_id)!;
          client.total_quotations++;
          
          if (new Date(quotation.created_at) > new Date(client.last_activity)) {
            client.last_activity = quotation.created_at;
          }
        }
      });

      // Process orders using normalized client relationship
      orders.forEach((order: any) => {
        if (order.client_id && clientMap.has(order.client_id)) {
          const client = clientMap.get(order.client_id)!;
          client.total_orders++;
          client.total_value += order.final_amount || order.total_amount || 0;
          
          if (new Date(order.created_at) > new Date(client.last_activity)) {
            client.last_activity = order.created_at;
          }
        }
      });

      // Process contact requests by matching email/company to existing clients
      contactRequests.forEach((request: any) => {
        // Find matching client by email or company name (case insensitive)
        const matchingClient = Array.from(clientMap.values()).find(client => {
          const emailMatch = request.email && client.email && 
            request.email.toLowerCase().trim() === client.email.toLowerCase().trim();
          const companyMatch = request.company && client.company_name && 
            request.company.toLowerCase().trim() === client.company_name.toLowerCase().trim();
          const nameMatch = request.name && client.contact_person &&
            request.name.toLowerCase().trim() === client.contact_person.toLowerCase().trim();
          
          return emailMatch || companyMatch || nameMatch;
        });
        
        if (matchingClient) {
          matchingClient.total_messages++;
          
          if (new Date(request.created_at) > new Date(matchingClient.last_activity)) {
            matchingClient.last_activity = request.created_at;
          }
        } else {
          // Create a virtual client entry for unmatched contact requests
          const virtualClientId = `virtual_${request.id}`;
          clientMap.set(virtualClientId, {
            id: virtualClientId,
            company_name: request.company || 'Unknown Company',
            contact_person: request.name || 'Unknown Contact',
            email: request.email || '',
            phone: '',
            country: '',
            city: '',
            address: '',
            usual_discount: 0,
            priority: 'medium',
            created_at: request.created_at,
            total_messages: 1,
            total_quotations: 0,
            total_orders: 0,
            total_value: 0,
            last_activity: request.created_at
          });
        }
      });

      setClients(Array.from(clientMap.values()));
      
      // Store total quotation value for the quotation total value card
      (window as any).totalQuotationValue = totalQuotationValue;
    } catch (error) {
      console.error('Error fetching client stats:', error);
    } finally {
      setLoading(false);
    }
  };





  const handleEditClient = (client: ClientStats) => {
    setEditingClient(client);
    if (client.id === 'new') {
      // Reset form for new client
      setEditForm({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        address: '',
        usual_discount: 0,
        priority: 'medium'
      });
    } else {
      // Populate form for existing client
      setEditForm({
        company_name: client.company_name,
        contact_person: client.contact_person || '',
        email: client.email || '',
        phone: client.phone || '',
        country: client.country || '',
        city: client.city || '',
        address: client.address || '',
        usual_discount: client.usual_discount || 0,
        priority: client.priority || 'medium'
      });
    }
  };
  
  const handleCancelEdit = () => {
    setEditingClient(null);
    setEditForm({
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      address: '',
      usual_discount: 0,
      priority: 'medium'
    });
  };
  
  // Handle selecting a client row
  const handleSelectClient = (id: string) => {
    setSelectedClientId(id === selectedClientId ? null : id);
    const client = clients.find(c => c.id === id);
    if (client && id !== selectedClientId) {
      setSelectedClient(client);
    } else {
      setSelectedClient(null);
    }
  };

  const handleSaveClient = async () => {
    if (!editingClient) return;
    
    try {
      if (editingClient.id === 'new') {
        // Create new client
        await dbService.addClient(editForm);
      } else if (editingClient.id.startsWith('virtual_')) {
        // Convert virtual client to real client
        await dbService.addClient(editForm);
      } else {
        // Update existing client
        await dbService.updateClient(editingClient.id, editForm);
      }
      await fetchClientStats(); // Refresh the data
      setEditingClient(null);
      // Reset form
      setEditForm({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        address: '',
        usual_discount: 0,
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const filteredClients = clients.filter(client =>
    client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedClients = [...filteredClients].sort((a, b) => {
    switch (sortBy) {
      case 'company_name':
        return a.company_name.localeCompare(b.company_name);
      case 'priority':
        // Sort by priority: high > medium > low
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority || 'medium'] || 2;
        const bPriority = priorityOrder[b.priority || 'medium'] || 2;
        return bPriority - aPriority;
      case 'total_value':
        return b.total_value - a.total_value;
      case 'total_quotations':
        return b.total_quotations - a.total_quotations;
      case 'last_activity':
        return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
      default:
        return 0;
    }
  });

  const totalStats = clients.reduce(
    (acc, client) => ({
      totalClients: acc.totalClients + 1,
      totalMessages: acc.totalMessages + client.total_messages,
      totalQuotations: acc.totalQuotations + client.total_quotations,
      totalOrders: acc.totalOrders + client.total_orders,
      totalValue: acc.totalValue + client.total_value,
    }),
    { totalClients: 0, totalMessages: 0, totalQuotations: 0, totalOrders: 0, totalValue: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading client dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Client Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Overview of all clients, their activities, and business metrics
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-2xl font-bold">{totalStats.totalClients}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-2xl font-bold">{totalStats.totalMessages}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-2xl font-bold">{totalStats.totalQuotations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-2xl font-bold">{totalStats.totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-2xl font-bold">${totalStats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quotation Total Value Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quotation Total Value
          </CardTitle>
          <CardDescription>
            Total value of all quotations across all clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            ${((window as any).totalQuotationValue || 0).toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Based on {totalStats.totalQuotations} quotations
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Client List</CardTitle>
            <CardDescription>
              Manage and view detailed information about all clients
            </CardDescription>
          </div>
          <Button 
            onClick={() => setEditingClient({ id: 'new' } as ClientStats)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Client
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company_name">Company Name</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="total_value">Total Value</SelectItem>
                <SelectItem value="total_quotations">Total Quotations</SelectItem>
                <SelectItem value="last_activity">Last Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => selectedClient && handleEditClient(selectedClient)}
                  disabled={!selectedClient}
                  className="w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Edit Client</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
              </div>
              {selectedClient && (
                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                  <UserCheck className="h-4 w-4 mr-1" />
                  <span className="truncate">Selected: <strong className="truncate">{selectedClient.company_name}</strong></span>
                </div>
              )}
            </div>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Company</TableHead>
                    <TableHead className="min-w-[150px] hidden md:table-cell">Contact Person</TableHead>
                    <TableHead className="min-w-[200px] hidden lg:table-cell">Email</TableHead>
                    <TableHead className="min-w-[100px] hidden xl:table-cell">Country</TableHead>
                    <TableHead className="min-w-[80px] text-center">Priority</TableHead>
                    <TableHead className="min-w-[80px] text-center">Messages</TableHead>
                    <TableHead className="min-w-[80px] text-center hidden sm:table-cell">Quotations</TableHead>
                    <TableHead className="min-w-[80px] text-center hidden sm:table-cell">Orders</TableHead>
                    <TableHead className="min-w-[120px]">Total Value</TableHead>
                    <TableHead className="min-w-[120px] hidden lg:table-cell">Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedClients.map((client) => (
                    <TableRow 
                      key={client.id} 
                      className={selectedClientId === client.id ? "bg-muted/50" : ""}
                      onClick={() => handleSelectClient(client.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell className="font-medium truncate">{client.company_name}</TableCell>
                      <TableCell className="truncate hidden md:table-cell">{client.contact_person || 'N/A'}</TableCell>
                      <TableCell className="truncate hidden lg:table-cell">{client.email || 'N/A'}</TableCell>
                      <TableCell className="truncate hidden xl:table-cell">{client.country || 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={client.priority === 'high' ? 'destructive' : client.priority === 'medium' ? 'default' : 'outline'}>
                          {client.priority || 'medium'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{client.total_messages}</Badge>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <Badge variant="outline">{client.total_quotations}</Badge>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <Badge variant="default">{client.total_orders}</Badge>
                      </TableCell>
                      <TableCell className="truncate">${client.total_value.toLocaleString()}</TableCell>
                      <TableCell className="truncate hidden lg:table-cell">
                        {new Date(client.last_activity).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {sortedClients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No clients found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Detail Modal */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Building className="h-5 w-5" />
              <span className="truncate">{selectedClient?.company_name} - Client Details</span>
            </DialogTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => selectedClient && handleEditClient(selectedClient)}
              className="mt-2 sm:mt-0"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Client
            </Button>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-6">
              {/* Client Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-sm">Company:</span>
                            <span className="text-sm truncate">{selectedClient.company_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-sm">Phone:</span>
                            <span className="text-sm truncate">{selectedClient.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-sm">Country:</span>
                            <span className="text-sm truncate">{selectedClient.country || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-sm">City:</span>
                            <span className="text-sm truncate">{selectedClient.city || 'N/A'}</span>
                          </div>
                        </div>
                      <div className="border-t pt-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-sm">Address:</span>
                              <p className="text-sm text-muted-foreground mt-1 break-words">
                                {selectedClient.address || 'No address provided'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-sm">Usual Discount:</span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm font-medium">
                              {selectedClient.usual_discount || 0}%
                            </span>
                          </div>
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-sm">Priority:</span>
                            <Badge variant={selectedClient.priority === 'high' ? 'destructive' : selectedClient.priority === 'medium' ? 'default' : 'outline'}>
                              {selectedClient.priority || 'medium'}
                            </Badge>
                          </div>
                        </div>
                        {/* Notes section removed as it's not in the database schema */}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg border">
                        <h4 className="font-medium text-slate-900 mb-2">Primary Contact</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-sm">Name:</span>
                            <span className="text-sm truncate">{selectedClient.contact_person || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-sm">Email:</span>
                            <span className="text-sm truncate">{selectedClient.email || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-slate-900 mb-2">Business Relationship</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="font-semibold text-blue-900 text-xs sm:text-sm">Client Since</div>
                            <div className="text-blue-700 text-xs sm:text-sm">
                              {new Date(selectedClient.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="font-semibold text-green-900 text-xs sm:text-sm">Status</div>
                            <div className="text-green-700 text-xs sm:text-sm">Active</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Messages Sent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedClient.total_messages}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Quotations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedClient.total_quotations}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedClient.total_orders}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${selectedClient.total_value.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Business Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Business Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-blue-900">Average Order Value</div>
                            <div className="text-2xl font-bold text-blue-600">
                              ${selectedClient.total_orders > 0 ? 
                                Math.round((selectedClient.total_value || 0) / selectedClient.total_orders).toLocaleString() : 
                                '0'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-green-900">Conversion Rate</div>
                            <div className="text-2xl font-bold text-green-600">
                              {selectedClient.total_quotations > 0 ? 
                                Math.round((selectedClient.total_orders / selectedClient.total_quotations) * 100) : 
                                0
                              }%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Recent Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {clientDetail && clientDetail.orders.length > 0 ? (
                        clientDetail.orders.slice(0, 3).map((order: any) => (
                          <div key={order.id} className="p-3 bg-slate-50 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-slate-900">
                                  Order #{order.quotation_number}
                                </div>
                                <div className="text-sm text-slate-600">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-slate-900">
                                  ${order.final_amount?.toLocaleString() || '0'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                          <p>No recent orders found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Quote Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                        <div className="text-center">
                          <div className="font-medium text-purple-900">Success Rate</div>
                          <div className="text-3xl font-bold text-purple-600">
                            {selectedClient.total_quotations > 0 ? 
                              Math.round((selectedClient.total_orders / selectedClient.total_quotations) * 100) : 
                              0
                            }%
                          </div>
                          <div className="text-sm text-purple-700 mt-1">
                            {selectedClient.total_orders} of {selectedClient.total_quotations} quotes converted
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                        <div className="text-center">
                          <div className="font-medium text-orange-900">Engagement Score</div>
                          <div className="text-2xl font-bold text-orange-600">
                            {Math.min(100, (selectedClient.total_messages * 2) + (selectedClient.total_quotations * 5) + (selectedClient.total_orders * 10))}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Lists */}
              {detailLoading ? (
                <div className="text-center py-8">Loading client details...</div>
              ) : clientDetail && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Messages */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {clientDetail.messages.length > 0 ? (
                          clientDetail.messages.map((message: any) => (
                            <div key={message.id} className="p-3 border rounded-lg">
                              <div className="font-medium text-sm">{message.request_type}</div>
                              <div className="text-xs text-muted-foreground mb-1">
                                {new Date(message.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-sm">{message.message.substring(0, 100)}...</div>
                              <Badge variant={message.status === 'completed' ? 'default' : 'secondary'} className="mt-1">
                                {message.status}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-4">
                            No messages found
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quotations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quotations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {clientDetail.quotations.length > 0 ? (
                          clientDetail.quotations.map((quotation: any) => (
                            <div key={quotation.id} className="p-3 border rounded-lg">
                              <div className="font-medium text-sm">{quotation.quotation_number}</div>
                              <div className="text-xs text-muted-foreground mb-1">
                                {new Date(quotation.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-sm">{quotation.title}</div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="font-medium">${quotation.final_amount?.toLocaleString() || 0}</span>
                                <Badge variant={quotation.status === 'accepted' ? 'default' : 'outline'}>
                                  {quotation.status}
                                </Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-4">
                            No quotations found
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Orders */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {clientDetail.orders.length > 0 ? (
                          clientDetail.orders.map((order: any) => (
                            <div key={order.id} className="p-3 border rounded-lg">
                              <div className="font-medium text-sm">{order.quotation_number}</div>
                              <div className="text-xs text-muted-foreground mb-1">
                                Order Date: {new Date(order.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-sm">{order.title}</div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="font-medium">${order.final_amount?.toLocaleString() || 0}</span>
                                <Badge variant="default">Confirmed</Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-4">
                            No orders found
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              {editingClient?.id === 'new' ? (
                <>
                  <Plus className="h-5 w-5" />
                  <span className="truncate">Add New Client</span>
                </>
              ) : (
                <>
                  <Edit className="h-5 w-5" />
                  <span className="truncate">Edit Client - {editingClient?.company_name}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {editingClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <Input
                    value={editForm.company_name}
                    onChange={(e) => setEditForm({...editForm, company_name: e.target.value})}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Person</label>
                  <Input
                    value={editForm.contact_person}
                    onChange={(e) => setEditForm({...editForm, contact_person: e.target.value})}
                    placeholder="Contact person name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <Input
                    value={editForm.country}
                    onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                    placeholder="Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <Input
                    value={editForm.city}
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                    placeholder="City"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <Input
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  placeholder="Full address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Usual Discount (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.usual_discount}
                  onChange={(e) => setEditForm({...editForm, usual_discount: parseFloat(e.target.value) || 0})}
                  placeholder="Discount percentage"
                />
              </div>
              
              {/* Notes field removed as it doesn't exist in the clients table schema */}
              
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <Select
                  value={editForm.priority}
                  onValueChange={(value) => setEditForm({...editForm, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto bg-white hover:bg-red-600 hover:text-white">
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleSaveClient} className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboardPage;