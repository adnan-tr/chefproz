import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, Database } from 'lucide-react';

export default function SetupServicesPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (log: string) => {
    setLogs(prev => [...prev, log]);
  };

  const createServicesTable = async () => {
    try {
      setLoading(true);
      setStatus('idle');
      setMessage('');
      setLogs([]);
      
      addLog('Starting services table setup...');
      
      // Step 1: Check if the services table already exists
      addLog('Checking if services table exists...');
      const { data: existingTables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'services');
      
      if (tablesError) {
        throw new Error(`Error checking tables: ${tablesError.message}`);
      }
      
      const tableExists = existingTables && existingTables.length > 0;
      
      if (tableExists) {
        addLog('Services table already exists.');
      } else {
        // Step 2: Create the services table
        addLog('Creating services table...');
        const { error: createTableError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS public.services (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              service_id TEXT UNIQUE NOT NULL,
              title TEXT NOT NULL,
              description TEXT NOT NULL,
              timeline TEXT NOT NULL,
              starting_price INTEGER NOT NULL,
              icon TEXT NOT NULL,
              image TEXT,
              included_services TEXT[] NOT NULL DEFAULT '{}',
              is_active BOOLEAN NOT NULL DEFAULT true,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
            );
          `
        });
        
        if (createTableError) {
          throw new Error(`Error creating table: ${createTableError.message}`);
        }
        
        addLog('Services table created successfully!');
        
        // Step 3: Create updated_at trigger
        addLog('Creating updated_at trigger...');
        const { error: triggerError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
            RETURNS TRIGGER AS $$
            BEGIN
              NEW.updated_at = now();
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
            
            DROP TRIGGER IF EXISTS set_services_updated_at ON public.services;
            
            CREATE TRIGGER set_services_updated_at
            BEFORE UPDATE ON public.services
            FOR EACH ROW
            EXECUTE FUNCTION public.set_updated_at_timestamp();
          `
        });
        
        if (triggerError) {
          throw new Error(`Error creating trigger: ${triggerError.message}`);
        }
        
        addLog('Updated_at trigger created successfully!');
        
        // Step 4: Set up RLS (Row Level Security)
        addLog('Setting up Row Level Security...');
        const { error: rlsError } = await supabase.rpc('exec_sql', {
          sql: `
            ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
            
            -- Allow authenticated users to select, insert, update, delete
            CREATE POLICY "Authenticated users can select services"
              ON public.services
              FOR SELECT
              TO authenticated
              USING (true);
            
            CREATE POLICY "Authenticated users can insert services"
              ON public.services
              FOR INSERT
              TO authenticated
              WITH CHECK (true);
            
            CREATE POLICY "Authenticated users can update services"
              ON public.services
              FOR UPDATE
              TO authenticated
              USING (true);
            
            CREATE POLICY "Authenticated users can delete services"
              ON public.services
              FOR DELETE
              TO authenticated
              USING (true);
            
            -- Allow public to select active services
            CREATE POLICY "Public can view active services"
              ON public.services
              FOR SELECT
              TO anon
              USING (is_active = true);
          `
        });
        
        if (rlsError) {
          throw new Error(`Error setting up RLS: ${rlsError.message}`);
        }
        
        addLog('Row Level Security set up successfully!');
      }
      
      // Step 5: Insert initial data
      addLog('Inserting initial services data...');
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

      // Use upsert to handle both insert and update
      const { error: insertError } = await supabase
        .from('services')
        .upsert(initialServices, { onConflict: 'service_id' });

      if (insertError) {
        throw new Error(`Error inserting initial services: ${insertError.message}`);
      }

      addLog('Initial services data inserted successfully!');
      addLog('Setup completed successfully!');
      
      setStatus('success');
      setMessage('Services table setup completed successfully!');
    } catch (error: any) {
      console.error('Setup failed:', error);
      setStatus('error');
      setMessage(error.message || 'An unknown error occurred');
      addLog(`ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Setup Services | ChefPro Secure Portal</title>
      </Helmet>
      <div className="container mx-auto py-8">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6" />
                Services Table Setup
              </CardTitle>
              <CardDescription>
                This utility will create the services table in your database and populate it with initial data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Success</AlertTitle>
                  <AlertDescription className="text-green-700">
                    {message}
                  </AlertDescription>
                </Alert>
              )}
              
              {status === 'error' && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Error</AlertTitle>
                  <AlertDescription className="text-red-700">
                    {message}
                  </AlertDescription>
                </Alert>
              )}
              
              {logs.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Setup Logs:</h3>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200 max-h-60 overflow-y-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {logs.map((log, index) => (
                        <div key={index} className={`py-1 ${log.startsWith('ERROR') ? 'text-red-600' : ''}`}>
                          {log}
                        </div>
                      ))}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={createServicesTable} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up services table...
                  </>
                ) : (
                  'Setup Services Table'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
    </>
  );
}