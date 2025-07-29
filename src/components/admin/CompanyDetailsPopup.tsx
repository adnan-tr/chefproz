import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Upload, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Globe,
  Save,
  Settings
} from 'lucide-react';
import { dbService } from '@/lib/supabase';
import { useCompany } from '@/contexts/CompanyContext';

interface CompanyDetails {
  name: string;
  logo: string; // Base64 data for preview
  logo_url: string; // Supabase storage URL
  description: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  social_media: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
}

interface CompanyDetailsPopupProps {
  trigger?: React.ReactNode;
}

const CompanyDetailsPopup: React.FC<CompanyDetailsPopupProps> = ({ trigger }) => {
  const { refreshCompanyDetails } = useCompany();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    name: 'ChefGear Pro',
    logo: '',
    logo_url: '',
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
  });

  // Load company details when component mounts
  useEffect(() => {
    loadCompanyDetails();
  }, []);

  const loadCompanyDetails = async () => {
    try {
      const details = await dbService.getCompanyDetails();
      setCompanyDetails(details);
    } catch (error) {
      console.error('Error loading company details:', error);
    }
  };

  const handleInputChange = (field: keyof CompanyDetails, value: string) => {
    setCompanyDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform: keyof CompanyDetails['social_media'], value: string) => {
    setCompanyDetails(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value
      }
    }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Show loading state
        setLoading(true);
        
        // Read file for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setCompanyDetails(prev => ({
            ...prev,
            logo: result
          }));
        };
        reader.readAsDataURL(file);
        
        // Upload to Supabase storage
        const logoUrl = await dbService.uploadLogoToStorage(file);
        
        // Update state with the URL
        setCompanyDetails(prev => ({
          ...prev,
          logo_url: logoUrl
        }));
        
        console.log('Logo uploaded successfully:', logoUrl);
      } catch (error) {
        console.error('Error uploading logo:', error);
        alert('Failed to upload logo. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await dbService.updateCompanyDetails(companyDetails);
      
      // Refresh the company context to update all components
      await refreshCompanyDetails();
      
      // Trigger a custom event to notify other components about the update
      window.dispatchEvent(new CustomEvent('companyDetailsUpdated', { 
        detail: companyDetails 
      }));
      
      console.log('Company details saved:', companyDetails);
      setIsOpen(false);
      
      // Show success message
      alert('Company details updated successfully!');
    } catch (error) {
      console.error('Error saving company details:', error);
      alert('Failed to save company details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
      <Settings className="h-4 w-4 mr-2" />
      Company Settings
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center">
            <Building2 className="h-6 w-6 mr-2 text-blue-600" />
            Company Details Management
          </DialogTitle>
          <DialogDescription>
            Manage your company information, contact details, and social media links.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={companyDetails.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <Label htmlFor="company-description">Description</Label>
                <Textarea
                  id="company-description"
                  value={companyDetails.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter company description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="company-website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="company-website"
                    value={companyDetails.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Company Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                {companyDetails.logo_url || companyDetails.logo ? (
                  <div className="space-y-4">
                    <img
                      src={companyDetails.logo_url || companyDetails.logo}
                      alt="Company Logo"
                      className="mx-auto max-h-32 object-contain"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCompanyDetails(prev => ({
                          ...prev,
                          logo: '',
                          logo_url: ''
                        }));
                      }}
                      size="sm"
                    >
                      Remove Logo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <div>
                      <Label htmlFor="logo-upload" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                          Click to upload logo
                        </span>
                        <p className="text-sm text-slate-500 mt-1">
                          PNG, JPG, SVG up to 5MB
                        </p>
                      </Label>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="company-email"
                    type="email"
                    value={companyDetails.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="info@company.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company-phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="company-phone"
                    value={companyDetails.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company-address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Textarea
                    id="company-address"
                    value={companyDetails.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter company address"
                    rows={3}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Facebook className="h-5 w-5 mr-2" />
                Social Media Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="facebook"
                    value={companyDetails.social_media.facebook}
                    onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                    placeholder="https://facebook.com/company"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="twitter"
                    value={companyDetails.social_media.twitter}
                    onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                    placeholder="https://twitter.com/company"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="instagram"
                    value={companyDetails.social_media.instagram}
                    onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                    placeholder="https://instagram.com/company"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="linkedin"
                    value={companyDetails.social_media.linkedin}
                    onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/company"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6 pt-6 border-t border-slate-200">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDetailsPopup;