import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { dbService } from '@/lib/supabase';
import { EmailService } from '@/lib/emailService';
import { AdvertisementService, type AdvertisementBrand } from '@/lib/advertisementService';
import AdvertisementBar from '@/components/AdvertisementBar';
import { notifyN8N } from '@/utils/notifyN8N';

const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    country: '',
    phone: '',
    email: '',
    sla_level: '',
    request_type: '',
    message: '',
    file: null as File | null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [advertisementBrands, setAdvertisementBrands] = useState<AdvertisementBrand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  // Load advertisement brands on component mount
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setBrandsLoading(true);
        const brands = await AdvertisementService.getActiveBrands();
        setAdvertisementBrands(brands);
      } catch (error) {
        console.error('Error loading advertisement brands:', error);
      } finally {
        setBrandsLoading(false);
      }
    };

    loadBrands();
  }, []);

  const slaLevels = [
    { value: 'standard', label: t('contact.sla_standard', 'Standard (3-5 business days)') },
    { value: 'priority', label: t('contact.sla_priority', 'Priority (1-2 business days)') },
    { value: 'urgent', label: t('contact.sla_urgent', 'Urgent (Same day)') },
  ];

  const requestTypes = [
    { value: 'consultation', label: t('contact.request_consultation', 'General Consultation') },
    { value: 'quotation', label: t('contact.request_quotation', 'Price Quotation') },
    { value: 'installation', label: t('contact.request_installation', 'Installation Services') },
    { value: 'maintenance', label: t('contact.request_maintenance', 'Maintenance Support') },
    { value: 'custom', label: t('contact.request_custom', 'Custom Solution') },
  ];

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);
    
    try {
  const messageData = {
    name: formData.name,
    company: formData.company,
    email: formData.email,
    phone: formData.phone,
    message: formData.message,
    request_type: formData.request_type,
    sla_level: formData.sla_level,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await dbService.createContactMessage(messageData);

  try {
    await EmailService.sendContactFormNotification({
      name: formData.name,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      request_type: formData.request_type,
      sla_level: formData.sla_level,
      country: formData.country
    });

      await notifyN8N("contact-form", {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        sla_level: formData.sla_level,
        request_type: formData.request_type,
        message: formData.message,
        submitted_at: new Date().toISOString()
      });

  } catch (emailError) {
    console.error('Email notification failed:', emailError);
  }

  // ✅ NEW: Notify n8n after successful storage & email
  await notifyN8N('contact-form', {
    name: formData.name,
    company: formData.company,
    email: formData.email,
    phone: formData.phone,
    country: formData.country,
    sla_level: formData.sla_level,
    request_type: formData.request_type,
    message: formData.message,
    submitted_at: new Date().toISOString()
  });

  setSubmitSuccess(true);
  setFormData({ ... }); // reset as before
  window.scrollTo({ top: 0, behavior: 'smooth' });
} catch (error) {
  console.error('Error submitting contact form:', error);
  setSubmitError('There was an error submitting your request. Please try again.');
} finally {
  setIsSubmitting(false);
}

      
      setSubmitSuccess(true);
      
      setFormData({
        name: '',
        company: '',
        country: '',
        phone: '',
        email: '',
        sla_level: '',
        request_type: '',
        message: '',
        file: null,
      });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitError('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="px-4 sm:px-6 lg:px-8">
        {submitSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your message has been sent successfully. We will get back to you as soon as possible.
            </AlertDescription>
          </Alert>
        )}
        
        {submitError && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">{submitError}</AlertDescription>
          </Alert>
        )}
        
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('nav.contact')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('contact.page_description', 'Get in touch with our experts for professional consultation and customized solutions')}
          </p>
        </div>

        {/* Advertisement Bar - Top */}
        <div className="mb-4">
          <AdvertisementBar 
            brands={advertisementBrands} 
            direction="left" 
            loading={brandsLoading} 
          />
        </div>

        {/* Centered Contact Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="contact-form-abstract">
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-semibold text-gray-900">
                {t('contact.send_us_message', 'Send us a Message')}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      {t('contact.form.name')} *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="mt-1"
                      placeholder={t('contact.name_placeholder', 'Enter your full name')}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                      {t('contact.form.company')} *
                    </Label>
                    <Input
                      id="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="mt-1"
                      placeholder={t('contact.company_placeholder', 'Enter your company name')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      {t('contact.form.country')} *
                    </Label>
                    <Input
                      id="country"
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="mt-1"
                      placeholder={t('contact.country_placeholder', 'Enter your country')}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      {t('contact.form.phone')} *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="mt-1"
                      placeholder={t('contact.phone_placeholder', 'Enter your phone number')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {t('contact.form.email')} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-1"
                    placeholder={t('contact.email_placeholder', 'Enter your email address')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      {t('contact.service_level_agreement', 'Service Level Agreement')} *
                    </Label>
                    <Select value={formData.sla_level} onValueChange={(value) => handleInputChange('sla_level', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t('contact.select_response_time', 'Select response time')} />
                      </SelectTrigger>
                      <SelectContent>
                        {slaLevels.map((sla) => (
                          <SelectItem key={sla.value} value={sla.value}>
                            {sla.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      {t('contact.request_type', 'Request Type')} *
                    </Label>
                    <Select value={formData.request_type} onValueChange={(value) => handleInputChange('request_type', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t('contact.select_request_type', 'Select request type')} />
                      </SelectTrigger>
                      <SelectContent>
                        {requestTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                    {t('contact.form.message')} *
                  </Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="mt-1"
                    rows={5}
                    placeholder={t('contact.message_placeholder', 'Please provide details about your requirements...')}
                  />
                </div>

                <div>
                  <Label htmlFor="file" className="text-sm font-medium text-gray-700">
                    {t('contact.file_attachment', 'File Attachment (Optional)')}
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="mt-1"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('contact.file_formats', 'Supported formats: PDF, Word documents, Images (Max 10MB)')}
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      {t('common.sending', 'Sending...')}
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      {t('contact.form.submit')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Advertisement Bar - Bottom */}
        <div className="mt-4">
          <AdvertisementBar 
            brands={advertisementBrands} 
            direction="right" 
            loading={brandsLoading} 
          />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;