"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { adminApi, type AdminInventoryUser, type AdminInventoryItem } from "@/utils/api";
import {
  Package,
  ChevronDown,
  ChevronRight,
  User as UserIcon,
  Mail,
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Loader2,
} from "lucide-react";

export default function AdminInventoryPage() {
  const router = useRouter();
  const { isAdmin } = useUser();
  const [users, setUsers] = useState<AdminInventoryUser[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<AdminInventoryItem[]>([]);
  const [loadingExpanded, setLoadingExpanded] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/meals");
      return;
    }
    loadUsers();
  }, [isAdmin, router]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getInventoryUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserItems = useCallback(async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      setExpandedItems([]);
      return;
    }
    setLoadingExpanded(userId);
    try {
      const response = await adminApi.getAllInventory({
        user_id: userId,
        per_page: 100,
      });
      setExpandedUserId(userId);
      setExpandedItems(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setLoadingExpanded(null);
    }
  }, [expandedUserId]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="w-full mx-auto p-6">
      <button
        onClick={() => router.push("/admin")}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Package className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-orange-700 dark:text-orange-400">
              Inventory Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Click a user to view their inventory
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-gray-600 dark:text-gray-400">Loading users...</div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No users with inventory</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => loadUserItems(user.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="shrink-0">
                  {expandedUserId === user.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 shrink-0" />
                    {user.email}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {user.items_count} item{user.items_count !== 1 ? "s" : ""}
                  </span>
                  {user.low_stock_count > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      <AlertTriangle className="w-3 h-3" />
                      {user.low_stock_count} low stock
                    </span>
                  )}
                </div>
                {loadingExpanded === user.id && (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                )}
              </button>

              {expandedUserId === user.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                  {loadingExpanded === user.id ? (
                    <div className="p-6 text-center text-gray-500">Loading...</div>
                  ) : expandedItems.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No items</div>
                  ) : (
                    <div className="p-4 space-y-2">
                      {expandedItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {item.ingredient?.name ?? "—"}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>
                              {item.input_quantity} {item.input_unit}
                            </span>
                            {item.is_low_stock && (
                              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="w-3 h-3" />
                                Low
                              </span>
                            )}
                            {item.expiration_date ? (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(item.expiration_date).toLocaleDateString()}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
