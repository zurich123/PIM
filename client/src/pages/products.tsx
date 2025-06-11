import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ProductCard } from "@/components/products/product-card";
import { ProductForm } from "@/components/products/product-form";
import { ProductFilters } from "@/components/products/product-filters";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductWithOfferings } from "@shared/schema";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    productType: "",
    lifecycleStatus: "",
    format: "",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithOfferings | null>(null);

  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.set("search", searchQuery);
  if (filters.productType) queryParams.set("productType", filters.productType);
  if (filters.lifecycleStatus) queryParams.set("lifecycleStatus", filters.lifecycleStatus);
  if (filters.format) queryParams.set("format", filters.format);

  const { data: products = [], isLoading } = useQuery<ProductWithOfferings[]>({
    queryKey: ["/api/products", queryParams.toString()],
  });

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsCreateModalOpen(true);
  };

  const handleEditProduct = (product: ProductWithOfferings) => {
    setEditingProduct(product);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingProduct(null);
  };

  const handleClearFilters = () => {
    setFilters({
      productType: "",
      lifecycleStatus: "",
      format: "",
    });
    setSearchQuery("");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateProduct={handleCreateProduct}
          productCount={products.length}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <ProductFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
          />
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="space-y-3">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <Skeleton className="h-8 w-16" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No products found</div>
              <p className="text-gray-400 mb-4">
                {searchQuery || Object.values(filters).some(f => f) 
                  ? "Try adjusting your search or filters"
                  : "Create your first product to get started"
                }
              </p>
              {!searchQuery && !Object.values(filters).some(f => f) && (
                <button 
                  onClick={handleCreateProduct}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
                >
                  Create Product
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={() => handleEditProduct(product)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ProductForm
            product={editingProduct}
            onClose={handleCloseModal}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
