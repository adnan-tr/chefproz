import React, { createContext, useContext, useState, useEffect } from 'react';

interface PageConfig {
  id: string;
  name: string;
  path: string;
  isActive: boolean;
  showPrices: boolean;
  redirectUrl?: string;
  comingSoon: boolean;
  description: string;
}

interface PageConfigContextType {
  pageConfigs: PageConfig[];
  getPageConfig: (pageId: string) => PageConfig | undefined;
  isPageActive: (pageId: string) => boolean;
  shouldShowPrices: (pageId: string) => boolean;
  updatePageConfigs: (configs: PageConfig[]) => void;
}

const defaultPages: PageConfig[] = [
  {
    id: 'hotel-equipment',
    name: 'Hotel Equipment',
    path: '/hotel-equipment',
    isActive: true,
    showPrices: true,
    comingSoon: false,
    description: 'Professional hotel and banquet equipment'
  },
  {
    id: 'refrigeration',
    name: 'Refrigeration',
    path: '/refrigeration',
    isActive: true,
    showPrices: true,
    comingSoon: false,
    description: 'Commercial refrigeration solutions'
  },
  {
    id: 'kitchen-tools',
    name: 'Kitchen Tools',
    path: '/kitchen-tools',
    isActive: true,
    showPrices: true,
    comingSoon: false,
    description: 'Professional kitchen tools and accessories'
  },
  {
    id: 'inoksan',
    name: 'Inoksan Products',
    path: '/inoksan',
    isActive: true,
    showPrices: true,
    comingSoon: false,
    description: 'Inoksan brand kitchen equipment'
  },
  {
    id: 'special-requests',
    name: 'Special Requests',
    path: '/special-requests',
    isActive: true,
    showPrices: true,
    comingSoon: false,
    description: 'Custom solutions and special requests'
  }
];

const PageConfigContext = createContext<PageConfigContextType | undefined>(undefined);

export const usePageConfig = () => {
  const context = useContext(PageConfigContext);
  if (!context) {
    throw new Error('usePageConfig must be used within a PageConfigProvider');
  }
  return context;
};

export const PageConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pageConfigs, setPageConfigs] = useState<PageConfig[]>(defaultPages);

  useEffect(() => {
    // Load page configurations from localStorage
    const savedPages = localStorage.getItem('pageConfigurations');
    console.log('Loading from localStorage:', savedPages);
    if (savedPages) {
      try {
        const parsedPages = JSON.parse(savedPages);
        console.log('Parsed pages:', parsedPages);
        
        // Migrate old data format with numeric IDs to new format with string IDs
        const migratedPages = parsedPages.map((page: any) => {
          const pathToIdMap: { [key: string]: string } = {
            '/hotel-equipment': 'hotel-equipment',
            '/refrigeration': 'refrigeration',
            '/kitchen-tools': 'kitchen-tools',
            '/inoksan': 'inoksan',
            '/special-request': 'special-requests'
          };
          
          // If the ID is numeric, convert it based on the path
          if (typeof page.id === 'string' && /^\d+$/.test(page.id)) {
            const newId = pathToIdMap[page.path];
            if (newId) {
              console.log(`Migrating page ID from '${page.id}' to '${newId}' for path '${page.path}'`);
              return { ...page, id: newId };
            }
          }
          
          return page;
        });
        
        console.log('Migrated pages:', migratedPages);
        setPageConfigs(migratedPages);
        
        // Save the migrated data back to localStorage
        localStorage.setItem('pageConfigurations', JSON.stringify(migratedPages));
      } catch (error) {
        console.error('Error loading page configurations:', error);
      }
    } else {
      console.log('No saved configurations found, using defaults:', defaultPages);
    }
  }, []);

  const getPageConfig = (pageId: string): PageConfig | undefined => {
    // First try to find by ID
    let config = pageConfigs.find(config => config.id === pageId);
    
    // If not found, try to find by path (fallback for legacy data)
    if (!config) {
      config = pageConfigs.find(config => config.path === `/${pageId}`);
    }
    
    console.log(`getPageConfig('${pageId}'):`, config);
    return config;
  };

  const isPageActive = (pageId: string): boolean => {
    const config = getPageConfig(pageId);
    const result = config?.isActive ?? true;
    console.log(`isPageActive('${pageId}'):`, result, 'config:', config);
    return result;
  };

  const shouldShowPrices = (pageId: string): boolean => {
    const config = getPageConfig(pageId);
    const result = config?.showPrices ?? true;
    console.log(`shouldShowPrices('${pageId}'):`, result, 'config:', config);
    return result;
  };

  const updatePageConfigs = (configs: PageConfig[]) => {
    console.log('Updating page configs:', configs);
    setPageConfigs(configs);
    localStorage.setItem('pageConfigurations', JSON.stringify(configs));
    console.log('Saved to localStorage:', localStorage.getItem('pageConfigurations'));
  };

  const value: PageConfigContextType = {
    pageConfigs,
    getPageConfig,
    isPageActive,
    shouldShowPrices,
    updatePageConfigs
  };

  return (
    <PageConfigContext.Provider value={value}>
      {children}
    </PageConfigContext.Provider>
  );
};

export type { PageConfig };