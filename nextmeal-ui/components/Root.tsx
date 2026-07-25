import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router';
import { getCurrentUser, logout, isAuthenticated } from '../utils/auth';
import { Package, Sparkles, Heart, ShoppingCart, User, LogOut, AlertCircle, ChefHat } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { ingredients, getLowStockItems } = useInventory();
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    setLowStockCount(getLowStockItems().length);
  }, [ingredients, getLowStockItems]);

  useEffect(() => {
    // Redirect to login if not authenticated and not on login page
    if (!isAuthenticated() && location.pathname !== '/login' && location.pathname !== '/') {
      navigate('/login');
    }
    // Redirect to suggestions if authenticated and on login page
    if (isAuthenticated() && (location.pathname === '/login' || location.pathname === '/')) {
      navigate('/suggestions');
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show nav on login page
  const isLoginPage = location.pathname === '/login' || location.pathname === '/';

  const navItems = [
    { path: '/suggestions', label: 'Meal Suggestions', icon: Sparkles },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/favorites', label: 'Favorites', icon: Heart },
    { path: '/shopping', label: 'Shopping List', icon: ShoppingCart },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoginPage && user && (
        <nav className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link to="/suggestions" className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors">
                <ChefHat className="w-8 h-8" />
                <span className="text-xl font-semibold">NextMeal</span>
              </Link>

              {/* Navigation */}
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const showBadge = item.path === '/shopping' && lowStockCount > 0;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors relative ${
                        isActive
                          ? 'bg-green-50 text-green-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden sm:inline">{item.label}</span>
                      {showBadge && (
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {lowStockCount}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {/* User Menu */}
                <div className="ml-4 pl-4 border-l flex items-center gap-3">
                  <span className="text-sm text-gray-700 hidden sm:inline">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Alert Banner */}
          {lowStockCount > 0 && location.pathname !== '/shopping' && (
            <div className="bg-orange-50 border-t border-orange-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <Link
                  to="/shopping"
                  className="flex items-center gap-2 text-sm text-orange-700 hover:text-orange-800"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    {lowStockCount} {lowStockCount === 1 ? 'item is' : 'items are'} running low. View shopping list →
                  </span>
                </Link>
              </div>
            </div>
          )}
        </nav>
      )}

      <main className={isLoginPage ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        <Outlet />
      </main>
    </div>
  );
}