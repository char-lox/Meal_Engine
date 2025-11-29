
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MealPlan, ChatProcessResult } from "../types";

// Initialize Gemini Client
// Assumption: process.env.API_KEY is pre-configured and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MACRO_SUMMARY_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    totalCalories: { type: Type.NUMBER },
    proteinGrams: { type: Type.NUMBER },
    carbGrams: { type: Type.NUMBER },
    fatGrams: { type: Type.NUMBER },
  },
  required: ["totalCalories", "proteinGrams", "carbGrams", "fatGrams"],
};

const MEAL_OPTION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          grams: { type: Type.NUMBER },
        },
        required: ["item", "grams"],
      },
    },
    macros: MACRO_SUMMARY_SCHEMA
  },
  required: ["id", "name", "ingredients", "macros"],
};

const MEAL_PLAN_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    breakfastOptions: {
      type: Type.ARRAY,
      items: MEAL_OPTION_SCHEMA,
    },
    lunchOptions: {
      type: Type.ARRAY,
      items: MEAL_OPTION_SCHEMA,
    },
    dinnerOptions: {
      type: Type.ARRAY,
      items: MEAL_OPTION_SCHEMA,
    },
    targetDailySummary: MACRO_SUMMARY_SCHEMA,
  },
  required: ["breakfastOptions", "lunchOptions", "dinnerOptions", "targetDailySummary"],
};

const CHAT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    reply: { type: Type.STRING, description: "The conversational response to the user." },
    calories: { type: Type.NUMBER, description: "The extracted target calories, if specified or implied." },
    exclusions: { type: Type.STRING, description: "The updated full list of exclusions/dietary restrictions." },
  },
  required: ["reply"],
};

export const generateMealPlan = async (calories: number, exclusions: string): Promise<MealPlan> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    You are "Annie's Meal Planning Engine".
    
    PROTOCOL (NON-NEGOTIABLE):
    1. Macro Split: 40% Protein, 30% Carbs, 30% Fats.
    2. Meal Structure: The daily intake is split exactly into 3 meals (Breakfast, Lunch, Dinner).
       - Therefore, each meal option must provide approx 33% of the Daily Calorie Target.
    3. Food Sources: WHOLE FOODS ONLY.
       - Allowed: Lean meats (chicken, turkey, white fish, lean beef), Eggs/Whites, 0% Greek Yogurt, Oats, Rice, Potato, Sweet Potato, Quinoa, Avocado, Nuts, Olive Oil, Fruits, Vegetables.
       - Banned: Processed sugar, junk food, supplements, protein powders, processed meats.

    CRITICAL RULES FOR PALATABILITY & SIMPLICITY:
    - Meals must make CULINARY SENSE. Do not mix incompatible ingredients just to hit macros.
    - STRICTLY FORBIDDEN: Mixing savory meats (Chicken, Beef, Fish) with Oats or Sweet Fruits in the same bowl.
    - KEEP IT SIMPLE: These are for fitness clients who meal prep. 3-5 ingredients per meal max.
    
    MEAL ARCHETYPES:
    1. Breakfast Options:
       - Type A (Sweet): Oats + Protein Source (Egg Whites OR 0% Greek Yogurt) + Berries/Banana + Nuts/Nut Butter.
         * If using Egg Whites, specify "on side" or "cooked in".
         * If using Greek Yogurt, it pairs well mixed with oats.
       - Type B (Savory): Whole Eggs + Egg Whites + Veggies (Spinach/Peppers) + Potato/Toast + Avocado/Oil.
    
    2. Lunch/Dinner Options:
       - Standard "Bro Meal": Lean Meat (Chicken/Beef/Fish) + Starch (Rice/Potato/Sweet Potato) + Green Veg (Broccoli/Asparagus/Green Beans) + Fat Source (Olive Oil/Avocado/Nuts).
       - Ensure the protein source is logical (e.g., No "Salmon and Strawberries").

    TASK:
    Generate a Flexible Meal Plan with options for exactly ${calories} Daily Calories.
    Exclusions: ${exclusions || "None"}.
    
    REQUIREMENTS:
    1. Calculate the per-meal target: ${Math.round(calories / 3)} calories.
    2. Generate exactly 5 DISTINCT options for Breakfast.
    3. Generate exactly 5 DISTINCT options for Lunch.
    4. Generate exactly 5 DISTINCT options for Dinner.
    5. For EVERY option:
       - Calculate precise raw weight in grams for ingredients.
       - Ensure it hits the per-meal calorie target and the 40/30/30 macro split.
       - Ingredients must be Whole Foods Only.
    
    OUTPUT:
    Return a JSON object containing the lists of options and the daily summary.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: MEAL_PLAN_SCHEMA,
        temperature: 0.3, // Low temperature for consistency and adherence to rules
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini.");
    }

    return JSON.parse(text) as MealPlan;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const processChat = async (
  message: string, 
  currentCalories: number, 
  currentExclusions: string
): Promise<ChatProcessResult> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    You are the intelligent intake assistant for Annie's Meal Planning Engine.
    
    Current System State:
    - Target Calories: ${currentCalories}
    - Current Exclusions: "${currentExclusions}"

    User Input: "${message}"

    TASK:
    1. Analyze the user's input for diet info, calorie targets, allergies, or food preferences.
    2. If the user provides a "dump" of info (e.g., onboarding form data), extract the relevant constraints.
    3. If they specify a calorie amount, update it. If they specify gender/weight/goals but NO calories, estimate a rough TDEE for weight loss (deficit) and set that as the calories (e.g., 2000 for avg male, 1600 for avg female) or ask for clarification if unsure. Default to ${currentCalories} if not clear.
    4. For exclusions: Combine new exclusions with the 'Current Exclusions' unless the user implies a reset. Interpret "dislikes" or "hates" as exclusions.
    5. Generate a helpful, brief reply confirming what you changed.

    OUTPUT JSON:
    {
      "reply": "Your conversational response here.",
      "calories": number (optional, only if changed),
      "exclusions": "string" (optional, only if changed. Return the COMPLETE new string)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: CHAT_SCHEMA,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return { reply: "I couldn't process that. Please try again." };
    
    return JSON.parse(text) as ChatProcessResult;
  } catch (error) {
    console.error("Chat Processing Error:", error);
    return { reply: "Sorry, I had trouble connecting to the engine. Please try again." };
  }
};
