import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { 
  Search, 
 
  Eye, 
  MessageSquare, 
  Clock,
  CheckCircle,
  AlertCircle,
  Download,


  Send,
  X,
  UserPlus
} from 'lucide-react';
import { dbService } from '@/lib/supabase';

// Add CSS for spinner
const spinnerCSS = `
  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Add style element to head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = spinnerCSS;
  document.head.appendChild(style);
}

const ClientRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [slaFilter, setSlaFilter] = useState('all');
  const [slaLevels, setSlaLevels] = useState<any[]>([]);
  
  // View and respond dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [respondDialogOpen, setRespondDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [convertingToClient, setConvertingToClient] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchSLALevels();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await dbService.getContactRequests();
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await dbService.updateContactRequest(id, { 
        status: newStatus,
        updated_at: new Date().toISOString()
      });
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  
  // Function to convert contact request to client
  const handleConvertToClient = async () => {
    if (!selectedRequest) return;
    
    try {
      setConvertingToClient(true);
      
      // Create client data from the request
      const clientData = {
        company_name: selectedRequest.company || selectedRequest.name,
        contact_person: selectedRequest.name,
        email: selectedRequest.email,
        phone: selectedRequest.phone || '',
        country: selectedRequest.country || '',
        city: '',
        address: '',
        usual_discount: 0,
        priority: 'medium',
        created_at: new Date().toISOString()
      };
      
      // Add client to database
      const newClient = await dbService.addClient(clientData);
      
      if (newClient) {
        // Update request status to completed
        await handleUpdateStatus(selectedRequest.id, 'completed');
        
        // Show success message
        alert(`Successfully converted to client: ${newClient.company_name}`);
        
        // Close dialog
        setViewDialogOpen(false);
      }
    } catch (error) {
      console.error('Error converting to client:', error);
      alert('Failed to convert to client. Please try again.');
    } finally {
      setConvertingToClient(false);
    }
  };
  
  // Function to send email response using Resend API
  const sendEmailResponse = async (to: string, subject: string, message: string) => {
    try {
      // This is a placeholder for actual email sending implementation
      // In a real implementation, you would use the SENDER_API_KEY from .env
      // to authenticate with an email service like Resend
      
      console.log('Sending email to:', to);
      console.log('Subject:', subject);
      console.log('Message:', message);
      
      // Simulate API call success
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }
  };

  const handleExportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Company,Country,Email,Phone,SLA Level,Request Type,Status,Created At\n"
      + requests.map(r => 
          `"${r.name}","${r.company}","${r.country}","${r.email}","${r.phone}","${r.sla_level || 'unknown'}","${r.request_type}","${r.status || 'unknown'}","${r.created_at}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "client_requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchSLALevels = async () => {
    try {
      const data = await dbService.getSLALevels();
      setSlaLevels(data || []);
    } catch (error) {
      console.error('Error fetching SLA levels:', error);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    // Improved SLA filtering with null/undefined handling
    const matchesSLA = slaFilter === 'all' || 
                      (request.sla_level && request.sla_level.toLowerCase() === slaFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesSLA;
  });



  const getStatusBadge = (status: string | null | undefined) => {
    // Handle null, undefined, or empty values
    const statusValue = status || 'unknown';
    
    const variants: Record<string, any> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[statusValue] || 'bg-gray-100 text-gray-800'}>
        {statusValue.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getSLABadge = (sla: string | null | undefined) => {
    // Handle null, undefined, or empty values
    const slaLevel = sla || 'unknown';
    
    const variants: Record<string, any> = {
      standard: 'bg-gray-100 text-gray-800',
      priority: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[slaLevel] || 'bg-gray-100 text-gray-800'}>
        {slaLevel.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Requests</h1>
            <p className="text-gray-600">Loading requests...</p>
          </div>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">Client Requests</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage and respond to client inquiries</p>
        </div>
        <Button onClick={handleExportData} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="min-w-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Total Requests</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
              <MessageSquare className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Pending</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">In Progress</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
              <AlertCircle className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Completed</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="min-w-0">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by client name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={slaFilter} onValueChange={setSlaFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="SLA Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SLA</SelectItem>
                  {slaLevels.map((level) => (
                    <SelectItem key={level.id} value={level.name.toLowerCase()}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="grid gap-6">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Card key={request.id} className="mb-4 overflow-hidden hover:shadow-md transition-shadow duration-200 min-w-0">
              <CardContent className="p-0">
                <div className="p-3 lg:p-4 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 truncate">{request.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{request.email}</p>
                      {request.company && <p className="text-sm text-gray-500 truncate">{request.company} • {request.country}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                      {getSLABadge(request.sla_level)}
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs uppercase tracking-wider font-medium text-gray-500 mb-1">Request Type</p>
                    <p className="text-sm truncate">{request.request_type}</p>
                  </div>
                </div>
                
                <div className="px-3 lg:px-4 py-3 bg-gray-50">
                  <p className="text-xs uppercase tracking-wider font-medium text-gray-500 mb-1">Message</p>
                  <p className="text-sm line-clamp-2 text-gray-700">{request.message}</p>
                  {request.file_attachment && (
                    <a 
                      href="#" 
                      className="text-sm text-red-600 hover:underline mt-2 inline-flex items-center truncate"
                    >
                      <Download className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{request.file_attachment}</span>
                    </a>
                  )}
                </div>
                
                <div className="p-3 lg:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-t border-gray-100">
                  <Select 
                    value={request.status || 'pending'} 
                    onValueChange={(value) => handleUpdateStatus(request.id, value)}
                  >
                    <SelectTrigger className="w-full sm:w-[140px] h-8 text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 sm:flex-none h-8"
                      onClick={() => {
                        setSelectedRequest(request);
                        setViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 flex-1 sm:flex-none h-8"
                      onClick={() => {
                        setSelectedRequest(request);
                        setResponseMessage('');
                        setRespondDialogOpen(true);
                      }}
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      <span className="hidden sm:inline">Respond</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">No client requests match your current filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Request Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Request Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500">Name</h4>
                  <p className="text-sm mt-1">{selectedRequest.name}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500">Email</h4>
                  <p className="text-sm mt-1">{selectedRequest.email}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500">Phone</h4>
                  <p className="text-sm mt-1">{selectedRequest.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500">Company</h4>
                  <p className="text-sm mt-1">{selectedRequest.company || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500">Country</h4>
                  <p className="text-sm mt-1">{selectedRequest.country || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500">Request Type</h4>
                  <p className="text-sm mt-1">{selectedRequest.request_type}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500">SLA Level</h4>
                  <p className="text-sm mt-1">{selectedRequest.sla_level || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500">Status</h4>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500 mb-2">Message</h4>
                <p className="text-sm whitespace-pre-wrap p-4 bg-gray-50 rounded-md">{selectedRequest.message}</p>
              </div>
              
              {selectedRequest.attachment && (
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500 mb-2">Attachment</h4>
                  <a 
                    href={selectedRequest.attachment} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download Attachment
                  </a>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="sm:justify-end pt-2 border-t border-gray-100 mt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
            {selectedRequest && (
              <Button 
                type="button" 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  setViewDialogOpen(false);
                  setResponseMessage('');
                  setRespondDialogOpen(true);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Respond
              </Button>
            )}
            {selectedRequest && (
              <Button 
                type="button" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleConvertToClient}
                disabled={convertingToClient}
              >
                {convertingToClient ? (
                  <>
                    <div className="spinner"></div>
                    Converting...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Convert to Client
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Respond to Request Dialog */}
      <Dialog open={respondDialogOpen} onOpenChange={setRespondDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Respond to Request
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6 py-2">
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500 mb-2">Recipient</h4>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{selectedRequest.name}</span>
                  <span className="text-sm text-gray-500">{selectedRequest.email}</span>
                  {selectedRequest.company && (
                    <span className="text-sm text-gray-500">{selectedRequest.company}</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500 mb-2">Original Request</h4>
                <p className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded-md max-h-[100px] overflow-y-auto">
                  {selectedRequest.message}
                </p>
              </div>
              
              <div>
                <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500 mb-2">Your Response</h4>
                <Textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Type your response here..."
                  className="min-h-[150px] w-full resize-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-end pt-2 border-t border-gray-100 mt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (responseMessage.trim() && selectedRequest) {
                  // Show loading state
                  const button = document.activeElement as HTMLButtonElement;
                  if (button) {
                    button.disabled = true;
                    button.innerHTML = '<span class="spinner"></span> Sending...';
                  }
                  
                  // Send the email response
                  const subject = `Re: ${selectedRequest.request_type} Request`;
                  const result = await sendEmailResponse(
                    selectedRequest.email,
                    subject,
                    responseMessage
                  );
                  
                  if (result.success) {
                    // Update the status to in_progress
                    await handleUpdateStatus(selectedRequest.id, 'in_progress');
                    // Show success message
                    alert(`Response sent to ${selectedRequest.email}`);
                    setRespondDialogOpen(false);
                  } else {
                    // Show error message
                    alert(`Failed to send response. Please try again.`);
                    // Reset button state
                    if (button) {
                      button.disabled = false;
                      button.innerHTML = '<svg class="h-4 w-4 mr-1"></svg> Send Response';
                    }
                  }
                }
              }}
              disabled={!responseMessage.trim()}
            >
              <Send className="h-4 w-4 mr-1" />
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientRequestsPage;