const { createClient } = require('@supabase/supabase-js');

// Supabase configuration for Node.js
const supabaseUrl = 'https://whlkoratnodmqbmtmtqk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGtvcmF0bm9kbXFibXRtdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA4NzQxMywiZXhwIjoyMDY2NjYzNDEzfQ.6XvS_T9myeCbKU3iiQh-iwrmApcP6WdiaWsfGmpJ5A8';

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Services data (let Supabase auto-generate UUIDs)
const servicesData = [
  {
    service_id: 'kitchen-design',
    title: 'Kitchen Design & Layout',
    description: 'Complete kitchen design and layout planning for industrial facilities',
    icon: 'ChefHat',
    timeline: '2-4 weeks',
    starting_price: 5000,
    included_services: ['Initial consultation', 'CAD drawings', '3D visualization', 'Equipment specifications'],
    is_active: true
  },
  {
    service_id: 'equipment-procurement',
    title: 'Equipment Procurement',
    description: 'Sourcing and procurement of commercial kitchen equipment',
    icon: 'Package',
    timeline: '3-6 weeks',
    starting_price: 3000,
    included_services: ['Vendor sourcing', 'Price negotiation', 'Quality assurance', 'Delivery coordination'],
    is_active: true
  },
  {
    service_id: 'installation-setup',
    title: 'Installation & Setup',
    description: 'Professional installation and setup of kitchen equipment',
    icon: 'Wrench',
    timeline: '1-2 weeks',
    starting_price: 2500,
    included_services: ['Equipment installation', 'System testing', 'Staff training', 'Documentation'],
    is_active: true
  },
  {
    service_id: 'maintenance-support',
    title: 'Maintenance & Support',
    description: 'Ongoing maintenance and technical support services',
    icon: 'Settings',
    timeline: 'Ongoing',
    starting_price: 1500,
    included_services: ['Regular maintenance', '24/7 support', 'Emergency repairs', 'Performance monitoring'],
    is_active: true
  },
  {
    service_id: 'consultation',
    title: 'Expert Consultation',
    description: 'Professional consultation for kitchen optimization',
    icon: 'Users',
    timeline: '1-2 days',
    starting_price: 500,
    included_services: ['Site assessment', 'Efficiency analysis', 'Recommendations report', 'Follow-up session'],
    is_active: true
  }
];

async function setupServices() {
  try {
    console.log('Setting up services table...');
    
    // First, try to create the services table if it doesn't exist
    const { error: createError } = await supabase.rpc('create_services_table');
    if (createError && !createError.message.includes('already exists')) {
      console.log('Creating services table manually...');
      // If the RPC doesn't exist, we'll insert data and let Supabase auto-create the table
    }
    
    // Clear existing data
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (deleteError) {
      console.log('Note: Could not clear existing data (table might not exist yet):', deleteError.message);
    }
    
    // Insert services data
    console.log('Inserting services data...');
    const { data, error } = await supabase
      .from('services')
      .insert(servicesData)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Services setup completed successfully!');
    console.log(`Inserted ${data.length} services:`);
    data.forEach(service => {
      console.log(`- ${service.title} (${service.service_id})`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up services:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupServices();