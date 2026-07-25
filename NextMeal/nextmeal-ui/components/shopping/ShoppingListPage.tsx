"use client";

import { useMemo, useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { ingredientDefaults } from "@/data/ingredientDefaults";

const CATEGORIES = ["Vegetables", "Protein", "Dairy", "Grains", "Pantry", "Other"] as const;
const UNITS = [
  "pieces", "g", "kg", "ml", "l", "cup", "tbsp", "tsp", "box", "bag", "bottle",
  "can", "head", "bulb", "bunch", "slices", "cloves",
] as const;

const LOW_STOCK_THRESHOLD = 2;

export function ShoppingListPage() {
  const {
    ingredients,
    shoppingList,
    addToShoppingList,
    removeFromShoppingList,
    toggleShoppingItemCompleted,
    clearCompletedItems,
  } = useInventory();

  const [showForm, setShowForm] = useState(false);
  const [recommendedQuantities, setRecommendedQuantities] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState({
    name: "",
    category: "Vegetables",
    unit: "pieces",
    quantity: 1,
  });

  const lowStockItems = useMemo(() => {
    return ingredients
      .filter((x) => x.quantity <= LOW_STOCK_THRESHOLD)
      .map((x) => {
        const key = x.name.toLowerCase().trim();
        const defaults = ingredientDefaults[key];
        return {
          id: x.id,
          name: x.name,
          unit: x.unit,
          current: x.quantity,
          threshold: LOW_STOCK_THRESHOLD,
          category: defaults?.category || "Other",
        };
      });
  }, [ingredients]);

  const uncheckedItems = useMemo(
    () => shoppingList.filter((x) => !x.checked),
    [shoppingList]
  );
  const checkedItems = useMemo(
    () => shoppingList.filter((x) => x.checked),
    [shoppingList]
  );

  const handleNameChange = (name: string) => {
    const key = name.toLowerCase().trim();
    const defaults = ingredientDefaults[key];
    setFormData((prev) => ({
      ...prev,
      name,
      category: defaults?.category || "Vegetables",
      unit: defaults?.unit || "pieces",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.name.trim();
    if (!name) return;

    addToShoppingList({
      name,
      category: formData.category,
      unit: formData.unit,
      quantity: formData.quantity,
      checked: false,
      fromRecommendations: false,
    });

    setFormData({ name: "", category: "Vegetables", unit: "pieces", quantity: 1 });
    setShowForm(false);
  };

  const updateRecommendedQuantity = (id: string, value: number) => {
    setRecommendedQuantities((prev) => ({ ...prev, [id]: value }));
  };

  const addRecommendedItem = (item: {
    id: string;
    name: string;
    category: string;
    unit: string;
    threshold: number;
  }) => {
    const exists = shoppingList.some(
      (x) => x.name.toLowerCase().trim() === item.name.toLowerCase().trim()
    );
    if (exists) return;

    const quantity = recommendedQuantities[item.id] ?? item.threshold;

    addToShoppingList({
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity,
      checked: false,
      fromRecommendations: true,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600 mt-1">
            {uncheckedItems.length} item{uncheckedItems.length !== 1 ? "s" : ""} to buy
            {checkedItems.length > 0 && `, ${checkedItems.length} checked off`}
          </p>
        </div>

        <div className="flex gap-2">
          {checkedItems.length > 0 && (
            <button
              onClick={clearCompletedItems}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Checked
            </button>
          )}

          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Recommendations */}
      {lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-sm border border-yellow-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-600" />
            <h3 className="text-yellow-900 font-semibold">Recommended Items</h3>
          </div>

          <p className="text-sm text-yellow-800 mb-4">
            These items are running low in your inventory:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lowStockItems.map((item) => {
              const alreadyInList = shoppingList.some(
                (x) => x.name.toLowerCase().trim() === item.name.toLowerCase().trim()
              );

              return (
                <div key={item.id} className="bg-white rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium capitalize text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          Current: {item.current} {item.unit}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={recommendedQuantities[item.id] ?? item.threshold}
                      onChange={(e) =>
                        updateRecommendedQuantity(item.id, parseInt(e.target.value) || 1)
                      }
                      className="w-20 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      disabled={alreadyInList}
                    />
                    <span className="text-sm text-gray-600">{item.unit}</span>

                    <button
                      onClick={() => addRecommendedItem(item)}
                      disabled={alreadyInList}
                      className={`ml-auto text-sm px-3 py-1 rounded transition-colors ${
                        alreadyInList
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-yellow-600 text-white hover:bg-yellow-700"
                      }`}
                    >
                      {alreadyInList ? "Added" : "Add"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="mb-4 font-semibold">Add Shopping Item</h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm mb-1 text-gray-700">Item Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., milk"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700">Quantity</label>
              <input
                type="number"
                required
                min={1}
                step={0.1}
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quantity: parseFloat(e.target.value) || 1,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-4">
            <label className="block text-sm mb-1 text-gray-700">Unit</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
              className="w-full md:w-64 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-6">
        {/* Unchecked */}
        {uncheckedItems.length > 0 && (
          <div>
            <h3 className="mb-3 text-gray-700 font-semibold">To Buy</h3>
            <div className="bg-white rounded-lg shadow-sm border divide-y">
              {uncheckedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleShoppingItemCompleted(item.id)}
                      className="text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <Circle className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <p className="capitalize text-gray-900">{item.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600">
                          {item.quantity} {item.unit} • {item.category}
                        </p>
                        {item.fromRecommendations && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromShoppingList(item.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checked */}
        {checkedItems.length > 0 && (
          <div>
            <h3 className="mb-3 text-gray-500 font-semibold">Checked Off</h3>
            <div className="bg-white rounded-lg shadow-sm border divide-y opacity-75">
              {checkedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleShoppingItemCompleted(item.id)}
                      className="text-green-600 hover:text-gray-400 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <p className="capitalize text-gray-500 line-through">{item.name}</p>
                      <p className="text-sm text-gray-400">
                        {item.quantity} {item.unit} • {item.category}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromShoppingList(item.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {shoppingList.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Your shopping list is empty</p>
            <p className="text-sm text-gray-500">
              {lowStockItems.length > 0
                ? "Add recommended items above or create your own"
                : "Add items to keep track of what you need to buy"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
