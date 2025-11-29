import React from 'react';
import { ChefHat, Activity, Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Annie's Meal Planning Engine</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">INTERNAL TOOL</span>
               <span className="text-[10px] text-slate-400 font-medium tracking-wide">PROTOCOL 40/30/30</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
           <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>v2.4.0 (Stable)</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>System: <span className="text-emerald-600 font-bold">Online</span></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;