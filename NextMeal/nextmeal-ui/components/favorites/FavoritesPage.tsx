"use client";

import { useInventory } from "@/context/InventoryContext";
import { recipeDatabase } from "../../data/recipe";
import type { Recipe } from "../../types";
import { Heart, Clock, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/recipe/${recipe.id}`)}
    >
      <div className="relative h-48 bg-gray-200">
        {recipe.imageUrl && !imageError ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
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
            <Heart className="w-16 h-16 text-gray-400" />
          </div>
        )}

        <div className="absolute top-2 right-2">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-2 font-semibold">{recipe.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FavoritesPage() {
  const router = useRouter();
  const { favorites, customRecipes } = useInventory();

  const favoriteRecipes = useMemo(() => {
    const allRecipes = [...recipeDatabase, ...customRecipes];
    return allRecipes.filter((r) => favorites.includes(r.id));
  }, [favorites, customRecipes]);

  if (favoriteRecipes.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-gray-600 mt-1">Your favorite recipes will appear here</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">You haven't added any favorites yet!</p>
          <button
            onClick={() => router.push("/meals")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-600 mt-1">
          {favoriteRecipes.length} favorite recipe{favoriteRecipes.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
