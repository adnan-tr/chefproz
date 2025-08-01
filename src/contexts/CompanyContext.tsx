import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dbService } from '@/lib/supabase';

interface CompanyDetails {
  name: string;
  logo: string;
  logo_url?: string;
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

interface CompanyContextType {
  companyDetails: CompanyDetails;
  loading: boolean;
  refreshCompanyDetails: () => Promise<void>;
}

const defaultCompanyDetails: CompanyDetails = {
  name: 'Hublinq',
  logo: '',
  description: 'Professional kitchen equipment and solutions - We speak many native languages to serve our diverse clientele',
  website: 'https://hublinq.com',
  email: 'info@hublinq.com',
  phone: '+90 (212) 555-1234',
  address: 'Atatürk Mah. Ertuğrul Gazi Sok. No: 25, Kat: 3, 34758 Ataşehir/İstanbul',
  social_media: {
    facebook: 'https://facebook.com/hublinq',
    twitter: 'https://twitter.com/hublinq',
    instagram: 'https://instagram.com/hublinq',
    linkedin: 'https://linkedin.com/company/hublinq'
  }
};

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(defaultCompanyDetails);
  const [loading, setLoading] = useState(true);

  const loadCompanyDetails = async () => {
    try {
      setLoading(true);
      const details = await dbService.getCompanyDetails();
      setCompanyDetails(details);
    } catch (error) {
      console.error('Error loading company details:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const refreshCompanyDetails = async () => {
    await loadCompanyDetails();
  };

  useEffect(() => {
    loadCompanyDetails();

    // Listen for company details updates
    const handleCompanyDetailsUpdate = (event: CustomEvent) => {
      setCompanyDetails(event.detail);
    };

    window.addEventListener('companyDetailsUpdated', handleCompanyDetailsUpdate as EventListener);

    return () => {
      window.removeEventListener('companyDetailsUpdated', handleCompanyDetailsUpdate as EventListener);
    };
  }, []);

  const value: CompanyContextType = {
    companyDetails,
    loading,
    refreshCompanyDetails
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export default CompanyContext;