import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MacroSummary } from '../types';

interface MacroChartProps {
  summary: MacroSummary;
}

const MacroChart: React.FC<MacroChartProps> = ({ summary }) => {
  const data = [
    { name: 'Protein', value: summary.proteinGrams * 4, grams: summary.proteinGrams, color: '#6366f1', percentage: 40 }, // Indigo 500
    { name: 'Carbs', value: summary.carbGrams * 4, grams: summary.carbGrams, color: '#10b981', percentage: 30 }, // Emerald 500
    { name: 'Fats', value: summary.fatGrams * 9, grams: summary.fatGrams, color: '#f59e0b', percentage: 30 }, // Amber 500
  ];

  const totalCalculated = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Chart Section - Takes available space */}
      <div className="relative flex-1 min-h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
                cursor={false}
                formatter={(value: number, name: string, props: any) => [`${props.payload.grams}g`, name]}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1e293b'
                }}
                itemStyle={{ color: '#475569', fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center">
            <span className="block text-3xl font-bold text-slate-800 tracking-tight tabular-nums">
              {Math.round(totalCalculated)}
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold -mt-1">
              kcal
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid - Fixed at bottom */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {data.map((item) => (
          <div 
            key={item.name} 
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 transition-all duration-200 hover:bg-white hover:shadow-sm group"
          >
            <div className="flex items-center gap-1.5 mb-1.5 opacity-80 group-hover:opacity-100">
              <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.name}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-slate-800 tabular-nums leading-none mb-0.5">
                {item.grams}
                <span className="text-xs font-medium text-slate-400 ml-0.5">g</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded-full border border-slate-100 shadow-sm mt-1">
                 {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MacroChart;