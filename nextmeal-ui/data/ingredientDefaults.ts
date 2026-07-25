export const ingredientDefaults: Record<
  string,
  {
    category: string;
    daysUntilExpiry?: number;
    unit: string;
    threshold: number;
  }
> = {
  // Vegetables
  tomatoes: {
    category: "Vegetables",
    daysUntilExpiry: 5,
    unit: "pieces",
    threshold: 2,
  },
  lettuce: {
    category: "Vegetables",
    daysUntilExpiry: 5,
    unit: "head",
    threshold: 1,
  },
  cucumber: {
    category: "Vegetables",
    daysUntilExpiry: 7,
    unit: "pieces",
    threshold: 1,
  },
  onion: {
    category: "Vegetables",
    daysUntilExpiry: 14,
    unit: "pieces",
    threshold: 2,
  },
  garlic: {
    category: "Vegetables",
    daysUntilExpiry: 14,
    unit: "cloves",
    threshold: 5,
  },
  peppers: {
    category: "Vegetables",
    daysUntilExpiry: 7,
    unit: "pieces",
    threshold: 1,
  },
  vegetables: {
    category: "Vegetables",
    daysUntilExpiry: 5,
    unit: "g",
    threshold: 200,
  },
  cabbage: {
    category: "Vegetables",
    daysUntilExpiry: 10,
    unit: "head",
    threshold: 1,
  },
  mushrooms: {
    category: "Vegetables",
    daysUntilExpiry: 5,
    unit: "g",
    threshold: 100,
  },
  avocado: {
    category: "Vegetables",
    daysUntilExpiry: 3,
    unit: "pieces",
    threshold: 1,
  },
  basil: {
    category: "Vegetables",
    daysUntilExpiry: 3,
    unit: "bunch",
    threshold: 1,
  },
  ginger: {
    category: "Vegetables",
    daysUntilExpiry: 14,
    unit: "g",
    threshold: 20,
  },
  carrots: {
    category: "Vegetables",
    daysUntilExpiry: 14,
    unit: "pieces",
    threshold: 3,
  },
  celery: {
    category: "Vegetables",
    daysUntilExpiry: 10,
    unit: "stalks",
    threshold: 3,
  },
  spinach: {
    category: "Vegetables",
    daysUntilExpiry: 5,
    unit: "g",
    threshold: 100,
  },
  broccoli: {
    category: "Vegetables",
    daysUntilExpiry: 7,
    unit: "head",
    threshold: 1,
  },

  // Protein
  chicken: {
    category: "Protein",
    daysUntilExpiry: 2,
    unit: "g",
    threshold: 300,
  },
  beef: {
    category: "Protein",
    daysUntilExpiry: 2,
    unit: "g",
    threshold: 300,
  },
  "ground beef": {
    category: "Protein",
    daysUntilExpiry: 2,
    unit: "g",
    threshold: 300,
  },
  fish: {
    category: "Protein",
    daysUntilExpiry: 1,
    unit: "g",
    threshold: 200,
  },
  salmon: {
    category: "Protein",
    daysUntilExpiry: 2,
    unit: "g",
    threshold: 200,
  },
  shrimp: {
    category: "Protein",
    daysUntilExpiry: 2,
    unit: "g",
    threshold: 200,
  },
  eggs: {
    category: "Protein",
    daysUntilExpiry: 21,
    unit: "pieces",
    threshold: 6,
  },
  bacon: {
    category: "Protein",
    daysUntilExpiry: 7,
    unit: "g",
    threshold: 100,
  },
  beans: { category: "Protein", unit: "can", threshold: 2 },
  tofu: {
    category: "Protein",
    daysUntilExpiry: 7,
    unit: "g",
    threshold: 200,
  },
  pork: {
    category: "Protein",
    daysUntilExpiry: 2,
    unit: "g",
    threshold: 300,
  },

  // Dairy
  milk: {
    category: "Dairy",
    daysUntilExpiry: 7,
    unit: "ml",
    threshold: 500,
  },
  cheese: {
    category: "Dairy",
    daysUntilExpiry: 14,
    unit: "g",
    threshold: 100,
  },
  mozzarella: {
    category: "Dairy",
    daysUntilExpiry: 10,
    unit: "g",
    threshold: 100,
  },
  parmesan: {
    category: "Dairy",
    daysUntilExpiry: 30,
    unit: "g",
    threshold: 50,
  },
  "feta cheese": {
    category: "Dairy",
    daysUntilExpiry: 14,
    unit: "g",
    threshold: 100,
  },
  butter: {
    category: "Dairy",
    daysUntilExpiry: 30,
    unit: "g",
    threshold: 100,
  },
  cream: {
    category: "Dairy",
    daysUntilExpiry: 7,
    unit: "ml",
    threshold: 100,
  },
  "sour cream": {
    category: "Dairy",
    daysUntilExpiry: 14,
    unit: "ml",
    threshold: 100,
  },
  yogurt: {
    category: "Dairy",
    daysUntilExpiry: 10,
    unit: "ml",
    threshold: 200,
  },

  // Grains
  pasta: { category: "Grains", unit: "g", threshold: 200 },
  rice: { category: "Grains", unit: "g", threshold: 300 },
  bread: {
    category: "Grains",
    daysUntilExpiry: 5,
    unit: "slices",
    threshold: 4,
  },
  flour: { category: "Grains", unit: "g", threshold: 500 },
  tortillas: {
    category: "Grains",
    daysUntilExpiry: 7,
    unit: "pieces",
    threshold: 4,
  },
  croutons: { category: "Grains", unit: "g", threshold: 50 },
  quinoa: { category: "Grains", unit: "g", threshold: 200 },
  noodles: { category: "Grains", unit: "g", threshold: 200 },

  // Pantry
  "olive oil": {
    category: "Pantry",
    unit: "ml",
    threshold: 100,
  },
  "soy sauce": {
    category: "Pantry",
    unit: "ml",
    threshold: 50,
  },
  "vegetable broth": {
    category: "Pantry",
    unit: "ml",
    threshold: 500,
  },
  "coconut milk": {
    category: "Pantry",
    unit: "ml",
    threshold: 200,
  },
  "white wine": {
    category: "Pantry",
    daysUntilExpiry: 3,
    unit: "ml",
    threshold: 100,
  },
  "chili flakes": {
    category: "Pantry",
    unit: "g",
    threshold: 10,
  },
  "black pepper": {
    category: "Pantry",
    unit: "g",
    threshold: 10,
  },
  "curry powder": {
    category: "Pantry",
    unit: "g",
    threshold: 20,
  },
  sugar: { category: "Pantry", unit: "g", threshold: 200 },
  olives: { category: "Pantry", unit: "g", threshold: 50 },
  lemon: {
    category: "Vegetables",
    daysUntilExpiry: 14,
    unit: "pieces",
    threshold: 1,
  },
  lime: {
    category: "Vegetables",
    daysUntilExpiry: 14,
    unit: "pieces",
    threshold: 1,
  },
  salt: { category: "Pantry", unit: "g", threshold: 100 },
  honey: { category: "Pantry", unit: "ml", threshold: 100 },
};

export function getIngredientDefaults(name: string) {
  const lowercaseName = name.toLowerCase().trim();
  return (
    ingredientDefaults[lowercaseName] || {
      category: "Other",
      unit: "pieces",
      threshold: 1,
    }
  );
}