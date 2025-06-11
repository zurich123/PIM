import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductFiltersProps {
  filters: {
    productType: string;
    lifecycleStatus: string;
    format: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export function ProductFilters({ filters, onFiltersChange, onClearFilters }: ProductFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Product Type:</label>
          <Select
            value={filters.productType}
            onValueChange={(value) => handleFilterChange("productType", value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="course">Course</SelectItem>
              <SelectItem value="book">Book</SelectItem>
              <SelectItem value="bundle">Bundle</SelectItem>
              <SelectItem value="membership">Membership</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <Select
            value={filters.lifecycleStatus}
            onValueChange={(value) => handleFilterChange("lifecycleStatus", value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Format:</label>
          <Select
            value={filters.format}
            onValueChange={(value) => handleFilterChange("format", value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Formats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Formats</SelectItem>
              <SelectItem value="digital">Digital</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="ghost"
          onClick={onClearFilters}
          className="text-primary-500 hover:text-primary-600"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
