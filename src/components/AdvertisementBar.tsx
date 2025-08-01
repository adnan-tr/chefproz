import React from 'react';
import { AdvertisementBrand } from '@/lib/advertisementService';

interface AdvertisementBarProps {
  brands: AdvertisementBrand[];
  direction?: 'left' | 'right';
  loading?: boolean;
}

const AdvertisementBar: React.FC<AdvertisementBarProps> = ({ 
  brands, 
  direction = 'left', 
  loading = false 
}) => {
  // If loading or no brands, show placeholder
  if (loading || brands.length === 0) {
    return (
      <div className="overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-sm">
        <div className={`${direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'} whitespace-nowrap py-4`}>
          <div className="inline-flex items-center space-x-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="inline-flex items-center space-x-4 px-6 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center animate-pulse">
                  <span className="text-gray-500 text-xs font-medium">LOGO</span>
                </div>
                <div className="text-center">
                  <div className="h-4 bg-gray-300 rounded w-20 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Duplicate brands multiple times to ensure continuous scrolling without gaps
  const duplicatedBrands = [...brands, ...brands];

  return (
    <div className="overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-sm">
      <div className={`${direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'} whitespace-nowrap py-4 flex`}>
        <div className="inline-flex items-center space-x-8 flex-shrink-0">
          {duplicatedBrands.map((brand, index) => (
            <div 
              key={`${brand.id}-${index}`} 
              className="inline-flex items-center space-x-4 px-6 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer flex-shrink-0"
              onClick={() => brand.website_url && window.open(brand.website_url, '_blank')}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {brand.logo_url ? (
                  <img 
                    src={brand.logo_url} 
                    alt={brand.brand_name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to text if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-gray-500 text-xs font-medium">${brand.brand_name.substring(0, 4).toUpperCase()}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span className="text-gray-500 text-xs font-medium">
                    {brand.brand_name.substring(0, 4).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-center flex-shrink-0">
                <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                  {brand.brand_name}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">
                  {brand.description || 'Partner Brand'}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* Duplicate the content again for seamless loop */}
        <div className="inline-flex items-center space-x-8 flex-shrink-0">
          {duplicatedBrands.map((brand, index) => (
            <div 
              key={`${brand.id}-${index}-duplicate`} 
              className="inline-flex items-center space-x-4 px-6 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer flex-shrink-0"
              onClick={() => brand.website_url && window.open(brand.website_url, '_blank')}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {brand.logo_url ? (
                  <img 
                    src={brand.logo_url} 
                    alt={brand.brand_name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to text if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-gray-500 text-xs font-medium">${brand.brand_name.substring(0, 4).toUpperCase()}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span className="text-gray-500 text-xs font-medium">
                    {brand.brand_name.substring(0, 4).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-center flex-shrink-0">
                <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                  {brand.brand_name}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">
                  {brand.description || 'Partner Brand'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvertisementBar;
export { AdvertisementBar };