import { Search, Plus, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateProduct: () => void;
  productCount: number;
}

export function Header({ searchQuery, onSearchChange, onCreateProduct, productCount }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="md:hidden text-gray-500 hover:text-gray-700">
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-900">Products</h2>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
            {productCount} total
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10 w-80"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          {/* Action Buttons */}
          <Button onClick={onCreateProduct} className="bg-primary-500 hover:bg-primary-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>
    </header>
  );
}
