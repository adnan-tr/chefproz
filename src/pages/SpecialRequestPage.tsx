import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  ArrowRight,
  Settings,
  Wrench,
  Users,
  FileText,
  Lightbulb,
  Shield,
  Loader2,
  Utensils,
  PenTool,
  Wind,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dbService } from '@/lib/supabase';

// Define the Service interface
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
}

const SpecialRequestPage: React.FC = () => {
  const { t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Map icon strings to Lucide icon components
  const iconMap: Record<string, React.ElementType> = {
    Settings: Settings,
    Wrench: Wrench,
    Users: Users,
    Shield: Shield,
    Lightbulb: Lightbulb,
    FileText: FileText,
    Utensils: Utensils,
    PenTool: PenTool,
    Tool: Wrench, // Using Wrench as Tool replacement
    Wind: Wind,
    Package: Package
  };

  // Fetch services from the database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const servicesData = await dbService.getServices(true); // Only fetch active services
        setServices(servicesData.filter(service => service.is_active)); // Double-check active status
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
    
    // Set up interval to refresh services every 30 seconds to reflect real-time changes
    const interval = setInterval(fetchServices, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('nav.special_request')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('special_request.page_description')}
          </p>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            <span className="ml-3 text-lg text-gray-600">{t('special_request.loading')}</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
            <p className="text-lg">{t('special_request.error')}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
            >
              {t('special_request.try_again')}
            </Button>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-yellow-50 text-yellow-600 p-6 rounded-lg text-center">
            <p className="text-lg">{t('special_request.no_services')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              // Get the icon component from the map or use FileText as fallback
              const Icon = iconMap[service.icon] || FileText;
              return (
                <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{t('special_request.starting_from')}</div>
                        <div className="text-lg font-bold text-green-600">
                          ${service.starting_price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {service.image && (
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    
                    <p className="text-gray-600">{service.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{t('special_request.timeline')} {service.timeline}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 text-sm">{t('special_request.included_services')}</h4>
                      <ul className="space-y-1">
                        {service.included_services.map((item, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <Button
                        asChild
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:bg-blue-700"
                      >
                        <Link to="/contact">
                          {t('special_request.get_consultation')}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-blue-600 text-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">
              {t('special_request.custom_solution')}
            </h2>
            <p className="text-lg mb-6 opacity-90">
              {t('special_request.custom_solution_description')}
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
            >
              <Link to="/contact">
                {t('special_request.discuss_project')}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialRequestPage;