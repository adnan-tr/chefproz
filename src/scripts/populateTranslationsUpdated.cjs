const { createClient } = require('@supabase/supabase-js');

// Supabase configuration for Node.js
const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Translation data - using the original format for ease of maintenance
const translationsSource = [
  // Navigation
  { key: 'nav.home', en: 'Home' },
  { key: 'nav.about', en: 'About' },
  { key: 'nav.contact', en: 'Contact Us' },
  { key: 'nav.inoksan', en: 'Inoksan' },
  { key: 'nav.refrigeration', en: 'Refrigeration' },
  { key: 'nav.kitchen_tools', en: 'Kitchen Tools' },
  { key: 'nav.hotel_equipment', en: 'Hotel Equipment' },
  { key: 'nav.special_request', en: 'Special Request' },
  { key: 'nav.secure_portal', en: 'Secure Portal' },

  // Header
  { key: 'header.company_name', en: 'ChefGear' },
  { key: 'header.company_tagline', en: 'Professional Kitchen Solutions' },

  // Hero Section
  { key: 'hero.title', en: 'Professional Kitchen & Catering Solutions' },
  { key: 'hero.subtitle', en: 'Expert consultancy for industrial kitchens, hotel equipment, and catering solutions' },
  { key: 'hero.cta', en: 'Get Consultation' },
  { key: 'hero.services', en: 'View Services' },

  // Company Section
  { key: 'company.overview', en: 'Leading Industrial Kitchen Consultancy' },
  { key: 'company.description', en: 'With over 15 years of experience, we provide comprehensive solutions for industrial kitchens, hotel equipment, and catering services.' },

  // Features
  { key: 'features.industrial.title', en: 'Industrial Kitchen Solutions' },
  { key: 'features.industrial.description', en: 'Complete industrial kitchen design and equipment solutions' },
  { key: 'features.refrigeration.title', en: 'Refrigeration Systems' },
  { key: 'features.refrigeration.description', en: 'Advanced refrigeration and cooling solutions' },
  { key: 'features.tools.title', en: 'Professional Kitchen Tools' },
  { key: 'features.tools.description', en: 'High-quality tools for professional kitchens' },
  { key: 'features.hotel.title', en: 'Hotel Equipment' },
  { key: 'features.hotel.description', en: 'Comprehensive hotel furniture and serving equipment' },

  // Statistics
  { key: 'stats.clients', en: 'Satisfied Clients' },
  { key: 'stats.experience', en: 'Years Experience' },
  { key: 'stats.countries', en: 'Countries Served' },
  { key: 'stats.projects', en: 'Projects Completed' },

  // Achievements
  { key: 'achievements.leader.title', en: 'Industry Leader' },
  { key: 'achievements.leader.description', en: 'Recognized as the leading kitchen consultancy in the region' },
  { key: 'achievements.success.title', en: '99% Success Rate' },
  { key: 'achievements.success.description', en: 'Exceptional project completion and client satisfaction rate' },
  { key: 'achievements.innovation.title', en: 'Innovation Award' },
  { key: 'achievements.innovation.description', en: 'Winner of the 2023 Kitchen Innovation Excellence Award' },
  { key: 'achievements.global.title', en: 'Global Presence' },
  { key: 'achievements.global.description', en: 'Serving clients across 5 continents with local expertise' },

  // Work Section
  { key: 'work.title', en: 'Our Work in Action' },
  { key: 'work.subtitle', en: 'See our professional kitchen solutions in real-world applications' },
  { key: 'work.item1.title', en: 'Modern Industrial Kitchen' },
  { key: 'work.item1.description', en: 'State-of-the-art equipment and design' },
  { key: 'work.item2.title', en: 'Hotel Restaurant Setup' },
  { key: 'work.item2.description', en: 'Complete kitchen and dining solutions' },
  { key: 'work.item3.title', en: 'Catering Facility' },
  { key: 'work.item3.description', en: 'High-volume food preparation systems' },

  // Transformations
  { key: 'transformations.title', en: 'Transformation Gallery' },
  { key: 'transformations.subtitle', en: 'Explore our portfolio of professional kitchen solutions' },
  { key: 'transformations.loading', en: 'Loading gallery...' },
  { key: 'transformations.empty', en: 'No images found. Add images to the \'trans\' folder in Supabase storage.' },

  // Products
  { key: 'products.title', en: 'Our Product Range' },
  { key: 'products.description', en: 'Comprehensive solutions for all your industrial kitchen needs' },
  { key: 'products.search', en: 'Search products...' },
  { key: 'products.search_hotel_equipment', en: 'Search hotel equipment...' },
  { key: 'products.search_refrigeration', en: 'Search refrigeration equipment...' },
  { key: 'products.search_kitchen_tools', en: 'Search kitchen tools...' },
  { key: 'products.search_industrial', en: 'Search industrial equipment...' },
  { key: 'products.filter', en: 'Filter' },
  { key: 'products.clear_filters', en: 'Clear Filters' },
  { key: 'products.loading', en: 'Loading products...' },
  { key: 'products.no_products_found', en: 'No products found' },
  { key: 'products.try_adjusting_filters', en: 'Try adjusting your search or filters' },
  { key: 'products.add_to_inquiry', en: 'Add to Inquiry' },
  { key: 'products.view_details', en: 'View Details' },
  { key: 'products.category', en: 'Category' },
  { key: 'products.subcategory', en: 'Subcategory' },
  { key: 'products.product_code', en: 'Product Code' },
  { key: 'products.supplier_code', en: 'Supplier Code' },
  { key: 'products.price', en: 'Price' },
  { key: 'products.discount', en: 'Discount (%)' },
  { key: 'products.quantity', en: 'Quantity' },
  { key: 'products.categories', en: 'Categories' },
  { key: 'products.all_categories', en: 'All Categories' },
  { key: 'products.subcategories', en: 'Subcategories' },
  { key: 'products.all', en: 'All' },
  { key: 'products.hotel_equipment_description', en: 'Premium hotel furniture and serving equipment for hospitality excellence. From elegant banquet furniture to professional serving stations, create memorable dining experiences.' },
  { key: 'products.refrigeration_title', en: 'Refrigeration Equipment' },
  { key: 'products.refrigeration_description', en: 'Professional refrigeration solutions for commercial kitchens, restaurants, and food service operations. Energy-efficient units with precise temperature control and reliable performance.' },
  { key: 'products.kitchen_tools_description', en: 'Professional kitchen tools and equipment for culinary excellence. From precision knives to specialized preparation tools, find everything you need for your professional kitchen.' },
  { key: 'products.inoksan_title', en: 'Industrial Kitchen Equipment' },
  { key: 'products.inoksan_description', en: 'Professional-grade industrial kitchen equipment designed for commercial use. All products come with warranty and professional installation services.' },

  // Contact Form
  { key: 'contact.page_title', en: 'Contact Us' },
  { key: 'contact.page_description', en: 'Get in touch with our experts for professional consultation and customized solutions' },
  { key: 'contact.contact_information', en: 'Contact Information' },
  { key: 'contact.business_hours', en: 'Business Hours' },
  { key: 'contact.business_hours_weekdays', en: 'Monday - Friday: 8:00 AM - 6:00 PM' },
  { key: 'contact.business_hours_saturday', en: 'Saturday: 9:00 AM - 4:00 PM' },
  { key: 'contact.business_hours_sunday', en: 'Sunday: Closed' },
  { key: 'contact.send_us_message', en: 'Send us a Message' },
  { key: 'contact.form.name', en: 'Full Name' },
  { key: 'contact.form.company', en: 'Company' },
  { key: 'contact.form.country', en: 'Country' },
  { key: 'contact.form.phone', en: 'Phone' },
  { key: 'contact.form.email', en: 'Email' },
  { key: 'contact.form.message', en: 'Message' },
  { key: 'contact.form.submit', en: 'Send Message' },
  { key: 'contact.name_placeholder', en: 'Enter your full name' },
  { key: 'contact.company_placeholder', en: 'Enter your company name' },
  { key: 'contact.country_placeholder', en: 'Enter your country' },
  { key: 'contact.phone_placeholder', en: 'Enter your phone number' },
  { key: 'contact.email_placeholder', en: 'Enter your email address' },
  { key: 'contact.message_placeholder', en: 'Please provide details about your requirements...' },
  { key: 'contact.service_level_agreement', en: 'Service Level Agreement' },
  { key: 'contact.sla_standard', en: 'Standard (3-5 business days)' },
  { key: 'contact.sla_priority', en: 'Priority (1-2 business days)' },
  { key: 'contact.sla_urgent', en: 'Urgent (Same day)' },
  { key: 'contact.request_type', en: 'Request Type' },
  { key: 'contact.request_consultation', en: 'General Consultation' },
  { key: 'contact.request_quotation', en: 'Price Quotation' },
  { key: 'contact.request_installation', en: 'Installation Services' },
  { key: 'contact.request_maintenance', en: 'Maintenance Support' },
  { key: 'contact.request_custom', en: 'Custom Solution' },
  { key: 'contact.file_attachment', en: 'File Attachment (Optional)' },
  { key: 'contact.file_formats', en: 'Supported formats: PDF, Word documents, Images (Max 10MB)' },

  // Special Request
  { key: 'special_request.page_title', en: 'Special Request' },
  { key: 'special_request.page_description', en: 'Professional services tailored to your specific requirements. From custom kitchen design to specialized installation and ongoing support.' },
  { key: 'special_request.loading', en: 'Loading services...' },
  { key: 'special_request.error', en: 'Failed to load services. Please try again later.' },
  { key: 'special_request.try_again', en: 'Try Again' },
  { key: 'special_request.no_services', en: 'No services available at the moment.' },
  { key: 'special_request.starting_from', en: 'Starting from' },
  { key: 'special_request.timeline', en: 'Timeline:' },
  { key: 'special_request.included_services', en: 'Included Services:' },
  { key: 'special_request.get_consultation', en: 'Get Consultation' },
  { key: 'special_request.custom_solution', en: 'Need a Custom Solution?' },
  { key: 'special_request.custom_solution_description', en: 'Can\'t find what you\'re looking for? We specialize in creating custom solutions for unique requirements. Contact us to discuss your specific needs.' },
  { key: 'special_request.discuss_project', en: 'Discuss Your Project' },

  // About Page
  { key: 'about.page_title', en: 'About Us' },
  { key: 'about.hero_description', en: 'ChefGear has been at the forefront of professional kitchen solutions for over 15 years, providing exceptional equipment and consultancy services to culinary professionals worldwide.' },
  { key: 'about.our_story', en: 'Our Story' },
  { key: 'about.story_paragraph1', en: 'Founded in 2009, ChefGear began as a small family business with a simple mission: to provide professional chefs and restaurateurs with the highest quality kitchen equipment and expert guidance they need to succeed.' },
  { key: 'about.story_paragraph2', en: 'Over the years, we\'ve grown from a local supplier to an international consultancy, working with restaurants, hotels, catering companies, and industrial kitchens across 25 countries. Our success is built on understanding that every kitchen is unique, and every client deserves personalized solutions.' },
  { key: 'about.story_paragraph3', en: 'Today, ChefGear stands as a trusted partner in the culinary industry, combining traditional craftsmanship with cutting-edge technology to deliver solutions that exceed expectations.' },
  { key: 'about.our_core_values', en: 'Our Core Values' },
  { key: 'about.core_values_subtitle', en: 'The principles that guide everything we do' },
  { key: 'about.our_mission', en: 'Our Mission' },
  { key: 'about.mission_description', en: 'To provide world-class kitchen equipment and consultancy services that empower culinary professionals to achieve excellence.' },
  { key: 'about.our_values', en: 'Our Values' },
  { key: 'about.values_description', en: 'Quality, integrity, innovation, and customer satisfaction are at the core of everything we do.' },
  { key: 'about.our_vision', en: 'Our Vision' },
  { key: 'about.vision_description', en: 'To be the leading global provider of professional kitchen solutions, setting industry standards for quality and service.' },
  { key: 'about.our_achievements', en: 'Our Achievements' },
  { key: 'about.achievements_subtitle', en: 'Numbers that reflect our commitment to excellence' },
  { key: 'about.satisfied_clients', en: 'Satisfied Clients' },
  { key: 'about.years_experience', en: 'Years Experience' },
  { key: 'about.countries_served', en: 'Countries Served' },
  { key: 'about.projects_completed', en: 'Projects Completed' },
  { key: 'about.meet_our_team', en: 'Meet Our Team' },
  { key: 'about.team_subtitle', en: 'The experts behind ChefGear\'s success' },
  { key: 'about.team_member1_name', en: 'John Smith' },
  { key: 'about.team_member1_role', en: 'CEO & Founder' },
  { key: 'about.team_member1_experience', en: '20+ years' },
  { key: 'about.team_member2_name', en: 'Sarah Johnson' },
  { key: 'about.team_member2_role', en: 'Head of Operations' },
  { key: 'about.team_member2_experience', en: '15+ years' },
  { key: 'about.team_member3_name', en: 'Michael Chen' },
  { key: 'about.team_member3_role', en: 'Technical Director' },
  { key: 'about.team_member3_experience', en: '18+ years' },
  { key: 'about.team_member4_name', en: 'Emily Rodriguez' },
  { key: 'about.team_member4_role', en: 'Customer Success Manager' },
  { key: 'about.team_member4_experience', en: '12+ years' },
  { key: 'about.ready_to_work', en: 'Ready to Work With Us?' },
  { key: 'about.work_with_us_description', en: 'Let\'s discuss how ChefGear can help transform your kitchen operations' },
  { key: 'about.get_in_touch', en: 'Get in Touch' },
  { key: 'about.view_services', en: 'View Services' },

  // Footer
  { key: 'footer.quick_links', en: 'Quick Links' },
  { key: 'footer.contact_info', en: 'Contact Info' },
  { key: 'footer.email', en: 'Email' },
  { key: 'footer.phone', en: 'Phone' },
  { key: 'footer.address', en: 'Address' },
  { key: 'footer.company_email', en: 'info@chefgear.com' },
  { key: 'footer.company_phone', en: '+1 (555) 123-4567' },
  { key: 'footer.company_address_line1', en: '123 Industrial Ave' },
  { key: 'footer.company_address_line2', en: 'Business District' },
  { key: 'footer.company_address_line3', en: 'City, State 12345' },
  { key: 'footer.copyright_year', en: '2024 ChefGear' },
  { key: 'footer.rights', en: 'All rights reserved.' },
  { key: 'footer.privacy_policy', en: 'Privacy Policy' },
  { key: 'footer.terms_of_service', en: 'Terms of Service' },
  { key: 'footer.cookie_policy', en: 'Cookie Policy' },

  // Language
  { key: 'language.select', en: 'Select Language:' },

  // Common UI Elements
  { key: 'common.loading', en: 'Loading...' },
  { key: 'common.save', en: 'Save' },
  { key: 'common.cancel', en: 'Cancel' },
  { key: 'common.edit', en: 'Edit' },
  { key: 'common.delete', en: 'Delete' },
  { key: 'common.add', en: 'Add' },
  { key: 'common.search', en: 'Search' },
  { key: 'common.filter', en: 'Filter' },
  { key: 'common.clear', en: 'Clear' },
  { key: 'common.submit', en: 'Submit' },
  { key: 'common.close', en: 'Close' },
  { key: 'common.view', en: 'View' },
  { key: 'common.download', en: 'Download' },
  { key: 'common.upload', en: 'Upload' },
  { key: 'common.export', en: 'Export' },
  { key: 'common.import', en: 'Import' },
  { key: 'common.next', en: 'Next' },
  { key: 'common.previous', en: 'Previous' },
  { key: 'common.more_pages', en: 'More pages' },
  { key: 'common.go_to_previous_page', en: 'Go to previous page' },
  { key: 'common.go_to_next_page', en: 'Go to next page' },

  // Admin Panel - Secure Portal
  { key: 'secure_portal.title', en: 'ChefGear Management Portal' },
  { key: 'secure_portal.dashboard', en: 'Dashboard' },
  { key: 'secure_portal.client_requests', en: 'Client Requests' },
  { key: 'secure_portal.client_dashboard', en: 'Client Dashboard' },
  { key: 'secure_portal.orders', en: 'Orders' },
  { key: 'secure_portal.translations', en: 'Translations' },
  { key: 'secure_portal.image_manager', en: 'Image Manager' },
  { key: 'secure_portal.product_manager', en: 'Product Manager' },
  { key: 'secure_portal.services', en: 'Services' },
  { key: 'secure_portal.admin_users', en: 'Portal Users' },
  { key: 'secure_portal.quotation_builder', en: 'Quotation Builder' },
  { key: 'secure_portal.chefgear_admin', en: 'ChefGear Management' },
  { key: 'secure_portal.management_panel', en: 'Management Portal' },
  { key: 'secure_portal.admin_user', en: 'Portal User' },
  { key: 'secure_portal.admin_email', en: 'portal@chefgear.com' },
  { key: 'secure_portal.back_to_website', en: 'Back to Website' },
  { key: 'secure_portal.welcome', en: 'Welcome, Manager' },

  // Admin Dashboard
  { key: 'admin.dashboard.title', en: 'Dashboard' },
  { key: 'admin.dashboard.overview', en: 'System Overview' },
  { key: 'admin.dashboard.total_users', en: 'Total Users' },
  { key: 'admin.dashboard.total_clients', en: 'Total Clients' },
  { key: 'admin.dashboard.contact_requests', en: 'Contact Requests' },
  { key: 'admin.dashboard.total_quotations', en: 'Total Quotations' },
  { key: 'admin.dashboard.pending_quotations', en: 'Pending' },
  { key: 'admin.dashboard.total_orders', en: 'Total Orders' },
  { key: 'admin.dashboard.waiting_payment', en: 'Waiting Payment' },
  { key: 'admin.dashboard.total_revenue', en: 'Total Revenue' },
  { key: 'admin.dashboard.products', en: 'Products' },
  { key: 'admin.dashboard.languages', en: 'Languages' },
  { key: 'admin.dashboard.recent_contact_requests', en: 'Recent Contact Requests' },
  { key: 'admin.dashboard.recent_orders', en: 'Recent Orders' },
  { key: 'admin.dashboard.quick_actions', en: 'Quick Actions' },
  { key: 'admin.dashboard.manage_products', en: 'Manage Products' },
  { key: 'admin.dashboard.multilingual_content', en: 'Multilingual Content' },
  { key: 'admin.dashboard.view_reports', en: 'View Reports' },
  { key: 'admin.dashboard.system_status', en: 'System Status' },
  { key: 'admin.dashboard.database_status', en: 'Database Status' },
  { key: 'admin.dashboard.storage_status', en: 'Storage Status' },
  { key: 'admin.dashboard.api_status', en: 'API Status' },
  { key: 'admin.dashboard.online', en: 'Online' },
  { key: 'admin.dashboard.loading', en: 'Loading dashboard data...' },

  // Admin Clients
  { key: 'admin.clients.title', en: 'Client Management' },
  { key: 'admin.clients.total_clients', en: 'Total Clients' },
  { key: 'admin.clients.active_clients', en: 'Active Clients' },
  { key: 'admin.clients.new_this_month', en: 'New This Month' },
  { key: 'admin.clients.search_clients', en: 'Search clients...' },
  { key: 'admin.clients.add_client', en: 'Add New Client' },
  { key: 'admin.clients.company_name', en: 'Company Name' },
  { key: 'admin.clients.contact_person', en: 'Contact Person' },
  { key: 'admin.clients.email', en: 'Email' },
  { key: 'admin.clients.phone', en: 'Phone' },
  { key: 'admin.clients.country', en: 'Country' },
  { key: 'admin.clients.city', en: 'City' },
  { key: 'admin.clients.address', en: 'Address' },
  { key: 'admin.clients.usual_discount', en: 'Usual Discount (%)' },
  { key: 'admin.clients.status', en: 'Status' },
  { key: 'admin.clients.actions', en: 'Actions' },
  { key: 'admin.clients.view_details', en: 'View Details' },
  { key: 'admin.clients.edit', en: 'Edit' },
  { key: 'admin.clients.delete', en: 'Delete' },
  { key: 'admin.clients.client_details', en: 'Client Details' },
  { key: 'admin.clients.company_information', en: 'Company Information' },
  { key: 'admin.clients.contact_information', en: 'Contact Information' },
  { key: 'admin.clients.business_relationship', en: 'Business Relationship' },
  { key: 'admin.clients.client_since', en: 'Client Since' },
  { key: 'admin.clients.activity_summary', en: 'Activity Summary' },
  { key: 'admin.clients.total_orders', en: 'Total Orders' },
  { key: 'admin.clients.total_spent', en: 'Total Spent' },
  { key: 'admin.clients.last_order', en: 'Last Order' },
  { key: 'admin.clients.products_orders_overview', en: 'Products & Orders Overview' },
  { key: 'admin.clients.recent_products_ordered', en: 'Recent Products Ordered' },
  { key: 'admin.clients.business_insights', en: 'Business Insights' },
  { key: 'admin.clients.average_order_value', en: 'Average Order Value' },
  { key: 'admin.clients.conversion_rate', en: 'Conversion Rate' },
  { key: 'admin.clients.engagement_score', en: 'Engagement Score' },
  { key: 'admin.clients.quote_performance', en: 'Quote Performance' },
  { key: 'admin.clients.quotes_sent', en: 'Quotes Sent' },
  { key: 'admin.clients.quotes_accepted', en: 'Quotes Accepted' },
  { key: 'admin.clients.acceptance_rate', en: 'Acceptance Rate' },
  { key: 'admin.clients.loading', en: 'Loading clients...' },
  { key: 'admin.clients.no_clients', en: 'No clients found' },

  // Admin Orders
  { key: 'admin.orders.title', en: 'Order Management' },
  { key: 'admin.orders.all_orders', en: 'All Orders' },
  { key: 'admin.orders.pending', en: 'Pending' },
  { key: 'admin.orders.processing', en: 'Processing' },
  { key: 'admin.orders.shipped', en: 'Shipped' },
  { key: 'admin.orders.delivered', en: 'Delivered' },
  { key: 'admin.orders.cancelled', en: 'Cancelled' },
  { key: 'admin.orders.search_orders', en: 'Search orders...' },
  { key: 'admin.orders.order_number', en: 'Order #' },
  { key: 'admin.orders.client', en: 'Client' },
  { key: 'admin.orders.date', en: 'Date' },
  { key: 'admin.orders.amount', en: 'Amount' },
  { key: 'admin.orders.status', en: 'Status' },
  { key: 'admin.orders.actions', en: 'Actions' },
  { key: 'admin.orders.view', en: 'View' },
  { key: 'admin.orders.edit', en: 'Edit' },
  { key: 'admin.orders.delete', en: 'Delete' },
  { key: 'admin.orders.loading', en: 'Loading orders...' },
  { key: 'admin.orders.no_orders', en: 'No orders found' },

  // Admin Products
  { key: 'admin.products.title', en: 'Product Management' },
  { key: 'admin.products.add_product', en: 'Add Product' },
  { key: 'admin.products.search_products', en: 'Search products...' },
  { key: 'admin.products.product_name', en: 'Product Name' },
  { key: 'admin.products.category', en: 'Category' },
  { key: 'admin.products.price', en: 'Price' },
  { key: 'admin.products.stock', en: 'Stock' },
  { key: 'admin.products.status', en: 'Status' },
  { key: 'admin.products.actions', en: 'Actions' },
  { key: 'admin.products.edit', en: 'Edit' },
  { key: 'admin.products.delete', en: 'Delete' },
  { key: 'admin.products.loading', en: 'Loading products...' },
  { key: 'admin.products.no_products', en: 'No products found' },

  // Admin Quotations
  { key: 'admin.quotations.title', en: 'Quotation Builder' },
  { key: 'admin.quotations.create_quotation', en: 'Create New Quotation' },
  { key: 'admin.quotations.search_quotations', en: 'Search quotations...' },
  { key: 'admin.quotations.quotation_number', en: 'Quotation #' },
  { key: 'admin.quotations.client', en: 'Client' },
  { key: 'admin.quotations.date', en: 'Date' },
  { key: 'admin.quotations.amount', en: 'Amount' },
  { key: 'admin.quotations.status', en: 'Status' },
  { key: 'admin.quotations.actions', en: 'Actions' },
  { key: 'admin.quotations.view', en: 'View' },
  { key: 'admin.quotations.edit', en: 'Edit' },
  { key: 'admin.quotations.send', en: 'Send' },
  { key: 'admin.quotations.duplicate', en: 'Duplicate' },
  { key: 'admin.quotations.convert_to_order', en: 'Convert to Order' },
  { key: 'admin.quotations.download_pdf', en: 'Download PDF' },
  { key: 'admin.quotations.delete', en: 'Delete' },
  { key: 'admin.quotations.draft', en: 'Draft' },
  { key: 'admin.quotations.sent', en: 'Sent' },
  { key: 'admin.quotations.accepted', en: 'Accepted' },
  { key: 'admin.quotations.rejected', en: 'Rejected' },
  { key: 'admin.quotations.expired', en: 'Expired' },
  { key: 'admin.quotations.converted_to_order', en: 'Converted to Order' },
  { key: 'admin.quotations.loading', en: 'Loading quotations...' },
  { key: 'admin.quotations.no_quotations', en: 'No quotations found' },
  { key: 'admin.quotations.select_client', en: 'Select Client' },
  { key: 'admin.quotations.valid_until', en: 'Valid Until' },
  { key: 'admin.quotations.notes', en: 'Notes' },
  { key: 'admin.quotations.add_product', en: 'Add Product' },
  { key: 'admin.quotations.remove_product', en: 'Remove Product' },
  { key: 'admin.quotations.quantity', en: 'Quantity' },
  { key: 'admin.quotations.unit_price', en: 'Unit Price' },
  { key: 'admin.quotations.total', en: 'Total' },
  { key: 'admin.quotations.subtotal', en: 'Subtotal' },
  { key: 'admin.quotations.discount', en: 'Discount' },
  { key: 'admin.quotations.final_amount', en: 'Final Amount' },
  { key: 'admin.quotations.create', en: 'Create Quotation' },
  { key: 'admin.quotations.update', en: 'Update Quotation' },

  // Admin Translations
  { key: 'translations.title', en: 'Translations' },
  { key: 'translations.loading', en: 'Loading translations...' },
  { key: 'translations.manage_content', en: 'Manage multilingual content across the platform' },
  { key: 'translations.import_csv', en: 'Import CSV' },
  { key: 'translations.export_csv', en: 'Export CSV' },
  { key: 'translations.add_translation', en: 'Add Translation' },
  { key: 'translations.add_new_translation', en: 'Add New Translation' },
  { key: 'translations.translation_key', en: 'Translation Key' },
  { key: 'translations.key_placeholder', en: 'e.g., nav.new_item' },
  { key: 'translations.enter_translation', en: 'Enter {language} translation...' },
  { key: 'translations.cancel', en: 'Cancel' },
  { key: 'translations.supported_languages', en: 'Supported Languages' },
  { key: 'translations.search_keys', en: 'Search translation keys...' },
  { key: 'translations.translation_keys', en: 'Translation Keys' },
  { key: 'translations.key_identifier', en: 'Translation key identifier' },
  { key: 'translations.save', en: 'Save' },
  { key: 'translations.edit', en: 'Edit' },
  { key: 'translations.no_translation', en: 'No translation' },

  // Admin Services
  { key: 'admin.services.title', en: 'Services Management' },
  { key: 'admin.services.loading', en: 'Loading services...' },

  // Admin Users
  { key: 'admin.users.title', en: 'Portal Users' },
  { key: 'admin.users.loading', en: 'Loading users...' },

  // Admin Requests
  { key: 'admin.requests.title', en: 'Client Requests' },
  { key: 'admin.requests.loading', en: 'Loading requests...' },

  // Admin Images
  { key: 'admin.images.title', en: 'Image Manager' },
  { key: 'admin.images.loading', en: 'Loading images...' },

  // Setup Services
  { key: 'setup.services.title', en: 'Setup Services Table' },
  { key: 'setup.services.description', en: 'Initialize the services table with default data for the special request page.' },
  { key: 'setup.services.setup_button', en: 'Setup Services Table' },
  { key: 'setup.services.success', en: 'Success' },
  { key: 'setup.services.error', en: 'Error' },
  { key: 'setup.services.logs', en: 'Setup Logs:' },
  { key: 'setup.services.running', en: 'Setting up...' },

  // Error Messages
  { key: 'error.generic', en: 'An error occurred. Please try again.' },
  { key: 'error.network', en: 'Network error. Please check your connection.' },
  { key: 'error.not_found', en: 'The requested resource was not found.' },
  { key: 'error.unauthorized', en: 'You are not authorized to perform this action.' },
  { key: 'error.validation', en: 'Please check your input and try again.' },

  // Success Messages
  { key: 'success.saved', en: 'Successfully saved!' },
  { key: 'success.updated', en: 'Successfully updated!' },
  { key: 'success.deleted', en: 'Successfully deleted!' },
  { key: 'success.created', en: 'Successfully created!' },
  { key: 'success.sent', en: 'Successfully sent!' },

  // Confirmation Messages
  { key: 'confirm.delete', en: 'Are you sure you want to delete this item?' },
  { key: 'confirm.save', en: 'Are you sure you want to save these changes?' },
  { key: 'confirm.send', en: 'Are you sure you want to send this?' },
  { key: 'confirm.convert', en: 'Are you sure you want to convert this quotation to an order?' },

  // Status Labels
  { key: 'status.active', en: 'Active' },
  { key: 'status.inactive', en: 'Inactive' },
  { key: 'status.pending', en: 'Pending' },
  { key: 'status.completed', en: 'Completed' },
  { key: 'status.cancelled', en: 'Cancelled' },
  { key: 'status.processing', en: 'Processing' },
  { key: 'status.shipped', en: 'Shipped' },
  { key: 'status.delivered', en: 'Delivered' },
  { key: 'status.draft', en: 'Draft' },
  { key: 'status.sent', en: 'Sent' },
  { key: 'status.accepted', en: 'Accepted' },
  { key: 'status.rejected', en: 'Rejected' },
  { key: 'status.expired', en: 'Expired' },
  { key: 'status.online', en: 'Online' },
  { key: 'status.offline', en: 'Offline' },

  // Date and Time
  { key: 'date.today', en: 'Today' },
  { key: 'date.yesterday', en: 'Yesterday' },
  { key: 'date.this_week', en: 'This Week' },
  { key: 'date.this_month', en: 'This Month' },
  { key: 'date.this_year', en: 'This Year' },

  // File Operations
  { key: 'file.upload', en: 'Upload File' },
  { key: 'file.download', en: 'Download File' },
  { key: 'file.delete', en: 'Delete File' },
  { key: 'file.supported_formats', en: 'Supported formats: PDF, Word documents, Images (Max 10MB)' },
  { key: 'file.max_size', en: 'Maximum file size: 10MB' },

  // Form Validation
  { key: 'validation.required', en: 'This field is required' },
  { key: 'validation.email', en: 'Please enter a valid email address' },
  { key: 'validation.phone', en: 'Please enter a valid phone number' },
  { key: 'validation.min_length', en: 'Minimum {count} characters required' },
  { key: 'validation.max_length', en: 'Maximum {count} characters allowed' },
  { key: 'validation.numeric', en: 'Please enter a valid number' },

  // Pagination
  { key: 'pagination.showing', en: 'Showing {start} to {end} of {total} results' },
  { key: 'pagination.per_page', en: 'Per page' },
  { key: 'pagination.first', en: 'First' },
  { key: 'pagination.last', en: 'Last' },
  { key: 'pagination.of', en: 'of' },
  { key: 'pagination.page', en: 'Page' },

  // Search and Filter
  { key: 'search.no_results', en: 'No results found' },
  { key: 'search.try_different', en: 'Try a different search term' },
  { key: 'filter.all', en: 'All' },
  { key: 'filter.apply', en: 'Apply Filters' },
  { key: 'filter.clear_all', en: 'Clear All Filters' },
  { key: 'filter.results', en: '{count} results found' },

  // Modal and Dialog
  { key: 'modal.close', en: 'Close' },
  { key: 'modal.confirm', en: 'Confirm' },
  { key: 'modal.cancel', en: 'Cancel' },
  { key: 'dialog.title', en: 'Confirmation' },
  { key: 'dialog.message', en: 'Are you sure you want to proceed?' },

  // Notifications
  { key: 'notification.success', en: 'Operation completed successfully' },
  { key: 'notification.error', en: 'An error occurred' },
  { key: 'notification.warning', en: 'Warning' },
  { key: 'notification.info', en: 'Information' },

  // Loading States
  { key: 'loading.please_wait', en: 'Please wait...' },
  { key: 'loading.processing', en: 'Processing...' },
  { key: 'loading.saving', en: 'Saving...' },
  { key: 'loading.loading', en: 'Loading...' },
  { key: 'loading.uploading', en: 'Uploading...' },
  { key: 'loading.downloading', en: 'Downloading...' },

  // Empty States
  { key: 'empty.no_data', en: 'No data available' },
  { key: 'empty.no_results', en: 'No results found' },
  { key: 'empty.no_items', en: 'No items to display' },
  { key: 'empty.start_by_adding', en: 'Start by adding your first item' },

  // Accessibility
  { key: 'accessibility.close', en: 'Close' },
  { key: 'accessibility.menu', en: 'Menu' },
  { key: 'accessibility.search', en: 'Search' },
  { key: 'accessibility.loading', en: 'Loading' },
  { key: 'accessibility.error', en: 'Error' },
  { key: 'accessibility.success', en: 'Success' },
  { key: 'accessibility.warning', en: 'Warning' },
  { key: 'accessibility.info', en: 'Information' }
];

