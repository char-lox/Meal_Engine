import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import ChatInterface from './components/ChatInterface';
import MacroChart from './components/MacroChart';
import MealTable from './components/MealTable';
import { generateMealPlan, processChat } from './services/geminiService';
import { AppStatus, MealPlan, ChatMessage } from './types';
import { Loader2, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [calories, setCalories] = useState<number>(2000);
  const [exclusions, setExclusions] = useState<string>('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', text: "Hello Annie. Paste the client onboarding data here, and I'll configure the engine." }
  ]);
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Debounced fetch for the meal plan
  const fetchPlan = useCallback(async (cal: number, excl: string) => {
    setStatus(AppStatus.LOADING);
    setErrorMsg(null);
    try {
      const plan = await generateMealPlan(cal, excl);
      setMealPlan(plan);
      setStatus(AppStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setErrorMsg("Failed to generate meal plan. Please check your API key or try again.");
    }
  }, []);

  // Effect to trigger fetch on calorie or exclusion change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlan(calories, exclusions);
    }, 800); 

    return () => clearTimeout(timer);
  }, [calories, exclusions, fetchPlan]);

  const handleChatMessage = async (msg: string) => {
    // Add user message immediately
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: msg };
    setChatHistory(prev => [...prev, userMsg]);
    setIsChatProcessing(true);

    try {
      // Process with Gemini
      const result = await processChat(msg, calories, exclusions);
      
      const botMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        text: result.reply 
      };
      setChatHistory(prev => [...prev, botMsg]);

      // Update state if parameters changed
      if (result.calories) setCalories(result.calories);
      if (result.exclusions !== undefined) setExclusions(result.exclusions); 
      
    } catch (error) {
      const errorMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        text: "I encountered an error processing that request." 
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsChatProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Chat & Controls & Stats */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Chat Interface - Primary Input */}
            <section aria-label="Client Intake" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <ChatInterface 
                history={chatHistory} 
                onSendMessage={handleChatMessage} 
                isProcessing={isChatProcessing}
              />
            </section>

            {/* Manual Controls Accordion */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
               <button 
                onClick={() => setShowControls(!showControls)}
                className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-700"
               >
                 <span className="flex items-center gap-2">
                   <Zap className="w-4 h-4 text-amber-500" />
                   Manual Configuration
                 </span>
                 {showControls ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
               </button>
               
               <div className={`transition-all duration-300 ease-in-out ${showControls ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                 <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                    <ControlPanel 
                      calories={calories} 
                      setCalories={setCalories} 
                      exclusions={exclusions}
                      setExclusions={setExclusions}
                      isGenerating={status === AppStatus.LOADING}
                    />
                 </div>
               </div>
            </div>

            {/* Live Chart - Expanded Height for Flexibility */}
            <section aria-label="Macro Visualization" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col flex-1 min-h-[340px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  Daily Target Breakdown
                </h3>
                {status === AppStatus.LOADING && (
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                )}
              </div>
              
              <div className="flex-1">
                {status === AppStatus.LOADING && !mealPlan ? (
                  <div className="h-full flex items-center justify-center flex-col gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <span className="text-xs text-slate-400 font-medium">Calculating Macros...</span>
                  </div>
                ) : mealPlan ? (
                  <MacroChart summary={mealPlan.targetDailySummary} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-100 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                       <Zap className="w-6 h-6 text-slate-300" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Waiting for data...</span>
                  </div>
                )}
              </div>
            </section>
            
            {/* Reminders */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg">
              <div className="relative z-10">
                 <h4 className="font-bold text-base mb-3 text-indigo-100">Protocol Reminders</h4>
                 <ul className="text-indigo-200/80 text-sm space-y-2.5 list-disc pl-4 font-medium">
                   <li>Weigh food <strong>raw</strong> unless specified.</li>
                   <li>Stick to the 3-meal structure.</li>
                   <li>Mix & match 1 option from each category.</li>
                 </ul>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Scale size={140} />
              </div>
            </div>
          </div>

          {/* Right Column: The Plan */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 min-h-[600px] flex flex-col h-full overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                   <h2 className="text-lg font-bold text-slate-900">Meal Plan Options</h2>
                   <p className="text-xs text-slate-500 font-medium mt-0.5">Select one option per meal time</p>
                </div>
                <div className={`text-xs font-mono font-bold py-1.5 px-3 rounded-lg border transition-all duration-300 ${status === AppStatus.LOADING ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                  {status === AppStatus.LOADING ? 'GENERATING...' : 'SYSTEM READY'}
                </div>
              </div>

              <div className="flex-1 overflow-hidden relative bg-slate-50/50">
                {status === AppStatus.ERROR ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 absolute inset-0">
                    <div className="bg-rose-50 p-4 rounded-2xl mb-4 border border-rose-100">
                       <AlertTriangle className="w-10 h-10 text-rose-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Calculation Error</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6 text-sm">{errorMsg}</p>
                    <button 
                        onClick={() => fetchPlan(calories, exclusions)}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200 font-semibold text-sm"
                    >
                        Retry Engine
                    </button>
                  </div>
                ) : mealPlan ? (
                   <div className={`h-full transition-all duration-500 ${status === AppStatus.LOADING ? 'opacity-40 scale-[0.99] blur-[1px] pointer-events-none' : 'opacity-100 scale-100 blur-0'}`}>
                      <MealTable 
                        breakfastOptions={mealPlan.breakfastOptions} 
                        lunchOptions={mealPlan.lunchOptions} 
                        dinnerOptions={mealPlan.dinnerOptions} 
                      />
                   </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400 absolute inset-0">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-100" />
                    </div>
                    <p className="text-sm font-medium">Waiting for intake data...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// Simple Icon for the reminder card
function Scale({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}

export default App;