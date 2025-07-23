import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  ArrowLeft, 
  Mail, 
  Phone,
  Construction
} from 'lucide-react';

const ComingSoonPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="border-2 border-blue-200 shadow-2xl">
          <CardContent className="p-8 text-center">
            {/* Icon */}
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Construction className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <Clock className="h-4 w-4 text-yellow-800" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              {t('coming_soon.title', 'Coming Soon')}
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-slate-600 mb-6">
              {t('coming_soon.subtitle', 'We\'re working hard to bring you something amazing!')}
            </p>

            {/* Description */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <p className="text-slate-700 leading-relaxed">
                {t('coming_soon.description', 
                  'This page is currently under development. Our team is crafting an exceptional experience that will showcase our premium kitchen equipment and services. Stay tuned for updates!'
                )}
              </p>
            </div>

            {/* Contact Information */}
            <div className="bg-slate-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                {t('coming_soon.contact_title', 'Need Immediate Assistance?')}
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">info@chefpro.com</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('coming_soon.back_home', 'Back to Home')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link to="/contact">
                  <Mail className="h-4 w-4 mr-2" />
                  {t('coming_soon.contact_us', 'Contact Us')}
                </Link>
              </Button>
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                {t('coming_soon.footer', 'Thank you for your patience as we enhance your experience.')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComingSoonPage;