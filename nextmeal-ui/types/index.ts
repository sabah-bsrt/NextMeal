export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
}

export interface MealSuggestion {
  id: string;
  name: string;
  requiredIngredients: string[];
  matchedIngredients: string[];
  missingIngredients: string[];
  matchPercentage: number;
  usesExpiringIngredients: boolean;
  prepTime: string;
  servings: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  checked: boolean;
  fromRecommendations: boolean;
}

export interface LowStockItem {
  id: string;
  name: string;
  current: number;
  unit: string;
  threshold: number;
  category: string;
}
