import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { X } from "lucide-react";
import { insertProductSchema, insertProductOfferingSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { ProductWithOfferings } from "@shared/schema";

interface ProductFormProps {
  product?: ProductWithOfferings | null;
  onClose: () => void;
}

const productFormSchema = insertProductSchema.extend({
  // Offering fields
  brand: z.string().optional(),
  professions: z.string().optional(),
  deliveryMethod: z.string().optional(),
  accessPeriod: z.number().optional(),
  accessPeriodType: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().default("USD"),
  pricingModel: z.string().optional(),
  commercialAvailability: z.boolean().default(true),
  channelVisibility: z.array(z.string()).default([]),
  approvedJurisdictions: z.string().optional(),
  creditEligibility: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export function ProductForm({ product, onClose }: ProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!product;
  const primaryOffering = product?.offerings?.[0];

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productName: product?.productName || "",
      productId: product?.productId || "",
      productType: product?.productType || "",
      format: product?.format || "",
      lifecycleStatus: product?.lifecycleStatus || "draft",
      membershipFlag: product?.membershipFlag || false,
      membershipEntitlements: product?.membershipEntitlements || "",
      bundleEntitlements: product?.bundleEntitlements || "",
      revenueRecognitionCode: product?.revenueRecognitionCode || "",
      reportingTags: product?.reportingTags || [],
      // Offering fields
      brand: primaryOffering?.brand || "",
      professions: primaryOffering?.professions?.join(", ") || "",
      deliveryMethod: primaryOffering?.deliveryMethod || "",
      accessPeriod: primaryOffering?.accessPeriod || undefined,
      accessPeriodType: primaryOffering?.accessPeriodType || "",
      price: primaryOffering?.price || "",
      currency: primaryOffering?.currency || "USD",
      pricingModel: primaryOffering?.pricingModel || "",
      commercialAvailability: primaryOffering?.commercialAvailability ?? true,
      channelVisibility: primaryOffering?.channelVisibility || [],
      approvedJurisdictions: primaryOffering?.approvedJurisdictions?.join(", ") || "",
      creditEligibility: primaryOffering?.creditEligibility || false,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Separate product and offering data
      const productData = {
        productName: data.productName,
        productId: data.productId,
        productType: data.productType,
        format: data.format,
        lifecycleStatus: data.lifecycleStatus,
        membershipFlag: data.membershipFlag,
        membershipEntitlements: data.membershipEntitlements,
        bundleEntitlements: data.bundleEntitlements,
        revenueRecognitionCode: data.revenueRecognitionCode,
        reportingTags: data.reportingTags,
      };

      const offeringData = {
        brand: data.brand,
        professions: data.professions ? data.professions.split(",").map(p => p.trim()) : [],
        deliveryMethod: data.deliveryMethod,
        accessPeriod: data.accessPeriod,
        accessPeriodType: data.accessPeriodType,
        price: data.price,
        currency: data.currency,
        pricingModel: data.pricingModel,
        commercialAvailability: data.commercialAvailability,
        channelVisibility: data.channelVisibility,
        approvedJurisdictions: data.approvedJurisdictions ? data.approvedJurisdictions.split(",").map(j => j.trim()) : [],
        creditEligibility: data.creditEligibility,
      };

      if (isEditing && product) {
        // Update existing product
        await apiRequest("PATCH", `/api/products/${product.id}`, productData);
        
        if (primaryOffering) {
          // Update existing offering
          await apiRequest("PATCH", `/api/offerings/${primaryOffering.id}`, offeringData);
        } else {
          // Create new offering
          await apiRequest("POST", `/api/products/${product.id}/offerings`, {
            ...offeringData,
            productId: product.id,
          });
        }
      } else {
        // Create new product
        const newProduct = await apiRequest("POST", "/api/products", productData);
        const productResult = await newProduct.json();
        
        // Create offering for new product
        await apiRequest("POST", `/api/products/${productResult.id}/offerings`, {
          ...offeringData,
          productId: productResult.id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: isEditing ? "Product updated" : "Product created",
        description: `The product has been successfully ${isEditing ? "updated" : "created"}.`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? "update" : "create"} product.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  const membershipFlag = form.watch("membershipFlag");
  const bundleFlag = form.watch("bundleEntitlements");

  return (
    <div className="max-w-4xl w-full">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">
          {isEditing ? "Edit Product" : "Create New Product"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">
          
          {/* Base Product Attributes Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Base Product Attributes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product ID (SKU) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter SKU" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="book">Book</SelectItem>
                        <SelectItem value="bundle">Bundle</SelectItem>
                        <SelectItem value="membership">Membership</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="physical">Physical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lifecycleStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lifecycle Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="revenueRecognitionCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue Recognition Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
            </div>
            
            {/* Membership and Bundle Flags */}
            <div className="mt-6 space-y-4">
              <FormField
                control={form.control}
                name="membershipFlag"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>This is a membership product</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              {membershipFlag && (
                <div className="ml-6">
                  <FormField
                    control={form.control}
                    name="membershipEntitlements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Membership Entitlements</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Define included content for membership"
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              <FormField
                control={form.control}
                name="bundleEntitlements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bundle Entitlements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Define included content for bundle (leave empty if not a bundle)"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Offering-Level Attributes Section */}
          <div className="border-t border-gray-200 pt-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Offering-Level Attributes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter brand" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="professions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profession(s)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter professions (comma-separated)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliveryMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delivery method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="livestream">Livestream</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <Label>Access Period</Label>
                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name="accessPeriod"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Duration"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accessPeriodType"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                            <SelectItem value="years">Years</SelectItem>
                            <SelectItem value="lifetime">Lifetime</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Price</Label>
                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="pricingModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pricing Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pricing model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="usage-based">Usage-based</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
            </div>
            
            {/* Channel and Availability Settings */}
            <div className="mt-6 space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Channel Visibility</Label>
                <div className="space-y-2">
                  {["retail", "partner", "direct"].map((channel) => (
                    <FormField
                      key={channel}
                      control={form.control}
                      name="channelVisibility"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(channel)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, channel]);
                                } else {
                                  field.onChange(currentValue.filter((c) => c !== channel));
                                }
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="capitalize">
                              {channel === "partner" ? "Partner Portal" : channel === "direct" ? "Direct Sales" : channel}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="commercialAvailability"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Available for purchase</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="approvedJurisdictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approved Jurisdictions</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter jurisdictions (comma-separated)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createProductMutation.isPending}
              className="bg-primary-500 hover:bg-primary-600"
            >
              {createProductMutation.isPending ? "Saving..." : (isEditing ? "Update Product" : "Create Product")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
