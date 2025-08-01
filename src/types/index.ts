export interface Product {
  id: string;
  name: string;
  code?: string;
  supplier_code?: string;
  price: number;
  category: string;
  subcategory?: string;
  description?: string;
  image_url: string;
  page_reference?: string;
  brand?: string;
  discount?: number;
  created_at?: string;
  updated_at?: string;
  supplier?: string;
  // New technical specification fields
  hz?: number;
  voltage?: number;
  power?: number;
  litre?: number;
  kg?: number;
}

export interface ProductTranslation {
  id: string;
  product_id: string;
  language_code: string;
  name: string;
  description: string;
  page_reference: string;
}

export interface ContactRequest {
  id: string;
  name: string;
  company: string;
  country: string;
  phone: string;
  email: string;
  sla_level: string;
  request_type: string;
  message: string;
  file_attachment?: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface PortalUser {
  id: string;
  email: string;
  name: string;
  role: 'editor' | 'viewer';
  status: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  timeline: string;
  starting_price: number;
  included_services: string[];
  image_url?: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  country: string;
  flagUrl: string;
  dir: 'ltr' | 'rtl';
  active: boolean;
}

export interface Translation {
  id: string;
  key: string;
  en: string;
  ar: string;
  tr: string;
  es: string;
  ru: string;
}

export interface SLALevel {
  id: string;
  name: string;
  response_time: string;
}

export interface RequestType {
  id: string;
  name: string;
  description: string;
}

export interface Client {
  id: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  usual_discount?: number;
  created_at: string;
}

export interface Quotation {
  id: string;
  client_id: string; // new field
  quotation_number?: string;
  title?: string;
  total_amount?: number;
  discount_percentage?: number;
  final_amount?: number;
  status?: string;
  valid_until?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  customer_reference?: string;

  // Optional: include joined client (if queried)
  client?: Client;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_percentage?: number;
  created_at: string;
}

export interface Order {
  id: string;
  quotation_id: string;
  order_number: string;
  client_id: string;
  title?: string;
  total_amount: number;
  final_amount: number;
  order_status: 'waiting_payment' | 'payment_received' | 'confirming_supplier' | 
                'supplier_confirmed' | 'sending_money' | 'money_sent' | 
                'production_started' | 'shipment_ready' | 'shipped' | 
                'delivered' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  supplier_status: 'pending' | 'confirmed' | 'rejected' | 'in_production';
  shipment_status: 'pending' | 'ready' | 'shipped' | 'delivered';
  order_date: string;
  expected_delivery?: string;
  actual_delivery?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Optional: include joined data
  client?: Client;
  quotation?: Quotation;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_percentage?: number;
  created_at: string;
  
  // Optional: include joined product data
  product?: Product;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  description?: string;
  template_data: any; // JSON structure
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientCommunication {
  id: string;
  client_id: string;
  quotation_id?: string;
  order_id?: string;
  communication_type: 'email_sent' | 'email_received' | 'phone_call' | 'meeting' | 'note';
  subject?: string;
  content: string;
  created_by: string;
  created_at: string;
  
  // Optional: include joined data
  client?: Client;
  quotation?: Quotation;
  order?: Order;
}

export interface OrderStats {
  total: number;
  waitingPayment: number;
  confirmingSupplier: number;
  shipmentReady: number;
  delivered: number;
  totalValue: number;
}

export interface QuotationStats {
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  conversionRate: number;
}