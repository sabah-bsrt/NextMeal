'use client';

import { useRouter } from 'next/navigation';
import { recipeDatabase } from '../data/recipes';
import { ArrowLeft, Clock, Users, CheckCircle2, Heart, ChefHat } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useState } from 'react';

export function RecipePage({ recipeId }: { recipeId: string }) {
  const router = useRouter();
  const { toggleFavorite, isFavorite, customRecipes } = useInventory();
  const [imageError, setImageError] = useState(false);

  const allRecipes = [...recipeDatabase, ...customRecipes];
  const recipe = allRecipes.find(r => r.id === recipeId);
  const favorite = recipe ? isFavorite(recipe.id) : false;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
  };

  if (!recipe) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <p className="text-gray-600">Recipe not found</p>
        <button
          onClick={() => router.push('/suggestions')}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Suggestions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Recipe Image */}
        <div className="relative h-96 bg-gray-200">
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
              <ChefHat className="w-24 h-24 text-gray-400" />
            </div>
          )}
          <button
            onClick={() => toggleFavorite(recipe.id)}
            className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
            title={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart 
              className={`w-6 h-6 ${favorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
            />
          </button>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5" />
              <span>{recipe.prepTime}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="w-5 h-5" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>
          <p className="text-gray-700">{recipe.description}</p>
        </div>

        <div className="p-8">
          {/* Ingredients */}
          <div className="mb-8">
            <h3 className="mb-4 text-gray-900">Ingredients</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3">
                {recipe.ingredientDetails.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <span className="capitalize">{item.ingredient}</span> - {item.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="mb-4 text-gray-900">Instructions</h3>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 pt-1">{instruction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}