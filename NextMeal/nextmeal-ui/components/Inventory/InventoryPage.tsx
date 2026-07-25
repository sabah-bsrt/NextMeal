"use client";

import { useMemo, useState } from "react";
import { useInventory } from "../../context/InventoryContext";
import {
  Package,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  TrendingDown,
  Edit2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import type { Ingredient } from "../../types";
import { getIngredientDefaults, ingredientDefaults } from "../../data/ingredientDefaults";

export function InventoryPage() {
  const { ingredients, addIngredient, removeIngredient, updateIngredient, getLowStockItems } =
    useInventory();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "quantity" | "expiry">("expiry");
  const [filterBy, setFilterBy] = useState<"all" | "expiring" | "low-stock">("all");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "",
    expiryDate: "",
    category: "",
    daysUntilExpiry: undefined as number | undefined,
  });

  const [editFormData, setEditFormData] = useState({
    quantity: "",
    expiryDate: "",
  });

  const lowStockItems = getLowStockItems();

  const filteredSuggestions = useMemo(() => {
    if (!formData.name.trim() || !showSuggestions) return [];
    const query = formData.name.toLowerCase();
    return Object.keys(ingredientDefaults)
      .filter((key) => key.includes(query))
      .slice(0, 10);
  }, [formData.name, showSuggestions]);

  const selectIngredient = (ingredientName: string) => {
    const defaults = getIngredientDefaults(ingredientName);
    const updatedFormData: any = {
      name: ingredientName,
      unit: defaults.unit,
      category: defaults.category,
      daysUntilExpiry: defaults.daysUntilExpiry,
    };

    const today = new Date();
    const days = defaults.daysUntilExpiry ?? 7;
    const expiryDate = new Date(today.setDate(today.getDate() + days));
    updatedFormData.expiryDate = expiryDate.toISOString().split("T")[0];

    setFormData((prev) => ({ ...prev, ...updatedFormData }));
    setShowSuggestions(false);
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: "expired", days: Math.abs(diffDays), color: "text-red-600" };
    if (diffDays === 0) return { status: "today", days: 0, color: "text-red-500" };
    if (diffDays <= 3) return { status: "soon", days: diffDays, color: "text-orange-500" };
    return { status: "fresh", days: diffDays, color: "text-green-600" };
  };

  const filteredAndSortedIngredients = useMemo(() => {
    let filtered = ingredients.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterBy === "expiring") {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      filtered = filtered.filter((item) => new Date(item.expiryDate) <= threeDaysFromNow);
    } else if (filterBy === "low-stock") {
      const lowStockIds = lowStockItems.map((item) => item.id);
      filtered = filtered.filter((item) => lowStockIds.includes(item.id));
    }

    return filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "quantity") return b.quantity - a.quantity;
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });
  }, [ingredients, searchQuery, sortBy, filterBy, lowStockItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.name.trim();
    if (!name) return;

    const existingIngredient = ingredients.find(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );

    const qty = parseFloat(formData.quantity);
    if (!Number.isFinite(qty) || qty <= 0) return;

    if (existingIngredient) {
      updateIngredient(existingIngredient.id, {
        quantity: existingIngredient.quantity + qty,
        expiryDate: formData.expiryDate,
      });
    } else {
      const newIngredient: Ingredient = {
        id: Date.now().toString(),
        name,
        quantity: qty,
        unit: formData.unit.trim() || "pcs",
        expiryDate: formData.expiryDate,
      };
      addIngredient(newIngredient);
    }

    setFormData({
      name: "",
      quantity: "",
      unit: "",
      expiryDate: "",
      category: "",
      daysUntilExpiry: undefined,
    });
    setShowAddForm(false);
  };

  const handleStartEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setEditFormData({
      quantity: ingredient.quantity.toString(),
      expiryDate: ingredient.expiryDate,
    });
  };

  const handleSaveEdit = (id: string) => {
    const qty = parseFloat(editFormData.quantity);
    if (!Number.isFinite(qty) || qty <= 0) return;

    updateIngredient(id, {
      quantity: qty,
      expiryDate: editFormData.expiryDate,
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => setEditingId(null);

  const expiringCount = ingredients.filter((item) => {
    const status = getExpiryStatus(item.expiryDate);
    return status.status === "soon" || status.status === "today" || status.status === "expired";
  }).length;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">My Inventory</h1>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Ingredient
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{ingredients.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-500">{expiringCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-red-500">{lowStockItems.length}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
                <p className="text-sm text-red-700 mt-1">
                  {lowStockItems.length} item{lowStockItems.length !== 1 ? "s are" : " is"} running low:{" "}
                  {lowStockItems.map((item) => item.name).join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Ingredient</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name + Suggestions */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">Ingredient Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({ ...formData, name });
                      setShowSuggestions(name.trim().length > 0);
                    }}
                    onFocus={() => {
                      if (formData.name.trim().length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Start typing to see suggestions..."
                  />

                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredSuggestions.map((suggestion) => {
                        const defaults = getIngredientDefaults(suggestion);
                        return (
                          <div
                            key={suggestion}
                            className="px-3 py-2 cursor-pointer hover:bg-green-50 border-b border-gray-100 last:border-b-0"
                            onClick={() => selectIngredient(suggestion)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium capitalize">{suggestion}</span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                {defaults.category}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Unit: <span className="font-medium">{defaults.unit}</span>
                              {defaults.daysUntilExpiry && (
                                <span>
                                  {" "}
                                  • Shelf life:{" "}
                                  <span className="font-medium">{defaults.daysUntilExpiry} days</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    step="1"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d+$/.test(value)) {
                        setFormData({ ...formData, quantity: value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 5"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Unit
                    {formData.unit && (
                      <span className="ml-2 text-xs text-gray-500">(Default: {formData.unit})</span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., pieces, kg, cups"
                  />
                </div>

                {/* Expiry */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Expiry Date
                    {formData.daysUntilExpiry && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Shelf life: {formData.daysUntilExpiry} days)
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {formData.category && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Category:</span> {formData.category}
                    {formData.daysUntilExpiry && (
                      <span>
                        {" "}
                        • <span className="font-semibold">Typical shelf life:</span>{" "}
                        {formData.daysUntilExpiry} days
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Ingredient
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Search ingredients..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Filter By</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Items</option>
                <option value="expiring">Expiring Soon</option>
                <option value="low-stock">Low Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="expiry">Expiry Date</option>
                <option value="name">Name</option>
                <option value="quantity">Quantity</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory List */}
      {filteredAndSortedIngredients.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No ingredients found</h3>
          <p className="text-gray-600">
            {searchQuery || filterBy !== "all"
              ? "Try adjusting your search or filters"
              : "Start by adding some ingredients to your inventory"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Ingredient
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Quantity
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Expiry Date
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedIngredients.map((item) => {
                  const expiryStatus = getExpiryStatus(item.expiryDate);
                  const isLowStock = lowStockItems.some((i) => i.id === item.id);
                  const isEditing = editingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {isLowStock && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              Low Stock
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={editFormData.quantity}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || /^\d+$/.test(value)) {
                                setEditFormData({ ...editFormData, quantity: value });
                              }
                            }}
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <span>
                            {item.quantity} {item.unit}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editFormData.expiryDate}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, expiryDate: e.target.value })
                            }
                            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${expiryStatus.color}`}>
                          {expiryStatus.status === "expired" && `Expired ${expiryStatus.days} days ago`}
                          {expiryStatus.status === "today" && "Expires today"}
                          {expiryStatus.status === "soon" && `Expires in ${expiryStatus.days} days`}
                          {expiryStatus.status === "fresh" && `Fresh (${expiryStatus.days} days)`}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeIngredient(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}