import { Edit, Copy, Trash2, GraduationCap, Book, Package, Crown, Laptop, Building, DollarSign } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProductWithOfferings } from "@shared/schema";

interface ProductCardProps {
  product: ProductWithOfferings;
  onEdit: () => void;
}

const productTypeIcons = {
  course: GraduationCap,
  book: Book,
  bundle: Package,
  membership: Crown,
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  draft: "bg-blue-100 text-blue-800",
  retired: "bg-gray-100 text-gray-800",
};

export function ProductCard({ product, onEdit }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const TypeIcon = productTypeIcons[product.productType as keyof typeof productTypeIcons] || Package;
  
  // Get the first offering for display (in a real app, you might want to show the primary offering)
  const primaryOffering = product.offerings[0];

  const deleteProductMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/products/${product.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const duplicateProductMutation = useMutation({
    mutationFn: async () => {
      const duplicateData = {
        ...product,
        productName: `${product.productName} (Copy)`,
        productId: `${product.productId}-copy-${Date.now()}`,
        id: undefined,
      };
      await apiRequest("POST", "/api/products", duplicateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product duplicated",
        description: "The product has been successfully duplicated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to duplicate product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate();
    }
  };

  const handleDuplicate = () => {
    duplicateProductMutation.mutate();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Product Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {product.productName}
            </h3>
            <p className="text-sm text-gray-500">SKU: {product.productId}</p>
          </div>
          <Badge className={statusColors[product.lifecycleStatus as keyof typeof statusColors]}>
            {product.lifecycleStatus}
          </Badge>
        </div>
        
        {/* Product Details */}
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <TypeIcon className="text-gray-400 w-4 h-4 mr-2" />
            <span className="text-gray-600">Type:</span>
            <span className="ml-2 font-medium capitalize">{product.productType}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Laptop className="text-gray-400 w-4 h-4 mr-2" />
            <span className="text-gray-600">Format:</span>
            <span className="ml-2 font-medium capitalize">{product.format}</span>
          </div>
          
          {primaryOffering?.brand && (
            <div className="flex items-center text-sm">
              <Building className="text-gray-400 w-4 h-4 mr-2" />
              <span className="text-gray-600">Brand:</span>
              <span className="ml-2 font-medium">{primaryOffering.brand}</span>
            </div>
          )}
          
          {primaryOffering?.price && (
            <div className="flex items-center text-sm">
              <DollarSign className="text-gray-400 w-4 h-4 mr-2" />
              <span className="text-gray-600">Price:</span>
              <span className="ml-2 font-medium text-primary-600">
                {primaryOffering.currency} {primaryOffering.price}
                {primaryOffering.pricingModel === 'subscription' && '/mo'}
              </span>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-primary-500 hover:text-primary-600 hover:bg-primary-50"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDuplicate}
              disabled={duplicateProductMutation.isPending}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteProductMutation.isPending}
              className="text-gray-400 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
