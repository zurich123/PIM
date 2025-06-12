import { Box, BarChart3, Tags, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/products" && (location === "/" || location === "/products")) {
      return true;
    }
    return location === path;
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-72 bg-white border-r border-gray-200">
        {/* Logo and Brand */}
        <div className="flex items-center px-6 py-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <Box className="text-white text-lg" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-semibold text-gray-900">ProductFlow</h1>
              <span className="text-sm text-gray-500">Product Management</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            to="/products"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
              isActive("/products")
                ? "text-white bg-primary-500"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Box className="mr-3 h-5 w-5" />
            Products
          </Link>
          <Link 
            to="/categories"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
              isActive("/categories")
                ? "text-white bg-primary-500"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Tags className="mr-3 h-5 w-5" />
            Categories
          </Link>
          <Link 
            to="/analytics"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
              isActive("/analytics")
                ? "text-white bg-primary-500"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <BarChart3 className="mr-3 h-5 w-5" />
            Analytics
          </Link>
          <a 
            href="#" 
            className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </a>
        </nav>

        {/* User Profile */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"} 
                alt="User profile" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900">{user?.name || 'User'}</span>
                <p className="text-xs text-gray-500">{user?.email || ''}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2 h-auto"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
