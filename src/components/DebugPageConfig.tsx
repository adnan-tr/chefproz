import React from 'react';
import { usePageConfig } from '@/contexts/PageConfigContext';

const DebugPageConfig: React.FC = () => {
  const { pageConfigs, isPageActive, shouldShowPrices } = usePageConfig();

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-md">
      <h3 className="font-bold mb-2">Page Config Debug</h3>
      <div className="text-xs space-y-1">
        {pageConfigs.map(config => (
          <div key={config.id} className="border-b pb-1">
            <div><strong>{config.name}</strong> (ID: {config.id})</div>
            <div>Active: {isPageActive(config.id) ? 'Yes' : 'No'}</div>
            <div>Show Prices: {shouldShowPrices(config.id) ? 'Yes' : 'No'}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs">
        <strong>localStorage:</strong>
        <pre className="bg-gray-100 p-1 rounded text-xs overflow-auto max-h-20">
          {localStorage.getItem('pageConfigurations') || 'null'}
        </pre>
      </div>
    </div>
  );
};

export default DebugPageConfig;