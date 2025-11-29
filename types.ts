
export interface Ingredient {
  item: string;
  grams: number;
}

export interface MacroSummary {
  totalCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
}

export interface MealOption {
  id: string; // unique identifier for key props
  name: string; // e.g., "Option 1: Scrambled Eggs & Oats"
  ingredients: Ingredient[];
  macros: MacroSummary;
}

export interface MealPlan {
  breakfastOptions: MealOption[];
  lunchOptions: MealOption[];
  dinnerOptions: MealOption[];
  targetDailySummary: MacroSummary;
}

export interface GenerationRequest {
  calories: number;
  exclusions: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export interface ChatProcessResult {
  reply: string;
  calories?: number;
  exclusions?: string;
}
