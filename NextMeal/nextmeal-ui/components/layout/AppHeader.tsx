"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChefHat, Package, Heart, ShoppingCart, User, LogOut } from "lucide-react";
import { getCurrentUser, logout, type CurrentUser } from "@/utils/auth";

function NavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        active ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/");
    router.refresh();
  };

  const hideHeader = pathname === "/";
  if (hideHeader) return null;

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/inventory" className="flex items-center gap-2">
          <ChefHat className="w-7 h-7 text-green-600" />
          <span className="font-bold text-gray-900">NextMeal</span>
        </Link>

        <nav className="flex items-center gap-2 ml-4 overflow-x-auto">
          <NavItem
            href="/inventory"
            label="Inventory"
            icon={<Package className="w-4 h-4" />}
            active={pathname === "/inventory"}
          />
          <NavItem
            href="/meals"
            label="Meals"
            icon={<ChefHat className="w-4 h-4" />}
            active={pathname === "/meals" || pathname.startsWith("/recipe")}
          />
          <NavItem
            href="/shopping"
            label="Shopping"
            icon={<ShoppingCart className="w-4 h-4" />}
            active={pathname === "/shopping"}
          />
          <NavItem
            href="/favorites"
            label="Favorites"
            icon={<Heart className="w-4 h-4" />}
            active={pathname === "/favorites"}
          />
          <NavItem
            href="/profile"
            label="Profile"
            icon={<User className="w-4 h-4" />}
            active={pathname === "/profile"}
          />
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user && (
            <div className="hidden md:block text-right">
              <div className="text-sm font-semibold text-gray-900 leading-4">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
