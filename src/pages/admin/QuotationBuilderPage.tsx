import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Client } from '@/types/index';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  Download,
  Send,
  Calculator,
  DollarSign,
  Calendar,
  User,
  Save,
  X,

  Clock,
  CheckCircle,
  Package,
  Minus,
  ShoppingCart,

  Copy,
  MessageSquare,


  Loader2,
  BarChart3,



} from 'lucide-react';
import { dbService } from '@/lib/supabase';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const QuotationBuilderPage: React.FC = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<any>(null);
  const [viewingQuotation, setViewingQuotation] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [selectedClientHistory, setSelectedClientHistory] = useState<any[]>([]);
  const [loadingClientHistory, setLoadingClientHistory] = useState(false);

  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [newClientData, setNewClientData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    usual_discount: 0
  });
  const [formData, setFormData] = useState({
    customer_reference: '',
    title: '',
    total_amount: '',
    discount_percentage: 0,
    final_amount: '',
    status: 'draft',
    valid_until: '',
    notes: '',
    client_id: ''
  });
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [viewingQuotationItems, setViewingQuotationItems] = useState<any[]>([]);
  const [reportData, setReportData] = useState({
    reportType: 'summary',
    dateFrom: '',
    dateTo: '',
    statusFilter: 'all'
  });
  const [calculatorData, setCalculatorData] = useState({
    basePrice: 0,
    quantity: 1,
    discount: 0,
    tax: 0
  });
  const [isConvertingToOrder, setIsConvertingToOrder] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isOrderConfirmModalOpen, setIsOrderConfirmModalOpen] = useState(false);
  const [quotationToConvert, setQuotationToConvert] = useState<any>(null);
  
  useEffect(() => {
    fetchQuotations();
    fetchProducts();
    fetchClients();
  }, []);

  const fetchQuotations = async () => {
    try {
      const data = await dbService.getQuotations();
      setQuotations(data || []);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await dbService.getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await dbService.getClients();
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const generateQuotationNumber = () => {
    // Find the highest existing quotation number
    let maxNumber = 0;
    
    quotations.forEach(quotation => {
      if (quotation.quotation_number) {
        // Extract the numeric part from the quotation number (e.g., "QT-001" -> 1)
        const match = quotation.quotation_number.match(/QT-(\d+)/);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    });
    
    // Increment the highest number and format it
    const nextNumber = maxNumber + 1;
    return `QT-${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleAddQuotation = async () => {
    try {
      if (!selectedClient) {
        alert('Please select a client first');
        return;
      }

      if (!formData.valid_until) {
        alert('Valid Until date is required');
        return;
      }

      let clientId = selectedClient.id;
      
      // If client doesn't have a real ID (temp client), create the client first
      if (clientId === 'temp' || !clientId) {
        const newClient = await dbService.addClient(selectedClient);
        if (!newClient) {
          console.error('Error creating client');
          return;
        }
        clientId = newClient.id;
      }

      const total = calculateTotal();
      const quotationData = {
        client_id: clientId,
        customer_reference: formData.customer_reference || '',
        title: formData.title,
        quotation_number: generateQuotationNumber(),
        total_amount: total,
        discount_percentage: formData.discount_percentage || 0,
        final_amount: total - (total * (formData.discount_percentage || 0) / 100),
        status: formData.status,
        valid_until: formData.valid_until,
        notes: formData.notes
      };

      const quotationResult = await dbService.createQuotation(quotationData);
      if (quotationResult) {
        // Add quotation items
        await addQuotationItems(quotationResult.id);
        fetchQuotations();
        setIsAddModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding quotation:', error);
    }
  };

  const addQuotationItems = async (quotationId: string) => {
    for (const product of selectedProducts) {
      await dbService.addQuotationItem({
        quotation_id: quotationId,
        product_id: product.id,
        quantity: product.quantity,
        unit_price: product.unit_price,
        total_price: product.unit_price * product.quantity
      });
    }
  };

  const handleUpdateQuotation = async () => {
    if (!editingQuotation) return;

    try {
      if (!selectedClient) {
        alert('Please select a client first');
        return;
      }

      if (!formData.valid_until) {
        alert('Valid Until date is required');
        return;
      }

      let clientId = selectedClient.id;
      
      // If client doesn't have a real ID (temp client), create the client first
      if (clientId === 'temp' || !clientId) {
        const newClient = await dbService.addClient(selectedClient);
        if (!newClient) {
          console.error('Error creating client');
          return;
        }
        clientId = newClient.id;
      }

      const total = calculateTotal();
      const quotationData = {
        client_id: clientId,
        customer_reference: formData.customer_reference || '',
        title: formData.title,
        total_amount: total,
        discount_percentage: formData.discount_percentage || 0,
        final_amount: total - (total * (formData.discount_percentage || 0) / 100),
        status: formData.status,
        valid_until: formData.valid_until,
        notes: formData.notes
      };

      await dbService.updateQuotation(editingQuotation.id, quotationData);
      // Update quotation items
      await updateQuotationItems(editingQuotation.id);
      fetchQuotations();
      setEditingQuotation(null);
      resetForm();
    } catch (error) {
      console.error('Error updating quotation:', error);
    }
  };

  const updateQuotationItems = async (quotationId: string) => {
    // First, delete existing items
    await dbService.deleteQuotationItems(quotationId);
    // Then add new items
    await addQuotationItems(quotationId);
  };

  const handleDeleteQuotation = async (id: string) => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      try {
        // First delete quotation items
        await dbService.deleteQuotationItems(id);
        // Then delete the quotation
        await dbService.deleteQuotation(id);
        fetchQuotations();
      } catch (error) {
        console.error('Error deleting quotation:', error);
        alert('Error deleting quotation. Please try again.');
      }
    }
  };



  const handleDownloadPDF = async (quotation: any) => {
    try {
      // Load quotation items for the PDF
      const quotationItems = await dbService.getQuotationItems(quotation.id);
      let items: any[] = [];
      
      if (quotationItems) {
        items = await Promise.all(
          quotationItems.map(async (item: any) => {
            const product = await dbService.getProductById(item.product_id);
            return {
              name: product?.name || 'Unknown Product',
              code: product?.page_reference === 'inoksan' ? product?.supplier_code : product?.code || 'N/A',
              quantity: item.quantity,
              unitPrice: item.unit_price,
              total: item.total_price,
              image_url: product?.image_url || null
            };
          })
        );
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Company Header
      doc.setFillColor(220, 38, 38); // Red color
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Company Logo/Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('ChefPro Equipment', 20, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Professional Kitchen Solutions', 20, 32);
      
      // Contact Info in header
      doc.setFontSize(10);
      doc.text('www.chefpro.com | info@chefpro.com | +1 (555) 123-4567', pageWidth - 20, 25, { align: 'right' });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Quotation Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('QUOTATION', 20, 60);
      
      // Quotation Number and Date
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Quotation #: ${quotation.quotation_number}`, 20, 75);
      doc.text(`Date: ${new Date(quotation.created_at).toLocaleDateString()}`, 20, 85);
      doc.text(`Valid Until: ${quotation.valid_until || 'N/A'}`, 20, 95);
      
      // Client Information Box
      doc.setDrawColor(200, 200, 200);
      doc.rect(20, 105, pageWidth - 40, 40);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Bill To:', 25, 120);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(quotation.client?.company_name || 'N/A', 25, 130);
      doc.text(quotation.client?.contact_person || 'N/A', 25, 137);
      doc.text(quotation.client?.email || 'N/A', 25, 144);
      
      // Quotation Title
      if (quotation.title) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Project: ${quotation.title}`, 20, 160);
      }
      
      // Items Table
      const tableStartY = quotation.title ? 170 : 160;
      
      if (items.length > 0) {
        const tableData = items.map(item => [
          item.code,
          item.name,
          item.quantity.toString(),
          `$${item.unitPrice.toFixed(2)}`,
          `$${item.total.toFixed(2)}`
        ]);
        
        autoTable(doc, {
          startY: tableStartY,
          head: [['Code', 'Description', 'Qty', 'Unit Price', 'Total']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [220, 38, 38],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 10,
            cellPadding: 5
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 80 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 30, halign: 'right' }
          },
          didDrawCell: (data) => {
            // Add product image to the description cell
            if (data.section === 'body' && data.column.index === 1 && data.row.index < items.length) {
              const item = items[data.row.index];
              if (item.image_url) {
                try {
                  // Position the image to the left of the text
                  const imageSize = 15; // Size of the image in mm
                  const padding = 2; // Padding from cell border
                  doc.addImage(
                    item.image_url,
                    'JPEG',
                    data.cell.x + padding,
                    data.cell.y + padding,
                    imageSize,
                    imageSize
                  );
                } catch (error) {
                  console.error('Error adding image to PDF:', error);
                }
              }
            }
          }
        });
      }
      
      // Financial Summary
      const finalY = (doc as any).lastAutoTable?.finalY || tableStartY + 20;
      const summaryStartY = finalY + 20;
      
      // Summary box
      doc.setDrawColor(200, 200, 200);
      doc.rect(pageWidth - 80, summaryStartY, 60, 40);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', pageWidth - 75, summaryStartY + 10);
      doc.text(`$${quotation.total_amount?.toFixed(2) || '0.00'}`, pageWidth - 25, summaryStartY + 10, { align: 'right' });
      
      if (quotation.discount_percentage > 0) {
        doc.text(`Discount (${quotation.discount_percentage}%):`, pageWidth - 75, summaryStartY + 20);
        const discountAmount = (quotation.total_amount * quotation.discount_percentage / 100) || 0;
        doc.text(`-$${discountAmount.toFixed(2)}`, pageWidth - 25, summaryStartY + 20, { align: 'right' });
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text('Total:', pageWidth - 75, summaryStartY + 30);
      doc.text(`$${quotation.final_amount?.toFixed(2) || '0.00'}`, pageWidth - 25, summaryStartY + 30, { align: 'right' });
      
      // Notes
      if (quotation.notes) {
        const notesY = summaryStartY + 50;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', 20, notesY);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitNotes = doc.splitTextToSize(quotation.notes, pageWidth - 40);
        doc.text(splitNotes, 20, notesY + 10);
      }
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 20, { align: 'center' });
      doc.text('ChefPro Equipment - Professional Kitchen Solutions', pageWidth / 2, pageHeight - 15, { align: 'center' });
      
      // Save the PDF
      doc.save(`quotation-${quotation.quotation_number}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_reference: '',
      title: '',
      total_amount: '',
      discount_percentage: 0,
      final_amount: '',
      status: 'draft',
      valid_until: '',
      notes: '',
      client_id: ''
    });
    setSelectedProducts([]);
    setSelectedClient(null);
    setClientSearchTerm('');
    setNewClientData({
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      address: '',
      usual_discount: 0
    });
    setEditingQuotation(null);
  };

  const addProductToQuotation = (product: any) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    if (existingProduct) {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === product.id 
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1, unit_price: product.price || 0 }]);
    }
  };

  const removeProductFromQuotation = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromQuotation(productId);
    } else {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === productId 
          ? { ...p, quantity }
          : p
      ));
    }
  };

  const handleClientSearch = async (searchTerm: string) => {
    setClientSearchTerm(searchTerm);
    if (searchTerm.length > 2) {
      try {
        const data = await dbService.searchClients(searchTerm);
        setClients(data || []);
      } catch (error) {
        console.error('Error searching clients:', error);
      }
    } else {
      fetchClients();
    }
  };

  const handleSelectClient = async (client: Client) => {
    setSelectedClient(client);
    setFormData({...formData, client_id: client.id, discount_percentage: client.usual_discount || 0});
    
    // Load client history
    setLoadingClientHistory(true);
    try {
      const clientQuotations = await dbService.getQuotations();
      const clientHistory = clientQuotations.filter(q => q.client_id === client.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5); // Show last 5 quotations
      setSelectedClientHistory(clientHistory);
    } catch (error) {
      console.error('Error loading client history:', error);
      setSelectedClientHistory([]);
    } finally {
      setLoadingClientHistory(false);
    }
    
    setIsClientModalOpen(false);
  };

  const handleAddNewClient = async () => {
    try {
      const newClient = await dbService.addClient(newClientData);
      if (newClient) {
        setClients([...clients, newClient]);
        setSelectedClient(newClient);
        setFormData({...formData, client_id: newClient.id, discount_percentage: newClient.usual_discount || 0});
        setIsClientModalOpen(false);
        setNewClientData({
          company_name: '',
          contact_person: '',
          email: '',
          phone: '',
          country: '',
          city: '',
          address: '',
          usual_discount: 0
        });
      }
    } catch (error) {
      console.error('Error adding new client:', error);
    }
  };

  const calculateTotal = () => {
    const subtotal = selectedProducts.reduce((sum, product) => 
      sum + (product.unit_price * product.quantity), 0
    );
    const discount = parseFloat(formData.discount_percentage.toString()) || 0;
    const discountAmount = (subtotal * discount) / 100;
    return subtotal - discountAmount;
  };

  const loadQuotationItems = async (quotationId: string) => {
    try {
      const quotationItems = await dbService.getQuotationItems(quotationId);
      if (quotationItems) {
        const productsWithDetails = await Promise.all(
          quotationItems.map(async (item: any) => {
            const product = await dbService.getProductById(item.product_id);
            return {
              ...item,
              product: product
            };
          })
        );
        setViewingQuotationItems(productsWithDetails.filter(Boolean));
      }
    } catch (error) {
      console.error('Error loading quotation items:', error);
      setViewingQuotationItems([]);
    }
  };

  const openEditModal = async (quotation: any) => {
    setEditingQuotation(quotation);
    setFormData({
      customer_reference: quotation.customer_reference || '',
      title: quotation.title || '',
      total_amount: quotation.total_amount?.toString() || '',
      discount_percentage: quotation.discount_percentage?.toString() || '',
      final_amount: quotation.final_amount?.toString() || '',
      status: quotation.status || 'draft',
      valid_until: quotation.valid_until || '',
      notes: quotation.notes || '',
      client_id: quotation.client_id || ''
    });
    
    // Set selected client from quotation's client relationship
    if (quotation.client) {
      setSelectedClient(quotation.client);
    }

    // Load quotation items with product details including images
    try {
      const quotationItems = await dbService.getQuotationItems(quotation.id);
      if (quotationItems) {
        const productsWithDetails = await Promise.all(
          quotationItems.map(async (item: any) => {
            const product = await dbService.getProductById(item.product_id);
            return {
              ...product,
              quantity: item.quantity,
              unit_price: item.unit_price
            };
          })
        );
        setSelectedProducts(productsWithDetails.filter(Boolean));
      }
    } catch (error) {
      console.error('Error loading quotation items:', error);
      setSelectedProducts([]);
    }
  };

  const calculateFinalAmount = () => {
    const total = parseFloat(formData.total_amount) || 0;
    const discount = formData.discount_percentage || 0;
    const final = total * (1 - discount / 100);
    setFormData({...formData, final_amount: final.toString()});
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'sent': 'bg-blue-100 text-blue-800',
      'accepted': 'bg-green-100 text-green-800',
      'confirm_order': 'bg-amber-100 text-amber-800',
      'rejected': 'bg-red-100 text-red-800',
      'expired': 'bg-orange-100 text-orange-800',
      'converted_to_order': 'bg-purple-100 text-purple-800',
    };
    
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const handleConvertToOrder = (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId);
    
    if (!quotation) return;
    
    // If the quotation is in 'accepted' status, first change it to 'confirm_order'
    if (quotation.status === 'accepted') {
      updateQuotationStatus(quotationId, 'confirm_order');
      alert('Quotation status updated to "Confirm Order". Click "Convert to Order" again to proceed with conversion.');
    } 
    // If it's already in 'confirm_order' status, proceed with the conversion
    else if (quotation.status === 'confirm_order') {
      setQuotationToConvert(quotation);
      setIsOrderConfirmModalOpen(true);
    }
  };
  
  const updateQuotationStatus = async (quotationId: string, newStatus: string) => {
    try {
      const result = await dbService.updateQuotation(quotationId, { status: newStatus });
      if (result) {
        fetchQuotations(); // Refresh the quotations list
        console.log(`Quotation status updated to ${newStatus} successfully`);
      }
    } catch (error) {
      console.error(`Error updating quotation status to ${newStatus}:`, error);
      alert(`Error updating quotation status. Please try again.`);
    }
  };

  const confirmConvertToOrder = async () => {
    if (!quotationToConvert) return;

    setIsConvertingToOrder(true);
    try {
      const order = await dbService.convertQuotationToOrder(quotationToConvert.id);
      if (order) {
        alert(`Order created successfully! Order ID: ${order.order_number || order.id}`);
        fetchQuotations(); // Refresh the quotations list
        setIsOrderConfirmModalOpen(false);
        setQuotationToConvert(null);
      }
    } catch (error) {
      console.error('Error converting quotation to order:', error);
      alert('Error converting quotation to order. Please try again.');
    } finally {
      setIsConvertingToOrder(false);
    }
  };

  const handleDuplicateQuotation = async (quotation: any) => {
    setIsDuplicating(true);
    try {
      // Load quotation items
      const quotationItems = await dbService.getQuotationItems(quotation.id);
      
      // Create new quotation data
      const newQuotationData = {
        client_id: quotation.client_id,
        customer_reference: quotation.customer_reference || '',
        title: `${quotation.title} (Copy)`,
        quotation_number: generateQuotationNumber(),
        total_amount: quotation.total_amount,
        discount_percentage: quotation.discount_percentage || 0,
        final_amount: quotation.final_amount,
        status: 'draft',
        valid_until: '', // Reset valid until date
        notes: quotation.notes || ''
      };

      const newQuotation = await dbService.createQuotation(newQuotationData);
      
      if (newQuotation && quotationItems) {
        // Copy quotation items
        for (const item of quotationItems) {
          await dbService.addQuotationItem({
            quotation_id: newQuotation.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price
          });
        }
      }
      
      fetchQuotations();
      alert('Quotation duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating quotation:', error);
      alert('Error duplicating quotation. Please try again.');
    } finally {
      setIsDuplicating(false);
    }
  };

  const canConvertToOrder = (quotation: any) => {
    return (quotation.status === 'accepted' || quotation.status === 'confirm_order') && !quotation.order_id;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="h-4 w-4" />;
      case 'sent':
        return <Send className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'confirm_order':
        return <ShoppingCart className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      case 'expired':
        return <Clock className="h-4 w-4" />;
      case 'converted_to_order':
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.client?.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.client?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.quotation_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Quotation Builder</h1>
            <p className="text-slate-600 text-lg">Loading quotations...</p>
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
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2 truncate">Quotation Builder</h1>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg">Create and manage client quotations</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto group">
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
              New Quotation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-6 w-6 text-red-600" />
                Create New Quotation
              </DialogTitle>
              <p className="text-slate-600 mt-1">Build a professional quotation for your client</p>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              {/* Client Selection */}
              <div className="col-span-1 lg:col-span-2">
                <div className="bg-slate-50 rounded-lg p-4 border">
                  <Label className="text-base font-semibold text-slate-700 flex items-center gap-2 mb-3">
                    <User className="h-5 w-5 text-red-600" />
                    Client Information
                  </Label>
                  <div className="space-y-3">
                    {selectedClient ? (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-green-200 rounded-lg bg-green-50 gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="font-semibold text-green-800 truncate">{selectedClient.company_name}</span>
                            </div>
                            <div className="text-sm text-green-700 truncate">
                              {selectedClient.contact_person && `${selectedClient.contact_person} • `}
                              {selectedClient.email}
                            </div>
                            {selectedClient.country && (
                              <div className="text-xs text-green-600 mt-1">
                                📍 {selectedClient.city ? `${selectedClient.city}, ` : ''}{selectedClient.country}
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedClient(null)}
                            className="w-full sm:w-auto hover:bg-green-100"
                          >
                            <X className="h-4 w-4" />
                            Change
                          </Button>
                        </div>
                        {selectedClient.usual_discount && selectedClient.usual_discount > 0 && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-blue-800">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">Client's Usual Discount:</span> 
                              <span className="font-bold">{selectedClient.usual_discount}%</span>
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              💡 This is for reference only and won't be applied automatically
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start h-12 border-dashed border-2 hover:border-red-300 hover:bg-red-50 transition-colors"
                        onClick={() => setIsClientModalOpen(true)}
                      >
                        <User className="h-5 w-5 mr-3 text-red-600" />
                        <span className="text-slate-700">Select a client to continue</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quotation Details */}
              <div className="bg-slate-50 rounded-lg p-4 border">
                <Label className="text-base font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-red-600" />
                  Quotation Details
                </Label>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quotation_number" className="text-sm font-medium text-slate-600">Quotation Number</Label>
                    <div className="relative mt-1">
                      <Input
                        id="quotation_number"
                        value={editingQuotation ? editingQuotation.quotation_number : generateQuotationNumber()}
                        readOnly
                        className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 font-bold text-green-800 pl-8"
                      />
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                        <span className="text-green-600 font-bold">#</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-slate-600">Quotation Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Kitchen Equipment Package"
                      className="mt-1 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 border">
                <Label className="text-base font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <MessageSquare className="h-5 w-5 text-red-600" />
                  Additional Information
                </Label>
                <div>
                  <Label htmlFor="customer_reference" className="text-sm font-medium text-slate-600">Customer Reference</Label>
                  <Input
                    id="customer_reference"
                    value={formData.customer_reference}
                    onChange={(e) => setFormData({...formData, customer_reference: e.target.value})}
                    placeholder="Customer's internal reference number"
                    className="mt-1 focus:ring-red-500 focus:border-red-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Optional: Your client's internal reference for this quotation</p>
                </div>
              </div>
              {/* Products Section */}
              <div className="col-span-1 lg:col-span-2">
                <div className="bg-slate-50 rounded-lg p-4 border">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                      <Package className="h-5 w-5 text-red-600" />
                      Products & Services
                      {selectedProducts.length > 0 && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          {selectedProducts.length} item{selectedProducts.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsProductModalOpen(true)}
                      className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Products
                    </Button>
                  </div>
                  <div className="border border-slate-200 rounded-lg bg-white max-h-60 overflow-y-auto">
                    {selectedProducts.length === 0 ? (
                      <div className="p-8 text-center">
                        <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm mb-2">No products selected yet</p>
                        <p className="text-slate-400 text-xs">Click "Add Products" to start building your quotation</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {selectedProducts.map((product, _) => (
                          <div key={product.id} className="flex flex-col sm:flex-row sm:items-center p-4 gap-3 hover:bg-slate-50 transition-colors">
                            <div className="w-14 h-14 flex-shrink-0">
                              <img 
                                 src={product.image_url || '/placeholder-product.svg'} 
                                 alt={product.name}
                                 className="w-full h-full object-cover rounded-lg border shadow-sm"
                               />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-800 truncate">{product.name}</div>
                              <div className="text-xs text-slate-500 truncate mt-1">
                                Code: {product.page_reference === 'inoksan' ? product.supplier_code : product.code}
                              </div>
                              <div className="text-xs text-slate-600 truncate mt-1">{product.description}</div>
                              <div className="text-sm font-bold text-green-600 mt-1">${product.unit_price}</div>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-600 font-medium">Qty:</label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={product.quantity}
                                  onChange={(e) => updateProductQuantity(product.id, parseInt(e.target.value))}
                                  className="w-16 h-8 text-center text-sm"
                                />
                              </div>
                              <div className="text-sm font-bold text-slate-800">
                                ${(product.unit_price * product.quantity).toFixed(2)}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProductFromQuotation(product.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {/* Subtotal Row */}
                        <div className="bg-slate-50 p-4 border-t-2 border-slate-200">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-700">Subtotal ({selectedProducts.length} items):</span>
                            <span className="text-lg font-bold text-slate-800">
                              ${selectedProducts.reduce((sum, p) => sum + (p.unit_price * p.quantity), 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing & Summary */}
              <div className="bg-slate-50 rounded-lg p-4 border">
                <Label className="text-base font-semibold text-slate-700 flex items-center gap-2 mb-4">
                  <Calculator className="h-5 w-5 text-red-600" />
                  Pricing & Summary
                </Label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discount_percentage" className="text-sm font-medium text-slate-600">Discount (%)</Label>
                      <Input
                        id="discount_percentage"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount_percentage}
                        onChange={(e) => setFormData({...formData, discount_percentage: parseFloat(e.target.value) || 0})}
                        className="mt-1 focus:ring-red-500 focus:border-red-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="valid_until" className="text-sm font-medium text-slate-600">Valid Until *</Label>
                      <Input
                        id="valid_until"
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                        className="mt-1 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Summary Card */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-medium text-slate-800">
                        ${selectedProducts.reduce((sum, p) => sum + (p.unit_price * p.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                    {formData.discount_percentage > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Discount ({formData.discount_percentage}%):</span>
                        <span className="font-medium text-red-600">
                          -${(selectedProducts.reduce((sum, p) => sum + (p.unit_price * p.quantity), 0) * (formData.discount_percentage / 100)).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-slate-800">Total Amount:</span>
                        <span className="text-xl font-bold text-green-600">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 border">
                <Label className="text-base font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <MessageSquare className="h-5 w-5 text-red-600" />
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Add any special instructions, terms, or notes for this quotation..."
                  className="min-h-[100px] focus:ring-red-500 focus:border-red-500"
                  rows={4}
                />
                <p className="text-xs text-slate-500 mt-2">These notes will appear on the quotation document</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-6 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                {selectedProducts.length > 0 ? (
                  <span>✅ Ready to create quotation with {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''}</span>
                ) : (
                  <span>⚠️ Please add at least one product to continue</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="w-full sm:w-auto border-slate-300 hover:bg-slate-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddQuotation} 
                  disabled={selectedProducts.length === 0 || !selectedClient || !formData.title || !formData.valid_until}
                  className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-400 disabled:to-slate-500 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Quotation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Selection Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Package className="h-6 w-6 text-red-600" />
              Select Products & Services
            </DialogTitle>
            <p className="text-slate-600 mt-1">Browse and add products to your quotation</p>
          </DialogHeader>
          
          {/* Enhanced Search and Filter Controls */}
          <div className="sticky top-0 bg-white z-10 pt-4 pb-4 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search by name, code, or description..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="pl-11 h-11 text-base focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              <div className="w-full lg:w-64">
                <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
                  <SelectTrigger className="h-11 focus:ring-red-500 focus:border-red-500">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🏷️ All Categories</SelectItem>
                    {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(category => (
                      <SelectItem key={category} value={category}>📦 {category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-medium">Found:</span>
                <span className="bg-slate-100 px-2 py-1 rounded-full font-semibold">
                  {products.filter(product => {
                    const matchesSearch = productSearchTerm === '' || 
                      product.name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                      product.code?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                      product.supplier_code?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                      product.description?.toLowerCase().includes(productSearchTerm.toLowerCase());
                    const matchesCategory = productCategoryFilter === 'all' || product.category === productCategoryFilter;
                    return matchesSearch && matchesCategory;
                  }).length} products
                </span>
              </div>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 pt-4">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg mb-2">No products available</p>
                <p className="text-slate-400 text-sm">Please check your inventory or contact support</p>
              </div>
            ) : (
              <div className="grid gap-4 pb-4">
                {products
                  .filter(product => {
                    const matchesSearch = productSearchTerm === '' || 
                      product.name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                      product.code?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                      product.supplier_code?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                      product.description?.toLowerCase().includes(productSearchTerm.toLowerCase());
                    
                    const matchesCategory = productCategoryFilter === 'all' || product.category === productCategoryFilter;
                    
                    return matchesSearch && matchesCategory;
                  })
                  .map((product) => {
                    const isAlreadySelected = selectedProducts.some(p => p.id === product.id);
                    return (
                      <div key={product.id} className={`flex flex-col lg:flex-row lg:items-center p-4 border rounded-lg hover:shadow-md transition-all duration-200 gap-4 min-w-0 ${
                        isAlreadySelected ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-red-300 hover:bg-red-50'
                      }`}>
                        <div className="w-20 h-20 flex-shrink-0 mx-auto lg:mx-0">
                          <img 
                             src={product.image_url || '/placeholder-product.svg'} 
                             alt={product.name}
                             loading="lazy"
                             className="w-full h-full object-cover rounded-lg border shadow-sm"
                           />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-slate-800 text-base lg:text-lg break-words leading-tight">{product.name}</h4>
                            {product.category && (
                              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0">
                                {product.category}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 break-words">
                            <span className="font-medium">Code:</span> {product.page_reference === 'inoksan' ? product.supplier_code : product.code}
                          </p>
                          <p className="text-sm text-slate-600 line-clamp-2 break-words leading-relaxed">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xl font-bold text-green-600">
                              ${product.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </p>
                            {product.page_reference && (
                              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                {product.page_reference}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 w-full lg:w-auto">
                          {isAlreadySelected ? (
                            <Button
                              disabled
                              size="sm"
                              className="bg-green-600 text-white w-full lg:w-auto cursor-not-allowed"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Added
                            </Button>
                          ) : (
                            <Button
                              onClick={() => addProductToQuotation(product)}
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 w-full lg:w-auto group"
                            >
                              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                              Add to Quote
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {products.filter(product => {
                  const matchesSearch = productSearchTerm === '' || 
                    product.name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                    product.code?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                    product.supplier_code?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                    product.description?.toLowerCase().includes(productSearchTerm.toLowerCase());
                  const matchesCategory = productCategoryFilter === 'all' || product.category === productCategoryFilter;
                  return matchesSearch && matchesCategory;
                }).length === 0 && (
                  <div className="text-center py-16">
                    <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg mb-2">No products found</p>
                    <p className="text-slate-400 text-sm">Try adjusting your search terms or filters</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="sticky bottom-0 bg-white border-t pt-4 pb-2 mt-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsProductModalOpen(false)} className="w-full sm:w-auto">
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Selection Modal */}
      <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl truncate">Select or Add Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Search Clients */}
            <div>
              <Label htmlFor="client-search">Search Clients</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="client-search"
                  placeholder="Search by company name, contact person, or email..."
                  value={clientSearchTerm}
                  onChange={(e) => handleClientSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Existing Clients List */}
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
              {clients.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No clients found</p>
              ) : (
                clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer gap-2"
                    onClick={() => handleSelectClient(client)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{client.company_name}</div>
                      <div className="text-sm text-gray-600 truncate">
                        {client.contact_person && `${client.contact_person} • `}
                        {client.email}
                        {client.country && ` • ${client.country}`}
                      </div>
                      {client.usual_discount && client.usual_discount > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          Usual Discount: {client.usual_discount}%
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="w-full sm:w-auto flex-shrink-0">
                      Select
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Selected Client History */}
            {selectedClient && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Selected Client: {selectedClient.company_name}</h4>
                {loadingClientHistory ? (
                  <p className="text-sm text-blue-600">Loading client history...</p>
                ) : selectedClientHistory.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-700 font-medium">Recent Quotations:</p>
                    {selectedClientHistory.map((quotation: any) => (
                      <div key={quotation.id} className="text-xs text-blue-600 bg-white p-2 rounded border">
                        <span className="font-medium">{quotation.quotation_number}</span> - 
                        <span className="capitalize">{quotation.status}</span> - 
                        <span>${quotation.final_amount?.toFixed(2) || '0.00'}</span> - 
                        <span>{new Date(quotation.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-blue-600">No previous quotations found</p>
                )}
              </div>
            )}

            {/* Add New Client Form */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Add New Client</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={newClientData.company_name}
                    onChange={(e) => setNewClientData({...newClientData, company_name: e.target.value})}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={newClientData.contact_person}
                    onChange={(e) => setNewClientData({...newClientData, contact_person: e.target.value})}
                    placeholder="Contact person name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newClientData.phone}
                    onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={newClientData.country}
                    onChange={(e) => setNewClientData({...newClientData, country: e.target.value})}
                    placeholder="Country"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newClientData.city}
                    onChange={(e) => setNewClientData({...newClientData, city: e.target.value})}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="usual_discount">Usual Discount (%)</Label>
                  <Input
                    id="usual_discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newClientData.usual_discount}
                    onChange={(e) => setNewClientData({...newClientData, usual_discount: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newClientData.address}
                    onChange={(e) => setNewClientData({...newClientData, address: e.target.value})}
                    placeholder="Full address"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsClientModalOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddNewClient}
                  disabled={!newClientData.company_name}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Stats Cards with Animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="group border-2 border-blue-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-w-0 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <p className="text-sm font-medium text-slate-600 truncate mb-1">Total Quotations</p>
                <p className="text-xl lg:text-3xl font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">{quotations.length}</p>
                <div className="text-xs text-slate-500 mt-1">
                  {quotations.filter(q => q.status === 'draft').length} drafts
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group border-2 border-green-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-w-0 overflow-hidden bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <p className="text-sm font-medium text-slate-600 truncate mb-1">Total Value</p>
                <p className="text-lg lg:text-2xl xl:text-3xl font-bold text-slate-900 group-hover:text-green-700 transition-colors" title={`$${quotations.reduce((sum, q) => sum + (q.final_amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                  ${quotations.reduce((sum, q) => sum + (q.final_amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="text-xs text-slate-500 mt-1">
                  Avg: ${quotations.length > 0 ? (quotations.reduce((sum, q) => sum + (q.final_amount || 0), 0) / quotations.length).toFixed(0) : '0'}
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
                <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group border-2 border-purple-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-w-0 overflow-hidden bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <p className="text-sm font-medium text-slate-600 truncate mb-1">Accepted</p>
                <p className="text-xl lg:text-3xl font-bold text-slate-900 truncate group-hover:text-purple-700 transition-colors">
                  {quotations.filter(q => q.status === 'accepted').length}
                </p>
                <div className="text-xs text-slate-500 mt-1">
                  {quotations.length > 0 ? Math.round((quotations.filter(q => q.status === 'accepted').length / quotations.length) * 100) : 0}% rate
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                <Calculator className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600 flex-shrink-0" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group border-2 border-orange-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-w-0 overflow-hidden bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <p className="text-sm font-medium text-slate-600 truncate mb-1">This Month</p>
                <p className="text-xl lg:text-3xl font-bold text-slate-900 truncate group-hover:text-orange-700 transition-colors">
                  {quotations.filter(q => {
                    const created = new Date(q.created_at);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length}
                </p>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div className="bg-orange-100 p-3 rounded-full group-hover:bg-orange-200 transition-colors">
                <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600 flex-shrink-0" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters Section */}
      <Card className="border-2 border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by quotation number, client, or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border-slate-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 border-slate-300 focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="converted_to_order">Converted to Order</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReportsModalOpen(true)}
                  className="border-slate-300 hover:border-slate-400"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Reports
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCalculatorModalOpen(true)}
                  className="border-slate-300 hover:border-slate-400"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculator
                </Button>
              </div>
            </div>
          </div>
          {(searchTerm || statusFilter !== 'all') && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <span>Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="ml-1 hover:text-purple-900"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="text-slate-500 hover:text-slate-700 h-6 px-2"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quotations List */}
      <Card>
        <CardHeader>
          <CardTitle>Quotations List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="text-sm text-slate-600">
                Click on any quotation to view details
              </div>
            </div>
            
            <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="min-w-[120px] font-semibold text-slate-700">Quotation #</TableHead>
                    <TableHead className="min-w-[140px] hidden sm:table-cell font-semibold text-slate-700">Client</TableHead>
                    <TableHead className="min-w-[180px] font-semibold text-slate-700">Title</TableHead>
                    <TableHead className="min-w-[120px] font-semibold text-slate-700 text-right">Amount</TableHead>
                    <TableHead className="min-w-[100px] font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="min-w-[110px] hidden md:table-cell font-semibold text-slate-700">Created</TableHead>
                    <TableHead className="min-w-[110px] hidden lg:table-cell font-semibold text-slate-700">Valid Until</TableHead>
                    <TableHead className="min-w-[80px] hidden lg:table-cell font-semibold text-slate-700 text-center">Discount</TableHead>
                    <TableHead className="w-[100px] font-semibold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.length > 0 ? (
                    filteredQuotations.map((quotation) => {
                      const isExpiringSoon = quotation.valid_until && new Date(quotation.valid_until) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                      
                      return (
                        <TableRow 
                          key={quotation.id}
                          className={`cursor-pointer transition-all duration-200 hover:bg-slate-50 border-b border-slate-100 ${
                            isExpiringSoon && quotation.status !== 'expired' ? 'border-l-4 border-l-orange-400' : ''
                          }`}
                          onClick={() => {
                            setViewingQuotation(quotation);
                            loadQuotationItems(quotation.id);
                          }}
                        >
                          <TableCell className="font-medium text-slate-900">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(quotation.status)}
                              {quotation.quotation_number}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="max-w-[120px]">
                              <div className="font-medium text-slate-900 truncate">
                                {quotation.client?.company_name || 'No client'}
                              </div>
                              {quotation.client?.contact_person && (
                                <div className="text-xs text-slate-500 truncate">
                                  {quotation.client.contact_person}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[160px]">
                              <div className="font-medium text-slate-900 truncate" title={quotation.title}>
                                {quotation.title}
                              </div>
                              {quotation.customer_reference && (
                                <div className="text-xs text-slate-500 truncate">
                                  Ref: {quotation.customer_reference}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-semibold text-slate-900">
                              ${quotation.final_amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </div>
                            {quotation.discount_percentage > 0 && (
                              <div className="text-xs text-green-600">
                                -{quotation.discount_percentage}% disc.
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge className={getStatusBadge(quotation.status)}>
                                {quotation.status?.toUpperCase()}
                              </Badge>
                              {isExpiringSoon && quotation.status !== 'expired' && (
                                <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                                  Expiring Soon
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-600">
                            <div className="text-sm">
                              {new Date(quotation.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: '2-digit'
                              })}
                            </div>
                            <div className="text-xs text-slate-500">
                              {new Date(quotation.created_at).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit'
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-slate-600">
                            <div className="text-sm">
                              {quotation.valid_until ? 
                                new Date(quotation.valid_until).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: '2-digit'
                                }) : 'N/A'
                              }
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-center">
                            <Badge variant="outline" className="text-xs">
                              {quotation.discount_percentage || 0}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingQuotation(quotation);
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(quotation);
                                }}
                                className="h-8 w-8 p-0 hover:bg-green-100"
                                title="Edit Quotation"
                              >
                                <Edit className="h-4 w-4 text-green-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <FileText className="h-12 w-12 mb-2 text-slate-300" />
                          <p className="text-lg font-medium">No quotations found</p>
                          <p className="text-sm">Try adjusting your search criteria or create a new quotation.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={!!editingQuotation} onOpenChange={() => setEditingQuotation(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl truncate">Edit Quotation</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Selection */}
            <div className="sm:col-span-2">
              <Label>Client</Label>
              {selectedClient ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg bg-gray-50 gap-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{selectedClient.company_name}</div>
                    <div className="text-sm text-gray-600 truncate">
                      {selectedClient.contact_person && `${selectedClient.contact_person} • `}
                      {selectedClient.email}
                    </div>
                  </div>
                  <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     onClick={() => {
                       setSelectedClient(null);
                     }}
                     className="w-full sm:w-auto flex-shrink-0"
                   >
                     Clear
                   </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsClientModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Select Client
                </Button>
              )}
            </div>
            <div>
              <Label htmlFor="edit-title">Quotation Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-total_amount">Total Amount</Label>
              <Input
                id="edit-total_amount"
                type="number"
                value={formData.total_amount}
                onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                onBlur={calculateFinalAmount}
              />
            </div>
            <div>
              <Label htmlFor="edit-discount_percentage">Discount (%)</Label>
              <Input
                id="edit-discount_percentage"
                type="number"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({...formData, discount_percentage: parseFloat(e.target.value) || 0})}
                onBlur={calculateFinalAmount}
              />
            </div>
            <div>
              <Label htmlFor="edit-final_amount">Final Amount</Label>
              <Input
                id="edit-final_amount"
                type="number"
                value={formData.final_amount}
                onChange={(e) => setFormData({...formData, final_amount: e.target.value})}
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="confirm_order">Confirm Order</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="converted_to_order">Converted to Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-valid_until">Valid Until *</Label>
              <Input
                id="edit-valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            
            {/* Products Section */}
            <div className="sm:col-span-2">
              <div className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                    <Label className="text-lg font-semibold">Products & Services</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsProductModalOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                {selectedProducts.length > 0 ? (
                  <div className="space-y-2">
                    {selectedProducts.map((product, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg bg-gray-50 gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          {product.image_url && (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium truncate">{product.name}</div>
                            <div className="text-sm text-gray-500 truncate">{product.page_reference === 'inoksan' ? product.supplier_code : product.code}</div>
                            <div className="text-sm text-gray-600">${product.price?.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center sm:justify-end space-x-2 flex-shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateProductQuantity(product.id, Math.max(1, product.quantity - 1))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{product.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateProductQuantity(product.id, product.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => removeProductFromQuotation(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No products added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <Button 
                variant="outline" 
                onClick={() => handleDownloadPDF(editingQuotation)} 
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDuplicateQuotation(editingQuotation)} 
                className="w-full sm:w-auto"
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingQuotation(null);
                  handleDeleteQuotation(editingQuotation.id);
                }} 
                className="w-full sm:w-auto text-red-600 hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <Button variant="outline" onClick={() => setEditingQuotation(null)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleUpdateQuotation} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Update Quotation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Quotation Modal */}
      <Dialog open={!!viewingQuotation} onOpenChange={() => setViewingQuotation(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl truncate">View Quotation - {viewingQuotation?.quotation_number}</DialogTitle>
          </DialogHeader>
          {viewingQuotation && (
            <div className="space-y-0">
              {/* Professional Quotation Preview - PDF Draft Style */}
              <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg">
                {/* Header Section */}
                <div className="bg-red-600 text-white p-4 sm:p-6 rounded-t-lg">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold">ChefPro Equipment</h1>
                      <p className="text-red-100 text-sm sm:text-base">Professional Kitchen Solutions</p>
                    </div>
                    <div className="text-left sm:text-right text-sm">
                      <p>www.chefpro.com</p>
                      <p>info@chefpro.com</p>
                      <p>+1 (555) 123-4567</p>
                    </div>
                  </div>
                </div>

                {/* Quotation Title and Client Information - Same Line */}
                <div className="p-4 sm:p-6 border-b">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">QUOTATION</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Quotation Details */}
                    <div className="space-y-2">
                      <p className="text-sm sm:text-base"><strong>Quotation #:</strong> <span className="break-all">{viewingQuotation.quotation_number}</span></p>
                      <p className="text-sm sm:text-base"><strong>Date:</strong> {new Date(viewingQuotation.created_at).toLocaleDateString()}</p>
                      <p className="text-sm sm:text-base"><strong>Valid Until:</strong> {viewingQuotation.valid_until || 'N/A'}</p>
                      <div className="text-sm sm:text-base"><strong>Status:</strong> 
                        <Badge className={`ml-2 ${getStatusBadge(viewingQuotation.status)}`}>
                          {viewingQuotation.status?.toUpperCase()}
                        </Badge>
                      </div>
                      {viewingQuotation.title && (
                        <p className="text-sm sm:text-base"><strong>Project:</strong> <span className="break-words">{viewingQuotation.title}</span></p>
                      )}
                    </div>
                    
                    {/* Client Information */}
                    <div className="border border-gray-300 p-4 rounded">
                      <h3 className="font-bold text-lg mb-3">Bill To:</h3>
                      <div className="space-y-1">
                        <p className="font-semibold text-lg">{viewingQuotation.client?.company_name || 'N/A'}</p>
                        <p>{viewingQuotation.client?.contact_person || 'N/A'}</p>
                        <p>{viewingQuotation.client?.email || 'N/A'}</p>
                        <p>{viewingQuotation.client?.phone || 'N/A'}</p>
                        {viewingQuotation.client?.address && (
                          <p>{viewingQuotation.client.address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products & Services Table */}
                <div className="p-6 border-b">
                  <h3 className="font-bold text-lg mb-4">Products & Services</h3>
                  {viewingQuotationItems.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-red-600 text-white">
                            <th className="border border-gray-300 px-4 py-3 text-left">Code</th>
                            <th className="border border-gray-300 px-4 py-3 text-left">Description</th>
                            <th className="border border-gray-300 px-4 py-3 text-center">Qty</th>
                            <th className="border border-gray-300 px-4 py-3 text-right">Unit Price</th>
                            <th className="border border-gray-300 px-4 py-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewingQuotationItems.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-3 text-sm font-mono">
                                {item.product?.page_reference === 'inoksan' ? item.product?.supplier_code : item.product?.code || 'N/A'}
                              </td>
                              <td className="border border-gray-300 px-4 py-3">
                                <div className="flex items-center space-x-3">
                                  {item.product?.image_url ? (
                                    <img 
                                      src={item.product.image_url} 
                                      alt={item.product.name}
                                      className="w-16 h-16 object-cover rounded border"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 border">
                                      No Image
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-base">{item.product?.name || 'Unknown Product'}</p>
                                    {item.product?.description && (
                                      <p className="text-sm text-gray-600 mt-1">{item.product.description}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center font-mono font-bold text-lg">
                                {item.quantity}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-right font-mono text-base">
                                ${(item.unit_price || 0).toFixed(2)}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-right font-mono font-bold text-base">
                                ${(item.total_price || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg">No products added to this quotation.</p>
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="p-4 sm:p-6 border-b">
                  <div className="flex justify-center sm:justify-end">
                    <div className="w-full sm:w-80">
                      <div className="border border-gray-300 p-4 rounded bg-gray-50">
                        <h3 className="font-bold text-lg mb-3">Financial Summary</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm sm:text-base">
                            <span>Subtotal:</span>
                            <span className="font-mono font-semibold">${(viewingQuotation.total_amount || 0).toFixed(2)}</span>
                          </div>
                          {viewingQuotation.discount_percentage > 0 && (
                            <div className="flex justify-between text-sm sm:text-base text-red-600">
                              <span>Discount ({viewingQuotation.discount_percentage}%):</span>
                              <span className="font-mono font-semibold">-${((viewingQuotation.total_amount * viewingQuotation.discount_percentage / 100) || 0).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="border-t pt-3 flex justify-between font-bold text-lg sm:text-xl">
                            <span>Total:</span>
                            <span className="font-mono text-green-600">${(viewingQuotation.final_amount || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {viewingQuotation.notes && (
                  <div className="p-6 border-b">
                    <h3 className="font-bold text-lg mb-3">Notes:</h3>
                    <div className="bg-yellow-50 p-4 rounded border">
                      <p className="text-gray-700 whitespace-pre-wrap">{viewingQuotation.notes}</p>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="p-6 text-center text-gray-500 text-sm bg-gray-50 rounded-b-lg">
                  <p className="font-semibold">Thank you for your business!</p>
                  <p className="mt-1">ChefPro Equipment - Professional Kitchen Solutions</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  {canConvertToOrder(viewingQuotation) && (
                    <Button 
                      onClick={() => {
                        setViewingQuotation(null);
                        handleConvertToOrder(viewingQuotation.id);
                      }}
                      className={`w-full sm:w-auto ${
                        viewingQuotation.status === 'accepted' 
                          ? 'bg-orange-600 hover:bg-orange-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {viewingQuotation.status === 'accepted' ? 'Confirm Order' : 'Convert to Order'}
                    </Button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => setViewingQuotation(null)} className="w-full sm:w-auto">
                    Close
                  </Button>
                  <Button onClick={() => {
                    setViewingQuotation(null);
                    openEditModal(viewingQuotation);
                  }} className="w-full sm:w-auto">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button onClick={() => handleDownloadPDF(viewingQuotation)} className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setViewingQuotation(null);
                      handleDuplicateQuotation(viewingQuotation);
                    }} 
                    disabled={isDuplicating}
                    className="w-full sm:w-auto"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                    onClick={() => {
                      setViewingQuotation(null);
                      handleDeleteQuotation(viewingQuotation.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-slate-800">
            <Calculator className="h-6 w-6 mr-3 text-red-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="p-6 h-auto flex-col space-y-2 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 text-blue-900 hover:from-blue-100 hover:to-blue-200"
              onClick={() => setIsTemplateModalOpen(true)}
            >
              <FileText className="h-8 w-8" />
              <span className="font-semibold">Create Template</span>
              <span className="text-sm text-blue-600">Build reusable quotation templates</span>
            </Button>
            <Button 
              className="p-6 h-auto flex-col space-y-2 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 text-green-900 hover:from-green-100 hover:to-green-200"
              onClick={() => setIsReportsModalOpen(true)}
            >
              <Download className="h-8 w-8" />
              <span className="font-semibold">Export Reports</span>
              <span className="text-sm text-green-600">Generate quotation reports</span>
            </Button>
            <Button 
              className="p-6 h-auto flex-col space-y-2 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 text-purple-900 hover:from-purple-100 hover:to-purple-200"
              onClick={() => setIsCalculatorModalOpen(true)}
            >
              <Calculator className="h-8 w-8" />
              <span className="font-semibold">Pricing Calculator</span>
              <span className="text-sm text-purple-600">Quick pricing calculations</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Template Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl truncate">Create Quotation Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input id="template-name" placeholder="Enter template name" />
            </div>
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea id="template-description" placeholder="Template description" />
            </div>
            <div>
              <Label>Base Template On</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select existing quotation" />
                </SelectTrigger>
                <SelectContent>
                  {quotations.map((quotation) => (
                    <SelectItem key={quotation.id} value={quotation.id}>
                      <span className="truncate">{quotation.quotation_number} - {quotation.title}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsTemplateModalOpen(false)}>
                Cancel
              </Button>
              <Button className="w-full sm:w-auto" onClick={() => {
                // Template creation logic here
                alert('Template creation feature coming soon!');
                setIsTemplateModalOpen(false);
              }}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Confirmation Modal */}
      <Dialog open={isOrderConfirmModalOpen} onOpenChange={setIsOrderConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Convert to Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to convert this quotation to an order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {quotationToConvert && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Quotation #:</span>
                  <span>{quotationToConvert.quotation_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Client:</span>
                  <span>{quotationToConvert.client?.company_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span>${quotationToConvert.final_amount?.toLocaleString() || 0}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderConfirmModalOpen(false)} disabled={isConvertingToOrder}>
              Cancel
            </Button>
            <Button 
              onClick={confirmConvertToOrder} 
              disabled={isConvertingToOrder}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isConvertingToOrder ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Convert to Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Reports Modal */}
      <Dialog open={isReportsModalOpen} onOpenChange={setIsReportsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl truncate">Export Quotation Reports</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Report Type</Label>
              <Select value={reportData.reportType} onValueChange={(value) => setReportData({...reportData, reportType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="client">Client Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date-from">From Date</Label>
                <Input 
                  id="date-from" 
                  type="date" 
                  value={reportData.dateFrom}
                  onChange={(e) => setReportData({...reportData, dateFrom: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="date-to">To Date</Label>
                <Input 
                  id="date-to" 
                  type="date" 
                  value={reportData.dateTo}
                  onChange={(e) => setReportData({...reportData, dateTo: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label>Status Filter</Label>
              <Select value={reportData.statusFilter} onValueChange={(value) => setReportData({...reportData, statusFilter: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsReportsModalOpen(false)}>
                Cancel
              </Button>
              <Button className="w-full sm:w-auto" onClick={async () => {
                try {
                  // Filter quotations based on criteria
                  let filteredData = quotations;
                  
                  if (reportData.dateFrom) {
                    filteredData = filteredData.filter(q => new Date(q.created_at) >= new Date(reportData.dateFrom));
                  }
                  
                  if (reportData.dateTo) {
                    filteredData = filteredData.filter(q => new Date(q.created_at) <= new Date(reportData.dateTo));
                  }
                  
                  if (reportData.statusFilter !== 'all') {
                    filteredData = filteredData.filter(q => q.status === reportData.statusFilter);
                  }
                  
                  // Generate report based on type
                  const doc = new jsPDF();
                  doc.setFontSize(20);
                  doc.text(`${reportData.reportType.charAt(0).toUpperCase() + reportData.reportType.slice(1)} Report`, 20, 30);
                  
                  doc.setFontSize(12);
                  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
                  doc.text(`Period: ${reportData.dateFrom || 'All'} to ${reportData.dateTo || 'All'}`, 20, 55);
                  doc.text(`Status Filter: ${reportData.statusFilter}`, 20, 65);
                  
                  const tableData = filteredData.map(q => [
                    q.quotation_number,
                    q.client?.company_name || 'N/A',
                    q.status?.toUpperCase(),
                    `$${q.final_amount?.toFixed(2) || '0.00'}`,
                    new Date(q.created_at).toLocaleDateString()
                  ]);
                  
                  doc.autoTable({
                    startY: 80,
                    head: [['Quotation #', 'Client', 'Status', 'Amount', 'Date']],
                    body: tableData,
                    theme: 'grid'
                  });
                  
                  // Add summary
                  const totalAmount = filteredData.reduce((sum, q) => sum + (q.final_amount || 0), 0);
                  const finalY = (doc as any).lastAutoTable.finalY + 20;
                  
                  doc.setFontSize(14);
                  doc.text(`Total Quotations: ${filteredData.length}`, 20, finalY);
                  doc.text(`Total Value: $${totalAmount.toFixed(2)}`, 20, finalY + 10);
                  
                  doc.save(`quotation-report-${reportData.reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
                  setIsReportsModalOpen(false);
                } catch (error) {
                  console.error('Error generating report:', error);
                  alert('Error generating report. Please try again.');
                }
              }}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pricing Calculator Modal */}
      <Dialog open={isCalculatorModalOpen} onOpenChange={setIsCalculatorModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl truncate">Pricing Calculator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calc-base-price">Base Price</Label>
                <Input 
                  id="calc-base-price" 
                  type="number" 
                  placeholder="0.00" 
                  value={calculatorData.basePrice}
                  onChange={(e) => setCalculatorData({...calculatorData, basePrice: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="calc-quantity">Quantity</Label>
                <Input 
                  id="calc-quantity" 
                  type="number" 
                  placeholder="1" 
                  value={calculatorData.quantity}
                  onChange={(e) => setCalculatorData({...calculatorData, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calc-discount">Discount (%)</Label>
                <Input 
                  id="calc-discount" 
                  type="number" 
                  placeholder="0" 
                  value={calculatorData.discount}
                  onChange={(e) => setCalculatorData({...calculatorData, discount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="calc-tax">Tax (%)</Label>
                <Input 
                  id="calc-tax" 
                  type="number" 
                  placeholder="0" 
                  value={calculatorData.tax}
                  onChange={(e) => setCalculatorData({...calculatorData, tax: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Calculation Results</h3>
              <div className="space-y-1 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">${(calculatorData.basePrice * calculatorData.quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="font-mono text-red-600">-${((calculatorData.basePrice * calculatorData.quantity * calculatorData.discount) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-mono">${(((calculatorData.basePrice * calculatorData.quantity) - ((calculatorData.basePrice * calculatorData.quantity * calculatorData.discount) / 100)) * calculatorData.tax / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-1">
                  <span>Total:</span>
                  <span className="font-mono">${(() => {
                    const subtotal = calculatorData.basePrice * calculatorData.quantity;
                    const discountAmount = (subtotal * calculatorData.discount) / 100;
                    const afterDiscount = subtotal - discountAmount;
                    const taxAmount = (afterDiscount * calculatorData.tax) / 100;
                    return (afterDiscount + taxAmount).toFixed(2);
                  })()}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => {
                setCalculatorData({ basePrice: 0, quantity: 1, discount: 0, tax: 0 });
                setIsCalculatorModalOpen(false);
              }}>
                Close
              </Button>
              <Button className="w-full sm:w-auto" onClick={() => {
                const subtotal = calculatorData.basePrice * calculatorData.quantity;
                const discountAmount = (subtotal * calculatorData.discount) / 100;
                const afterDiscount = subtotal - discountAmount;
                const taxAmount = (afterDiscount * calculatorData.tax) / 100;
                const total = afterDiscount + taxAmount;
                
                // Update form data with calculated values
                setFormData({
                  ...formData,
                  total_amount: subtotal.toString(),
                  discount_percentage: calculatorData.discount,
                  final_amount: total.toString()
                });
                
                setCalculatorData({ basePrice: 0, quantity: 1, discount: 0, tax: 0 });
                setIsCalculatorModalOpen(false);
                alert('Values added to quotation form!');
              }}>
                Apply to Quotation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Confirmation Modal */}
      <Dialog open={isOrderConfirmModalOpen} onOpenChange={setIsOrderConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Convert to Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to convert this quotation to an order?
            </p>
            {quotationToConvert && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium">{quotationToConvert.quotation_number}</div>
                <div className="text-sm text-gray-600">{quotationToConvert.client?.company_name}</div>
                <div className="text-sm font-medium text-green-600">
                  ${quotationToConvert.final_amount?.toFixed(2) || '0.00'}
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto" 
                onClick={() => {
                  setIsOrderConfirmModalOpen(false);
                  setQuotationToConvert(null);
                }}
                disabled={isConvertingToOrder}
              >
                Cancel
              </Button>
              <Button 
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700" 
                onClick={confirmConvertToOrder}
                disabled={isConvertingToOrder}
              >
                {isConvertingToOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Converting...
                  </>
                ) : (
                  'Convert to Order'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuotationBuilderPage;