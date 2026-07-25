export type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string; // YYYY-MM-DD
};

export type IngredientDetail = {
  ingredient: string;
  amount?: string;      // "200 g"
  quantity?: number;    // 200
  unit?: string;        // "g"
};

export type Recipe = {
  id: string;
  name: string;
  description: string;
  prepTime: string;
  servings: number;
  requiredIngredients: string[];
  ingredientDetails: IngredientDetail[];
  instructions: string[];
  imageUrl?: string;
};

export type MealSuggestion = {
  id: string;
  name: string;
  requiredIngredients: string[];
  matchedIngredients: string[];
  missingIngredients: string[];
  matchPercentage: number;
  usesExpiringIngredients: boolean;
  prepTime: string;
  servings: number;
};

export type ShoppingItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  checked: boolean;
  fromRecommendations?: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
};
