import { useState } from "react";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/sidebar";

export default function Categories() {
  const [categories] = useState([
    {
      id: 1,
      name: "Professional Development",
      description: "Courses and materials for career advancement",
      productCount: 15,
      color: "blue"
    },
    {
      id: 2,
      name: "Technical Skills",
      description: "Programming and technology courses",
      productCount: 23,
      color: "green"
    },
    {
      id: 3,
      name: "Business & Finance",
      description: "Business strategy and financial literacy",
      productCount: 8,
      color: "purple"
    },
    {
      id: 4,
      name: "Health & Wellness",
      description: "Health education and wellness programs",
      productCount: 12,
      color: "red"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold text-gray-900">Categories</h2>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                {categories.length} total
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search categories..."
                  className="w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Action Buttons */}
              <Button className="bg-primary-500 hover:bg-primary-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No categories found</div>
              <p className="text-gray-400 mb-4">
                {searchQuery 
                  ? "Try adjusting your search" 
                  : "Create your first category to organize products"
                }
              </p>
              {!searchQuery && (
                <Button className="bg-primary-500 hover:bg-primary-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Category
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${category.color}-100`}>
                          <Tag className={`h-5 w-5 text-${category.color}-600`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            {category.name}
                          </CardTitle>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.productCount} products
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm mb-4">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary-500 hover:text-primary-600 hover:bg-primary-50"
                      >
                        View Products
                      </Button>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}