import React from 'react';
import { Outlet } from 'react-router-dom';
import { ChefHat, Settings } from 'lucide-react';

const OrderLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-white">
      {/* Top bar only - no sidebar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 h-16">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600 rounded-xl shadow-lg">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900">ChefGear Management</span>
              <p className="text-xs text-slate-500 -mt-1">Order Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs">A</span>
              </div>
              <div className="text-sm text-slate-600">
                Order Manager
              </div>
            </div>
            <button className="p-2 rounded-xl text-slate-400 hover:text-red-600 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Page content - full width without sidebar */}
      <main className="p-4 lg:p-6">
        <div className="max-w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default OrderLayout;