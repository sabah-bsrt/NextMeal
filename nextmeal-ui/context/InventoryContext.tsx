'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Ingredient, ShoppingItem, LowStockItem } from "../types";
import { getCurrentUser } from '../utils/auth';
import { ingredientDefaults } from '../data/ingredientDefaults';
import { Recipe } from '../data/recipes';

interface InventoryContextType {
  ingredients: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  mergeOrAddIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (id: string) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  getLowStockItems: () => LowStockItem[];
  shoppingList: ShoppingItem[];
  addToShoppingList: (item: ShoppingItem) => void;
  removeFromShoppingList: (id: string) => void;
  toggleShoppingItemCompleted: (id: string) => void;
  clearCompletedItems: () => void;
  favorites: string[];
  toggleFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
  customRecipes: Recipe[];
  addCustomRecipe: (recipe: Recipe) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const user = getCurrentUser();
  const userId = user?.id || 'guest';

const getStorageKey = (key: string) => `nextMeal_${userId}_${key}`;

// 1) مقدار اولیه امن (بدون localStorage)
const [ingredients, setIngredients] = useState<Ingredient[]>([]);
const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
const [favorites, setFavorites] = useState<string[]>([]);
const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);

// 2) Load بعد از mount و هر بار userId عوض شد
useEffect(() => {
  if (typeof window === "undefined") return;
  if (!userId) return;

  try {
    const i = window.localStorage.getItem(getStorageKey("ingredients"));
    setIngredients(i ? JSON.parse(i) : []);

    const s = window.localStorage.getItem(getStorageKey("shoppingList"));
    setShoppingList(s ? JSON.parse(s) : []);

    const f = window.localStorage.getItem(getStorageKey("favorites"));
    setFavorites(f ? JSON.parse(f) : []);

    const c = window.localStorage.getItem(getStorageKey("customRecipes"));
    setCustomRecipes(c ? JSON.parse(c) : []);
  } catch {
    // اگر JSON خراب بود یا storage مشکل داشت، با حالت خالی بالا میایم
    setIngredients([]);
    setShoppingList([]);
    setFavorites([]);
    setCustomRecipes([]);
  }
}, [userId]);

// 3) Save: فقط وقتی userId داریم
useEffect(() => {
  if (typeof window === "undefined") return;
  if (!userId) return;

  window.localStorage.setItem(
    getStorageKey("ingredients"),
    JSON.stringify(ingredients)
  );
}, [ingredients, userId]);

useEffect(() => {
  if (typeof window === "undefined") return;
  if (!userId) return;

  window.localStorage.setItem(
    getStorageKey("shoppingList"),
    JSON.stringify(shoppingList)
  );
}, [shoppingList, userId]);

useEffect(() => {
  if (typeof window === "undefined") return;
  if (!userId) return;

  window.localStorage.setItem(
    getStorageKey("favorites"),
    JSON.stringify(favorites)
  );
}, [favorites, userId]);

useEffect(() => {
  if (typeof window === "undefined") return;
  if (!userId) return;

  window.localStorage.setItem(
    getStorageKey("customRecipes"),
    JSON.stringify(customRecipes)
  );
}, [customRecipes, userId]);


  const addIngredient = (ingredient: Ingredient) => {
    setIngredients(prev => [...prev, ingredient]);
  };

  const mergeOrAddIngredient = (newIngredient: Ingredient) => {
    setIngredients(prev => {
      const existingIndex = prev.findIndex(
        item => item.name.toLowerCase() === newIngredient.name.toLowerCase()
      );

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: existing.quantity + newIngredient.quantity,
          expiryDate: existing.expiryDate < newIngredient.expiryDate 
            ? existing.expiryDate 
            : newIngredient.expiryDate,
        };
        return updated;
      }

      return [...prev, newIngredient];
    });
  };

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(item => item.id !== id));
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const getLowStockItems = () => {
    return ingredients
      .filter(item => {
        const defaults = ingredientDefaults[item.name.toLowerCase().trim()];
        const threshold = defaults?.threshold || 0;
        return item.quantity <= threshold;
      })
      .map(item => {
        const defaults = ingredientDefaults[item.name.toLowerCase().trim()];
        return {
          id: item.id,
          name: item.name,
          current: item.quantity,
          unit: item.unit,
          threshold: defaults?.threshold || 1,
          category: defaults?.category || 'Other',
        };
      });
  };

  const addToShoppingList = (item: ShoppingItem) => {
    setShoppingList(prev => {
      const existing = prev.find(
        i => i.name.toLowerCase() === item.name.toLowerCase()
      );
      if (existing) {
        return prev.map(i =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, { ...item, id: Date.now().toString() }];
    });
  };

  const removeFromShoppingList = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const toggleShoppingItemCompleted = (id: string) => {
    setShoppingList(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const clearCompletedItems = () => {
    setShoppingList(prev => prev.filter(item => !item.checked));
  };

  const toggleFavorite = (recipeId: string) => {
    setFavorites(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const isFavorite = (recipeId: string) => {
    return favorites.includes(recipeId);
  };

  const addCustomRecipe = (recipe: Recipe) => {
    setCustomRecipes(prev => [...prev, recipe]);
  };

  return (
    <InventoryContext.Provider
      value={{
        ingredients,
        addIngredient,
        mergeOrAddIngredient,
        removeIngredient,
        updateIngredient,
        getLowStockItems,
        shoppingList,
        addToShoppingList,
        removeFromShoppingList,
        toggleShoppingItemCompleted,
        clearCompletedItems,
        favorites,
        toggleFavorite,
        isFavorite,
        customRecipes,
        addCustomRecipe,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}