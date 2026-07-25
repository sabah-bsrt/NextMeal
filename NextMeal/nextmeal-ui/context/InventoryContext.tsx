"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { Ingredient, Recipe, ShoppingItem } from "../types";

/* ================= TYPES ================= */

type InventoryPatch = Partial<Pick<Ingredient, "quantity" | "expiryDate">>;
type AddCustomRecipeInput = Omit<Recipe, "id" | "ingredientDetails">;

type InventoryContextValue = {
  /* inventory */
  ingredients: Ingredient[];
  addIngredient: (i: Ingredient) => void;
  removeIngredient: (id: string) => void;
  updateIngredient: (id: string, patch: InventoryPatch) => void;
  getLowStockItems: () => Ingredient[];

  /* recipes */
  customRecipes: Recipe[];
  addCustomRecipe: (r: AddCustomRecipeInput) => void;

  /* favorites */
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  /* shopping list */
  shoppingList: ShoppingItem[];
  addToShoppingList: (item: Omit<ShoppingItem, "id">) => void;
  removeFromShoppingList: (id: string) => void;
  toggleShoppingItemCompleted: (id: string) => void;
  clearCompletedItems: () => void;
};

/* ================= CONTEXT ================= */

const InventoryContext = createContext<InventoryContextValue | null>(null);

/* ================= HELPERS ================= */

function toISODate(d: Date) {
  return d.toISOString().split("T")[0];
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/* ================= SEED DATA ================= */

const seedIngredients: Ingredient[] = [
  { id: "1", name: "milk", quantity: 1, unit: "l", expiryDate: daysFromNow(2) },
  { id: "2", name: "egg", quantity: 6, unit: "pcs", expiryDate: daysFromNow(10) },
  { id: "3", name: "tomato", quantity: 2, unit: "pcs", expiryDate: daysFromNow(1) },
  { id: "4", name: "rice", quantity: 500, unit: "g", expiryDate: daysFromNow(120) },
  { id: "5", name: "yogurt", quantity: 200, unit: "g", expiryDate: daysFromNow(6) },
];

/* ================= PROVIDER ================= */

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  /* inventory */
  const [ingredients, setIngredients] = useState<Ingredient[]>(seedIngredients);

  /* recipes */
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);

  /* favorites */
  const [favorites, setFavorites] = useState<string[]>([]);

  /* shopping list */
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  /* ---------- inventory actions ---------- */

  const addIngredient = (i: Ingredient) =>
    setIngredients((prev) => [i, ...prev]);

  const removeIngredient = (id: string) =>
    setIngredients((prev) => prev.filter((x) => x.id !== id));

  const updateIngredient = (id: string, patch: InventoryPatch) =>
    setIngredients((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...patch } : x))
    );

  const getLowStockItems = () =>
    ingredients.filter((x) => x.quantity <= 2);

  /* ---------- recipes ---------- */

type AddCustomRecipeInput = {
  name: string;
  description: string;
  prepTime: string;
  servings: number;
  requiredIngredients: string[];
  instructions: string[];
  imageUrl?: string;
};

const addCustomRecipe = (r: AddCustomRecipeInput) => {
  const id = `c_${Date.now()}`;

  setCustomRecipes((prev) => [
    {
      id,
      name: r.name,
      description: r.description,
      prepTime: r.prepTime,
      servings: r.servings,
      requiredIngredients: r.requiredIngredients,
      instructions: r.instructions,
      imageUrl: r.imageUrl,
      ingredientDetails: r.requiredIngredients.map((ing) => ({
        ingredient: ing,
        amount: "",
      })),
    },
    ...prev,
  ]);
};

  /* ---------- favorites ---------- */

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]
    );
  };

  const isFavorite = (id: string) => favorites.includes(id);

  /* ---------- shopping list ---------- */

  const addToShoppingList = (item: Omit<ShoppingItem, "id">) => {
    setShoppingList((prev) => [
      { id: `s_${Date.now()}`, ...item },
      ...prev,
    ]);
  };

  const removeFromShoppingList = (id: string) => {
    setShoppingList((prev) => prev.filter((x) => x.id !== id));
  };

  const toggleShoppingItemCompleted = (id: string) => {
    setShoppingList((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, checked: !x.checked } : x
      )
    );
  };

  const clearCompletedItems = () => {
    setShoppingList((prev) => prev.filter((x) => !x.checked));
  };

  /* ---------- value ---------- */

  const value = useMemo(
    () => ({
      ingredients,
      addIngredient,
      removeIngredient,
      updateIngredient,
      getLowStockItems,

      customRecipes,
      addCustomRecipe,

      favorites,
      toggleFavorite,
      isFavorite,

      shoppingList,
      addToShoppingList,
      removeFromShoppingList,
      toggleShoppingItemCompleted,
      clearCompletedItems,
    }),
    [ingredients, customRecipes, favorites, shoppingList]
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error("useInventory must be used inside InventoryProvider");
  }
  return ctx;
}
