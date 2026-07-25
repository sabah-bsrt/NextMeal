"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useInventory } from "@/context/InventoryContext";
import { recipeDatabase } from "../../data/recipe";
import type { MealSuggestion } from "../../types";
import {
  ChefHat,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  X,
  Package,
} from "lucide-react";

export function MealSuggestionsPage() {
  const router = useRouter();
  const { ingredients, addCustomRecipe, customRecipes } = useInventory();

  const [sortBy, setSortBy] = useState<"match" | "expiry">("expiry");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newRecipe, setNewRecipe] = useState({
    name: "",
    description: "",
    prepTime: "",
    servings: 2,
    ingredients: [""],     // requiredIngredients
    instructions: [""],
    imageUrl: "",
  });

  const allRecipes = [...recipeDatabase, ...customRecipes];

  const isIngredientExpiring = (expiryDate: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const suggestions = useMemo<MealSuggestion[]>(() => {
    const expiringIngredients = ingredients
      .filter((ing) => isIngredientExpiring(ing.expiryDate))
      .map((ing) => ing.name.toLowerCase());

    return allRecipes
      .map((recipe: any) => {
        let totalScore = 0;
        const matchedIngredients: string[] = [];
        const missingIngredients: string[] = [];

        recipe.requiredIngredients.forEach((requiredIng: string) => {
          const userIngredient = ingredients.find(
            (userIng) =>
              userIng.name.toLowerCase().includes(requiredIng.toLowerCase()) ||
              requiredIng.toLowerCase().includes(userIng.name.toLowerCase())
          );

          if (userIngredient) {
            const recipeIngDetail = recipe.ingredientDetails?.find(
              (detail: any) => detail.ingredient?.toLowerCase() === requiredIng.toLowerCase()
            );

            if (recipeIngDetail?.quantity && recipeIngDetail?.unit) {
              const userUnit = userIngredient.unit.toLowerCase().trim();
              const recipeUnit = recipeIngDetail.unit.toLowerCase().trim();

              if (userUnit === recipeUnit) {
                const quantityRatio = userIngredient.quantity / recipeIngDetail.quantity;
                totalScore += Math.min(quantityRatio, 1);
              } else {
                totalScore += 1;
              }
            } else {
              totalScore += 1;
            }

            matchedIngredients.push(requiredIng);
          } else {
            missingIngredients.push(requiredIng);
          }
        });

        const matchPercentage = (totalScore / recipe.requiredIngredients.length) * 100;

        const usesExpiringIngredients = matchedIngredients.some((ing) =>
          expiringIngredients.some(
            (exp) => exp.includes(ing.toLowerCase()) || ing.toLowerCase().includes(exp)
          )
        );

        return {
          id: recipe.id,
          name: recipe.name,
          requiredIngredients: recipe.requiredIngredients,
          matchedIngredients,
          missingIngredients,
          matchPercentage,
          usesExpiringIngredients,
          prepTime: recipe.prepTime,
          servings: recipe.servings,
        };
      })
      .filter((s) => s.matchedIngredients.length > 0);
  }, [ingredients, allRecipes]);

  const sortedSuggestions = useMemo(() => {
    const sorted = [...suggestions];
    if (sortBy === "expiry") {
      return sorted.sort((a, b) => {
        if (a.usesExpiringIngredients && !b.usesExpiringIngredients) return -1;
        if (!a.usesExpiringIngredients && b.usesExpiringIngredients) return 1;
        return b.matchPercentage - a.matchPercentage;
      });
    }
    return sorted.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [suggestions, sortBy]);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return sortedSuggestions;
    const q = searchQuery.toLowerCase();
    return sortedSuggestions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.requiredIngredients.some((ing) => ing.toLowerCase().includes(q))
    );
  }, [sortedSuggestions, searchQuery]);

  const handleAddIngredient = () =>
    setNewRecipe((p) => ({ ...p, ingredients: [...p.ingredients, ""] }));

  const handleAddInstruction = () =>
    setNewRecipe((p) => ({ ...p, instructions: [...p.instructions, ""] }));

  const handleRemoveIngredient = (index: number) =>
    setNewRecipe((p) => ({ ...p, ingredients: p.ingredients.filter((_, i) => i !== index) }));

  const handleRemoveInstruction = (index: number) =>
    setNewRecipe((p) => ({ ...p, instructions: p.instructions.filter((_, i) => i !== index) }));

  const handleUpdateIngredient = (index: number, value: string) =>
    setNewRecipe((p) => ({ ...p, ingredients: p.ingredients.map((x, i) => (i === index ? value : x)) }));

  const handleUpdateInstruction = (index: number, value: string) =>
    setNewRecipe((p) => ({ ...p, instructions: p.instructions.map((x, i) => (i === index ? value : x)) }));

  const handleSubmitRecipe = (e: React.FormEvent) => {
    e.preventDefault();

    const name = newRecipe.name.trim();
    const description = newRecipe.description.trim();
    const prepTime = newRecipe.prepTime.trim();
    const servings = Number(newRecipe.servings) || 1;

    const requiredIngredients = newRecipe.ingredients
      .map((x) => x.trim())
      .filter(Boolean);

    const instructions = newRecipe.instructions
      .map((x) => x.trim())
      .filter(Boolean);

    if (!name || !description || !prepTime) {
      alert("Name, description, and prep time are required.");
      return;
    }
    if (requiredIngredients.length === 0) {
      alert("Please add at least one ingredient.");
      return;
    }
    if (instructions.length === 0) {
      alert("Please add at least one instruction step.");
      return;
    }

    addCustomRecipe({
      name,
      description,
      prepTime,
      servings,
      requiredIngredients,
      instructions,
      imageUrl:
        newRecipe.imageUrl.trim() ||
        "https://images.unsplash.com/photo-1546548970-71785318a17b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    });

    setNewRecipe({
      name: "",
      description: "",
      prepTime: "",
      servings: 2,
      ingredients: [""],
      instructions: [""],
      imageUrl: "",
    });
    setShowCreateForm(false);
  };

  if (ingredients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="mb-2 text-gray-900">No Ingredients Yet</h2>
        <p className="text-gray-600 mb-6">
          Add ingredients to your inventory to get personalized meal suggestions
        </p>
        <button
          onClick={() => router.push("/inventory")}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Go to Inventory
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600 mt-1">
            {filteredSuggestions.length} recipe{filteredSuggestions.length !== 1 ? "s" : ""} match
            your inventory
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm((s) => !s)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Recipe
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-900 text-lg font-semibold">Create Custom Recipe</h3>
            <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitRecipe} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">Recipe Name *</label>
                <input
                  type="text"
                  required
                  value={newRecipe.name}
                  onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Grandma's Pasta"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">Prep Time *</label>
                <input
                  type="text"
                  required
                  value={newRecipe.prepTime}
                  onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 30 min"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">Servings *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newRecipe.servings}
                  onChange={(e) =>
                    setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">Image URL (optional)</label>
                <input
                  type="url"
                  value={newRecipe.imageUrl}
                  onChange={(e) => setNewRecipe({ ...newRecipe, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700">Description *</label>
              <textarea
                required
                value={newRecipe.description}
                onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={2}
                placeholder="Brief description of the recipe"
              />
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-700">Ingredients *</label>
                <button type="button" onClick={handleAddIngredient} className="text-sm text-green-600 hover:text-green-700">
                  + Add Ingredient
                </button>
              </div>

              <div className="space-y-2">
                {newRecipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleUpdateIngredient(index, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., pasta or tomatoes"
                    />
                    {newRecipe.ingredients.length > 1 && (
                      <button type="button" onClick={() => handleRemoveIngredient(index)} className="text-gray-400 hover:text-red-600">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-700">Instructions *</label>
                <button type="button" onClick={handleAddInstruction} className="text-sm text-green-600 hover:text-green-700">
                  + Add Step
                </button>
              </div>

              <div className="space-y-2">
                {newRecipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-2">
                      {index + 1}
                    </div>
                    <textarea
                      value={instruction}
                      onChange={(e) => handleUpdateInstruction(index, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={2}
                      placeholder="Describe this step..."
                    />
                    {newRecipe.instructions.length > 1 && (
                      <button type="button" onClick={() => handleRemoveInstruction(index)} className="text-gray-400 hover:text-red-600">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Create Recipe
              </button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Sort */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes by name or ingredient..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "match" | "expiry")}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="expiry">Expiring Soon</option>
              <option value="match">Best Match</option>
            </select>
          </div>
        </div>
      </div>

      {filteredSuggestions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <ChefHat className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          {searchQuery ? (
            <>
              <p className="text-gray-600 mb-2">No recipes found matching "{searchQuery}"</p>
              <button onClick={() => setSearchQuery("")} className="text-sm text-green-600 hover:text-green-700">
                Clear search
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-2">No recipe suggestions available</p>
              <p className="text-sm text-gray-500">Add more ingredients to your inventory to get suggestions</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuggestions.map((suggestion) => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} customRecipes={customRecipes} />
          ))}
        </div>
      )}
    </div>
  );
}

function SuggestionCard({ suggestion, customRecipes }: { suggestion: any; customRecipes: any[] }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const recipe =
    recipeDatabase.find((r: any) => r.id === suggestion.id) ||
    customRecipes.find((r: any) => r.id === suggestion.id);

  return (
    <div
      className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/recipe/${suggestion.id}`)}
    >
      <div className="relative h-48 bg-gray-200">
        {recipe?.imageUrl && !imageError ? (
          <img
            src={recipe.imageUrl}
            alt={suggestion.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setImageError(true);
            }}
            loading="lazy"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
            <ChefHat className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {suggestion.usesExpiringIngredients && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Uses expiring items
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-start gap-2">
              <h4 className="flex-1 font-semibold">{suggestion.name}</h4>
              {suggestion.usesExpiringIngredients && (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs whitespace-nowrap">
                  <AlertCircle className="w-3 h-3" />
                  <span>Use Soon</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{suggestion.prepTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{suggestion.servings} servings</span>
              </div>
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-2xl font-bold">{Math.round(suggestion.matchPercentage)}%</div>
            <div className="text-xs text-gray-600">match</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-1 text-sm text-green-700 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>You have ({suggestion.matchedIngredients.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {suggestion.matchedIngredients.map((ing: string, idx: number) => (
                <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded capitalize">
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {suggestion.missingIngredients.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                <XCircle className="w-4 h-4" />
                <span>You need ({suggestion.missingIngredients.length})</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestion.missingIngredients.map((ing: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded capitalize">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
