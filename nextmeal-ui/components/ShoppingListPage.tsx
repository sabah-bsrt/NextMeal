'use client';

import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { ShoppingCart, Plus, Trash2, Check, AlertCircle, TrendingDown, Package, CheckCircle2, Circle, Sparkles, AlertTriangle } from 'lucide-react';
import { ingredientDefaults } from '../data/ingredientDefaults';

export function ShoppingListPage() {
  const { 
    shoppingList, 
    addToShoppingList, 
    removeFromShoppingList, 
    toggleShoppingItemCompleted, 
    clearCompletedItems,
    getLowStockItems 
  } = useInventory();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    unit: 'pieces',
    quantity: 1,
  });
  const [recommendedQuantities, setRecommendedQuantities] = useState<Record<string, number>>({});

  const categories = ['Vegetables', 'Protein', 'Dairy', 'Grains', 'Pantry', 'Other'];
  const units = ['pieces', 'g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'box', 'bag', 'bottle', 'can', 'head', 'bulb', 'bunch', 'slices', 'cloves'];

  const lowStockItems = getLowStockItems();

  // Auto-populate category and unit when ingredient name changes
  const handleNameChange = (name: string) => {
    setFormData(prev => {
      const defaults = ingredientDefaults[name];
      return {
        ...prev,
        name,
        category: defaults?.category || 'Vegetables',
        unit: defaults?.unit || 'pieces',
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToShoppingList({
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      quantity: formData.quantity,
      checked: false,
      fromRecommendations: false,
    });
    setFormData({
      name: '',
      category: 'Vegetables',
      unit: 'pieces',
      quantity: 1,
    });
    setShowForm(false);
  };

  const addRecommendedItem = (item: { id: string; name: string; category: string; unit: string; threshold: number }) => {
    // Check if already in shopping list
    const exists = shoppingList.some(
      shoppingItem => shoppingItem.name.toLowerCase() === item.name.toLowerCase()
    );
    
    if (!exists) {
      const quantity = recommendedQuantities[item.id] || item.threshold;
      addToShoppingList({
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantity,
        checked: false,
        fromRecommendations: true,
      });
    }
  };

  const getRecommendedQuantity = (id: string, defaultValue: number) => {
    return recommendedQuantities[id] !== undefined ? recommendedQuantities[id] : defaultValue;
  };

  const updateRecommendedQuantity = (id: string, value: number) => {
    setRecommendedQuantities(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const uncheckedItems = shoppingList.filter(item => !item.checked);
  const checkedItems = shoppingList.filter(item => item.checked);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600 mt-1">
            {uncheckedItems.length} item{uncheckedItems.length !== 1 ? 's' : ''} to buy
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
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Recommendations for low stock items */}
      {lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-sm border border-yellow-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-600" />
            <h3 className="text-yellow-900">Recommended Items</h3>
          </div>
          <p className="text-sm text-yellow-800 mb-4">These items are running low in your inventory:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lowStockItems.map((item, index) => {
              const alreadyInList = shoppingList.some(
                shoppingItem => shoppingItem.name.toLowerCase() === item.name.toLowerCase()
              );
              // Use item.id as primary key, fallback to index if somehow missing
              const itemKey = item.id || `low-stock-${index}`;
              return (
                <div
                  key={itemKey}
                  className="bg-white rounded-lg p-4"
                >
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
                      min="1"
                      value={getRecommendedQuantity(item.id, item.threshold)}
                      onChange={(e) => updateRecommendedQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="w-20 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      disabled={alreadyInList}
                    />
                    <span className="text-sm text-gray-600">{item.unit}</span>
                    <button
                      onClick={() => addRecommendedItem(item)}
                      disabled={alreadyInList}
                      className={`ml-auto text-sm px-3 py-1 rounded transition-colors ${
                        alreadyInList
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-yellow-600 text-white hover:bg-yellow-700'
                      }`}
                    >
                      {alreadyInList ? 'Added' : 'Add'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="mb-4">Add Shopping Item</h3>
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
                min="1"
                step="0.1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
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
        </div>
      )}

      {/* Shopping list items */}
      <div className="space-y-6">
        {/* Unchecked items */}
        {uncheckedItems.length > 0 && (
          <div>
            <h3 className="mb-3 text-gray-700">To Buy</h3>
            <div className="bg-white rounded-lg shadow-sm border divide-y">
              {uncheckedItems.map(item => (
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
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checked items */}
        {checkedItems.length > 0 && (
          <div>
            <h3 className="mb-3 text-gray-500">Checked Off</h3>
            <div className="bg-white rounded-lg shadow-sm border divide-y opacity-75">
              {checkedItems.map(item => (
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
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {shoppingList.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Your shopping list is empty</p>
            <p className="text-sm text-gray-500">
              {lowStockItems.length > 0 
                ? 'Add recommended items above or create your own'
                : 'Add items to keep track of what you need to buy'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}