import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://whlkoratnodmqbmtmtqk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwODc0MTMsImV4cCI6MjA2NjY2MzQxM30.adJwb6qCv6rSRDRnUXbh0tJZiEYuzbWfT4tuMtbkrSs'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create admin client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database configuration
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
}

// Auth helpers
export const auth = supabase.auth

// Storage helpers
export const storage = supabase.storage

// Database helpers
export const db = supabase

// Database service functions
export const dbService = {
  // Storage functions
  async getTransformationImages() {
    const { data, error } = await supabase.storage
      .from('images')
      .list('trans', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) throw error;
    
    // Filter only image files and get public URLs
    const imageFiles = data?.filter(file => 
      file.name.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)
    ) || [];
    
    return imageFiles.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(`trans/${file.name}`);
      return {
        name: file.name,
        url: publicUrl,
        created_at: file.created_at
      };
    });
  },
  // Products
  async getProducts(pageReference?: string, page?: number, limit?: number, searchTerm?: string, category?: string) {
    let query = supabase.from('products').select('*')
    
    if (pageReference) {
      query = query.eq('page_reference', pageReference)
    }
    
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,supplier_code.ilike.%${searchTerm}%`);
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    // Add pagination if specified
    if (page !== undefined && limit !== undefined) {
      const from = page * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    } else {
      // Ensure we get all records by setting a high limit when no pagination is specified
      query = query.limit(50000);
    }
    
    // Optimize ordering for better performance
    const { data, error } = await query.order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getProductsCount(pageReference?: string, searchTerm?: string, category?: string) {
    let query = supabase.from('products').select('*', { count: 'exact', head: true })
    
    if (pageReference) {
      query = query.eq('page_reference', pageReference)
    }
    
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`);
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { count, error } = await query;
    
    if (error) throw error;
    return count || 0;
  },

  async getProductById(id: string) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async createProduct(product: any) {
    const { data, error } = await supabaseAdmin.from('products').insert(product).select().single();
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: any) {
    const { data, error } = await supabaseAdmin.from('products').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // Optimized methods for filter options
  async getProductCategories() {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)
      .not('category', 'eq', '')
      .order('category');
    
    if (error) throw error;
    const categories = Array.from(new Set(data?.map(item => item.category).filter(Boolean) || []));
    return categories;
  },

  async getProductCategoriesByPage(pageReference: string) {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('page_reference', pageReference)
      .not('category', 'is', null)
      .not('category', 'eq', '')
      .order('category');
    
    if (error) throw error;
    const categories = Array.from(new Set(data?.map(item => item.category).filter(Boolean) || []));
    return categories;
  },

  async getProductPageReferences() {
    const { data, error } = await supabase
      .from('products')
      .select('page_reference')
      .not('page_reference', 'is', null)
      .not('page_reference', 'eq', '')
      .order('page_reference');
    
    if (error) throw error;
    const pages = Array.from(new Set(data?.map(item => item.page_reference).filter(Boolean) || []));
    return pages;
  },

  // Contact Requests
  async getContactRequests() {
    const { data, error } = await supabaseAdmin
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createContactRequest(request: any) {
    const { data, error } = await supabase.from('contact_requests').insert(request).select().single();
    if (error) throw error;
    return data;
  },

  async updateContactRequest(id: string, updates: any) {
    const { data, error } = await supabase.from('contact_requests').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  
  // Contact Messages (using contact_requests table)
  async getContactMessages() {
    const { data, error } = await supabaseAdmin
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createContactMessage(message: any) {
    const { data, error } = await supabase.from('contact_requests').insert(message).select().single();
    if (error) throw error;
    return data;
  },

  // Portal Users
  async getPortalUsers() {
    const { data, error } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createPortalUser(user: any) {
    const { data, error } = await supabase.from('admin_users').insert(user).select().single();
    if (error) throw error;
    return data;
  },

  async updatePortalUser(id: string, updates: any) {
    const { data, error } = await supabase.from('admin_users').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deletePortalUser(id: string) {
    const { error } = await supabase.from('admin_users').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // Translations
  async getTranslations() {
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .order('key', { ascending: true });
    if (error) throw error;
    return data;
  },

  async updateTranslation(key: string, updates: any) {
    const { data, error } = await supabase
      .from('translations')
      .update(updates)
      .eq('key', key)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createTranslation(translation: any) {
    const { data, error } = await supabase
      .from('translations')
      .insert(translation)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Quotations
  async getQuotations() {
    const { data, error } = await supabaseAdmin
      .from('quotations')
      .select('*, client:clients(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addQuotation(quotation: any) {
    const { data, error } = await supabaseAdmin
      .from('quotations')
      .insert(quotation)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async createQuotation(quotation: any) {
    const { data, error } = await supabaseAdmin
      .from('quotations')
      .insert(quotation)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async updateQuotation(id: string, quotation: any) {
    const { data, error } = await supabaseAdmin
      .from('quotations')
      .update(quotation)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async deleteQuotation(id: string) {
    const { error } = await supabaseAdmin
      .from('quotations')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // Quotation Items
  async getQuotationItems(quotationId: string) {
    const { data, error } = await supabaseAdmin
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', quotationId);
    if (error) throw error;
    return data || [];
  },

  async addQuotationItem(item: any) {
    const { data, error } = await supabaseAdmin
      .from('quotation_items')
      .insert([item])
      .select('*');
    if (error) throw error;
    return data;
  },

  async deleteQuotationItems(quotationId: string) {
    const { error } = await supabaseAdmin
      .from('quotation_items')
      .delete()
      .eq('quotation_id', quotationId);
    if (error) throw error;
    return true;
  },

  // Client management methods
  async getClients() {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .order('company_name');
    
    if (error) throw error;
    return data || [];
  },

  async searchClients(searchTerm: string) {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .or(`company_name.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('company_name');
    
    if (error) throw error;
    return data;
  },

  async addClient(client: Omit<any, 'id' | 'created_at'>) {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert(client)
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async getClientById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateClient(id: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  // UI Images
  async getUIImages() {
    const { data, error } = await supabaseAdmin.from('ui_images').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createUIImage(image: any) {
    const { data, error } = await supabaseAdmin.from('ui_images').insert(image).select().single();
    if (error) throw error;
    return data;
  },

  async updateUIImage(id: string, updates: any) {
    const { data, error } = await supabaseAdmin.from('ui_images').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteUIImage(id: string) {
    const { error } = await supabaseAdmin.from('ui_images').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // SLA Levels
  async getSLALevels() {
    const { data, error } = await supabase.from('sla_levels').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Request Types
  async getRequestTypes() {
    const { data, error } = await supabase.from('request_types').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Orders
  async getOrders() {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, client:clients(*), quotation:quotations!orders_quotation_id_fkey(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createOrder(order: any) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(order)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async updateOrder(id: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async deleteOrder(id: string) {
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async generateOrderNumber() {
    // Get all existing orders to find the highest order number
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('order_number')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    let maxNumber = 0;
    if (orders && orders.length > 0) {
      orders.forEach(order => {
        if (order.order_number) {
          // Extract the numeric part from the order number (e.g., "ORD-001" -> 1)
          const match = order.order_number.match(/ORD-(\d+)/);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (num > maxNumber) {
              maxNumber = num;
            }
          }
        }
      });
    }
    
    // Generate next order number
    const nextNumber = maxNumber + 1;
    return `ORD-${nextNumber.toString().padStart(3, '0')}`;
  },

  async convertQuotationToOrder(quotationId: string) {
    // Get quotation with items
    const quotation = await this.getQuotationById(quotationId);
    const quotationItems = await this.getQuotationItems(quotationId);
    
    if (!quotation) throw new Error('Quotation not found');
    
    // Generate order number
    const orderNumber = await this.generateOrderNumber();
    
    // Create order
    const orderData = {
      quotation_id: quotationId,
      order_number: orderNumber,
      client_id: quotation.client_id,
      title: quotation.title,
      total_amount: quotation.total_amount,
      final_amount: quotation.final_amount,
      order_status: 'waiting_payment',
      payment_status: 'pending',
      supplier_status: 'pending',
      shipment_status: 'pending',
      order_date: new Date().toISOString(),
      notes: quotation.notes
    };
    
    const order = await this.createOrder(orderData);
    
    // Copy quotation items to order items
    if (quotationItems && quotationItems.length > 0) {
      const orderItems = quotationItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        discount_percentage: item.discount_percentage || 0
      }));
      
      await this.addOrderItems(orderItems);
    }
    
    // Update quotation status and link to order
    await this.updateQuotation(quotationId, {
      status: 'converted_to_order',
      order_id: order.id
    });
    
    return order;
  },

  async getQuotationById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('quotations')
      .select('*, client:clients(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Order Items
  async getOrderItems(orderId: string) {
    const { data, error } = await supabaseAdmin
      .from('order_items')
      .select('*, product:products(*)')
      .eq('order_id', orderId);
    if (error) throw error;
    return data || [];
  },

  async addOrderItems(items: any[]) {
    const { data, error } = await supabaseAdmin
      .from('order_items')
      .insert(items)
      .select('*');
    if (error) throw error;
    return data;
  },

  async updateOrderItem(id: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('order_items')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async deleteOrderItem(id: string) {
    const { error } = await supabaseAdmin
      .from('order_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async deleteOrderItems(orderId: string) {
    const { error } = await supabaseAdmin
      .from('order_items')
      .delete()
      .eq('order_id', orderId);
    if (error) throw error;
    return true;
  },

  async getAllOrderItems() {
    const { data, error } = await supabaseAdmin
      .from('order_items')
      .select('*, product:products(*), order:orders(*, client:clients(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getAllQuotationItems() {
    const { data, error } = await supabaseAdmin
      .from('quotation_items')
      .select('*, product:products(*), quotation:quotations(*, client:clients(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Quotation Templates
  async getQuotationTemplates() {
    const { data, error } = await supabaseAdmin
      .from('quotation_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data;
  },

  async createQuotationTemplate(template: any) {
    const { data, error } = await supabaseAdmin
      .from('quotation_templates')
      .insert(template)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async updateQuotationTemplate(id: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('quotation_templates')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async deleteQuotationTemplate(id: string) {
    const { data, error } = await supabaseAdmin
      .from('quotation_templates')
      .update({ is_active: false })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  // Client Communications
  async getClientCommunications(clientId?: string, quotationId?: string, orderId?: string) {
    let query = supabase
      .from('client_communications')
      .select('*, client:clients(*), quotation:quotations(*), order:orders(*)');
    
    if (clientId) query = query.eq('client_id', clientId);
    if (quotationId) query = query.eq('quotation_id', quotationId);
    if (orderId) query = query.eq('order_id', orderId);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addClientCommunication(communication: any) {
    const { data, error } = await supabase
      .from('client_communications')
      .insert(communication)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  // Analytics
  async getOrderAnalytics() {
    const { data, error } = await supabaseAdmin
      .from('order_analytics')
      .select('*')
      .limit(12);
    if (error) throw error;
    return data;
  },

  async getQuotationStats() {
    const { data: quotations, error } = await supabaseAdmin
      .from('quotations')
      .select('status');
    
    if (error) throw error;
    
    const stats = quotations.reduce((acc: any, q: any) => {
      acc.total++;
      if (q.status === 'draft') acc.draft++;
      if (q.status === 'sent') acc.sent++;
      if (q.status === 'accepted') acc.accepted++;
      if (q.status === 'converted_to_order') acc.convertedToOrder++;
      if (q.status === 'rejected') acc.rejected++;
      return acc;
    }, { total: 0, draft: 0, sent: 0, accepted: 0, convertedToOrder: 0, rejected: 0 });
    
    // Include both accepted and converted_to_order in the conversion rate
    const successfulQuotations = stats.accepted + stats.convertedToOrder;
    stats.conversionRate = stats.total > 0 ? (successfulQuotations / stats.total) * 100 : 0;
    
    return stats;
  },

  async getOrderStats() {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('order_status, final_amount');
    
    if (error) throw error;
    
    return orders.reduce((acc: any, order: any) => {
      acc.total++;
      if (order.order_status === 'waiting_payment') acc.waitingPayment++;
      if (order.order_status === 'confirming_supplier') acc.confirmingSupplier++;
      if (order.order_status === 'shipment_ready') acc.shipmentReady++;
      if (order.order_status === 'delivered') acc.delivered++;
      acc.totalValue += order.final_amount || 0;
      return acc;
    }, { total: 0, waitingPayment: 0, confirmingSupplier: 0, shipmentReady: 0, delivered: 0, totalValue: 0 });
  },
  
  // Services for Special Request Page
  async getServices(activeOnly: boolean = true) {
    let query = supabaseAdmin.from('services').select('*');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('title');
    if (error) throw error;
    return data || [];
  },
  
  async getServiceById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  
  async getServiceByServiceId(serviceId: string) {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('service_id', serviceId)
      .single();
    if (error) throw error;
    return data;
  },
  
  async createService(service: any) {
    const { data, error } = await supabaseAdmin
      .from('services')
      .insert(service)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  
  async updateService(id: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('services')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  
  async deleteService(id: string) {
    // Soft delete by setting is_active to false
    const { data, error } = await supabaseAdmin
      .from('services')
      .update({ is_active: false })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  
  async hardDeleteService(id: string) {
    // Hard delete - permanently removes the service
    const { error } = await supabaseAdmin
      .from('services')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // Authentication functions
  async verifyAdminLogin(email: string, password: string) {
    const { data, error } = await supabase
      .rpc('verify_admin_login', {
        p_email: email,
        p_password: password
      });
    
    if (error) throw error;
    return data;
  },

  async createAdminUserWithPassword(email: string, name: string, role: string, password: string, status: string = 'active') {
    const { data, error } = await supabaseAdmin
      .rpc('create_admin_user_with_password', {
        p_email: email,
        p_name: name,
        p_role: role,
        p_password: password,
        p_status: status
      });
    
    if (error) throw error;
    return data;
  },

  async getAdminCredentials() {
    const { data, error } = await supabaseAdmin
      .from('admin_credentials')
      .select(`
        id,
        email,
        last_login,
        failed_login_attempts,
        locked_until,
        created_at,
        admin_user:admin_users(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async resetAdminPassword(email: string, newPassword: string) {
    // This would typically generate a reset token and send an email
    // For now, we'll create a simple function to update the password
    const { data, error } = await supabaseAdmin
      .rpc('reset_admin_password', {
        p_email: email,
        p_new_password: newPassword
      });
    
    if (error) throw error;
    return data;
  },

  async unlockAdminAccount(email: string) {
    const { data, error } = await supabaseAdmin
      .from('admin_credentials')
      .update({
        failed_login_attempts: 0,
        locked_until: null
      })
      .eq('email', email)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Company Details Management
  async getCompanyDetails() {
    try {
      const { data, error } = await supabaseAdmin
        .from('company_details')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw error;
      }

      return data || {
        name: 'ChefGear Pro',
        logo: '',
        logo_url: 'https://whlkoratnodmqbmtmtqk.supabase.co/storage/v1/object/public/images//loho.png',
        description: 'Professional kitchen equipment and solutions',
        website: 'https://chefgear.com',
        email: 'info@chefgear.com',
        phone: '+90 (212) 555-1234',
        address: 'Atatürk Mah. Ertuğrul Gazi Sok. No: 25, Kat: 3, 34758 Ataşehir/İstanbul',
        social_media: {
          facebook: 'https://facebook.com/chefgear',
          twitter: 'https://twitter.com/chefgear',
          instagram: 'https://instagram.com/chefgear',
          linkedin: 'https://linkedin.com/company/chefgear'
        }
      };
    } catch (error) {
      console.error('Error fetching company details:', error);
      throw error;
    }
  },

  async uploadLogoToStorage(file: File) {
    try {
      // Convert base64 to file if needed
      let fileToUpload = file;
      
      // Generate a unique file name with timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = `company/${fileName}`;
      
      // Upload to Supabase Storage
      const { error } = await supabaseAdmin.storage
        .from('images')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  },
  
  async updateCompanyDetails(details: any) {
    try {
      const { data, error } = await supabaseAdmin
        .from('company_details')
        .upsert({
          id: 1, // Single row for company details
          ...details,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating company details:', error);
      throw error;
    }
  }
}