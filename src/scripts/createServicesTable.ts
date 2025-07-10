import { supabase } from '../lib/supabase';

async function createServicesTable() {
  console.log('Creating services table...');
  
  // Create the services table
  const { error: createTableError } = await supabase.rpc('create_services_table');
  
  if (createTableError) {
    console.error('Error creating services table:', createTableError);
    return;
  }
  
  console.log('Services table created successfully!');
  
  // Insert initial data
  const initialServices = [
    {
      service_id: 'kitchen-renovation',
      title: 'Kitchen Renovation',
      description: 'Complete kitchen renovation services tailored for professional chefs and cooking enthusiasts.',
      timeline: '4-6 weeks',
      starting_price: 15000,
      icon: 'Utensils',
      image: '/images/services/kitchen-renovation.jpg',
      included_services: [
        'Custom cabinet installation',
        'Professional-grade appliance setup',
        'Specialized ventilation systems',
        'Chef-optimized workspace design',
        'Premium countertop installation'
      ],
      is_active: true
    },
    {
      service_id: 'equipment-installation',
      title: 'Equipment Installation',
      description: 'Professional installation of commercial kitchen equipment with proper ventilation and utility connections.',
      timeline: '1-2 weeks',
      starting_price: 5000,
      icon: 'Settings',
      image: '/images/services/equipment-installation.jpg',
      included_services: [
        'Commercial appliance installation',
        'Gas line setup and testing',
        'Electrical wiring and connections',
        'Ventilation hood installation',
        'Safety compliance verification'
      ],
      is_active: true
    },
    {
      service_id: 'kitchen-design',
      title: 'Kitchen Design Consultation',
      description: 'Expert kitchen design services focusing on workflow efficiency and ergonomics for professional chefs.',
      timeline: '2-3 weeks',
      starting_price: 3000,
      icon: 'PenTool',
      image: '/images/services/kitchen-design.jpg',
      included_services: [
        '3D kitchen modeling',
        'Workflow optimization',
        'Material and equipment selection',
        'Lighting design',
        'Storage solution planning'
      ],
      is_active: true
    },
    {
      service_id: 'maintenance-service',
      title: 'Maintenance Service',
      description: 'Regular maintenance and servicing of commercial kitchen equipment to ensure optimal performance.',
      timeline: 'Ongoing',
      starting_price: 1200,
      icon: 'Tool',
      image: '/images/services/maintenance.jpg',
      included_services: [
        'Quarterly equipment inspection',
        'Preventive maintenance',
        'Parts replacement',
        'Performance optimization',
        'Emergency repair service'
      ],
      is_active: true
    },
    {
      service_id: 'ventilation-upgrade',
      title: 'Ventilation System Upgrade',
      description: 'Upgrade your kitchen ventilation system to improve air quality and meet commercial standards.',
      timeline: '1-2 weeks',
      starting_price: 7500,
      icon: 'Wind',
      image: '/images/services/ventilation.jpg',
      included_services: [
        'Hood system installation',
        'Ductwork modification',
        'Exhaust fan upgrade',
        'Make-up air system installation',
        'Fire suppression system integration'
      ],
      is_active: true
    },
    {
      service_id: 'storage-solutions',
      title: 'Storage Solutions',
      description: 'Custom storage solutions designed for efficient inventory management in professional kitchens.',
      timeline: '1-3 weeks',
      starting_price: 4000,
      icon: 'Package',
      image: '/images/services/storage-solutions.jpg',
      included_services: [
        'Custom shelving installation',
        'Walk-in cooler organization',
        'Dry storage optimization',
        'Inventory tracking system setup',
        'Mobile storage solutions'
      ],
      is_active: true
    }
  ];

  const { error: insertError } = await supabase
    .from('services')
    .insert(initialServices);

  if (insertError) {
    console.error('Error inserting initial services:', insertError);
    return;
  }

  console.log('Initial services data inserted successfully!');
}

// Execute the function
createServicesTable()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err));