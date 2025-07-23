import React from 'react';
import { usePageConfig } from '@/contexts/PageConfigContext';
import ComingSoonPage from '@/pages/ComingSoonPage';

interface PageWrapperProps {
  pageId: string;
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ pageId, children }) => {
  const { pageConfigs } = usePageConfig();
  
  const pageConfig = pageConfigs.find(config => config.id === pageId);
  
  // If page is not found in config, render the children (default behavior)
  if (!pageConfig) {
    return <>{children}</>;
  }
  
  // If page is set to coming soon, show the coming soon page
  if (pageConfig.comingSoon) {
    return <ComingSoonPage />;
  }
  
  // If page is inactive, show the coming soon page
  if (!pageConfig.isActive) {
    return <ComingSoonPage />;
  }
  
  // If page has a redirect URL, redirect to it
  if (pageConfig.redirectUrl) {
    window.location.href = pageConfig.redirectUrl;
    return null;
  }
  
  // Otherwise, render the normal page content
  return <>{children}</>;
};

export default PageWrapper;