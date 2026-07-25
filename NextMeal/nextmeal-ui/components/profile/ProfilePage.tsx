"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, updateUserProfile, type CurrentUser } from "@/utils/auth";
import { User, Mail, Save, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Load user on client
  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
    setFormData({ name: u.name, email: u.email });
  }, [router]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const updated = updateUserProfile(user.id, {
        name: formData.name,
        email: formData.email,
      });

      setUser(updated);
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

      // اگر nav اسم کاربر رو از localStorage می‌خونه و رندر نمی‌شه:
      // یک refresh سبک:
      router.refresh();
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleCancel = () => {
    setFormData({ name: user.name, email: user.email });
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
          <Check className="w-5 h-5" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-900">Profile Information</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4" />
                    <span>Name</span>
                  </div>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </div>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="your@email.com"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <p className="text-sm text-gray-600">Name</p>
                </div>
                <p className="text-gray-900">{user.name}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <p className="text-sm text-gray-600">Email</p>
                </div>
                <p className="text-gray-900">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-blue-900 mb-2">About NextMeal</h4>
        <p className="text-sm text-blue-800 mb-2">
          NextMeal helps you reduce food waste by suggesting meals based on ingredients that are about to expire.
        </p>
        <p className="text-sm text-blue-800">
          All your data is stored locally in your browser. We don't collect or share any personal information.
        </p>
      </div>
    </div>
  );
}