// Define the language codes we're working with
const languageCodes = ['en', 'ru', 'es', 'tr', 'ar'];

// Transform the source data into the new format
function transformTranslations(sourceData) {
  const transformedData = [];
  
  for (const translation of sourceData) {
    for (const langCode of languageCodes) {
      // Only add entries where the language value exists
      if (translation[langCode]) {
        transformedData.push({
          key: translation.key,
          language_code: langCode,
          value: translation[langCode]
        });
      }
    }
  }
  
  return transformedData;
}

async function populateTranslations() {
  try {
    console.log('Starting translation population...');
    
    // First, check if the translations table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('translations')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('Translations table does not exist. Creating it...');
      
      // Create the translations table with the new structure
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS translations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            key TEXT NOT NULL,
            language_code TEXT NOT NULL,
            value TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(key, language_code)
          );
          
          -- Enable RLS
          ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Allow public read access" ON translations
            FOR SELECT USING (true);
          
          CREATE POLICY "Allow authenticated insert" ON translations
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
          
          CREATE POLICY "Allow authenticated update" ON translations
            FOR UPDATE USING (auth.role() = 'authenticated');
          
          CREATE POLICY "Allow authenticated delete" ON translations
            FOR DELETE USING (auth.role() = 'authenticated');
        `
      });
      
      if (createError) {
        console.error('Error creating translations table:', createError);
        return;
      }
      
      console.log('Translations table created successfully.');
    }
    
    // Transform the data to the new format
    const translations = transformTranslations(translationsSource);
    
    console.log(`Inserting ${translations.length} translation entries...`);
    
    // Insert translations in batches to avoid timeout
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < translations.length; i += batchSize) {
      const batch = translations.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('translations')
        .upsert(batch, { 
          onConflict: 'key,language_code',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
        errorCount += batch.length;
      } else {
        console.log(`Successfully inserted batch ${Math.floor(i/batchSize) + 1} (${batch.length} items)`);
        successCount += batch.length;
      }
    }
    
    console.log(`\nTranslation population completed!`);
    console.log(`Successfully inserted: ${successCount} entries`);
    console.log(`Errors: ${errorCount} entries`);
    
    // Verify the data
    const { data: count, error: countError } = await supabase
      .from('translations')
      .select('count');
    
    if (!countError) {
      console.log(`Total translations in database: ${count?.length || 0}`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
populateTranslations();