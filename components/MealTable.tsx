import React, { useState } from 'react';
import { MealOption } from '../types';
import { Scale, Coffee, Sun, Moon, ArrowRight, Utensils } from 'lucide-react';

interface MealTableProps {
  breakfastOptions: MealOption[];
  lunchOptions: MealOption[];
  dinnerOptions: MealOption[];
}

type MealType = 'breakfast' | 'lunch' | 'dinner';

const MealTable: React.FC<MealTableProps> = ({ breakfastOptions, lunchOptions, dinnerOptions }) => {
  const [activeTab, setActiveTab] = useState<MealType>('breakfast');

  const getActiveOptions = () => {
    switch (activeTab) {
      case 'breakfast': return breakfastOptions;
      case 'lunch': return lunchOptions;
      case 'dinner': return dinnerOptions;
      default: return [];
    }
  };

  const tabs = [
    { 
      id: 'breakfast', 
      label: 'Breakfast', 
      sub: 'Options 1-5',
      icon: Coffee, 
      activeColor: 'text-amber-700', 
      activeBg: 'bg-amber-50',
      barColor: 'bg-amber-500' 
    },
    { 
      id: 'lunch', 
      label: 'Lunch', 
      sub: 'Options 1-5',
      icon: Sun, 
      activeColor: 'text-orange-700', 
      activeBg: 'bg-orange-50',
      barColor: 'bg-orange-500' 
    },
    { 
      id: 'dinner', 
      label: 'Dinner', 
      sub: 'Options 1-5',
      icon: Moon, 
      activeColor: 'text-indigo-700', 
      activeBg: 'bg-indigo-50',
      barColor: 'bg-indigo-500' 
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MealType)}
              className={`flex-1 py-4 px-2 flex flex-col items-center justify-center gap-2 transition-all relative group
                ${isActive ? 'bg-white' : 'bg-slate-50/50 hover:bg-slate-50'}`}
            >
              <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? tab.activeBg : 'bg-transparent group-hover:bg-slate-100'}`}>
                <Icon className={`w-5 h-5 ${isActive ? tab.activeColor : 'text-slate-400'}`} />
              </div>
              <div className="text-center">
                 <span className={`block text-sm font-bold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                  {tab.label}
                 </span>
                 <span className="block text-[10px] text-slate-400 font-medium">{tab.sub}</span>
              </div>
              {isActive && (
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${tab.barColor} rounded-t-full mx-8`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 p-4 sm:p-6 space-y-6">
        {getActiveOptions().map((option, index) => (
            <div key={option.id || index} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              {/* Option Header */}
              <div className="px-5 py-4 border-b border-slate-50 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-500 text-xs font-bold mt-0.5 shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-tight">{option.name || `Option ${index + 1}`}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                       <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                          Approx. {option.macros?.totalCalories} kcal
                       </div>
                    </div>
                  </div>
                </div>
                
                {/* Mini Macro Pill */}
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Target Macros</div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                     <span className="text-indigo-600 font-bold">{option.macros?.proteinGrams}P</span>
                     <span className="text-slate-300">|</span>
                     <span className="text-emerald-600 font-bold">{option.macros?.carbGrams}C</span>
                     <span className="text-slate-300">|</span>
                     <span className="text-amber-600 font-bold">{option.macros?.fatGrams}F</span>
                  </div>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-slate-400">
                    <tr>
                       <th className="px-5 py-2 font-semibold text-[10px] uppercase tracking-wider w-2/3 pl-14">Ingredient</th>
                       <th className="px-5 py-2 font-semibold text-[10px] uppercase tracking-wider text-right">Raw Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {option.ingredients.map((ing, i) => (
                      <tr key={i} className="group hover:bg-indigo-50/20 transition-colors">
                        <td className="px-5 py-3 text-slate-700 pl-14 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors"></span>
                           {ing.item}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-slate-900 font-bold tabular-nums">
                          {ing.grams} <span className="text-xs font-normal text-slate-400">g</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        ))}
        
        {/* Footer Note */}
        <div className="flex items-center justify-center gap-2 p-4 text-xs text-slate-400 font-medium">
          <Utensils className="w-3 h-3" />
          <span>Remember: You can swap any {activeTab} option day-to-day.</span>
        </div>
      </div>
    </div>
  );
};

export default MealTable;