import React, { useEffect, useState, useCallback } from 'react';
import { Sliders, Ban, AlertCircle } from 'lucide-react';

interface ControlPanelProps {
  calories: number;
  setCalories: (c: number) => void;
  exclusions: string;
  setExclusions: (e: string) => void;
  isGenerating: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  calories,
  setCalories,
  exclusions,
  setExclusions,
  isGenerating,
}) => {
  // Local state for immediate slider feedback before debounce logic in parent
  const [localCalories, setLocalCalories] = useState(calories);

  useEffect(() => {
    setLocalCalories(calories);
  }, [calories]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setLocalCalories(val);
  };

  const handleSliderCommit = () => {
    setCalories(localCalories);
  };

  const handleExclusionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExclusions(e.target.value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Sliders className="w-4 h-4" />
            Calorie Target
          </label>
          <span className="text-2xl font-bold text-indigo-600 tabular-nums">
            {localCalories} <span className="text-sm font-medium text-slate-400">kcal</span>
          </span>
        </div>
        
        <input
          type="range"
          min="1200"
          max="4000"
          step="50"
          value={localCalories}
          onChange={handleSliderChange}
          onMouseUp={handleSliderCommit}
          onTouchEnd={handleSliderCommit}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={isGenerating}
        />
        <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium px-1">
          <span>1200</span>
          <span>2600</span>
          <span>4000</span>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          <Ban className="w-4 h-4 text-rose-500" />
          Exclusions (Optional)
        </label>
        <div className="relative">
          <input
            type="text"
            value={exclusions}
            onChange={handleExclusionChange}
            placeholder="e.g. No pork, gluten-free, no peanuts"
            className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            disabled={isGenerating}
          />
          {exclusions && (
             <div className="absolute right-3 top-2.5">
               <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
             </div>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500 flex items-start gap-1">
          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
          Changing exclusions will trigger a recalculation.
        </p>
      </div>
    </div>
  );
};

export default ControlPanel;